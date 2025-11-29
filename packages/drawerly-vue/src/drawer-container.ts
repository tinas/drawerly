import type { DrawerInstance, DrawerKey, DrawerManager } from '@drawerly/core'
import type { PropType } from 'vue'
import type { VueDrawerOptions } from './plugin'
import {
  defineComponent,
  h,
  inject,
  onMounted,
  onUnmounted,

  shallowRef,
  Teleport,
} from 'vue'
import { DrawerSymbol } from './plugin'

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

    const closingKeys = shallowRef<Set<DrawerKey>>(new Set())
    const enteringKeys = shallowRef<Set<DrawerKey>>(new Set())
    const nextTopKey = shallowRef<DrawerKey | null>(null)
    const bulkClosingAll = shallowRef(false)

    let unsubscribe: (() => void) | null = null

    const addKeyToSet = (setRef: { value: Set<DrawerKey> }, key: DrawerKey): void => {
      const next = new Set(setRef.value)
      next.add(key)
      setRef.value = next
    }

    const removeKeyFromSet = (setRef: { value: Set<DrawerKey> }, key: DrawerKey): void => {
      if (!setRef.value.has(key))
        return
      const next = new Set(setRef.value)
      next.delete(key)
      setRef.value = next
    }

    const syncNextTopWithStack = (stack: DrawerInstance<VueDrawerOptions>[]): void => {
      if (!nextTopKey.value)
        return
      const exists = stack.some(d => d.drawerKey === nextTopKey.value)
      if (!exists)
        nextTopKey.value = null
    }

    const updateEnteringKeys = (prevState: ManagerState, nextState: ManagerState): void => {
      const prevKeys = new Set(prevState.stack.map(d => d.drawerKey))
      const newKeys: DrawerKey[] = []

      nextState.stack.forEach((d) => {
        if (!prevKeys.has(d.drawerKey))
          newKeys.push(d.drawerKey)
      })

      if (newKeys.length > 0) {
        enteringKeys.value = new Set([
          ...Array.from(enteringKeys.value),
          ...newKeys,
        ])
      }

      syncNextTopWithStack(nextState.stack)
    }

    const handleCloseAllTransition = (prevState: ManagerState): void => {
      const prevStack = prevState.stack
      if (prevStack.length === 0)
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

      if (!isBulk) {
        manager.close(key)
      }

      removeKeyFromSet(closingKeys, key)
      removeKeyFromSet(enteringKeys, key)

      if (isBulk && closingKeys.value.size === 0) {
        renderStack.value = stateRef.value.stack
        bulkClosingAll.value = false
      }

      syncNextTopWithStack(stateRef.value.stack)

      if (!isBulk) {
        nextTopKey.value = null
      }
    }

    const closeWithAnimation = (key: DrawerKey): void => {
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
        const belowIndex = len - 2
        const below = stack[belowIndex]
        if (below) {
          nextTopKey.value = below.drawerKey
        }
      }

      addKeyToSet(closingKeys, key)
    }

    const handleBackdropClick = (drawer: DrawerInstance<VueDrawerOptions>): void => {
      if (drawer.options?.closeOnBackdrop !== false) {
        closeWithAnimation(drawer.drawerKey)
      }
    }

    const handleClose = (key: DrawerKey): void => {
      closeWithAnimation(key)
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape')
        return

      const stack = renderStack.value
      const len = stack.length
      if (!len)
        return

      const top = stack[len - 1]
      if (top && top.options?.closeOnEsc !== false) {
        closeWithAnimation(top.drawerKey)
      }
    }

    const handlePanelAnimationEnd = (key: DrawerKey, event: AnimationEvent): void => {
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
        const prevLen = prevState.stack.length
        const nextLen = nextState.stack.length

        stateRef.value = nextState

        const wasNotEmpty = prevLen > 0
        const isNowEmpty = nextLen === 0

        if (wasNotEmpty && isNowEmpty && closingKeys.value.size === 0) {
          handleCloseAllTransition(prevState)
          return
        }

        updateEnteringKeys(prevState, nextState)
        renderStack.value = nextState.stack
      })

      document.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      unsubscribe?.()
      document.removeEventListener('keydown', handleKeyDown)
    })

    return () => {
      const stack = renderStack.value
      const len = stack.length
      if (!len)
        return null

      const top = stack[len - 1]
      const topKey: DrawerKey | null = top ? top.drawerKey : null

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
            const placement = drawer.options?.placement ?? 'right'
            const key = drawer.drawerKey
            const isClosing = closingKeys.value.has(key)
            const isEntering = enteringKeys.value.has(key) && !isClosing

            const isTopLike = key === topKey || key === nextTopKey.value

            const userDataAttributes
              = drawer.options?.dataAttributes != null
                ? Object.fromEntries(
                    Object.entries(drawer.options.dataAttributes).filter(
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
                h('div', {
                  'data-drawerly-backdrop': '',
                  'onClick': () => handleBackdropClick(drawer),
                }),
                h(
                  'div',
                  {
                    'data-drawerly-panel': '',
                    'role': 'dialog',
                    'aria-modal': 'true',
                    'aria-label': drawer.options?.ariaLabel,
                    'aria-describedby': drawer.options?.ariaDescribedBy,
                    'aria-labelledby': drawer.options?.ariaLabelledBy,
                    'onAnimationend': (event: AnimationEvent) =>
                      handlePanelAnimationEnd(key, event),
                  },
                  drawer.options?.component
                    ? h(drawer.options.component, {
                        ...drawer.options.props,
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
