import type {
  DrawerDefaultOptions,
  DrawerKey,
  DrawerManager,
  DrawerUpdatableOptions,
} from '@drawerly/core'
import type { VueDrawerOptions } from './utils'

import { inject, markRaw } from 'vue'
import { DrawerSymbol } from './utils'

/**
 * Vue drawer options without the `component` field.
 *
 * @public
 */
export type VueDrawerOptionsWithoutComponent<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> = Omit<TVueDrawerOptions, 'component'>

/**
 * Updatable Vue drawer options, excluding `component`.
 *
 * Mirrors {@link DrawerUpdatableOptions} from core but hides `component`.
 *
 * @public
 */
export type VueDrawerUpdatableOptionsWithoutComponent<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> = Omit<DrawerUpdatableOptions<TVueDrawerOptions>, 'component'>

/**
 * Default Vue drawer options, excluding `component`.
 *
 * Mirrors {@link DrawerDefaultOptions} from core but hides `component`.
 *
 * @public
 */
export type VueDrawerDefaultOptionsWithoutComponent<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> = Omit<DrawerDefaultOptions<TVueDrawerOptions>, 'component'>

/**
 * API returned by {@link useDrawerContext}.
 *
 * Mirrors {@link DrawerManager} but:
 * - `defaultOptions` and updates never expose or modify `component`.
 *
 * @public
 */
export interface UseDrawerContextResult<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> {
  getState: DrawerManager<TVueDrawerOptions>['getState']

  getDrawerInstance: DrawerManager<TVueDrawerOptions>['getDrawerInstance']

  /**
   * Returns global default options for Vue drawers, excluding `component`.
   */
  getDefaultOptions: () =>
    | VueDrawerDefaultOptionsWithoutComponent<TVueDrawerOptions>
    | undefined

  subscribe: DrawerManager<TVueDrawerOptions>['subscribe']

  open: DrawerManager<TVueDrawerOptions>['open']

  close: DrawerManager<TVueDrawerOptions>['close']

  bringToTop: DrawerManager<TVueDrawerOptions>['bringToTop']

  closeAll: DrawerManager<TVueDrawerOptions>['closeAll']

  /**
   * Updates global default options for Vue drawers, excluding `component`.
   */
  updateDefaultOptions: (
    updater: (
      prev:
        | VueDrawerDefaultOptionsWithoutComponent<TVueDrawerOptions>
        | undefined,
    ) => VueDrawerDefaultOptionsWithoutComponent<TVueDrawerOptions>,
  ) => void

  /**
   * Updates options for an existing drawer, excluding `component`.
   */
  updateOptions: (
    drawerKey: DrawerKey,
    updater: (
      prev: VueDrawerUpdatableOptionsWithoutComponent<TVueDrawerOptions>,
    ) => VueDrawerUpdatableOptionsWithoutComponent<TVueDrawerOptions>,
  ) => void
}

/**
 * Returns the global drawer manager instance registered by {@link DrawerPlugin}.
 *
 * The returned API:
 * - automatically marks the `component` passed to {@link DrawerManager.open} as `markRaw`
 * - hides `component` from defaults and option updates.
 *
 * @public
 */
export function useDrawerContext<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
>(): UseDrawerContextResult<TVueDrawerOptions> {
  const manager = inject<DrawerManager<TVueDrawerOptions>>(DrawerSymbol)

  if (!manager) {
    throw new Error(
      '[@drawerly/vue] useDrawerContext must be used after installing DrawerPlugin.',
    )
  }

  const getState: UseDrawerContextResult<
    TVueDrawerOptions
  >['getState'] = () => manager.getState()

  const getDrawerInstance: UseDrawerContextResult<
    TVueDrawerOptions
  >['getDrawerInstance'] = drawerKey => manager.getDrawerInstance(drawerKey)

  const getDefaultOptions: UseDrawerContextResult<
    TVueDrawerOptions
  >['getDefaultOptions'] = () => {
    const defaults = manager.getDefaultOptions()
    if (!defaults)
      return undefined

    const { component, ...rest } = defaults

    return rest as VueDrawerDefaultOptionsWithoutComponent<TVueDrawerOptions>
  }

  const subscribe: UseDrawerContextResult<
    TVueDrawerOptions
  >['subscribe'] = listener => manager.subscribe(listener)

  const open: UseDrawerContextResult<
    TVueDrawerOptions
  >['open'] = (options) => {
    const { component, ...rest } = options as VueDrawerOptions

    return manager.open({
      ...(rest as TVueDrawerOptions),
      component: component ? markRaw(component) : undefined,
    } as TVueDrawerOptions)
  }

  const close: UseDrawerContextResult<
    TVueDrawerOptions
  >['close'] = drawerKey => manager.close(drawerKey)

  const bringToTop: UseDrawerContextResult<
    TVueDrawerOptions
  >['bringToTop'] = drawerKey => manager.bringToTop(drawerKey)

  const closeAll: UseDrawerContextResult<
    TVueDrawerOptions
  >['closeAll'] = () => manager.closeAll()

  const updateDefaultOptions: UseDrawerContextResult<
    TVueDrawerOptions
  >['updateDefaultOptions'] = (updater) => {
    manager.updateDefaultOptions((prev) => {
      const { component, ...restPrev } = (prev ?? {}) as DrawerDefaultOptions<TVueDrawerOptions>

      const nextWithoutComponent = updater(
        restPrev as VueDrawerDefaultOptionsWithoutComponent<TVueDrawerOptions>,
      )

      // Preserve any existing component default, but do not allow changing it
      // through this API.
      // TS cannot fully infer this merged shape, so we use a controlled cast.
      return {
        ...(prev ?? {}),
        ...nextWithoutComponent,
        ...(component ? { component } : {}),
      } as unknown as DrawerDefaultOptions<TVueDrawerOptions>
    })
  }

  const updateOptions: UseDrawerContextResult<
    TVueDrawerOptions
  >['updateOptions'] = (drawerKey, updater) => {
    manager.updateOptions(drawerKey, (prev) => {
      const { component, ...restPrev } = prev as DrawerUpdatableOptions<TVueDrawerOptions>

      const nextWithoutComponent = updater(
        restPrev as VueDrawerUpdatableOptionsWithoutComponent<TVueDrawerOptions>,
      )

      // Preserve the existing component on the instance
      // do not allow swapping it via updates.
      return {
        ...prev,
        ...nextWithoutComponent,
        ...(component ? { component } : {}),
      } as DrawerUpdatableOptions<TVueDrawerOptions>
    })
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
