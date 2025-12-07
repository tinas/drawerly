import type {
  DrawerDefaultOptions,
  DrawerManager,
} from '@drawerly/core'
import type { VueDrawerOptions } from './utils'

import { inject, markRaw } from 'vue'
import { DrawerSymbol } from './utils'

export interface UseDrawerContextResult<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> {
  getState: DrawerManager<TVueDrawerOptions>['getState']

  getDrawerInstance: DrawerManager<TVueDrawerOptions>['getDrawerInstance']

  getDefaultOptions: DrawerManager<Omit<TVueDrawerOptions, 'component'>>['getDefaultOptions']

  subscribe: DrawerManager<TVueDrawerOptions>['subscribe']

  open: DrawerManager<TVueDrawerOptions>['open']

  close: DrawerManager<TVueDrawerOptions>['close']

  bringToTop: DrawerManager<TVueDrawerOptions>['bringToTop']

  closeAll: DrawerManager<TVueDrawerOptions>['closeAll']

  updateDefaultOptions: DrawerManager<Omit<TVueDrawerOptions, 'component'>>['updateDefaultOptions']

  updateOptions: DrawerManager<Omit<TVueDrawerOptions, 'component'>>['updateOptions']
}

/**
 * Returns the global drawer manager instance registered by {@link DrawerPlugin}.
 *
 * @public
 */
export function useDrawerContext<TVueDrawerOptions extends VueDrawerOptions>(): UseDrawerContextResult<TVueDrawerOptions> {
  const manager = inject<DrawerManager<TVueDrawerOptions>>(DrawerSymbol)

  if (!manager) {
    throw new Error(
      '[@drawerly/vue] useDrawerContext must be used after installing DrawerPlugin.',
    )
  }

  const getState: UseDrawerContextResult<TVueDrawerOptions>['getState'] = () => manager.getState()

  const getDrawerInstance: UseDrawerContextResult<TVueDrawerOptions>['getDrawerInstance'] = (drawerKey) => {
    return manager.getDrawerInstance(drawerKey)
  }

  const getDefaultOptions: UseDrawerContextResult<TVueDrawerOptions>['getDefaultOptions'] = () => {
    const defaultOptions = manager.getDefaultOptions()

    // Omit 'component' from the returned default options
    const { component, ...rest } = defaultOptions || {}
    return rest as DrawerDefaultOptions<Omit<TVueDrawerOptions, 'component'>> | undefined
  }

  const subscribe: UseDrawerContextResult<TVueDrawerOptions>['subscribe'] = listener => manager.subscribe(listener)

  const open: UseDrawerContextResult<TVueDrawerOptions>['open'] = (options) => {
    const { component, ...rest } = options

    return manager.open({
      ...rest,
      component: component ? markRaw(component) : undefined,
    } as TVueDrawerOptions)
  }

  const close: UseDrawerContextResult<TVueDrawerOptions>['close'] = (drawerKey) => {
    manager.close(drawerKey)
  }

  const bringToTop: UseDrawerContextResult<TVueDrawerOptions>['bringToTop'] = (drawerKey) => {
    manager.bringToTop(drawerKey)
  }

  const closeAll: UseDrawerContextResult<TVueDrawerOptions>['closeAll'] = () => {
    manager.closeAll()
  }

  const updateDefaultOptions: UseDrawerContextResult<TVueDrawerOptions>['updateDefaultOptions'] = (updater) => {
    manager.updateDefaultOptions(
      updater as unknown as (
        prev: DrawerDefaultOptions<TVueDrawerOptions> | undefined,
      ) => DrawerDefaultOptions<TVueDrawerOptions>,
    )
  }

  const updateOptions: UseDrawerContextResult<TVueDrawerOptions>['updateOptions'] = (drawerKey, updater) => {
    manager.updateOptions(
      drawerKey,
      updater as unknown as (
        prev: DrawerDefaultOptions<TVueDrawerOptions>,
      ) => DrawerDefaultOptions<TVueDrawerOptions>,
    )
  }

  return {
    getState,
    getDrawerInstance,
    getDefaultOptions,
    subscribe,
    open,
    close,
    bringToTop,
    closeAll,
    updateDefaultOptions,
    updateOptions,
  }
}
