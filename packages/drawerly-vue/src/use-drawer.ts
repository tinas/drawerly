import type { DrawerKey, DrawerState } from '@drawerly/core'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { VueDrawerOptions } from './plugin'
import {
  onMounted,
  onUnmounted,
  readonly,
  ref,
  toValue,
} from 'vue'
import { useDrawerContext } from './use-drawer-context'

/**
 * Options accepted by {@link useDrawer}.
 *
 * The `drawerKey` is passed as the first argument to {@link useDrawer},
 * so these options intentionally omit it. The key is injected by the
 * composable when calling the underlying {@link DrawerManager.open}
 * method.
 *
 * Uses Vue’s {@link MaybeRefOrGetter} so options can be:
 * - plain object
 * - ref
 * - computed
 * - getter function
 *
 * @public
 */
export type UseDrawerOptions<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> = MaybeRefOrGetter<Omit<TDrawerOptions, 'drawerKey'>>

/**
 * Returned result from {@link useDrawer}.
 *
 * @public
 */
export interface UseDrawerResult {
  /**
   * Opens the drawer associated with this hook.
   *
   * If the drawer does not exist, it is created.
   * If it already exists, its options are updated using the latest
   * resolved {@link UseDrawerOptions} and it is moved to the top
   * of the stack.
   */
  open: () => DrawerKey

  /**
   * Closes this drawer, if it exists in the stack.
   */
  close: () => void

  /**
   * Brings this drawer to the top of the stack, if it exists.
   */
  bringToTop: () => void

  /**
   * Reactive flag indicating whether this drawer is currently open.
   */
  isOpen: Readonly<Ref<boolean>>
}

/**
 * Creates a drawer handle bound to a fixed `drawerKey`.
 *
 * The first argument identifies the drawer, while the second argument
 * provides its configuration. The configuration can be static or
 * reactive (ref, computed, or getter). Whenever `open()` is called,
 * the latest resolved configuration is applied.
 *
 * @example Basic usage
 * ```ts
 * const { open, isOpen } = useDrawer('settings', {
 *   component: SettingsDrawer,
 *   placement: 'right',
 * })
 *
 * open()
 * ```
 *
 * @example Reactive options
 * ```ts
 * const options = computed(() => ({
 *   component: SettingsDrawer,
 *   componentProps: { userId: userId.value },
 *   placement: 'right',
 * }))
 *
 * const { open } = useDrawer('settings', options)
 *
 * // The drawer will always receive the most recent configuration
 * // whenever open() is invoked.
 * open()
 * ```
 *
 * @public
 */

export function useDrawer<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
>(
  drawerKey: DrawerKey,
  options: UseDrawerOptions<TDrawerOptions>,
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
    const current = toValue(options)

    const merged: TDrawerOptions = {
      ...(current as TDrawerOptions),
      // identity is always driven by the hook argument
      drawerKey,
    }

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
