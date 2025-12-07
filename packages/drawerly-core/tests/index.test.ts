import type {
  DrawerDefaultOptions,
  DrawerKey,
  DrawerOptions,
  DrawerState,
} from '../src/index'
import { describe, expect, it, vi } from 'vitest'
import { createDrawerManager } from '../src/index'

interface TestDrawerOptions extends DrawerOptions {
  title?: string
  extra?: string
}

function createTestManager(
  initial?: Partial<DrawerState<TestDrawerOptions>>,
  defaults?: DrawerDefaultOptions<TestDrawerOptions>,
) {
  return createDrawerManager<TestDrawerOptions>(initial, defaults)
}

describe('createDrawerManager', () => {
  it('initializes with an empty stack when no initial state is provided', () => {
    const manager = createTestManager()

    const state = manager.getState()
    expect(state.stack).toEqual([])
  })

  it('initializes with a cloned stack when initial state is provided', () => {
    const initial: DrawerState<TestDrawerOptions> = {
      stack: [
        { drawerKey: 'a', title: 'A' },
        { drawerKey: 'b', title: 'B' },
      ],
    }

    const manager = createTestManager(initial)
    const state = manager.getState()

    // same content but not the same array reference
    expect(state.stack).toEqual(initial.stack)
    expect(state.stack).not.toBe(initial.stack)
  })

  it('returns drawer instances by key with getDrawerInstance', () => {
    const manager = createTestManager({
      stack: [
        { drawerKey: 'a', title: 'A' },
        { drawerKey: 'b', title: 'B' },
      ],
    })

    expect(manager.getDrawerInstance('a')?.title).toBe('A')
    expect(manager.getDrawerInstance('b')?.title).toBe('B')
    expect(manager.getDrawerInstance('missing')).toBeUndefined()
  })

  it('returns undefined default options when none are configured', () => {
    const manager = createTestManager()

    expect(manager.getDefaultOptions()).toBeUndefined()
  })

  it('initializes default options with built-in defaults merged with user defaults', () => {
    const manager = createTestManager(undefined, {
      placement: 'left',
      extra: 'x',
    })

    const defaults = manager.getDefaultOptions()
    expect(defaults).toEqual({
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

  it('open merges options with default options when present', () => {
    const manager = createTestManager(undefined, {
      placement: 'left',
      extra: 'from-default',
    })

    manager.open({ drawerKey: 'a', title: 'From open' })

    const instance = manager.getDrawerInstance('a')
    expect(instance).toMatchObject({
      drawerKey: 'a',
      title: 'From open',
      placement: 'left',
      extra: 'from-default',
    })
  })

  it('open overrides default options with explicit options', () => {
    const manager = createTestManager(undefined, {
      placement: 'left',
      closeOnEscapeKey: false,
    })

    manager.open({
      drawerKey: 'a',
      placement: 'right',
      closeOnEscapeKey: true,
    })

    const instance = manager.getDrawerInstance('a')
    expect(instance).toMatchObject({
      drawerKey: 'a',
      placement: 'right', // override
      closeOnEscapeKey: true, // override
    })
  })

  it('open updates an existing drawer and moves it to the top', () => {
    const manager = createTestManager({
      stack: [
        { drawerKey: 'a', title: 'A' },
        { drawerKey: 'b', title: 'B' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    // update existing 'a' and move it to top
    manager.open({ drawerKey: 'a', title: 'A-updated' })

    const state = manager.getState()
    expect(state.stack.map(d => d.drawerKey)).toEqual(['b', 'a'])
    expect(state.stack[1]).toMatchObject({ drawerKey: 'a', title: 'A-updated' })

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('close without key closes the top drawer when stack is non-empty', () => {
    const manager = createTestManager({
      stack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.close()

    const state = manager.getState()
    expect(state.stack.map(d => d.drawerKey)).toEqual(['a'])
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
      stack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
        { drawerKey: 'c' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.close('b')

    const state = manager.getState()
    expect(state.stack.map(d => d.drawerKey)).toEqual(['a', 'c'])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('close with unknown key is a no-op and does not notify', () => {
    const manager = createTestManager({
      stack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.close('missing')

    const state = manager.getState()
    expect(state.stack.map(d => d.drawerKey)).toEqual(['a', 'b'])
    expect(listener).not.toHaveBeenCalled()
  })

  it('bringToTop is a no-op when stack has fewer than two items', () => {
    const manager = createTestManager({
      stack: [{ drawerKey: 'a' }],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.bringToTop('a')

    const state = manager.getState()
    expect(state.stack.map(d => d.drawerKey)).toEqual(['a'])
    expect(listener).not.toHaveBeenCalled()
  })

  it('bringToTop is a no-op when key is missing or already top', () => {
    const manager = createTestManager({
      stack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.bringToTop('missing')
    manager.bringToTop('b') // already top

    const state = manager.getState()
    expect(state.stack.map(d => d.drawerKey)).toEqual(['a', 'b'])
    expect(listener).not.toHaveBeenCalled()
  })

  it('bringToTop moves a middle drawer to the top and notifies', () => {
    const manager = createTestManager({
      stack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
        { drawerKey: 'c' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.bringToTop('b')

    const state = manager.getState()
    expect(state.stack.map(d => d.drawerKey)).toEqual(['a', 'c', 'b'])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('closeAll empties the stack and notifies when non-empty', () => {
    const manager = createTestManager({
      stack: [
        { drawerKey: 'a' },
        { drawerKey: 'b' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.closeAll()

    const state = manager.getState()
    expect(state.stack).toEqual([])
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

  it('updateDefaultOptions updates defaults via the updater', () => {
    const manager = createTestManager(undefined, {
      placement: 'left',
    })

    manager.updateDefaultOptions(prev => ({
      ...prev,
      extra: 'x',
    }))

    const defaults = manager.getDefaultOptions()
    expect(defaults).toMatchObject({
      placement: 'left',
      extra: 'x',
    })
  })

  it('updateDefaultOptions can initialize defaults when none exist', () => {
    const manager = createTestManager()

    manager.updateDefaultOptions(() => ({
      placement: 'bottom',
      extra: 'init',
    }))

    const defaults = manager.getDefaultOptions()
    expect(defaults).toEqual({
      placement: 'bottom',
      extra: 'init',
    })
  })

  it('updateOptions updates an existing drawer and preserves its key', () => {
    const manager = createTestManager({
      stack: [
        { drawerKey: 'a', title: 'Original', extra: 'one' },
        { drawerKey: 'b', title: 'Other' },
      ],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.updateOptions('a', prev => ({
      ...prev,
      title: 'Updated',
      extra: 'two',
    }))

    const state = manager.getState()
    const updated = state.stack.find(d => d.drawerKey === 'a')

    expect(updated).toMatchObject({
      drawerKey: 'a',
      title: 'Updated',
      extra: 'two',
    })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('updateOptions is a no-op when key does not exist', () => {
    const manager = createTestManager({
      stack: [{ drawerKey: 'a', title: 'A' }],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.updateOptions('missing', prev => ({ ...prev, title: 'X' }))

    const state = manager.getState()
    expect(state.stack[0]).toMatchObject({ drawerKey: 'a', title: 'A' })
    expect(listener).not.toHaveBeenCalled()
  })

  it('updateOptions is a no-op when updater returns the same object reference', () => {
    const initial: TestDrawerOptions = {
      drawerKey: 'a',
      title: 'A',
    }

    const manager = createTestManager({
      stack: [initial],
    })

    const listener = vi.fn()
    manager.subscribe(listener)

    manager.updateOptions('a', prev => prev) // same reference

    const state = manager.getState()
    // still the same reference in the stack
    expect(state.stack[0]).toBe(initial)
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
