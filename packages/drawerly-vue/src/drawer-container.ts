import type { DrawerInstance, DrawerKey } from '@drawerly/core'
import type { VNode } from 'vue'
import type { VueDrawerOptions } from './types'
import { resolveDrawerPredicate } from '@drawerly/core'
import { lockScroll } from '@drawerly/core/dom'
import {
  computed,
  defineComponent,
  h,
  inject,
  onMounted,
  onUnmounted,
  ref,
  Teleport,
  TransitionGroup,
  watch,
} from 'vue'
import { drawerlyInjectionKey } from './injection'

const TRANSITION_NAME = 'drawerly'

/**
 * Renders and animates the active drawer stack.
 *
 * @public
 */
export const DrawerlyContainer = defineComponent({
  name: 'DrawerlyContainer',

  props: {
    /**
     * Teleport target for the drawer stack.
     */
    teleportTo: {
      type: String,
      default: 'body',
    },
    /**
     * Renders drawers as modal dialogs: backdrop, body scroll locking and
     * `aria-modal`.
     */
    modal: {
      type: Boolean,
      default: true,
    },
    /**
     * Locks body scroll while a modal drawer is on screen.
     */
    lockScroll: {
      type: Boolean,
      default: true,
    },
  },

  emits: {
    /** when a drawer finishes opening */
    'drawer-opened': (_payload: { key: DrawerKey }) => true,

    /** when a drawer finishes closing */
    'drawer-closed': (_payload: { key: DrawerKey }) => true,

    /** when the last drawer has finished closing */
    'all-closed': () => true,
  },

  setup(props, { slots, emit }) {
    const drawerly = inject(drawerlyInjectionKey)
    if (!drawerly) {
      throw new Error(
        '[@drawerly/vue] DrawerlyContainer must be used after installing the instance created by createDrawerly().',
      )
    }

    // Teleport cannot render during SSR; mount the stack client-side only.
    const isMounted = ref(false)
    const leavingCount = ref(0)

    const stack = computed(() => drawerly.state.value.stack)
    const topKey = computed(() => drawerly.getTopDrawer()?.drawerKey)

    // A closing drawer is still on screen, so side effects have to outlive
    // the manager state.
    const isOccupied = computed(
      () => stack.value.length > 0 || leavingCount.value > 0,
    )

    const handleBackdropClick = (
      drawer: DrawerInstance<VueDrawerOptions>,
    ): void => {
      if (resolveDrawerPredicate(drawer.closeOnBackdropClick, drawer))
        drawerly.close(drawer.drawerKey)
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape')
        return

      const top = drawerly.getTopDrawer()
      if (top && resolveDrawerPredicate(top.closeOnEscapeKey, top))
        drawerly.close(top.drawerKey)
    }

    let releaseScroll: (() => void) | null = null

    watch(
      () => isMounted.value
        && props.modal
        && props.lockScroll
        && isOccupied.value,
      (shouldLock) => {
        if (shouldLock) {
          releaseScroll ??= lockScroll()
          return
        }

        releaseScroll?.()
        releaseScroll = null
      },
      { flush: 'post' },
    )

    onMounted(() => {
      isMounted.value = true
      document.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown)
      releaseScroll?.()
      releaseScroll = null
    })

    const keyOf = (el: Element): DrawerKey | null =>
      el.getAttribute('data-drawerly-key')

    const onAfterEnter = (el: Element): void => {
      const key = keyOf(el)
      if (key !== null)
        emit('drawer-opened', { key })
    }

    // Zero arity on purpose: a leave hook that declares a `done` callback
    // opts out of the transition timing TransitionGroup does for us.
    const onLeave = (): void => {
      leavingCount.value++
    }

    const onLeaveCancelled = (): void => {
      leavingCount.value--
    }

    const onAfterLeave = (el: Element): void => {
      leavingCount.value--

      const key = keyOf(el)
      if (key !== null)
        emit('drawer-closed', { key })

      if (leavingCount.value === 0 && stack.value.length === 0)
        emit('all-closed')
    }

    const renderOverlay = (
      drawer: DrawerInstance<VueDrawerOptions>,
      index: number,
      count: number,
      currentTopKey: DrawerKey | undefined,
    ): VNode => {
      const key = drawer.drawerKey

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
          'data-drawerly-count': count,
          'data-drawerly-placement': drawer.placement ?? 'right',
          ...(key === currentTopKey && { 'data-top': '' }),
          ...userDataAttributes,
        },
        [
          props.modal
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
              'tabindex': '-1',
              ...(props.modal && { 'aria-modal': 'true' }),
              'aria-label': drawer.ariaLabel,
              'aria-describedby': drawer.ariaDescribedBy,
              'aria-labelledby': drawer.ariaLabelledBy,
            },
            drawer.component
              ? h(drawer.component, {
                  ...drawer.componentProps,
                  drawerKey: key,
                })
              : slots.default?.({
                  drawer,
                  close: () => drawerly.close(key),
                }),
          ),
        ],
      )
    }

    return () => {
      if (!isMounted.value)
        return null

      const current = stack.value
      const currentTopKey = topKey.value

      return h(
        Teleport,
        { to: props.teleportTo },
        h(
          TransitionGroup,
          {
            'tag': 'div',
            'name': TRANSITION_NAME,
            'appear': true,
            'data-drawerly-root': '',
            onAfterEnter,
            onLeave,
            onLeaveCancelled,
            onAfterLeave,
          },
          {
            default: () =>
              current.map((drawer, index) =>
                renderOverlay(drawer, index, current.length, currentTopKey)),
          },
        ),
      )
    }
  },
})
