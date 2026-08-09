import type {
  DrawerInstance,
  DrawerKey,
  DrawerPatch,
} from '@drawerly/core'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { VueDrawerOptions } from './types'
import { computed, toValue } from 'vue'
import { useDrawerly } from './use-drawerly'

/**
 * Returned by {@link useDrawer}.
 *
 * @public
 */
export interface UseDrawerResult<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> {
  /**
   * Whether the drawer is in the stack.
   */
  isOpen: ComputedRef<boolean>

  /**
   * Whether the drawer is the topmost one in the stack.
   */
  isTop: ComputedRef<boolean>

  /**
   * The drawer instance, or `undefined` while closed.
   */
  instance: ComputedRef<DrawerInstance<TDrawerOptions> | undefined>

  /**
   * Closes the drawer.
   */
  close: () => void

  /**
   * Moves the drawer to the top of the stack.
   */
  bringToTop: () => void

  /**
   * Merges a patch into the drawer's options.
   */
  updateOptions: (patch: DrawerPatch<TDrawerOptions>) => void
}

/**
 * Binds to the drawer with the given key.
 *
 * @public
 */
export function useDrawer<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
>(
  drawerKey: MaybeRefOrGetter<DrawerKey>,
): UseDrawerResult<TDrawerOptions> {
  const drawerly = useDrawerly<TDrawerOptions>()

  const key = computed(() => toValue(drawerKey))
  const instance = computed(() => drawerly.getDrawerInstance(key.value))

  const isOpen = computed(() => instance.value !== undefined)
  const isTop = computed(
    () => drawerly.getTopDrawer()?.drawerKey === key.value,
  )

  const close = (): void => {
    drawerly.close(key.value)
  }

  const bringToTop = (): void => {
    drawerly.bringToTop(key.value)
  }

  const updateOptions = (patch: DrawerPatch<TDrawerOptions>): void => {
    drawerly.updateOptions(key.value, patch)
  }

  return {
    isOpen,
    isTop,
    instance,
    close,
    bringToTop,
    updateOptions,
  }
}
