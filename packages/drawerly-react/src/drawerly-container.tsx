import type { ReactElement, ReactNode } from 'react'
import type { DrawerKey, ReactDrawerContentProps, ReactDrawerOptions } from './types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { DrawerOverlay } from './drawer-overlay'
import { useDrawer } from './use-drawer'

/**
 * Props passed to children render function.
 *
 * @public
 */
export interface DrawerlyContainerRenderProps {
  /**
   * The current drawer instance being rendered.
   */
  drawer: ReactDrawerOptions

  /**
   * Props to pass to drawer content (drawerKey, close).
   */
  contentProps: ReactDrawerContentProps
}

/**
 * Props for the DrawerlyContainer component.
 *
 * @public
 */
export interface DrawerlyContainerProps {
  /**
   * CSS selector for the portal target element.
   *
   * @default 'body'
   */
  portalTarget?: string

  /**
   * Whether to disable built-in animations and styling.
   *
   * When true, no backdrop or animations are rendered.
   * You take full control over drawer presentation.
   *
   * @default false
   */
  headless?: boolean

  /**
   * Render function for custom drawer content.
   *
   * Used when a drawer is opened without a `component` or `render` option.
   *
   * @example
   * ```tsx
   * <DrawerlyContainer headless>
   *   {({ drawer, contentProps }) => (
   *     <div className="my-drawer">
   *       <button onClick={contentProps.close}>Close</button>
   *     </div>
   *   )}
   * </DrawerlyContainer>
   * ```
   */
  children?: (props: DrawerlyContainerRenderProps) => ReactNode
}

/**
 * Root container that renders the active drawer stack.
 *
 * Must be placed once at the root of your application.
 * Creates a portal to render drawers outside the normal DOM hierarchy.
 *
 * @example
 * ```tsx
 * // App.tsx
 * import { DrawerlyContainer } from '@drawerly/react'
 * import '@drawerly/react/style.css'
 *
 * function App() {
 *   return (
 *     <>
 *       <YourAppContent />
 *       <DrawerlyContainer />
 *     </>
 *   )
 * }
 * ```
 *
 * @public
 */
export function DrawerlyContainer({
  portalTarget = 'body',
  headless = false,
  children,
}: DrawerlyContainerProps): ReactElement | null {
  const { stack, close } = useDrawer()

  const [isMounted, setIsMounted] = useState(false)

  const [nextTopKey, setNextTopKey] = useState<DrawerKey | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (headless)
        return
      if (event.key !== 'Escape')
        return

      const currentStack = stack
      const top = currentStack[currentStack.length - 1]
      if (!top)
        return

      const closeOnEscapeKey = typeof top.closeOnEscapeKey === 'function'
        ? top.closeOnEscapeKey(top)
        : Boolean(top.closeOnEscapeKey ?? true)

      if (closeOnEscapeKey) {
        if (currentStack.length > 1) {
          const below = currentStack[currentStack.length - 2]
          if (below) {
            setNextTopKey(below.drawerKey)
          }
        }

        // Note: The actual close happens in DrawerOverlay after animation
        // For now we just trigger the close state
        close(top.drawerKey)
      }
    },
    [headless, stack, close],
  )

  useEffect(() => {
    if (!isMounted || headless)
      return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMounted, headless, handleKeyDown])

  useEffect(() => {
    if (nextTopKey) {
      const exists = stack.some((d: ReactDrawerOptions) => d.drawerKey === nextTopKey)
      if (!exists) {
        setNextTopKey(null)
      }
    }
  }, [stack, nextTopKey])

  const portalTargetElement = useMemo(() => {
    if (!isMounted)
      return null
    return document.querySelector(portalTarget) ?? document.body
  }, [isMounted, portalTarget])

  if (!isMounted || !portalTargetElement) {
    return null
  }

  if (stack.length === 0) {
    return null
  }

  return createPortal(
    <div
      data-drawerly-root=""
      {...(headless && { 'data-headless': '' })}
    >
      {stack.map((drawer: ReactDrawerOptions, index: number) => (
        <DrawerOverlay
          key={drawer.drawerKey}
          drawer={drawer}
          index={index}
          count={stack.length}
          headless={headless}
          nextTopKey={nextTopKey}
          renderFallback={children}
        />
      ))}
    </div>,
    portalTargetElement,
  )
}
