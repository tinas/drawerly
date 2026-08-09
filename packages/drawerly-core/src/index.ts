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
 * @public
 */
export type DrawerPredicate<TInstance>
  = | boolean
    | ((instance: TInstance) => boolean)

/**
 * Shared options for all drawers.
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
   * @defaultValue true
   */
  closeOnEscapeKey?: DrawerPredicate<this>

  /**
   * Whether clicking the backdrop closes the drawer.
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
 * Default options applied to new drawers.
 *
 * @public
 */
export type DrawerDefaultOptions<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> = Partial<DrawerOptionsWithoutKey<TDrawerOptions>>

/**
 * Partial set of options merged into a drawer.
 *
 * @public
 */
export type DrawerPatch<
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
  stack: readonly DrawerInstance<TDrawerOptions>[]
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
 * Configuration accepted by {@link createDrawerManager}.
 *
 * @public
 */
export interface DrawerManagerConfig<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
> {
  /**
   * Drawers present in the stack when the manager is created.
   */
  initialStack?: readonly DrawerInstance<TDrawerOptions>[]

  /**
   * Global default options merged into every opened drawer.
   */
  defaultOptions?: DrawerDefaultOptions<TDrawerOptions>
}

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
  getDrawerInstance: (key: DrawerKey) => DrawerInstance<TDrawerOptions> | undefined

  /**
   * Returns the topmost drawer instance, if any.
   */
  getTopDrawer: () => DrawerInstance<TDrawerOptions> | undefined

  /**
   * Returns whether a drawer with the given key is in the stack.
   */
  isOpen: (key: DrawerKey) => boolean

  /**
   * Returns the current global default options.
   */
  getDefaultOptions: () => DrawerDefaultOptions<TDrawerOptions>

  /**
   * Subscribes to state changes.
   */
  subscribe: (listener: DrawerListener<TDrawerOptions>) => Unsubscribe

  /**
   * Opens a drawer at the top of the stack. Options of an already open
   * drawer are replaced.
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
   * Merges a patch into the global default options used for future drawers.
   */
  updateDefaultOptions: (patch: DrawerDefaultOptions<TDrawerOptions>) => void

  /**
   * Merges a patch into the options of an existing drawer.
   */
  updateOptions: (key: DrawerKey, patch: DrawerPatch<TDrawerOptions>) => void
}

/**
 * Built-in defaults applied to every drawer manager.
 *
 * @public
 */
export const BASE_DRAWER_DEFAULTS = {
  placement: 'right',
  closeOnEscapeKey: true,
  closeOnBackdropClick: true,
} as const satisfies DrawerDefaultOptions

/**
 * Resolves a {@link DrawerPredicate} against a drawer instance.
 *
 * @public
 */
export function resolveDrawerPredicate<TInstance>(
  predicate: DrawerPredicate<TInstance> | undefined,
  instance: TInstance,
  fallback = true,
): boolean {
  if (predicate === undefined)
    return fallback
  if (typeof predicate === 'function')
    return predicate(instance)
  return predicate
}

function mergeDefined<TResult extends object>(
  base: object,
  patch: object | undefined,
): TResult {
  const result: Record<string, unknown> = { ...base }

  if (patch) {
    for (const [name, value] of Object.entries(patch)) {
      if (value !== undefined && value !== null)
        result[name] = value
    }
  }

  return result as TResult
}

/**
 * Creates a new drawer manager backed by an in-memory stack.
 *
 * @public
 */
export function createDrawerManager<
  TDrawerOptions extends DrawerOptions = DrawerOptions,
>(
  config?: DrawerManagerConfig<TDrawerOptions>,
): DrawerManager<TDrawerOptions> {
  let defaults = mergeDefined<DrawerDefaultOptions<TDrawerOptions>>(
    BASE_DRAWER_DEFAULTS,
    config?.defaultOptions,
  )

  const withDefaults = (
    options: DrawerInstance<TDrawerOptions>,
  ): DrawerInstance<TDrawerOptions> =>
    mergeDefined<DrawerInstance<TDrawerOptions>>(defaults, options)

  let state: DrawerState<TDrawerOptions> = {
    stack: (config?.initialStack ?? []).map(withDefaults),
  }

  const listeners = new Set<DrawerListener<TDrawerOptions>>()

  let dispatching = false
  let dispatchPending = false

  const notify = (): void => {
    // A listener may open or close a drawer while being notified. Dispatching
    // the resulting state after the current round keeps every listener on the
    // same state and delivers them in order.
    if (dispatching) {
      dispatchPending = true
      return
    }

    dispatching = true

    try {
      do {
        dispatchPending = false
        const notified = state

        for (const listener of [...listeners])
          listener(notified)
      } while (dispatchPending)
    }
    finally {
      dispatching = false
    }
  }

  const setStack = (stack: DrawerInstance<TDrawerOptions>[]): void => {
    state = { stack }
    notify()
  }

  const getState = (): DrawerState<TDrawerOptions> => state

  const getDrawerInstance = (
    key: DrawerKey,
  ): DrawerInstance<TDrawerOptions> | undefined =>
    state.stack.find(d => d.drawerKey === key)

  const getTopDrawer = (): DrawerInstance<TDrawerOptions> | undefined =>
    state.stack[state.stack.length - 1]

  const isOpen = (key: DrawerKey): boolean =>
    state.stack.some(d => d.drawerKey === key)

  const getDefaultOptions = (): DrawerDefaultOptions<TDrawerOptions> => defaults

  const subscribe = (
    listener: DrawerListener<TDrawerOptions>,
  ): Unsubscribe => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const open = (options: TDrawerOptions): DrawerKey => {
    const { drawerKey } = options

    setStack([
      ...state.stack.filter(d => d.drawerKey !== drawerKey),
      withDefaults(options),
    ])

    return drawerKey
  }

  const close = (key?: DrawerKey): void => {
    const { stack } = state
    if (!stack.length)
      return

    if (key === undefined) {
      setStack(stack.slice(0, -1))
      return
    }

    const remaining = stack.filter(d => d.drawerKey !== key)
    if (remaining.length !== stack.length)
      setStack(remaining)
  }

  const bringToTop = (key: DrawerKey): void => {
    const { stack } = state
    const target = getDrawerInstance(key)

    if (!target || stack[stack.length - 1] === target)
      return

    setStack([...stack.filter(d => d !== target), target])
  }

  const closeAll = (): void => {
    if (state.stack.length)
      setStack([])
  }

  const updateDefaultOptions = (
    patch: DrawerDefaultOptions<TDrawerOptions>,
  ): void => {
    defaults = mergeDefined<DrawerDefaultOptions<TDrawerOptions>>(defaults, patch)
  }

  const updateOptions = (
    key: DrawerKey,
    patch: DrawerPatch<TDrawerOptions>,
  ): void => {
    const index = state.stack.findIndex(d => d.drawerKey === key)
    const current = state.stack[index]
    if (!current)
      return

    const updated = mergeDefined<DrawerInstance<TDrawerOptions>>(current, patch)
    updated.drawerKey = current.drawerKey

    const stack = [...state.stack]
    stack[index] = updated
    setStack(stack)
  }

  return {
    getState,
    getDrawerInstance,
    getTopDrawer,
    isOpen,
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
