import type {
  DrawerInstance,
  DrawerKey,
  DrawerPlacement,
  Unsubscribe,
} from '@drawerly/core'
import type {
  ComputedRef,
  MaybeRef,
  WritableComputedRef,
} from 'vue'
import type {
  VueDrawerOptionsWithoutComponent,
  VueDrawerUpdatableOptionsWithoutComponent,
} from './use-drawer-context'
import type { VueDrawerOptions } from './utils'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  toValue,
  watch,
} from 'vue'
import { useDrawerContext } from './use-drawer-context'

/**
 * Reactive API for working with a single drawer instance.
 *
 * Use this composable when you have a drawer key and want to:
 * - read whether it is open,
 * - bind to its placement and close behaviors,
 * - update its options (excluding `component` and `drawerKey`),
 * - close it or bring it to the top.
 *
 * @public
 */
export interface UseDrawerInstanceResult<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> {
  /**
   * Whether the drawer with the given key currently exists in the stack.
   */
  isOpen: ComputedRef<boolean>

  /**
   * Two-way binding for the drawer placement.
   *
   * Defaults to `'right'` when not explicitly set.
   */
  placement: WritableComputedRef<DrawerPlacement>

  /**
   * Two-way binding for the `closeOnEscapeKey` flag.
   *
   * Note: this only covers the boolean form and does not reflect
   * function-based predicates, which are intended for advanced usage.
   */
  closeOnEscapeKey: WritableComputedRef<boolean>

  /**
   * Two-way binding for the `closeOnBackdropClick` flag.
   *
   * Note: this only covers the boolean form and does not reflect
   * function-based predicates, which are intended for advanced usage.
   */
  closeOnBackdropClick: WritableComputedRef<boolean>

  /**
   * Read-only view of the drawer options, excluding `drawerKey` and `component`.
   */
  options: ComputedRef<VueDrawerOptionsWithoutComponent<TVueDrawerOptions>>

  /**
   * Closes this drawer instance.
   */
  close: () => void

  /**
   * Brings this drawer instance to the top of the stack.
   */
  bringToTop: () => void

  /**
   * Updates options for this drawer instance, excluding `component`.
   *
   * The updater receives the current options (without `drawerKey`/`component`)
   * and must return the full updated options (still without those fields).
   */
  updateOptions: (
    updater: (
      prev: VueDrawerUpdatableOptionsWithoutComponent<TVueDrawerOptions>,
    ) => VueDrawerUpdatableOptionsWithoutComponent<TVueDrawerOptions>,
  ) => void
}

/**
 * Binds to a single drawer instance by key.
 *
 * This composable does not open drawers; use {@link useDrawerContext}
 * and `manager.open` for creation, then pass the key here to observe
 * and update that instance.
 *
 * @public
 */
export function useDrawerInstance<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
>(
  drawerKey: MaybeRef<DrawerKey>,
): UseDrawerInstanceResult<TVueDrawerOptions> {
  const manager = useDrawerContext<TVueDrawerOptions>()

  const instance = shallowRef<DrawerInstance<TVueDrawerOptions> | undefined>(undefined)

  const instanceKey = computed(() => toValue(drawerKey))

  const options = computed<
    VueDrawerOptionsWithoutComponent<TVueDrawerOptions>
  >(() => {
    const current = instance.value
    if (!current) {
      return {} as VueDrawerOptionsWithoutComponent<TVueDrawerOptions>
    }

    // Strip `drawerKey` and `component` from the instance.
    const {
      drawerKey: _drawerKey,
      component: _component,
      ...rest
    } = current

    return rest as VueDrawerOptionsWithoutComponent<TVueDrawerOptions>
  })

  let unsubscribe: Unsubscribe | null = null

  onMounted(() => {
    unsubscribe = manager.subscribe((state) => {
      instance.value = state.stack.find(
        d => d?.drawerKey === instanceKey.value,
      )
    })
  })

  // Keep the instance in sync when the key changes.
  const stopWatch = watch(
    instanceKey,
    (newInstanceKey) => {
      instance.value = manager.getDrawerInstance(newInstanceKey)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    stopWatch()
    unsubscribe?.()
    unsubscribe = null
  })

  const isOpen = computed(() => Boolean(instance.value))

  const placement = computed<DrawerPlacement>({
    get: () => options.value.placement ?? 'right',
    set: (value: DrawerPlacement) => {
      manager.updateOptions(instanceKey.value, prev => ({
        ...prev,
        placement: value,
      }))
    },
  })

  const closeOnEscapeKey = computed<boolean>({
    get: () => (options.value.closeOnEscapeKey as boolean) ?? true,
    set: (value: boolean) => {
      manager.updateOptions(instanceKey.value, prev => ({
        ...prev,
        closeOnEscapeKey: value,
      }))
    },
  })

  const closeOnBackdropClick = computed<boolean>({
    get: () => (options.value.closeOnBackdropClick as boolean) ?? true,
    set: (value: boolean) => {
      manager.updateOptions(instanceKey.value, prev => ({
        ...prev,
        closeOnBackdropClick: value,
      }))
    },
  })

  const close = (): void => {
    manager.close(instanceKey.value)
  }

  const bringToTop = (): void => {
    manager.bringToTop(instanceKey.value)
  }

  const updateOptions: UseDrawerInstanceResult<
    TVueDrawerOptions
  >['updateOptions'] = (updater) => {
    manager.updateOptions(instanceKey.value, updater)
  }

  return {
    isOpen,
    placement,
    closeOnEscapeKey,
    closeOnBackdropClick,
    options,
    close,
    bringToTop,
    updateOptions,
  }
}
