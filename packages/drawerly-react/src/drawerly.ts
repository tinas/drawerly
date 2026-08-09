import type {
  DrawerDefaultOptions,
  DrawerManager,
} from '@drawerly/core'
import type { ReactDrawerOptions } from './types'

import { createDrawerManager } from '@drawerly/core'

/**
 * Configuration options for {@link createDrawerly}.
 *
 * @public
 */
export interface DrawerlyOptions<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
> {
  /**
   * Global default options applied to new drawers.
   */
  defaultOptions?: DrawerDefaultOptions<TDrawerOptions>
}

/**
 * Drawerly instance created by {@link createDrawerly}.
 *
 * @public
 */
export type Drawerly<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
> = DrawerManager<TDrawerOptions>

/**
 * Creates a {@link Drawerly} instance.
 *
 * @public
 */
export function createDrawerly<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
>(options?: DrawerlyOptions<TDrawerOptions>): Drawerly<TDrawerOptions> {
  return createDrawerManager<TDrawerOptions>({
    defaultOptions: options?.defaultOptions,
  })
}
