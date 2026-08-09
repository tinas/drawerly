import type {
  DrawerInstance,
  DrawerKey,
  DrawerPatch,
} from '@drawerly/core'
import type { Drawerly } from './drawerly'
import type { ReactDrawerOptions } from './types'
import { useCallback } from 'react'
import { useDrawerly } from './use-drawerly'

/**
 * Returned by {@link useDrawer}.
 *
 * @public
 */
export interface UseDrawerResult<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
> {
  /**
   * Whether the drawer is in the stack.
   */
  isOpen: boolean

  /**
   * Whether the drawer is the topmost one in the stack.
   */
  isTop: boolean

  /**
   * The drawer instance, or `undefined` while closed.
   */
  instance: DrawerInstance<TDrawerOptions> | undefined

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
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
>(
  drawerly: Drawerly<TDrawerOptions>,
  drawerKey: DrawerKey,
): UseDrawerResult<TDrawerOptions> {
  const bound = useDrawerly(drawerly)

  const instance = bound.getDrawerInstance(drawerKey)
  const isOpen = instance !== undefined
  const isTop = bound.getTopDrawer()?.drawerKey === drawerKey

  const close = useCallback(() => {
    drawerly.close(drawerKey)
  }, [drawerly, drawerKey])

  const bringToTop = useCallback(() => {
    drawerly.bringToTop(drawerKey)
  }, [drawerly, drawerKey])

  const updateOptions = useCallback(
    (patch: DrawerPatch<TDrawerOptions>) => {
      drawerly.updateOptions(drawerKey, patch)
    },
    [drawerly, drawerKey],
  )

  return {
    isOpen,
    isTop,
    instance,
    close,
    bringToTop,
    updateOptions,
  }
}
