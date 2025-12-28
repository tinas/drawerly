import type {
  DrawerInstance,
  DrawerKey,
  DrawerPlacement,
  DrawerState,
  DrawerUpdatableOptions,
  ReactDrawerOptions,
  ReactDrawerUpdatableOptionsWithoutComponent,
} from './types'
import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { getDrawerManager } from './manager'

/**
 * Result when `useDrawer()` is called without a key (manager mode).
 *
 * Provides full access to the drawer manager for opening, closing,
 * and managing multiple drawers.
 *
 * @public
 */
export interface UseDrawerManagerResult {
  /**
   * Current drawer stack. The last item is the topmost drawer.
   */
  stack: DrawerInstance<ReactDrawerOptions>[]

  /**
   * Opens a new drawer or updates an existing one and moves it to the top.
   *
   * @param options - Drawer options including key, component, and behavior settings.
   * @returns The drawer key.
   */
  open: (options: ReactDrawerOptions) => DrawerKey

  /**
   * Closes the top drawer or a specific drawer by key.
   *
   * @param key - Optional drawer key. If omitted, closes the top drawer.
   */
  close: (key?: DrawerKey) => void

  /**
   * Closes all open drawers.
   */
  closeAll: () => void

  /**
   * Moves a drawer to the top of the stack.
   *
   * @param key - The drawer key to bring to top.
   */
  bringToTop: (key: DrawerKey) => void

  /**
   * Updates options for a specific drawer.
   *
   * @param key - The drawer key to update.
   * @param updater - Function receiving current options and returning updated options.
   */
  updateOptions: (
    key: DrawerKey,
    updater: (
      prev: ReactDrawerUpdatableOptionsWithoutComponent,
    ) => ReactDrawerUpdatableOptionsWithoutComponent,
  ) => void

  /**
   * Returns the current drawer state snapshot.
   */
  getState: () => DrawerState<ReactDrawerOptions>

  /**
   * Returns a specific drawer instance by key.
   *
   * @param key - The drawer key to look up.
   */
  getDrawerInstance: (key: DrawerKey) => DrawerInstance<ReactDrawerOptions> | undefined
}

/**
 * Result when `useDrawer(key)` is called with a key (instance mode).
 *
 * Provides reactive access to a specific drawer's state and controls.
 *
 * @public
 */
export interface UseDrawerInstanceResult {
  /**
   * Whether this drawer is currently in the stack.
   */
  isOpen: boolean

  /**
   * Current placement of the drawer.
   */
  placement: DrawerPlacement

  /**
   * Whether pressing Escape closes the drawer.
   */
  closeOnEscapeKey: boolean

  /**
   * Whether clicking the backdrop closes the drawer.
   */
  closeOnBackdropClick: boolean

  /**
   * All options (excluding drawerKey, component, render).
   */
  options: ReactDrawerUpdatableOptionsWithoutComponent

  /**
   * Closes this drawer.
   */
  close: () => void

  /**
   * Brings this drawer to the top of the stack.
   */
  bringToTop: () => void

  /**
   * Updates the drawer placement.
   *
   * @param placement - The new placement value.
   */
  setPlacement: (placement: DrawerPlacement) => void

  /**
   * Updates whether Escape key closes the drawer.
   *
   * @param value - The new value.
   */
  setCloseOnEscapeKey: (value: boolean) => void

  /**
   * Updates whether backdrop click closes the drawer.
   *
   * @param value - The new value.
   */
  setCloseOnBackdropClick: (value: boolean) => void

  /**
   * Updates any options for this drawer (excluding component/render).
   *
   * @param updater - Function receiving current options and returning updated options.
   */
  updateOptions: (
    updater: (
      prev: ReactDrawerUpdatableOptionsWithoutComponent,
    ) => ReactDrawerUpdatableOptionsWithoutComponent,
  ) => void
}

/**
 * Hook for managing drawers (manager mode).
 *
 * Without a key, returns controls for the entire drawer stack.
 *
 * @public
 */
export function useDrawer(): UseDrawerManagerResult

/**
 * Hook for a specific drawer instance (instance mode).
 *
 * With a key, returns reactive state and controls for that drawer.
 *
 * @param drawerKey - The key of the drawer to bind to.
 * @public
 */
export function useDrawer(drawerKey: DrawerKey): UseDrawerInstanceResult

export function useDrawer(
  drawerKey?: DrawerKey,
): UseDrawerManagerResult | UseDrawerInstanceResult {
  const manager = getDrawerManager()

  const state = useSyncExternalStore(
    manager.subscribe,
    manager.getState,
    manager.getState,
  )

  const stableKey = drawerKey ?? ''

  const managerOpen = useCallback(
    (options: ReactDrawerOptions) => manager.open(options),
    [manager],
  )

  const managerClose = useCallback(
    (key?: DrawerKey) => manager.close(key),
    [manager],
  )

  const managerCloseAll = useCallback(
    () => manager.closeAll(),
    [manager],
  )

  const managerBringToTop = useCallback(
    (key: DrawerKey) => manager.bringToTop(key),
    [manager],
  )

  const managerUpdateOptions = useCallback(
    (
      key: DrawerKey,
      updater: (
        prev: ReactDrawerUpdatableOptionsWithoutComponent,
      ) => ReactDrawerUpdatableOptionsWithoutComponent,
    ) => {
      manager.updateOptions(key, (prev: DrawerUpdatableOptions<ReactDrawerOptions>) => {
        const { component: _, componentProps: __, render: ___, ...rest } = prev as ReactDrawerOptions
        const updated = updater(rest as ReactDrawerUpdatableOptionsWithoutComponent)
        return { ...prev, ...updated }
      })
    },
    [manager],
  )

  const instance = useMemo(
    () => state.stack.find((d: DrawerInstance<ReactDrawerOptions>) => d.drawerKey === stableKey),
    [state.stack, stableKey],
  )

  const instanceOptions = useMemo((): ReactDrawerUpdatableOptionsWithoutComponent => {
    if (!instance)
      return {} as ReactDrawerUpdatableOptionsWithoutComponent

    const {
      drawerKey: _,
      component: __,
      componentProps: ___,
      render: ____,
      ...rest
    } = instance

    return rest as ReactDrawerUpdatableOptionsWithoutComponent
  }, [instance])

  const instanceClose = useCallback(
    () => manager.close(stableKey),
    [manager, stableKey],
  )

  const instanceBringToTop = useCallback(
    () => manager.bringToTop(stableKey),
    [manager, stableKey],
  )

  const instanceSetPlacement = useCallback(
    (value: DrawerPlacement) => {
      manager.updateOptions(stableKey, prev => ({ ...prev, placement: value }))
    },
    [manager, stableKey],
  )

  const instanceSetCloseOnEscapeKey = useCallback(
    (value: boolean) => {
      manager.updateOptions(stableKey, prev => ({ ...prev, closeOnEscapeKey: value }))
    },
    [manager, stableKey],
  )

  const instanceSetCloseOnBackdropClick = useCallback(
    (value: boolean) => {
      manager.updateOptions(stableKey, prev => ({ ...prev, closeOnBackdropClick: value }))
    },
    [manager, stableKey],
  )

  const instanceUpdateOptions = useCallback(
    (
      updater: (
        prev: ReactDrawerUpdatableOptionsWithoutComponent,
      ) => ReactDrawerUpdatableOptionsWithoutComponent,
    ) => {
      manager.updateOptions(stableKey, (prev: DrawerUpdatableOptions<ReactDrawerOptions>) => {
        const { component: _, componentProps: __, render: ___, ...rest } = prev as ReactDrawerOptions
        const updated = updater(rest as ReactDrawerUpdatableOptionsWithoutComponent)
        return { ...prev, ...updated }
      })
    },
    [manager, stableKey],
  )

  if (drawerKey === undefined) {
    return {
      stack: state.stack,
      open: managerOpen,
      close: managerClose,
      closeAll: managerCloseAll,
      bringToTop: managerBringToTop,
      updateOptions: managerUpdateOptions,
      getState: manager.getState,
      getDrawerInstance: manager.getDrawerInstance,
    }
  }

  const isOpen = Boolean(instance)
  const placement: DrawerPlacement = instance?.placement ?? 'right'

  const closeOnEscapeKey = typeof instance?.closeOnEscapeKey === 'boolean'
    ? instance.closeOnEscapeKey
    : true

  const closeOnBackdropClick = typeof instance?.closeOnBackdropClick === 'boolean'
    ? instance.closeOnBackdropClick
    : true

  return {
    isOpen,
    placement,
    closeOnEscapeKey,
    closeOnBackdropClick,
    options: instanceOptions,
    close: instanceClose,
    bringToTop: instanceBringToTop,
    setPlacement: instanceSetPlacement,
    setCloseOnEscapeKey: instanceSetCloseOnEscapeKey,
    setCloseOnBackdropClick: instanceSetCloseOnBackdropClick,
    updateOptions: instanceUpdateOptions,
  }
}
