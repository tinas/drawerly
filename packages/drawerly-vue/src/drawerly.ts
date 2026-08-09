import type {
  DrawerDefaultOptions,
  DrawerManager,
  DrawerState,
} from '@drawerly/core'
import type { App, ShallowRef } from 'vue'
import type { VueDrawerOptions } from './types'

import { createDrawerManager } from '@drawerly/core'
import { markRaw, shallowRef } from 'vue'
import { DrawerlyContainer } from './drawer-container'
import { drawerlyInjectionKey } from './injection'

/**
 * Configuration options for {@link createDrawerly}.
 *
 * @public
 */
export interface DrawerlyOptions<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
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
export interface Drawerly<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> extends DrawerManager<TDrawerOptions> {
  /**
   * Reactive drawer state.
   */
  state: Readonly<ShallowRef<DrawerState<TDrawerOptions>>>

  /**
   * Installs the instance into a Vue application.
   */
  install: (app: App) => void
}

// Written as a literal expression so bundlers can fold it away.
// eslint-disable-next-line node/prefer-global/process
const isDev = process.env.NODE_ENV !== 'production'

// Vue warns when a component definition ends up behind a reactive proxy.
function markComponentRaw(options: unknown): void {
  if (typeof options !== 'object' || options === null || !('component' in options))
    return

  const { component } = options
  if (typeof component === 'object' && component !== null)
    markRaw(component)
}

/**
 * Creates a {@link Drawerly} instance to be installed with `app.use()`.
 *
 * @public
 */
export function createDrawerly<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
>(options?: DrawerlyOptions<TDrawerOptions>): Drawerly<TDrawerOptions> {
  markComponentRaw(options?.defaultOptions)

  const manager = createDrawerManager<TDrawerOptions>({
    defaultOptions: options?.defaultOptions,
  })

  const state = shallowRef(manager.getState())
  manager.subscribe((next) => {
    state.value = next
  })

  const drawerly: Drawerly<TDrawerOptions> = {
    ...manager,
    state,

    // Reading through `state` keeps these usable inside computed properties
    // and render functions, not only in event handlers.
    getState: () => state.value,
    getDrawerInstance: key => state.value.stack.find(d => d.drawerKey === key),
    getTopDrawer: () => state.value.stack[state.value.stack.length - 1],
    isOpen: key => state.value.stack.some(d => d.drawerKey === key),

    open: (drawerOptions) => {
      markComponentRaw(drawerOptions)
      return manager.open(drawerOptions)
    },

    updateOptions: (key, patch) => {
      markComponentRaw(patch)
      manager.updateOptions(key, patch)
    },

    updateDefaultOptions: (patch) => {
      markComponentRaw(patch)
      manager.updateDefaultOptions(patch)
    },

    install: (app) => {
      if (isDev && app.config.globalProperties.$drawerly) {
        console.warn(
          '[@drawerly/vue] Another Drawerly instance is already installed in this app and will be replaced. For an independent drawer stack, provide `drawerlyInjectionKey` in a subtree instead of installing a second instance.',
        )
      }

      app.provide(drawerlyInjectionKey, drawerly)
      app.config.globalProperties.$drawerly = drawerly

      if (!app.component('DrawerlyContainer'))
        app.component('DrawerlyContainer', DrawerlyContainer)
    },
  }

  return drawerly
}

declare module 'vue' {
  interface ComponentCustomProperties {
    /**
     * Drawerly instance registered by {@link createDrawerly}.
     */
    $drawerly: Drawerly
  }

  interface GlobalComponents {
    /**
     * Container that renders the active drawer stack.
     */
    DrawerlyContainer: typeof DrawerlyContainer
  }
}
