import type { App, Plugin, Component, InjectionKey } from 'vue'
import { defineComponent, h } from 'vue'
import {
  createDrawerManager,
  type DrawerOptions,
  type DrawerManager,
} from '@drawerly/core'
import { DrawerlyContainer } from './drawer-container'

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

/**
 * Drawer options used by the Vue adapter.
 *
 * Applications will typically extend this with their own props type.
 */
export interface VueDrawerOptions extends DrawerOptions {
  /**
   * Component rendered inside the drawer panel.
   */
  component: Component

  /**
   * Props passed to the rendered component.
   */
  props?: Record<string, unknown>

  placement?: DrawerPlacement
  closeOnEsc?: boolean
  closeOnBackdrop?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaLabelledBy?: string
  dataAttributes?: Record<
    `data-${string}`,
    string | number | boolean | null | undefined
  >
}

/**
 * Injection key for the global drawer manager.
 */
export const DrawerSymbol: InjectionKey<DrawerManager<VueDrawerOptions>> =
  Symbol('drawerly')

/**
 * Configuration for the Vue plugin.
 */
export interface DrawerPluginOptions {
  /**
   * Default options merged into all future drawer instances.
   * `drawerKey` is not required here.
   */
  defaultOptions?: Partial<Omit<VueDrawerOptions, 'drawerKey'>>
  teleportTo?: string
  headless?: boolean
}

/**
 * Vue plugin that registers the global drawer manager and container.
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
    $drawerly: DrawerManager<VueDrawerOptions>
  }

  export interface GlobalComponents {
    DrawerlyContainer: typeof DrawerlyContainer
  }
}
