import type { DrawerState } from '@drawerly/core'
import type { ReactDrawerOptions } from '../src/types'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let currentState: DrawerState<ReactDrawerOptions> = { stack: [] }
const listeners = new Set<(state: DrawerState<ReactDrawerOptions>) => void>()

const mockOpen = vi.fn()
const mockClose = vi.fn()
const mockCloseAll = vi.fn()
const mockBringToTop = vi.fn()
const mockUpdateOptions = vi.fn()
const mockDefaultOptions = vi.fn()
const mockUpdateDefaultOptions = vi.fn()

function setState(newStack: ReactDrawerOptions[]) {
  currentState = { stack: newStack }
  listeners.forEach(l => l(currentState))
}

function subscribe(listener: (state: DrawerState<ReactDrawerOptions>) => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getState = () => currentState

function getDrawerInstance(key: string) {
  return currentState.stack.find(d => d.drawerKey === key)
}

const mockManager = {
  subscribe,
  getState,
  getDrawerInstance,
  getDefaultOptions: mockDefaultOptions,
  open: mockOpen,
  close: mockClose,
  closeAll: mockCloseAll,
  bringToTop: mockBringToTop,
  updateDefaultOptions: mockUpdateDefaultOptions,
  updateOptions: mockUpdateOptions,
}

vi.mock('../src/manager', () => ({
  getDrawerManager: () => mockManager,
}))

const { useDrawer } = await import('../src/use-drawer')

describe('useDrawer', () => {
  beforeEach(() => {
    currentState = { stack: [] }
    listeners.clear()
    vi.clearAllMocks()
  })

  describe('manager Mode (no key)', () => {
    it('returns the current stack', () => {
      const { result } = renderHook(() => useDrawer())

      expect(result.current.stack).toEqual([])
    })

    it('open() calls manager.open with options', () => {
      const { result } = renderHook(() => useDrawer())

      act(() => {
        result.current.open({ drawerKey: 'test-drawer' })
      })

      expect(mockOpen).toHaveBeenCalledWith({ drawerKey: 'test-drawer' })
    })

    it('close() calls manager.close without key', () => {
      const { result } = renderHook(() => useDrawer())

      act(() => {
        result.current.close()
      })

      expect(mockClose).toHaveBeenCalledWith(undefined)
    })

    it('close(key) calls manager.close with key', () => {
      const { result } = renderHook(() => useDrawer())

      act(() => {
        result.current.close('drawer-1')
      })

      expect(mockClose).toHaveBeenCalledWith('drawer-1')
    })

    it('closeAll() calls manager.closeAll', () => {
      const { result } = renderHook(() => useDrawer())

      act(() => {
        result.current.closeAll()
      })

      expect(mockCloseAll).toHaveBeenCalled()
    })

    it('bringToTop() calls manager.bringToTop', () => {
      const { result } = renderHook(() => useDrawer())

      act(() => {
        result.current.bringToTop('drawer-1')
      })

      expect(mockBringToTop).toHaveBeenCalledWith('drawer-1')
    })

    it('getState() returns current state', () => {
      const { result } = renderHook(() => useDrawer())

      const state = result.current.getState()
      expect(state).toEqual({ stack: [] })
    })

    it('getDrawerInstance() returns undefined for nonexistent key', () => {
      const { result } = renderHook(() => useDrawer())

      const instance = result.current.getDrawerInstance('nonexistent')
      expect(instance).toBeUndefined()
    })

    it('updateOptions() calls manager.updateOptions', () => {
      const { result } = renderHook(() => useDrawer())

      act(() => {
        result.current.updateOptions('test-key', prev => ({ ...prev, placement: 'left' }))
      })

      expect(mockUpdateOptions).toHaveBeenCalledWith('test-key', expect.any(Function))
    })

    it('reflects stack changes when state updates', () => {
      const { result } = renderHook(() => useDrawer())

      expect(result.current.stack).toHaveLength(0)

      act(() => {
        setState([{ drawerKey: 'new-drawer' }])
      })

      expect(result.current.stack).toHaveLength(1)
      expect(result.current.stack[0]?.drawerKey).toBe('new-drawer')
    })
  })

  describe('instance Mode (with key)', () => {
    it('returns isOpen false when drawer is not in stack', () => {
      const { result } = renderHook(() => useDrawer('nonexistent'))

      expect(result.current.isOpen).toBe(false)
    })

    it('returns isOpen true when drawer is in stack', () => {
      setState([{ drawerKey: 'test-drawer' }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      expect(result.current.isOpen).toBe(true)
    })

    it('placement defaults to "right" when not set', () => {
      setState([{ drawerKey: 'test-drawer' }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      expect(result.current.placement).toBe('right')
    })

    it('placement returns the current value when set', () => {
      setState([{ drawerKey: 'test-drawer', placement: 'left' }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      expect(result.current.placement).toBe('left')
    })

    it('closeOnEscapeKey defaults to true when not set', () => {
      setState([{ drawerKey: 'test-drawer' }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      expect(result.current.closeOnEscapeKey).toBe(true)
    })

    it('closeOnEscapeKey returns false when explicitly set', () => {
      setState([{ drawerKey: 'test-drawer', closeOnEscapeKey: false }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      expect(result.current.closeOnEscapeKey).toBe(false)
    })

    it('closeOnBackdropClick defaults to true when not set', () => {
      setState([{ drawerKey: 'test-drawer' }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      expect(result.current.closeOnBackdropClick).toBe(true)
    })

    it('closeOnBackdropClick returns false when explicitly set', () => {
      setState([{ drawerKey: 'test-drawer', closeOnBackdropClick: false }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      expect(result.current.closeOnBackdropClick).toBe(false)
    })

    it('close() calls manager.close with the drawer key', () => {
      setState([{ drawerKey: 'test-drawer' }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      act(() => {
        result.current.close()
      })

      expect(mockClose).toHaveBeenCalledWith('test-drawer')
    })

    it('bringToTop() calls manager.bringToTop with the drawer key', () => {
      setState([{ drawerKey: 'test-drawer' }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      act(() => {
        result.current.bringToTop()
      })

      expect(mockBringToTop).toHaveBeenCalledWith('test-drawer')
    })

    it('setPlacement() calls updateOptions', () => {
      setState([{ drawerKey: 'test-drawer', placement: 'right' }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      act(() => {
        result.current.setPlacement('bottom')
      })

      expect(mockUpdateOptions).toHaveBeenCalledWith('test-drawer', expect.any(Function))
    })

    it('setCloseOnEscapeKey() calls updateOptions', () => {
      setState([{ drawerKey: 'test-drawer' }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      act(() => {
        result.current.setCloseOnEscapeKey(false)
      })

      expect(mockUpdateOptions).toHaveBeenCalledWith('test-drawer', expect.any(Function))
    })

    it('setCloseOnBackdropClick() calls updateOptions', () => {
      setState([{ drawerKey: 'test-drawer' }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      act(() => {
        result.current.setCloseOnBackdropClick(false)
      })

      expect(mockUpdateOptions).toHaveBeenCalledWith('test-drawer', expect.any(Function))
    })

    it('options returns drawer options excluding drawerKey and component', () => {
      setState([{
        drawerKey: 'test-drawer',
        placement: 'left',
        ariaLabel: 'Test',
        component: (() => null) as any,
      }])

      const { result } = renderHook(() => useDrawer('test-drawer'))

      expect(result.current.options).toEqual({
        placement: 'left',
        ariaLabel: 'Test',
      })
      expect((result.current.options as any).drawerKey).toBeUndefined()
      expect((result.current.options as any).component).toBeUndefined()
    })

    it('options is empty object when drawer not found', () => {
      const { result } = renderHook(() => useDrawer('nonexistent'))

      expect(result.current.options).toEqual({})
    })

    it('reacts to state changes', () => {
      const { result } = renderHook(() => useDrawer('test-drawer'))

      expect(result.current.isOpen).toBe(false)

      act(() => {
        setState([{ drawerKey: 'test-drawer', placement: 'bottom' }])
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.placement).toBe('bottom')
    })
  })

  describe('callback Stability', () => {
    it('manager mode callbacks are stable across renders', () => {
      const { result, rerender } = renderHook(() => useDrawer())

      const firstOpen = result.current.open
      const firstClose = result.current.close
      const firstCloseAll = result.current.closeAll
      const firstBringToTop = result.current.bringToTop

      rerender()

      expect(result.current.open).toBe(firstOpen)
      expect(result.current.close).toBe(firstClose)
      expect(result.current.closeAll).toBe(firstCloseAll)
      expect(result.current.bringToTop).toBe(firstBringToTop)
    })

    it('instance mode callbacks are stable across renders', () => {
      setState([{ drawerKey: 'test-drawer' }])

      const { result, rerender } = renderHook(() => useDrawer('test-drawer'))

      const firstClose = result.current.close
      const firstBringToTop = result.current.bringToTop
      const firstSetPlacement = result.current.setPlacement

      rerender()

      expect(result.current.close).toBe(firstClose)
      expect(result.current.bringToTop).toBe(firstBringToTop)
      expect(result.current.setPlacement).toBe(firstSetPlacement)
    })
  })
})
