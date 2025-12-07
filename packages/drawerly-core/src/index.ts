/**
 * Unique identifier for a drawer instance.
 *
 * @public
 */
export type DrawerKey = string

/**
 * Drawer placement relative to the viewport.
 *
 * @public
 */
export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'

/**
 * Base options used when opening a drawer.
 *
 * Framework adapters can extend this interface.
 *
 * @public
 */
export interface DrawerOptions {
  /**
   * Unique key identifying the drawer instance.
   */
  drawerKey: DrawerKey

  /**
   * Drawer placement relative to the viewport.
   *
   * @defaultValue 'right'
   */
  placement?: DrawerPlacement

  /**
   * Controls whether pressing Escape closes the drawer.
   *
   * @defaultValue true
   */
  closeOnEscapeKey?: boolean | ((instance: DrawerOptions) => boolean)

  /**
   * Controls whether clicking the backdrop closes the drawer.
   *
   * @defaultValue true
   */
  closeOnBackdropClick?: boolean | ((instance: DrawerOptions) => boolean)

  /**
   * ARIA label applied to the drawer panel.
   */
  ariaLabel?: string

  /**
   * ARIA `describedby` reference applied to the drawer panel.
   */
  ariaDescribedBy?: string

  /**
   * ARIA `labelledby` reference applied to the drawer panel.
   */
  ariaLabelledBy?: string

  /**
   * Extra data attributes applied to the drawer overlay element.
   */
  dataAttributes?: Record<
    `data-${string}`,
    string | number | boolean | null | undefined
  >
}

/**
 * Default options merged into all drawers when opened.
 *
 * Does not include `drawerKey`.
 *
 * @public
 */
export type DrawerDefaultOptions<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> = Omit<Partial<TDrawerOptions>, 'drawerKey'>

/**
 * A drawer instance is its full options object including `drawerKey`.
 *
 * @public
 */
export type DrawerInstance<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> = TDrawerOptions

/**
 * Shape of the drawer manager state.
 *
 * @public
 */
export interface DrawerState<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> {
  /**
   * Current drawer stack. The last item is the top drawer.
   */
  stack: DrawerInstance<TDrawerOptions>[]
}

/**
 * Listener called whenever the drawer state changes.
 *
 * @public
 */
export type DrawerListener<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> = (state: DrawerState<TDrawerOptions>) => void

/**
 * Function returned from `subscribe` to remove the listener.
 *
 * @public
 */
export type Unsubscribe = () => void

/**
 * Public API of the drawer manager.
 *
 * @public
 */
export interface DrawerManager<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> {
  /**
   * Returns the current drawer state.
   */
  getState: () => DrawerState<TDrawerOptions>

  /**
   * Returns a specific drawer instance by key.
   */
  getDrawerInstance: (key: DrawerKey) => DrawerInstance<TDrawerOptions> | undefined

  /**
   * Returns the current global default options.
   */
  getDefaultOptions: () => DrawerDefaultOptions<TDrawerOptions> | undefined

  /**
   * Subscribes to state changes.
   */
  subscribe: (listener: DrawerListener<TDrawerOptions>) => Unsubscribe

  /**
   * Opens or updates a drawer and brings it to the top.
   */
  open: (options: TDrawerOptions) => DrawerKey

  /**
   * Closes the top drawer or a specific drawer by key.
   */
  close: (key?: DrawerKey) => void

  /**
   * Brings the drawer with the given key to the top.
   */
  bringToTop: (key: DrawerKey) => void

  /**
   * Closes all drawers.
   */
  closeAll: () => void

  /**
   * Updates the global default options used for future drawers.
   */
  updateDefaultOptions: (
    updater: (
      prev: DrawerDefaultOptions<TDrawerOptions> | undefined,
    ) => DrawerDefaultOptions<TDrawerOptions>,
  ) => void

  /**
   * Updates options for a specific existing drawer.
   */
  updateOptions: (
    key: DrawerKey,
    updater: (
      prev: DrawerDefaultOptions<TDrawerOptions>,
    ) => DrawerDefaultOptions<TDrawerOptions>,
  ) => void
}

/**
 * Creates a new drawer manager.
 *
 * @public
 */
export function createDrawerManager<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
>(
  initialState?: Partial<DrawerState<TDrawerOptions>>,
  defaultOptions?: DrawerDefaultOptions<TDrawerOptions>,
): DrawerManager<TDrawerOptions> {
  let state: DrawerState<TDrawerOptions> = {
    stack: initialState?.stack ? [...initialState.stack] : [],
  }

  let defaults: DrawerDefaultOptions<TDrawerOptions> | undefined
    = defaultOptions
      ? {
          placement: 'right',
          closeOnEscapeKey: true,
          closeOnBackdropClick: true,
          ...defaultOptions,
        }
      : undefined

  const listeners = new Set<DrawerListener<TDrawerOptions>>()

  const notify = (): void => {
    for (const listener of listeners)
      listener(state)
  }

  const getState = (): DrawerState<TDrawerOptions> => state

  const getDrawerInstance = (key: DrawerKey): DrawerInstance<TDrawerOptions> | undefined => {
    return state.stack.find(d => d?.drawerKey === key)
  }

  const getDefaultOptions = ():
    | DrawerDefaultOptions<TDrawerOptions>
    | undefined => defaults

  const subscribe = (
    listener: DrawerListener<TDrawerOptions>,
  ): Unsubscribe => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const mergeOptions = (options: TDrawerOptions): TDrawerOptions => {
    if (!defaults)
      return options
    return { ...(defaults as TDrawerOptions), ...options }
  }

  const findIndex = (
    key: DrawerKey,
    stack: TDrawerOptions[],
  ): number => stack.findIndex(d => d?.drawerKey === key)

  const moveToTop = (
    stack: TDrawerOptions[],
    index: number,
    updated?: TDrawerOptions,
  ): TDrawerOptions[] => {
    const len = stack.length
    if (index < 0 || index >= len)
      return stack

    const instAtIndex = stack[index]
    if (instAtIndex === undefined)
      return stack

    if (index === len - 1 && !updated)
      return stack

    const result: TDrawerOptions[] = []

    for (let i = 0; i < len; i++) {
      if (i === index)
        continue
      const inst = stack[i]
      if (inst !== undefined)
        result.push(inst)
    }

    const target = updated ?? instAtIndex
    result.push(target)
    return result
  }

  const open = (options: TDrawerOptions): DrawerKey => {
    const key = options.drawerKey
    const merged = mergeOptions(options)

    const idx = findIndex(key, state.stack)

    if (idx === -1) {
      state = { stack: [...state.stack, merged] }
      notify()
      return key
    }

    state = { stack: moveToTop(state.stack, idx, merged) }
    notify()
    return key
  }

  const close = (key?: DrawerKey): void => {
    const { stack } = state
    if (!stack.length)
      return

    if (!key) {
      state = { stack: stack.slice(0, stack.length - 1) }
      notify()
      return
    }

    const filtered = stack.filter(d => d?.drawerKey !== key)
    if (filtered.length !== stack.length) {
      state = { stack: filtered }
      notify()
    }
  }

  const bringToTop = (key: DrawerKey): void => {
    const { stack } = state
    const len = stack.length
    if (len < 2)
      return

    const idx = findIndex(key, stack)
    if (idx === -1 || idx === len - 1)
      return

    state = { stack: moveToTop(stack, idx) }
    notify()
  }

  const closeAll = (): void => {
    if (!state.stack.length)
      return
    state = { stack: [] }
    notify()
  }

  const updateDefaultOptions = (
    updater: (
      prev: DrawerDefaultOptions<TDrawerOptions> | undefined,
    ) => DrawerDefaultOptions<TDrawerOptions>,
  ): void => {
    defaults = updater(defaults)
  }

  const updateOptions = (
    key: DrawerKey,
    updater: (
      prev: DrawerDefaultOptions<TDrawerOptions>,
    ) => DrawerDefaultOptions<TDrawerOptions>,
  ): void => {
    const { stack } = state
    const idx = findIndex(key, stack)
    if (idx === -1)
      return

    const current = stack[idx]
    if (current === undefined)
      return

    const { drawerKey, ...rest } = current

    const next = updater(rest)
    if (next === current)
      return

    const updatedStack = stack.slice()
    updatedStack[idx] = { drawerKey, ...next } as TDrawerOptions
    state = { stack: updatedStack }
    notify()
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
