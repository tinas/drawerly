import type {
  DrawerDefaultOptions,
  DrawerManager,
} from '@drawerly/core'
import type {
  App,
  Plugin,
} from 'vue'
import type {
  VueDrawerOptions,
} from './utils'

import { createDrawerManager } from '@drawerly/core'
import { defineComponent, h } from 'vue'
import { DrawerlyContainer } from './drawer-container'
import { DrawerSymbol } from './utils'

/**
 * Options accepted by {@link DrawerPlugin}.
 *
 * @public
 */
export interface DrawerPluginOptions {
  /**
   * Default drawer options applied to all future instances.
   */
  defaultOptions?: DrawerDefaultOptions<Omit<VueDrawerOptions, 'component'>>

  /**
   * Teleport target for the drawer container.
   *
   * @defaultValue 'body'
   */
  teleportTo?: string

  /**
   * Enables headless mode on the container.
   *
   * @defaultValue false
   */
  headless?: boolean
}

/**
 * Registers a global {@link DrawerManager} and the
 * {@link DrawerlyContainer} component.
 *
 * @public
 */
export const DrawerPlugin: Plugin = {
  install(app: App, options?: DrawerPluginOptions) {
    const headless = options?.headless === true

    const manager = createDrawerManager<VueDrawerOptions>(
      undefined,
      {
        placement: 'right',
        closeOnEscapeKey: true,
        closeOnBackdropClick: true,
        ...(options?.defaultOptions ?? {}),
      },
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
                headless,
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
     * Global drawer manager registered by {@link DrawerPlugin}.
     */
    $drawerly: DrawerManager<VueDrawerOptions>
  }

  export interface GlobalComponents {
    /**
     * Root container that renders the active drawer stack.
     */
    DrawerlyContainer: typeof DrawerlyContainer
  }
}
