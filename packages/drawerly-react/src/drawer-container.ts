import type {
  DrawerInstance,
  DrawerKey,
} from '@drawerly/core'
import type { ComponentType, ReactElement, ReactNode, RefObject } from 'react'
import type { Drawerly } from './drawerly'
import type { ReactDrawerOptions } from './types'
import { resolveDrawerPredicate } from '@drawerly/core'
import { lockScroll as lockPageScroll } from '@drawerly/core/dom'
import {
  createElement,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { createPortal } from 'react-dom'

const ENTER_CLASS = 'drawerly-enter-active'
const LEAVE_CLASS = 'drawerly-leave-active'

function whenAnimationsFinish(el: Element, done: () => void): () => void {
  // Environments without the Web Animations API have nothing to wait for.
  const animations = typeof el.getAnimations === 'function'
    ? el.getAnimations({ subtree: true })
    : []

  if (!animations.length) {
    done()
    return () => {}
  }

  let cancelled = false

  Promise
    .allSettled(animations.map(animation => animation.finished))
    .then(() => {
      if (!cancelled)
        done()
    })

  return () => {
    cancelled = true
  }
}

/**
 * Props accepted by {@link DrawerlyContainer}.
 *
 * @public
 */
export interface DrawerlyContainerProps<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
> {
  /**
   * Drawerly instance whose stack this container renders.
   */
  drawerly: Drawerly<TDrawerOptions>

  /**
   * Portal target selector for the drawer stack.
   *
   * @defaultValue 'body'
   */
  portalTo?: string

  /**
   * Renders drawers as modal dialogs: backdrop, body scroll locking and
   * `aria-modal`.
   *
   * @defaultValue true
   */
  modal?: boolean

  /**
   * Locks body scroll while a modal drawer is on screen.
   *
   * @defaultValue true
   */
  lockScroll?: boolean

  /**
   * Called when a drawer finishes opening.
   */
  onDrawerOpened?: (payload: { key: DrawerKey }) => void

  /**
   * Called when a drawer finishes closing.
   */
  onDrawerClosed?: (payload: { key: DrawerKey }) => void

  /**
   * Called when the last drawer has finished closing.
   */
  onAllClosed?: () => void

  /**
   * Renders the panel content of drawers that do not specify a
   * `component`.
   */
  children?: (props: {
    drawer: DrawerInstance<TDrawerOptions>
    close: () => void
  }) => ReactNode
}

interface ClosingEntry<TDrawerOptions extends ReactDrawerOptions> {
  drawer: DrawerInstance<TDrawerOptions>
  index: number
  count: number
  wasTop: boolean
}

interface DrawerContentProps {
  component: ComponentType<any>
  componentProps: Record<string, unknown> | undefined
  drawerKey: DrawerKey
}

function DrawerContentImpl(props: DrawerContentProps): ReactElement {
  const { component, componentProps, drawerKey } = props

  return createElement(component, { ...componentProps, drawerKey })
}

// Memoized so drawer content stays out of renders it is not involved in.
const DrawerContent = memo(DrawerContentImpl)

interface DrawerOverlayProps {
  drawer: DrawerInstance<ReactDrawerOptions>
  index: number
  count: number
  isTop: boolean
  modal: boolean
  closing: boolean
  onOpened: (key: DrawerKey) => void
  onClosed: (key: DrawerKey) => void
  onBackdropClick: (drawer: DrawerInstance<ReactDrawerOptions>) => void
  children?: ReactNode
}

function DrawerOverlay(props: DrawerOverlayProps): ReactElement {
  const {
    drawer,
    index,
    count,
    isTop,
    modal,
    closing,
    onOpened,
    onClosed,
    onBackdropClick,
    children,
  } = props

  const overlayRef: RefObject<HTMLDivElement | null> = useRef(null)

  const onOpenedRef = useRef(onOpened)
  onOpenedRef.current = onOpened

  const onClosedRef = useRef(onClosed)
  onClosedRef.current = onClosed

  useLayoutEffect(() => {
    const el = overlayRef.current
    if (!el)
      return

    el.classList.add(ENTER_CLASS)

    const cancel = whenAnimationsFinish(el, () => {
      el.classList.remove(ENTER_CLASS)
      onOpenedRef.current(drawer.drawerKey)
    })

    return () => {
      cancel()
      el.classList.remove(ENTER_CLASS)
    }
  }, [drawer.drawerKey])

  // The container keeps this overlay mounted while `closing` is set, so the
  // exit animation has somewhere to play.
  useLayoutEffect(() => {
    const el = overlayRef.current
    if (!el)
      return

    if (!closing) {
      el.classList.remove(LEAVE_CLASS)
      return
    }

    el.classList.remove(ENTER_CLASS)
    el.classList.add(LEAVE_CLASS)

    return whenAnimationsFinish(el, () => onClosedRef.current(drawer.drawerKey))
  }, [closing, drawer.drawerKey])

  const userDataAttributes
    = drawer.dataAttributes != null
      ? Object.fromEntries(
          Object.entries(drawer.dataAttributes).filter(
            ([name]) => !name.startsWith('data-drawerly'),
          ),
        )
      : undefined

  return createElement(
    'div',
    {
      'ref': overlayRef,
      'data-drawerly-overlay': '',
      'data-drawerly-key': drawer.drawerKey,
      'data-drawerly-index': index,
      'data-drawerly-count': count,
      'data-drawerly-placement': drawer.placement ?? 'right',
      ...(isTop ? { 'data-top': '' } : {}),
      ...(userDataAttributes ?? {}),
    },
    modal
      ? createElement('div', {
          'data-drawerly-backdrop': '',
          'onClick': () => onBackdropClick(drawer),
        })
      : null,
    createElement(
      'div',
      {
        'data-drawerly-panel': '',
        'role': 'dialog',
        'tabIndex': -1,
        ...(modal ? { 'aria-modal': 'true' } : {}),
        'aria-label': drawer.ariaLabel,
        'aria-describedby': drawer.ariaDescribedBy,
        'aria-labelledby': drawer.ariaLabelledBy,
      },
      children,
    ),
  )
}

/**
 * Renders and animates the active drawer stack through a portal.
 *
 * @public
 */
export function DrawerlyContainer<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
>(props: DrawerlyContainerProps<TDrawerOptions>): ReactNode {
  const {
    drawerly,
    portalTo = 'body',
    modal = true,
    lockScroll = true,
    onDrawerOpened,
    onDrawerClosed,
    onAllClosed,
    children,
  } = props

  if (!drawerly) {
    throw new Error(
      '[@drawerly/react] DrawerlyContainer requires a `drawerly` instance created by createDrawerly().',
    )
  }

  const state = useSyncExternalStore(
    drawerly.subscribe,
    drawerly.getState,
    drawerly.getState,
  )
  const { stack } = state
  const topKey = stack[stack.length - 1]?.drawerKey

  const onDrawerOpenedRef = useRef(onDrawerOpened)
  onDrawerOpenedRef.current = onDrawerOpened

  const onDrawerClosedRef = useRef(onDrawerClosed)
  onDrawerClosedRef.current = onDrawerClosed

  const onAllClosedRef = useRef(onAllClosed)
  onAllClosedRef.current = onAllClosed

  // Drawers removed from the stack stay rendered until their exit animation
  // finishes. Removals are derived during render, before React unmounts the
  // corresponding overlay.
  const [prevStack, setPrevStack] = useState(stack)
  const [closingEntries, setClosingEntries] = useState<
    ClosingEntry<TDrawerOptions>[]
  >([])

  if (stack !== prevStack) {
    setPrevStack(stack)

    const currentKeys = new Set(stack.map(d => d.drawerKey))
    const prevTopKey = prevStack[prevStack.length - 1]?.drawerKey

    const removed = prevStack
      .map((drawer, index) => ({
        drawer,
        index,
        count: prevStack.length,
        wasTop: drawer.drawerKey === prevTopKey,
      }))
      .filter(entry => !currentKeys.has(entry.drawer.drawerKey))

    setClosingEntries((prev) => {
      // Drawers reopened while closing leave the closing list.
      const kept = prev.filter(
        entry => !currentKeys.has(entry.drawer.drawerKey),
      )
      const keptKeys = new Set(kept.map(entry => entry.drawer.drawerKey))

      return [
        ...kept,
        ...removed.filter(entry => !keptKeys.has(entry.drawer.drawerKey)),
      ]
    })
  }

  // Portals cannot render during SSR; mount the stack client-side only.
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalTarget(
      document.querySelector<HTMLElement>(portalTo) ?? document.body,
    )
  }, [portalTo])

  const handleOverlayOpened = useCallback((key: DrawerKey) => {
    onDrawerOpenedRef.current?.({ key })
  }, [])

  const handleOverlayClosed = useCallback((key: DrawerKey) => {
    setClosingEntries(prev =>
      prev.filter(entry => entry.drawer.drawerKey !== key),
    )
    onDrawerClosedRef.current?.({ key })
  }, [])

  const handleBackdropClick = useCallback(
    (drawer: DrawerInstance<ReactDrawerOptions>) => {
      if (resolveDrawerPredicate(drawer.closeOnBackdropClick, drawer))
        drawerly.close(drawer.drawerKey)
    },
    [drawerly],
  )

  const hadDrawersRef = useRef(false)

  useEffect(() => {
    if (stack.length > 0) {
      hadDrawersRef.current = true
      return
    }

    if (closingEntries.length > 0)
      return

    if (hadDrawersRef.current) {
      hadDrawersRef.current = false
      onAllClosedRef.current?.()
    }
  }, [stack, closingEntries])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape')
        return

      const top = drawerly.getTopDrawer()
      if (top && resolveDrawerPredicate(top.closeOnEscapeKey, top))
        drawerly.close(top.drawerKey)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawerly])

  // A closing drawer is still on screen, so the lock has to outlive the
  // manager state.
  const isOccupied = stack.length > 0 || closingEntries.length > 0
  const shouldLockScroll = modal && lockScroll && isOccupied

  useEffect(() => {
    if (!shouldLockScroll)
      return

    return lockPageScroll()
  }, [shouldLockScroll])

  if (!portalTarget)
    return null

  const count = stack.length

  interface RenderedEntry {
    drawer: DrawerInstance<TDrawerOptions>
    index: number
    count: number
    isTop: boolean
    closing: boolean
  }

  const entries: RenderedEntry[] = stack.map((drawer, index) => ({
    drawer,
    index,
    count,
    isTop: drawer.drawerKey === topKey,
    closing: false,
  }))

  // Closing drawers keep the position and attributes they had when they
  // left the stack.
  for (const entry of closingEntries) {
    entries.splice(Math.min(entry.index, entries.length), 0, {
      drawer: entry.drawer,
      index: entry.index,
      count: entry.count,
      isTop: entry.wasTop,
      closing: true,
    })
  }

  const renderContent = (
    drawer: DrawerInstance<TDrawerOptions>,
  ): ReactNode => {
    if (drawer.component) {
      return createElement(DrawerContent, {
        component: drawer.component,
        componentProps: drawer.componentProps,
        drawerKey: drawer.drawerKey,
      })
    }

    return children?.({
      drawer,
      close: () => drawerly.close(drawer.drawerKey),
    }) ?? null
  }

  return createPortal(
    createElement(
      'div',
      { 'data-drawerly-root': '' },
      entries.map(entry =>
        createElement(
          DrawerOverlay,
          {
            key: entry.drawer.drawerKey,
            drawer: entry.drawer,
            index: entry.index,
            count: entry.count,
            isTop: entry.isTop,
            modal,
            closing: entry.closing,
            onOpened: handleOverlayOpened,
            onClosed: handleOverlayClosed,
            onBackdropClick: handleBackdropClick,
          },
          renderContent(entry.drawer),
        ),
      ),
    ),
    portalTarget,
  )
}
