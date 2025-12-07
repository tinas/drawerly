import type {
  DrawerDefaultOptions,
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

export interface UseDrawerInstanceResult<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> {
  isOpen: ComputedRef<boolean>
  placement: WritableComputedRef<DrawerPlacement>
  closeOnEscapeKey: WritableComputedRef<boolean>
  closeOnBackdropClick: WritableComputedRef<boolean>
  options: ComputedRef<Omit<TVueDrawerOptions, 'drawerKey' | 'component'>>
  close: () => void
  bringToTop: () => void
  updateOptions: (
    updater: DrawerDefaultOptions<Omit<TVueDrawerOptions, 'component'>>,
  ) => void
}

export function useDrawerInstance<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
>(
  drawerKey: MaybeRef<DrawerKey>,
): UseDrawerInstanceResult<TVueDrawerOptions> {
  const manager = useDrawerContext<TVueDrawerOptions>()

  const instance = shallowRef<DrawerInstance<TVueDrawerOptions> | undefined>(undefined)

  const options = computed<Omit<TVueDrawerOptions, 'drawerKey' | 'component'>>(() => {
    const { drawerKey, component, ...rest } = instance.value || {}
    return rest
  })

  let unsubscribe: Unsubscribe | null = null

  const instanceKey = computed(() => toValue(drawerKey))

  onMounted(() => {
    unsubscribe = manager.subscribe((state) => {
      instance.value = state.stack.find(d => d?.drawerKey === instanceKey.value)
    })
  })

  onBeforeUnmount(() => {
    unsubscribe?.()
    unsubscribe = null
  })

  watch(
    instanceKey,
    () => {
      instance.value = manager.getDrawerInstance(instanceKey.value)
    },
    { immediate: true },
  )

  const isOpen = computed(() => Boolean(instance.value))

  const placement = computed<DrawerPlacement>({
    get: () => (options.value.placement as DrawerPlacement) ?? 'right',
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

  const updateOptions: UseDrawerInstanceResult<TVueDrawerOptions>['updateOptions'] = (updater) => {
    manager.updateOptions(
      instanceKey.value,
      updater as unknown as (
        prev: DrawerDefaultOptions<Omit<TVueDrawerOptions, 'component'>>,
      ) => DrawerDefaultOptions<Omit<TVueDrawerOptions, 'component'>>,
    )
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
