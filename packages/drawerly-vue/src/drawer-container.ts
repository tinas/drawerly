import type {
  DrawerInstance,
  DrawerKey,
  DrawerManager,
} from '@drawerly/core'
import type { PropType } from 'vue'
import type { VueDrawerOptions } from './utils'
import {
  defineComponent,
  h,
  inject,
  onMounted,
  onUnmounted,
  shallowRef,
  Teleport,
} from 'vue'
import { DrawerSymbol } from './utils'

type ManagerState = ReturnType<DrawerManager<VueDrawerOptions>['getState']>

export const DrawerlyContainer = defineComponent({
  name: 'DrawerlyContainer',
  props: {
    teleportTo: {
      type: String as PropType<string>,
      default: 'body',
    },
    headless: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { slots }) {
    const manager = inject<DrawerManager<VueDrawerOptions>>(DrawerSymbol)
    if (!manager) {
      throw new Error(
        '[@drawerly/vue] DrawerlyContainer must be used within DrawerPlugin',
      )
    }

    const stateRef = shallowRef<ManagerState>(manager.getState())
    const renderStack = shallowRef<DrawerInstance<VueDrawerOptions>[]>(
      stateRef.value.stack,
    )

    const closingKeys = shallowRef(new Set<DrawerKey>())
    const enteringKeys = shallowRef(new Set<DrawerKey>())
    const nextTopKey = shallowRef<DrawerKey | null>(null)
    const bulkClosingAll = shallowRef(false)

    let unsubscribe: (() => void) | null = null

    const addKey = (setRef: { value: Set<DrawerKey> }, key: DrawerKey): void => {
      const next = new Set(setRef.value)
      next.add(key)
      setRef.value = next
    }

    const removeKey = (setRef: { value: Set<DrawerKey> }, key: DrawerKey): void => {
      if (!setRef.value.has(key))
        return
      const next = new Set(setRef.value)
      next.delete(key)
      setRef.value = next
    }

    const syncNextTopWithStack = (
      stack: DrawerInstance<VueDrawerOptions>[],
    ): void => {
      if (!nextTopKey.value)
        return
      const exists = stack.some(d => d.drawerKey === nextTopKey.value)
      if (!exists)
        nextTopKey.value = null
    }

    const computeEnteringKeys = (
      prevState: ManagerState,
      nextState: ManagerState,
    ): void => {
      const prevKeys = new Set(prevState.stack.map(d => d.drawerKey))
      const newKeys: DrawerKey[] = []

      nextState.stack.forEach((d) => {
        if (!prevKeys.has(d.drawerKey))
          newKeys.push(d.drawerKey)
      })

      if (newKeys.length) {
        enteringKeys.value = new Set([
          ...Array.from(enteringKeys.value),
          ...newKeys,
        ])
      }

      syncNextTopWithStack(nextState.stack)
    }

    const handleCloseAllTransition = (prevState: ManagerState): void => {
      const prevStack = prevState.stack
      if (!prevStack.length)
        return

      bulkClosingAll.value = true

      const allKeys = prevStack.map(d => d.drawerKey)

      closingKeys.value = new Set([
        ...Array.from(closingKeys.value),
        ...allKeys,
      ])

      if (enteringKeys.value.size > 0) {
        const entering = new Set(enteringKeys.value)
        allKeys.forEach(key => entering.delete(key))
        enteringKeys.value = entering
      }

      renderStack.value = prevStack
      nextTopKey.value = null
    }

    const finalizeClose = (key: DrawerKey): void => {
      const isBulk = bulkClosingAll.value

      if (!isBulk)
        manager.close(key)

      removeKey(closingKeys, key)
      removeKey(enteringKeys, key)

      if (isBulk && closingKeys.value.size === 0) {
        renderStack.value = stateRef.value.stack
        bulkClosingAll.value = false
      }

      syncNextTopWithStack(stateRef.value.stack)
      if (!isBulk)
        nextTopKey.value = null
    }

    const closeWithAnimation = (key: DrawerKey): void => {
      if (props.headless) {
        manager.close(key)
        return
      }

      const stack = renderStack.value
      const len = stack.length

      let closingIndex = -1
      for (let i = 0; i < len; i++) {
        const inst = stack[i]
        if (inst && inst.drawerKey === key) {
          closingIndex = i
          break
        }
      }

      if (closingIndex !== -1 && len > 1 && closingIndex === len - 1) {
        const below = stack[len - 2]
        if (below)
          nextTopKey.value = below.drawerKey
      }

      addKey(closingKeys, key)
    }

    const handleBackdropClick = (drawer: DrawerInstance<VueDrawerOptions>): void => {
      if (props.headless)
        return

      const _closeOnBackdropClick = typeof drawer.closeOnBackdropClick === 'function'
        ? drawer.closeOnBackdropClick(drawer)
        : Boolean(drawer.closeOnBackdropClick)

      if (_closeOnBackdropClick)
        closeWithAnimation(drawer.drawerKey)
    }

    const handleClose = (key: DrawerKey): void => {
      closeWithAnimation(key)
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (props.headless)
        return
      if (event.key !== 'Escape')
        return

      const stack = renderStack.value
      const top = stack[stack.length - 1]

      const _closeOnEscapeKey = typeof top?.closeOnEscapeKey === 'function'
        ? top.closeOnEscapeKey(top)
        : Boolean(top?.closeOnEscapeKey)

      if (top && _closeOnEscapeKey)
        closeWithAnimation(top.drawerKey)
    }

    const handlePanelAnimationEnd = (
      key: DrawerKey,
      event: AnimationEvent,
    ): void => {
      if (props.headless)
        return
      if (!closingKeys.value.has(key))
        return

      const name = event.animationName || ''
      if (!name.startsWith('drawerly-slide-out-'))
        return
      if (event.target !== event.currentTarget)
        return

      finalizeClose(key)
    }

    onMounted(() => {
      unsubscribe = manager.subscribe((nextState) => {
        const prevState = stateRef.value
        stateRef.value = nextState

        if (props.headless) {
          renderStack.value = nextState.stack
          closingKeys.value = new Set()
          enteringKeys.value = new Set()
          nextTopKey.value = null
          bulkClosingAll.value = false
          return
        }

        const prevLen = prevState.stack.length
        const nextLen = nextState.stack.length

        const wasNotEmpty = prevLen > 0
        const isNowEmpty = nextLen === 0

        if (wasNotEmpty && isNowEmpty && closingKeys.value.size === 0) {
          handleCloseAllTransition(prevState)
          return
        }

        computeEnteringKeys(prevState, nextState)
        renderStack.value = nextState.stack
      })

      if (!props.headless)
        document.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      unsubscribe?.()
      unsubscribe = null

      if (!props.headless)
        document.removeEventListener('keydown', handleKeyDown)
    })

    return () => {
      const stack = renderStack.value
      const len = stack.length
      if (!len)
        return null

      const top = stack[len - 1]
      const topKey = top?.drawerKey ?? null

      return h(
        Teleport,
        { to: props.teleportTo },
        h(
          'div',
          {
            'data-drawerly-root': '',
            ...(props.headless && { 'data-headless': '' }),
          },
          stack.map((drawer, index) => {
            const key = drawer.drawerKey
            const placement = drawer.placement ?? 'right'

            const isClosing
              = !props.headless && closingKeys.value.has(key)
            const isEntering
              = !props.headless
                && enteringKeys.value.has(key)
                && !isClosing

            const isTopLike
              = key === topKey || key === nextTopKey.value

            const userDataAttributes
              = drawer.dataAttributes != null
                ? Object.fromEntries(
                    Object.entries(drawer.dataAttributes).filter(
                      ([name]) => !name.startsWith('data-drawerly'),
                    ),
                  )
                : undefined

            return h(
              'div',
              {
                key,
                'data-drawerly-overlay': '',
                'data-drawerly-key': key,
                'data-drawerly-index': index,
                'data-drawerly-count': len,
                'data-drawerly-placement': placement,
                ...(isTopLike && { 'data-top': '' }),
                ...(isClosing && { 'data-closing': '' }),
                ...(isEntering && { 'data-entering': '' }),
                ...(userDataAttributes ?? {}),
              },
              [
                !props.headless
                  ? h('div', {
                      'data-drawerly-backdrop': '',
                      'onClick': () => handleBackdropClick(drawer),
                    })
                  : null,
                h(
                  'div',
                  {
                    'data-drawerly-panel': '',
                    'role': 'dialog',
                    'aria-modal': 'true',
                    'aria-label': drawer.ariaLabel,
                    'aria-describedby': drawer.ariaDescribedBy,
                    'aria-labelledby': drawer.ariaLabelledBy,
                    'onAnimationend': (event: AnimationEvent) =>
                      handlePanelAnimationEnd(key, event),
                  },
                  drawer.component
                    ? h(drawer.component, {
                        ...drawer.componentParams,
                        drawerKey: key,
                        onClose: () => handleClose(key),
                      })
                    : slots.default?.({
                        drawer,
                        close: () => handleClose(key),
                      }),
                ),
              ],
            )
          }),
        ),
      )
    }
  },
})
