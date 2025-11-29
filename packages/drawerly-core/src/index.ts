/**
 * Unique identifier for a drawer instance.
 *
 * Applications should use stable strings such as:
 * - "settings"
 * - "filters"
 * - "profile"
 */
export type DrawerKey = string

/**
 * Base options used when opening a drawer.
 *
 * Applications or framework adapters should extend this interface.
 */
export interface DrawerOptions extends Record<string, unknown> {
  /**
   * Unique key identifying the drawer instance.
   */
  drawerKey: DrawerKey
}

/**
 * Represents a single drawer instance in the stack.
 */
export interface DrawerInstance<O extends DrawerOptions = DrawerOptions> {
  /**
   * The drawer's identity.
   */
  drawerKey: DrawerKey

  /**
   * Options associated with this drawer instance.
   */
  options?: O
}

/**
 * Shape of the drawer manager's internal state.
 */
export interface DrawerState<O extends DrawerOptions = DrawerOptions> {
  /**
   * Current drawer stack. The last item is the top drawer.
   */
  stack: DrawerInstance<O>[]
}

/**
 * Listener invoked whenever the drawer state changes.
 */
export type DrawerListener<O extends DrawerOptions = DrawerOptions> = (
  state: DrawerState<O>,
) => void

/**
 * Function returned from `subscribe` to stop receiving updates.
 */
export type Unsubscribe = () => void

/**
 * Public API for controlling a drawer stack.
 */
export interface DrawerManager<O extends DrawerOptions = DrawerOptions> {
  /**
   * Returns the current drawer state synchronously.
   */
  getState: () => DrawerState<O>

  /**
   * Returns the current default options that will be merged into
   * all future drawer instances.
   */
  getDefaultOptions: () => O | undefined

  /**
   * Subscribes to drawer state changes.
   *
   * @param listener - Callback invoked whenever the state changes.
   * @returns Function to unsubscribe the listener.
   */
  subscribe: (listener: DrawerListener<O>) => Unsubscribe

  /**
   * Opens a drawer for the given key with the provided options.
   *
   * - If a drawer with this key does not exist, a new drawer is pushed
   *   to the top of the stack.
   * - If it exists, its options are updated and the drawer is moved
   *   to the top of the stack.
   *
   * @param options - Options for the drawer instance.
   * @returns The key of the opened drawer.
   */
  open: (options: O) => DrawerKey

  /**
   * Closes a drawer.
   *
   * - If a key is provided, closes the drawer with that key.
   * - If no key is provided, closes the topmost drawer.
   *
   * @param key - Optional key of the drawer to close.
   */
  close: (key?: DrawerKey) => void

  /**
   * Moves the drawer with the given key to the top of the stack.
   * If no such drawer exists, nothing happens.
   *
   * @param key - Key of the drawer to promote.
   */
  bringToTop: (key: DrawerKey) => void

  /**
   * Closes all drawers and clears the stack.
   */
  closeAll: () => void

  /**
   * Updates the default options used for all future drawer instances.
   * Already opened drawers are not affected.
   *
   * @param updater - Function that receives the current default options
   * and returns the new defaults.
   */
  updateOptions: (updater: (prev: O | undefined) => O) => void
}

/**
 * Creates a new drawer manager.
 *
 * @typeParam O - Drawer options type used by this manager.
 *
 * @param initialState - Optional initial state (useful for SSR hydration or tests).
 * @param defaultOptions - Default options applied to all future drawer instances.
 *
 * @returns A {@link DrawerManager} instance.
 */
export function createDrawerManager<O extends DrawerOptions = DrawerOptions>(
  initialState?: Partial<DrawerState<O>>,
  defaultOptions?: O,
): DrawerManager<O> {
  let state: DrawerState<O> = {
    stack: [],
    ...initialState,
  }

  let defaults: O | undefined = defaultOptions
    ? ({ ...defaultOptions } as O)
    : undefined

  const listeners = new Set<DrawerListener<O>>()

  const notify = (): void => {
    for (const listener of listeners) {
      listener(state)
    }
  }

  const getState = (): DrawerState<O> => state

  const getDefaultOptions = (): O | undefined => defaults

  const subscribe = (listener: DrawerListener<O>): Unsubscribe => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const mergeOptions = (options: O): O => {
    if (!defaults)
      return options
    return { ...(defaults as O), ...options }
  }

  const findIndex = (key: DrawerKey, stack: DrawerInstance<O>[]): number => {
    const len = stack.length
    for (let i = 0; i < len; i++) {
      const inst = stack[i]
      if (inst && inst.drawerKey === key)
        return i
    }
    return -1
  }

  const moveToTop = (
    stack: DrawerInstance<O>[],
    index: number,
    updated?: DrawerInstance<O>,
  ): DrawerInstance<O>[] => {
    const len = stack.length
    if (index < 0 || index >= len)
      return stack

    const instAtIndex = stack[index]
    if (!instAtIndex)
      return stack

    // Already top & unchanged
    if (index === len - 1 && !updated)
      return stack

    const result: DrawerInstance<O>[] = []

    for (let i = 0; i < len; i++) {
      if (i === index)
        continue
      const inst = stack[i]
      if (inst)
        result.push(inst)
    }

    result.push(updated ?? instAtIndex)
    return result
  }

  const open = (options: O): DrawerKey => {
    const key = options.drawerKey
    const mergedOptions = mergeOptions(options)

    const stack = state.stack
    const index = findIndex(key, stack)

    if (index === -1) {
      const instance: DrawerInstance<O> = {
        drawerKey: key,
        options: mergedOptions,
      }
      state = { stack: [...stack, instance] }
      notify()
      return key
    }

    const updated: DrawerInstance<O> = {
      drawerKey: key,
      options: mergedOptions,
    }

    const nextStack = moveToTop(stack, index, updated)
    state = { stack: nextStack }
    notify()
    return key
  }

  const close = (key?: DrawerKey): void => {
    const stack = state.stack
    const len = stack.length
    if (!len)
      return

    if (!key) {
      state = { stack: stack.slice(0, len - 1) }
      notify()
      return
    }

    const next: DrawerInstance<O>[] = []
    for (let i = 0; i < len; i++) {
      const inst = stack[i]
      if (inst && inst.drawerKey !== key)
        next.push(inst)
    }

    if (next.length === len)
      return
    state = { stack: next }
    notify()
  }

  const bringToTop = (key: DrawerKey): void => {
    const stack = state.stack
    const len = stack.length
    if (len < 2)
      return

    const index = findIndex(key, stack)
    if (index === -1 || index === len - 1)
      return

    const nextStack = moveToTop(stack, index)
    state = { stack: nextStack }
    notify()
  }

  const closeAll = (): void => {
    if (!state.stack.length)
      return
    state = { stack: [] }
    notify()
  }

  const updateOptions = (updater: (prev: O | undefined) => O): void => {
    defaults = updater(defaults)
  }

  return {
    getState,
    getDefaultOptions,
    subscribe,
    open,
    close,
    bringToTop,
    closeAll,
    updateOptions,
  }
}
