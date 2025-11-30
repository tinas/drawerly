import type { DrawerManager } from '@drawerly/core'
import type { VueDrawerOptions } from './plugin'
import { inject } from 'vue'
import { DrawerSymbol } from './plugin'

/**
 * Returns the global drawer manager instance registered by {@link DrawerPlugin}.
 *
 * @remarks
 * This helper must be used only after installing {@link DrawerPlugin} on
 * your Vue application. If the plugin has not been installed, it will
 * throw an error to help you catch misconfiguration early.
 *
 * @example
 * ```ts
 * import { useDrawerContext } from '@drawerly/vue'
 *
 * const manager = useDrawerContext()
 *
 * manager.open({
 *   drawerKey: 'settings',
 *   component: SettingsDrawer,
 *   placement: 'right',
 * })
 * ```
 *
 * @public
 */
export function useDrawerContext(): DrawerManager<VueDrawerOptions> {
  const manager = inject<DrawerManager<VueDrawerOptions>>(DrawerSymbol)

  if (!manager) {
    throw new Error(
      '[@drawerly/vue] useDrawerContext must be used after installing DrawerPlugin.',
    )
  }

  return manager
}
