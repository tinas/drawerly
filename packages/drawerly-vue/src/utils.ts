import type {
  DrawerOptions as CoreDrawerOptions,
  DrawerManager,
} from '@drawerly/core'
import type {
  Component,
  InjectionKey,
} from 'vue'

/**
 * Drawer options supported by the Vue adapter.
 *
 * @public
 */
export interface VueDrawerOptions extends CoreDrawerOptions {
  /**
   * Component rendered inside the drawer panel.
   *
   * Optional for headless usage.
   */
  component?: Component

  /**
   * Props passed to the rendered component.
   */
  componentParams?: Record<string, any>
}

/**
 * Injection key for accessing the global drawer manager.
 *
 * @internal
 */
export const DrawerSymbol: InjectionKey<
  DrawerManager<VueDrawerOptions>
> = Symbol('drawerly')
