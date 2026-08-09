import type {
  DrawerOptions as CoreDrawerOptions,
  DrawerKey,
} from '@drawerly/core'
import type { Component } from 'vue'

/**
 * Drawer options for the Vue adapter.
 *
 * @public
 */
export interface VueDrawerOptions extends CoreDrawerOptions {
  /**
   * Component rendered inside the drawer panel.
   */
  component?: Component

  /**
   * Props passed to the rendered component.
   */
  componentProps?: Record<string, unknown>
}

/**
 * Prop injected into every component rendered inside a drawer panel.
 *
 * @public
 */
export interface DrawerContentProps {
  /**
   * Key of the drawer rendering this component.
   */
  drawerKey: DrawerKey
}
