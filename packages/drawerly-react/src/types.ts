import type {
  DrawerOptions as CoreDrawerOptions,
  DrawerKey,
} from '@drawerly/core'
import type { ComponentType } from 'react'

/**
 * Drawer options for the React adapter.
 *
 * @public
 */
export interface ReactDrawerOptions extends CoreDrawerOptions {
  /**
   * Component rendered inside the drawer panel.
   */
  component?: ComponentType<any>

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
