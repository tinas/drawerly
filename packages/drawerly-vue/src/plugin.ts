import type { DrawerManager } from '@drawerly/core'
import type {
  DrawerComponentConfig,
  DrawerUiOptions,
  DrawerPlacement as SharedDrawerPlacement,
} from '@drawerly/shared'
import type { App, Component, InjectionKey, Plugin } from 'vue'
import type { OmitKeys } from './utils'
import { createDrawerManager } from '@drawerly/core'
import { defineComponent, h } from 'vue'
import { DrawerlyContainer } from './drawer-container'

/**
 * Re-export of the shared drawer placement union so that consumers can
 * import it directly from `@drawerly/vue` if they prefer.
 *
 * @public
 */
export type DrawerPlacement = SharedDrawerPlacement

/**
 * Drawer options used by the Vue adapter.
 *
 * This interface combines:
 * - {@link DrawerUiOptions} for shared UI-related configuration
 * - {@link DrawerComponentConfig} for component-driven drawers
 *
 * Applications will typically extend this with a more specific
 * `componentProps` shape that matches their drawer component.
 *
 * @example
 * ```ts
 * interface SettingsDrawerOptions extends VueDrawerOptions {
 *   componentProps: {
 *     userId: string
 *     tab?: 'profile' | 'billing'
 *   }
 * }
 * ```
 *
 * @public
 */
export interface VueDrawerOptions
  extends DrawerUiOptions,
  DrawerComponentConfig {
  /**
   * Vue component that will be rendered inside the drawer panel.
   *
   * This is optional to allow headless usage, where applications
   * render their own markup via the default slot of
   * {@link DrawerlyContainer}.
   */
  component?: Component
}

/**
 * Injection key for the global drawer manager.
 *
 * @remarks
 * This is an internal symbol and should not be used directly.
 * Applications should use {@link useDrawerContext} instead.
 *
 * @internal
 */
export const DrawerSymbol: InjectionKey<DrawerManager<VueDrawerOptions>>
  = Symbol('drawerly')

/**
 * Configuration options for the Vue plugin.
 *
 * @public
 */
export interface DrawerPluginOptions {
  /**
   * Default options merged into all future drawer instances.
   * The `drawerKey` is not required here, as it is specific to each
   * individual drawer.
   *
   * These defaults are shallow-merged with the options that are used
   * when opening a drawer (for example via {@link useDrawer}), allowing
   * applications to define global behavior such as placement or
   * accessibility attributes.
   */
  defaultOptions?: Partial<OmitKeys<VueDrawerOptions, 'drawerKey' | 'component'>>

  /**
   * Teleport target selector for the container.
   *
   * This determines where in the DOM the drawer overlays will be
   * mounted.
   *
   * @defaultValue `'body'`
   */
  teleportTo?: string

  /**
   * Enables headless mode on the container.
   *
   * In headless mode, the container:
   * - does not render a backdrop
   * - does not handle Escape key or backdrop closing behavior
   * - does not emit animation-related data attributes
   *
   * The drawer stack and lifecycle are still managed, but all visual
   * aspects are left entirely to the application.
   *
   * @defaultValue `false`
   */
  headless?: boolean
}

/**
 * Vue plugin that registers the global {@link DrawerManager} and
 * the {@link DrawerlyContainer} component.
 *
 * @remarks
 * Once installed, the manager can be accessed via:
 *
 * - the {@link useDrawerContext} composable inside setup functions, or
 * - `this.$drawerly` on Vue component instances.
 *
 * @example
 * ```ts
 * const app = createApp(App)
 *
 * app.use(DrawerPlugin, {
 *   defaultOptions: {
 *     placement: 'right',
 *     closeOnBackdrop: true,
 *   },
 * })
 * ```
 *
 * @public
 */
export const DrawerPlugin: Plugin = {
  install(app: App, options?: DrawerPluginOptions) {
    const manager = createDrawerManager<VueDrawerOptions>(
      undefined,
      options?.defaultOptions as VueDrawerOptions | undefined,
    )

    app.provide(DrawerSymbol, manager)
    app.config.globalProperties.$drawerly = manager

    app.component(
      'DrawerlyContainer',
      defineComponent({
        name: 'DrawerlyContainer',
        setup(_, { slots }) {
          return () =>
            h(
              DrawerlyContainer,
              {
                teleportTo: options?.teleportTo,
                headless: options?.headless,
              },
              slots,
            )
        },
      }),
    )
  },
}

declare module 'vue' {
  interface ComponentCustomProperties {
    /**
     * Global drawer manager instance registered by {@link DrawerPlugin}.
     */
    $drawerly: DrawerManager<VueDrawerOptions>
  }

  export interface GlobalComponents {
    /**
     * Root container used to render the active drawer stack.
     */
    DrawerlyContainer: typeof DrawerlyContainer
  }
}
