import type {
  DrawerKey,
  DrawerManagerConfig,
  DrawerOptions,
} from '../src/index'
import {
  BASE_DRAWER_DEFAULTS,
  createDrawerManager,
  resolveDrawerPredicate,
} from '../src/index'

interface TestDrawerOptions extends DrawerOptions {
  title?: string
  extra?: string
}

function createTestManager(config?: DrawerManagerConfig<TestDrawerOptions>) {
  return createDrawerManager<TestDrawerOptions>(config)
}

describe('createDrawerManager', () => {
  it('initializes with an empty stack when no config is provided', () => {
    const manager = createTestManager()

    expect(manager.getState().stack).toEqual([])
  })

  it('applies defaults to drawers provided through initialStack', () => {
    const initialStack: TestDrawerOptions[] = [
      { drawerKey: 'a', title: 'A' },
      { drawerKey: 'b', title: 'B', placement: 'left' },
    ]

    const manager = createTestManager({ initialStack })
    const state = manager.getState()

    expect(state.stack).not.toBe(initialStack)
    expect(state.stack[0]).toEqual({
      ...BASE_DRAWER_DEFAULTS,
      drawerKey: 'a',
      title: 'A',
    })
    expect(state.stack[1]?.placement).toBe('left')
  })

  it('returns drawer instances by key with getDrawerInstance', () => {
    const manager = createTestManager({
      initialStack: [
        { drawerKey: 'a', title: 'A' },
        { drawerKey: 'b', title: 'B' },
      ],
    })

    expect(manager.getDrawerInstance('a')?.title).toBe('A')
    expect(manager.getDrawerInstance('b')?.title).toBe('B')
    expect(manager.getDrawerInstance('missing')).toBeUndefined()
  })

  it('returns the topmost drawer with getTopDrawer', () => {
    const manager = createTestManager()

    expect(manager.getTopDrawer()).toBeUndefined()

    manager.open({ drawerKey: 'a' })
    manager.open({ drawerKey: 'b' })

    expect(manager.getTopDrawer()?.drawerKey).toBe('b')
  })

  it('reports drawer presence with isOpen', () => {
    const manager = createTestManager()

    expect(manager.isOpen('a')).toBe(false)

    manager.open({ drawerKey: 'a' })
    expect(manager.isOpen('a')).toBe(true)

    manager.close('a')
    expect(manager.isOpen('a')).toBe(false)
  })

  it('always applies built-in defaults', () => {
    const manager = createTestManager()

    expect(manager.getDefaultOptions()).toEqual(BASE_DRAWER_DEFAULTS)

    manager.open({ drawerKey: 'a' })
    expect(manager.getDrawerInstance('a')).toMatchObject({
      drawerKey: 'a',
      placement: 'right',
      closeOnEscapeKey: true,
      closeOnBackdropClick: true,
    })
  })

  it('merges user defaults over built-in defaults', () => {
    const manager = createTestManager({
      defaultOptions: {
        placement: 'left',
        extra: 'x',
      },
    })

    expect(manager.getDefaultOptions()).toEqual({
      placement: 'left', // user override
      extra: 'x', // user field
      closeOnEscapeKey: true, // built-in
      closeOnBackdropClick: true, // built-in
    })
  })

  it('subscribes and unsubscribes listeners', () => {
    const manager = createTestManager()
    const listener = vi.fn()

    const unsubscribe = manager.subscribe(listener)

    manager.open({ drawerKey: 'a' })
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    manager.open({ drawerKey: 'b' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('dispatches state changes in order when a listener reacts to one', () => {
    const manager = createTestManager()
    const seen: DrawerKey[][] = []

    manager.subscribe((state) => {
      if (state.stack.length === 1)
        manager.open({ drawerKey: 'b' })
    })

    manager.subscribe((state) => {
      seen.push(state.stack.map(d => d.drawerKey))
    })

    manager.open({ drawerKey: 'a' })

    expect(seen).toEqual([['a'], ['a', 'b']])
  })

  it('open adds a new drawer to the top of the stack and returns the key', () => {
    const manager = createTestManager()
    const listener = vi.fn()
    manager.subscribe(listener)

    const key: DrawerKey = 'drawer-1'
    const returnedKey = manager.open({ drawerKey: key, title: 'First' })

    expect(returnedKey).toBe(key)

    const state = manager.getState()
    expect(state.stack).toHaveLength(1)
    expect(state.stack[0]).toMatchObject({
      drawerKey: key,
      title: 'First',
    })

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('open overrides default options with explicit options', () => {
    const manager = createTestManager({
      defaultOptions: {
        placement: 'left',
        closeOnEscapeKey: false,
      },
    })

    manager.open({
      drawerKey: 'a',
      placement: 'right',
      closeOnEscapeKey: true,
    })

    expect(manager.getDrawerInstance('a')).toMatchObject({
      drawerKey: 'a',
      placement: 'right', // override
      closeOnEscapeKey: true, // override
    })
  })

  it('open keeps defaults for options passed as undefined or null', () => {
    const manager = createTestManager({
      defaultOptions: { placement: 'left', extra: 'kept' },
    })

    manager.open({
      drawerKey: 'a',
      placement: undefined,
      extra: null as unknown as string,
    })

    expect(manager.getDrawerInstance('a')).toMatchObject({
      placement: 'left',
      extra: 'kept',
    })
  })

  it('open replaces the options of an already open drawer and moves it to the top', () => {
    const manager = createTestManager({
      initialStack: [
        { drawerKey: 'a', title: 'A', extra: 'dropped' },
        { drawerKey: 'b', title: 'B' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.open({ drawerKey: 'a', title: 'A-updated' })

    const state = manager.getState()
    expect(state.stack.map(d => d.drawerKey)).toEqual(['b', 'a'])
    expect(state.stack[1]).toMatchObject({ drawerKey: 'a', title: 'A-updated' })
    expect(state.stack[1]?.extra).toBeUndefined()

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('close without key closes the top drawer when stack is non-empty', () => {
    const manager = createTestManager({
      initialStack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.close()

    expect(manager.getState().stack.map(d => d.drawerKey)).toEqual(['a'])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('close without key is a no-op when stack is empty', () => {
    const manager = createTestManager()
    const listener = vi.fn()
    manager.subscribe(listener)

    manager.close()
    expect(listener).not.toHaveBeenCalled()
    expect(manager.getState().stack).toEqual([])
  })

  it('close with key removes the matching drawer and notifies', () => {
    const manager = createTestManager({
      initialStack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
        { drawerKey: 'c' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.close('b')

    expect(manager.getState().stack.map(d => d.drawerKey)).toEqual(['a', 'c'])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('close with unknown key is a no-op and does not notify', () => {
    const manager = createTestManager({
      initialStack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.close('missing')

    expect(manager.getState().stack.map(d => d.drawerKey)).toEqual(['a', 'b'])
    expect(listener).not.toHaveBeenCalled()
  })

  it('bringToTop is a no-op when key is missing or already top', () => {
    const manager = createTestManager({
      initialStack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.bringToTop('missing')
    manager.bringToTop('b') // already top

    expect(manager.getState().stack.map(d => d.drawerKey)).toEqual(['a', 'b'])
    expect(listener).not.toHaveBeenCalled()
  })

  it('bringToTop moves a middle drawer to the top and notifies', () => {
    const manager = createTestManager({
      initialStack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
        { drawerKey: 'c' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.bringToTop('b')

    expect(manager.getState().stack.map(d => d.drawerKey)).toEqual(['a', 'c', 'b'])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('closeAll empties the stack and notifies when non-empty', () => {
    const manager = createTestManager({
      initialStack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.closeAll()

    expect(manager.getState().stack).toEqual([])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('closeAll is a no-op when stack is already empty', () => {
    const manager = createTestManager()
    const listener = vi.fn()

    manager.subscribe(listener)
    manager.closeAll()

    expect(manager.getState().stack).toEqual([])
    expect(listener).not.toHaveBeenCalled()
  })

  it('updateDefaultOptions merges a patch into defaults', () => {
    const manager = createTestManager({
      defaultOptions: { placement: 'left' },
    })

    manager.updateDefaultOptions({ extra: 'x' })

    expect(manager.getDefaultOptions()).toMatchObject({
      placement: 'left',
      extra: 'x',
    })
  })

  it('updateDefaultOptions keeps current values for undefined or null entries', () => {
    const manager = createTestManager({
      defaultOptions: { placement: 'left', extra: 'kept' },
    })

    manager.updateDefaultOptions({
      placement: undefined,
      extra: null as unknown as string,
    })

    expect(manager.getDefaultOptions()).toMatchObject({
      placement: 'left',
      extra: 'kept',
    })
  })

  it('updateOptions merges a patch into an existing drawer and preserves its key', () => {
    const manager = createTestManager({
      initialStack: [
        { drawerKey: 'a', title: 'Original', extra: 'one' },
        { drawerKey: 'b', title: 'Other' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.updateOptions('a', { title: 'Updated' })

    expect(manager.getDrawerInstance('a')).toMatchObject({
      drawerKey: 'a',
      title: 'Updated',
      extra: 'one', // untouched by the patch
    })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('updateOptions keeps current values for undefined or null entries', () => {
    const manager = createTestManager({
      initialStack: [{ drawerKey: 'a', title: 'Original', extra: 'one' }],
    })

    manager.updateOptions('a', {
      title: undefined,
      extra: null as unknown as string,
    })

    expect(manager.getDrawerInstance('a')).toMatchObject({
      title: 'Original',
      extra: 'one',
    })
  })

  it('updateOptions cannot override the drawer key', () => {
    const manager = createTestManager({
      initialStack: [{ drawerKey: 'a', title: 'A' }],
    })

    manager.updateOptions('a', { drawerKey: 'hijacked' } as never)

    expect(manager.getDrawerInstance('a')?.drawerKey).toBe('a')
    expect(manager.getDrawerInstance('hijacked')).toBeUndefined()
  })

  it('updateOptions is a no-op when key does not exist', () => {
    const manager = createTestManager({
      initialStack: [{ drawerKey: 'a', title: 'A' }],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.updateOptions('missing', { title: 'X' })

    expect(manager.getState().stack[0]).toMatchObject({ drawerKey: 'a', title: 'A' })
    expect(listener).not.toHaveBeenCalled()
  })

  it('getState returns a new state object when the stack changes', () => {
    const manager = createTestManager()

    const before = manager.getState()
    manager.open({ drawerKey: 'a' })
    const after = manager.getState()

    expect(before).not.toBe(after)
    expect(before.stack).toEqual([])
    expect(after.stack.map(d => d.drawerKey)).toEqual(['a'])
  })
})

describe('resolveDrawerPredicate', () => {
  const instance = { drawerKey: 'a' }

  it('returns the fallback when the predicate is undefined', () => {
    expect(resolveDrawerPredicate(undefined, instance)).toBe(true)
    expect(resolveDrawerPredicate(undefined, instance, false)).toBe(false)
  })

  it('returns booleans as-is', () => {
    expect(resolveDrawerPredicate(true, instance)).toBe(true)
    expect(resolveDrawerPredicate(false, instance)).toBe(false)
  })

  it('calls function predicates with the instance', () => {
    const predicate = vi.fn(
      (d: typeof instance) => d.drawerKey === 'a',
    )

    expect(resolveDrawerPredicate(predicate, instance)).toBe(true)
    expect(predicate).toHaveBeenCalledWith(instance)
  })
})
