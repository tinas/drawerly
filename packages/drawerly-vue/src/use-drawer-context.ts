import type { DrawerManager } from '@drawerly/core'
import type { VueDrawerOptions } from './plugin'
import { inject } from 'vue'
import { DrawerSymbol } from './plugin'

/**
 * Returns the global drawer manager instance.
 */
export function useDrawerContext(): DrawerManager<VueDrawerOptions> {
  const manager = inject(DrawerSymbol)

  if (!manager) {
    throw new Error(
      '[@drawerly/vue] useDrawerContext must be used after installing DrawerPlugin',
    )
  }

  return manager
}
