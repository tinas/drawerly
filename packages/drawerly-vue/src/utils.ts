import type {
  DrawerOptions as CoreDrawerOptions,
  DrawerManager,
} from '@drawerly/core'
import type { Component, InjectionKey } from 'vue'

/**
 * Drawer options for the Vue adapter.
 *
 * Extends the core options with a renderable component and props.
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
  componentParams?: Record<string, unknown>
}

/**
 * Injection key for the global drawer manager instance.
 *
 * @internal
 */
export const DrawerSymbol: InjectionKey<
  DrawerManager<VueDrawerOptions>
> = Symbol('drawerly')
