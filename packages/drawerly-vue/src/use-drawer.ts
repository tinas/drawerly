import type { DrawerKey, DrawerState } from '@drawerly/core'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { VueDrawerOptions } from './plugin'
import type { OmitKeys } from './utils'
import {
  onMounted,
  onUnmounted,
  readonly,
  ref,
  toValue,
} from 'vue'
import { useDrawerContext } from './use-drawer-context'

/**
 * Drawer configuration passed to {@link useDrawer}.
 * Removes `drawerKey`, which is supplied separately in {@link UseDrawerParams}.
 *
 * @public
 */
export type UseDrawerOptions<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> = OmitKeys<TDrawerOptions, 'drawerKey'>

/**
 * Parameters accepted by {@link useDrawer}.
 *
 * @public
 */
export interface UseDrawerParams<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> {
  /** Unique key identifying this drawer instance. */
  drawerKey: DrawerKey

  /**
   * Optional Drawer options.
   *
   * This can be:
   * - a plain object
   * - a ref
   * - a computed
   * - a getter function
   *
   * When omitted, the drawer will be opened using only `drawerKey`
   * and any default options configured via the plugin.
   */
  options?: MaybeRefOrGetter<UseDrawerOptions<TDrawerOptions>>
}

/**
 * Returned API from {@link useDrawer}.
 *
 * @public
 */
export interface UseDrawerResult {
  /**
   * Opens the drawer associated with this handle.
   *
   * **Behavior:**
   * - If the drawer does *not* exist in the stack, it is created.
   * - If it *does* exist, it is updated with the latest resolved options.
   * - In both cases, the drawer is moved to the top of the stack.
   *
   * This ensures that calling `open()` always:
   * - applies the newest props / component / config
   * - brings the drawer into focus
   * - triggers animations (unless headless mode is active)
   */
  open: () => DrawerKey

  /** Closes this drawer if it is currently in the stack. */
  close: () => void

  /** Brings this drawer to the top of the stack without changing its options. */
  bringToTop: () => void

  /** Reactive flag that indicates whether this drawer is currently open. */
  isOpen: Readonly<Ref<boolean>>
}

/**
 * Creates a handle for a specific drawer.
 *
 * The composable binds a fixed `drawerKey` and provides lifecycle-aware
 * helpers for opening, closing, and tracking the drawer.
 *
 * @example Basic usage
 * ```ts
 * const drawer = useDrawer({
 *   drawerKey: 'settings',
 *   options: {
 *     component: SettingsDrawer,
 *     placement: 'right',
 *   },
 * })
 *
 * drawer.open()
 * ```
 *
 * @example Reactive options
 * ```ts
 * const drawer = useDrawer({
 *   drawerKey: 'profile',
 *   options: computed(() => ({
 *     component: ProfileDrawer,
 *     componentProps: { id: userId.value },
 *   })),
 * })
 *
 * drawer.open() // always uses latest computed values
 * ```
 *
 * @example Without options
 * ```ts
 * const drawer = useDrawer({ drawerKey: 'help' })
 * drawer.open() // uses only plugin defaultOptions
 * ```
 *
 * @public
 */
export function useDrawer<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
>(
  { drawerKey, options }: UseDrawerParams<TDrawerOptions>,
): UseDrawerResult {
  const manager = useDrawerContext()
  const isOpenRef = ref(false)

  const handleStateChange = (state: DrawerState<VueDrawerOptions>): void => {
    isOpenRef.value = state.stack.some(
      instance => instance.drawerKey === drawerKey,
    )
  }

  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    // Initialize from current state
    handleStateChange(manager.getState())

    // Subscribe to further updates
    unsubscribe = manager.subscribe(handleStateChange)
  })

  onUnmounted(() => {
    unsubscribe?.()
    unsubscribe = null
  })

  const open = (): DrawerKey => {
    const resolved = (options ? toValue(options) : {}) as TDrawerOptions
    const merged: TDrawerOptions = { ...resolved, drawerKey }

    manager.open(merged)

    return drawerKey
  }

  const close = (): void => {
    manager.close(drawerKey)
  }

  const bringToTop = (): void => {
    manager.bringToTop(drawerKey)
  }

  return {
    open,
    close,
    bringToTop,
    isOpen: readonly(isOpenRef),
  }
}
