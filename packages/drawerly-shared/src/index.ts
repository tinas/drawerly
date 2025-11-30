import type { DrawerOptions } from '@drawerly/core'

/**
 * Drawer placement directions understood by all framework adapters.
 *
 * Represents which edge of the viewport the drawer will originate from.
 *
 * @public
 */
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

/**
 * Shared UI options applied across framework adapters.
 *
 * This interface extends the base {@link DrawerOptions} from
 * `@drawerly/core`, adding visual and accessibility-related fields
 * that are interpreted by framework-specific adapters.
 *
 * @public
 */
export interface DrawerUiOptions extends DrawerOptions {
  /**
   * The placement of the drawer relative to the viewport.
   *
   * @defaultValue `'right'`
   */
  placement?: DrawerPlacement

  /**
   * Whether pressing the Escape key should close the drawer.
   *
   * @defaultValue `true`
   */
  closeOnEscape?: boolean

  /**
   * Whether clicking on the backdrop should close the drawer.
   *
   * @defaultValue `true`
   */
  closeOnBackdrop?: boolean

  /**
   * ARIA label applied to the drawer's root panel.
   */
  ariaLabel?: string

  /**
   * ARIA "describedby" reference applied to the drawer panel.
   */
  ariaDescribedBy?: string

  /**
   * ARIA "labelledby" reference applied to the drawer panel.
   */
  ariaLabelledBy?: string

  /**
   * Additional data attributes applied to the drawer overlay element.
   */
  dataAttributes?: Record<
    `data-${string}`,
    string | number | boolean | null | undefined
  >
}

/**
 * Component configuration for component-driven drawers.
 *
 * Framework adapters are expected to interpret these fields according
 * to their rendering model.
 *
 * @public
 */
export interface DrawerComponentConfig {
  /**
   * The props (or bindings) passed to the rendered drawer component.
   *
   * These props are framework-agnostic and adapter-specific layers
   * decide how they are applied (for example, Vue component props or
   * React JSX props).
   */
  componentProps?: Record<string, unknown>
}

/**
 * This package also ships a stylesheet containing the default Drawerly
 * animations, transitions, and layout rules. Consumers may import it as:
 *
 * ```ts
 * import '@drawerly/shared/styles.css'
 * ```
 *
 * @remarks
 * The stylesheet is optional. Framework adapters can operate in headless
 * mode without any default CSS applied.
 *
 * @public
 */
export {}
