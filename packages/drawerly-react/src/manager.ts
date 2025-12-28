import type { DrawerManager } from '@drawerly/core'
import type { DrawerKey, ReactDrawerOptions } from './types'
import { createDrawerManager } from '@drawerly/core'

/**
 * Module-level singleton drawer manager.
 *
 * Lazy-initialized on first access for SSR safety.
 */
let manager: DrawerManager<ReactDrawerOptions> | null = null

/**
 * Returns the singleton drawer manager instance.
 *
 * Creates the manager on first call with sensible defaults.
 *
 * @internal
 */
export function getDrawerManager(): DrawerManager<ReactDrawerOptions> {
  if (!manager) {
    manager = createDrawerManager<ReactDrawerOptions>(undefined, {
      placement: 'right',
      closeOnEscapeKey: true,
      closeOnBackdropClick: true,
    })
  }
  return manager
}

/**
 * Imperative drawer API for opening and closing drawers.
 *
 * Can be used outside of React components.
 *
 * @public
 */
export const drawer = {
  /**
   * Opens a new drawer or updates an existing one and moves it to the top.
   *
   * @param options - Drawer options including key, component, and behavior settings.
   * @returns The drawer key.
   */
  open: (options: ReactDrawerOptions): DrawerKey => getDrawerManager().open(options),

  /**
   * Closes the top drawer or a specific drawer by key.
   *
   * @param key - Optional drawer key. If omitted, closes the top drawer.
   */
  close: (key?: DrawerKey): void => getDrawerManager().close(key),

  /**
   * Closes all open drawers.
   */
  closeAll: (): void => getDrawerManager().closeAll(),

  /**
   * Moves a drawer to the top of the stack.
   *
   * @param key - The drawer key to bring to top.
   */
  bringToTop: (key: DrawerKey): void => getDrawerManager().bringToTop(key),

  /**
   * Returns the current drawer state.
   */
  getState: () => getDrawerManager().getState(),

  /**
   * Returns a specific drawer instance by key.
   *
   * @param key - The drawer key to look up.
   */
  getDrawerInstance: (key: DrawerKey) => getDrawerManager().getDrawerInstance(key),
}
