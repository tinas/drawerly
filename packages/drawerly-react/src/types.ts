import type {
  DrawerOptions as CoreDrawerOptions,
  DrawerDefaultOptions,
  DrawerInstance,
  DrawerKey,
  DrawerPlacement,
  DrawerState,
  DrawerUpdatableOptions,
} from '@drawerly/core'
import type { ComponentType, ReactNode } from 'react'

/**
 * Props automatically passed to drawer content components.
 *
 * @public
 */
export interface ReactDrawerContentProps {
  /**
   * Key identifying this drawer instance.
   */
  drawerKey: DrawerKey

  /**
   * Function to close this drawer.
   */
  close: () => void
}

/**
 * Drawer options for the React adapter.
 *
 * Extends the core options with a renderable component or render function.
 *
 * @public
 */
export interface ReactDrawerOptions extends CoreDrawerOptions {
  /**
   * React component rendered inside the drawer panel.
   *
   * Receives {@link ReactDrawerContentProps} plus any `componentProps`.
   */
  component?: ComponentType<ReactDrawerContentProps & Record<string, unknown>>

  /**
   * Props passed to the rendered component (merged with content props).
   */
  componentProps?: Record<string, unknown>

  /**
   * Alternative: render function for inline content.
   *
   * Takes precedence over `component` if both are provided.
   */
  render?: (props: ReactDrawerContentProps) => ReactNode
}

/**
 * React drawer options without the `component` and `render` fields.
 *
 * @public
 */
export type ReactDrawerOptionsWithoutComponent<
  TReactDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
> = Omit<TReactDrawerOptions, 'component' | 'componentProps' | 'render'>

/**
 * Updatable React drawer options, excluding `component` and `render`.
 *
 * @public
 */
export type ReactDrawerUpdatableOptionsWithoutComponent<
  TReactDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
> = Omit<DrawerUpdatableOptions<TReactDrawerOptions>, 'component' | 'componentProps' | 'render'>

/**
 * Default React drawer options, excluding `component` and `render`.
 *
 * @public
 */
export type ReactDrawerDefaultOptionsWithoutComponent<
  TReactDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
> = Omit<DrawerDefaultOptions<TReactDrawerOptions>, 'component' | 'componentProps' | 'render'>

export type {
  DrawerInstance,
  DrawerKey,
  DrawerPlacement,
  DrawerState,
  DrawerUpdatableOptions,
}
