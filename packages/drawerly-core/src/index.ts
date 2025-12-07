/**
 * Key used to identify a drawer instance.
 *
 * @public
 */
export type DrawerKey = string

/**
 * Placement of a drawer relative to the viewport.
 *
 * @public
 */
export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'

/**
 * Predicate used for drawer behaviors.
 *
 * Can be a boolean or a function that receives the drawer instance.
 *
 * @public
 */
export type DrawerPredicate<TInstance>
  = | boolean
    | ((instance: TInstance) => boolean)

/**
 * Shared options for all drawers.
 *
 * Adapters should extend this interface for framework-specific fields.
 *
 * @public
 */
export interface DrawerOptions {
  /**
   * Unique key identifying the drawer instance.
   */
  drawerKey: DrawerKey

  /**
   * Drawer placement.
   *
   * @defaultValue 'right'
   */
  placement?: DrawerPlacement

  /**
   * Whether pressing Escape closes the drawer.
   *
   * When a function is provided, it is called with the drawer instance.
   *
   * @defaultValue true
   */
  closeOnEscapeKey?: DrawerPredicate<this>

  /**
   * Whether clicking the backdrop closes the drawer.
   *
   * When a function is provided, it is called with the drawer instance.
   *
   * @defaultValue true
   */
  closeOnBackdropClick?: DrawerPredicate<this>

  /**
   * ARIA label for the drawer panel.
   */
  ariaLabel?: string

  /**
   * ARIA `describedby` id for the drawer panel.
   */
  ariaDescribedBy?: string

  /**
   * ARIA `labelledby` id for the drawer panel.
   */
  ariaLabelledBy?: string

  /**
   * Extra data attributes applied to the overlay element.
   */
  dataAttributes?: Record<
    `data-${string}`,
    string | number | boolean | null | undefined
  >
}

/**
 * Drawer options without the `drawerKey` field.
 *
 * @public
 */
export type DrawerOptionsWithoutKey<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> = Omit<TDrawerOptions, 'drawerKey'>

/**
 * Options of a drawer that can be updated at runtime.
 *
 * `drawerKey` is intentionally excluded.
 *
 * @public
 */
export type DrawerUpdatableOptions<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> = DrawerOptionsWithoutKey<TDrawerOptions>

/**
 * Default options applied to new drawers.
 *
 * Partial version of {@link DrawerUpdatableOptions}.
 *
 * @public
 */
export type DrawerDefaultOptions<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> = Partial<DrawerOptionsWithoutKey<TDrawerOptions>>

/**
 * Concrete drawer instance (full options including `drawerKey`).
 *
 * @public
 */
export type DrawerInstance<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> = TDrawerOptions

/**
 * Drawer manager state.
 *
 * @public
 */
export interface DrawerState<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> {
  /**
   * Current drawer stack. The last item is the topmost drawer.
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
 * Function that unsubscribes a state listener.
 *
 * @public
 */
export type Unsubscribe = () => void

/**
 * Public API for managing a stack of drawers.
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
   * Returns a drawer instance by key, if it exists.
   */
  getDrawerInstance: (
    key: DrawerKey,
  ) => DrawerInstance<TDrawerOptions> | undefined

  /**
   * Returns the current global default options.
   */
  getDefaultOptions: () => DrawerDefaultOptions<TDrawerOptions> | undefined

  /**
   * Subscribes to state changes.
   */
  subscribe: (listener: DrawerListener<TDrawerOptions>) => Unsubscribe

  /**
   * Opens or updates a drawer and moves it to the top of the stack.
   *
   * Returns the drawer key.
   */
  open: (options: TDrawerOptions) => DrawerKey

  /**
   * Closes the top drawer or the drawer with the given key.
   */
  close: (key?: DrawerKey) => void

  /**
   * Moves the drawer with the given key to the top of the stack.
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
   * Updates options for an existing drawer.
   *
   * The updater receives the current options without `drawerKey`
   * and must return the full updated options (still without `drawerKey`).
   */
  updateOptions: (
    key: DrawerKey,
    updater: (
      prev: DrawerUpdatableOptions<TDrawerOptions>,
    ) => DrawerUpdatableOptions<TDrawerOptions>,
  ) => void
}

/**
 * Creates a new drawer manager backed by an in-memory stack.
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

  let defaults: DrawerDefaultOptions<TDrawerOptions> | undefined = defaultOptions
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

  const getDrawerInstance = (
    key: DrawerKey,
  ): DrawerInstance<TDrawerOptions> | undefined => {
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
      prev: DrawerUpdatableOptions<TDrawerOptions>,
    ) => DrawerUpdatableOptions<TDrawerOptions>,
  ): void => {
    const { stack } = state
    const idx = findIndex(key, stack)
    if (idx === -1)
      return

    const current = stack[idx]
    if (current === undefined)
      return

    const { drawerKey, ...rest } = current

    const next = updater(rest as DrawerUpdatableOptions<TDrawerOptions>)
    if (next === rest)
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
