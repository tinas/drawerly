import type {
  DrawerState,
  DrawerUpdatableOptions,
} from '@drawerly/core'
import type { Mock } from 'vitest'
import type { UseDrawerInstanceResult } from '../src/use-drawer-instance'
import type { VueDrawerOptions } from '../src/utils'

import { useDrawerContext } from '../src/use-drawer-context'
import { useDrawerInstance } from '../src/use-drawer-instance'

const mountedCallbacks: Array<() => void> = []
const beforeUnmountCallbacks: Array<() => void> = []

vi.mock('vue', () => {
  const shallowRef = <T>(initial: T) => ({ value: initial })

  const computed = (arg: any) => {
    if (typeof arg === 'function') {
      // read-only computed
      return {
        get value() {
          return arg()
        },
      }
    }

    // writable computed with { get, set }
    return {
      get value() {
        return arg.get()
      },
      set value(v: any) {
        arg.set(v)
      },
    }
  }

  const watch = (source: any, cb: (newVal: any, oldVal: any) => void, options?: any) => {
    // Read the current value from the source (could be a ref or computed)
    const currentValue = source.value !== undefined ? source.value : source

    // Call immediately if requested
    if (options?.immediate) {
      cb(currentValue, undefined)
    }

    return () => {}
  }

  const onMounted = (fn: () => void) => {
    mountedCallbacks.push(fn)
  }

  const onBeforeUnmount = (fn: () => void) => {
    beforeUnmountCallbacks.push(fn)
  }

  const toValue = (v: any) => (typeof v === 'function' ? v() : v)

  return {
    shallowRef,
    computed,
    watch,
    onMounted,
    onBeforeUnmount,
    toValue,
  }
})

vi.mock('../src/use-drawer-context', () => ({
  useDrawerContext: vi.fn(),
}))

// Simple manager type for our mocks (we don’t need full generic fidelity here)
interface MockManager {
  getState: Mock
  getDrawerInstance: Mock
  getDefaultOptions: Mock
  subscribe: Mock
  open: Mock
  close: Mock
  bringToTop: Mock
  closeAll: Mock
  updateDefaultOptions: Mock
  updateOptions: Mock
}

const useDrawerContextMock = useDrawerContext as unknown as Mock

function resetLifecycle() {
  mountedCallbacks.length = 0
  beforeUnmountCallbacks.length = 0
}

function createMockManager(overrides: Partial<MockManager> = {}): MockManager {
  const base: MockManager = {
    getState: vi.fn().mockReturnValue({ stack: [] } as DrawerState<VueDrawerOptions>),
    getDrawerInstance: vi.fn().mockReturnValue(undefined as VueDrawerOptions | undefined),
    getDefaultOptions: vi.fn().mockReturnValue(undefined),
    subscribe: vi.fn().mockReturnValue(() => {}),
    open: vi.fn().mockReturnValue('key-from-open'),
    close: vi.fn(),
    bringToTop: vi.fn(),
    closeAll: vi.fn(),
    updateDefaultOptions: vi.fn(),
    updateOptions: vi.fn(),
  }

  return { ...base, ...overrides }
}

describe('useDrawerInstance', () => {
  beforeEach(() => {
    resetLifecycle()
    useDrawerContextMock.mockReset()
  })

  it('returns closed state and empty options when instance is missing', () => {
    const manager = createMockManager({
      getDrawerInstance: vi.fn().mockReturnValue(undefined),
    })
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    expect(manager.getDrawerInstance).toHaveBeenCalledWith('drawer-1')
    expect(api.isOpen.value).toBe(false)
    expect(api.options.value).toEqual({})
  })

  it('derives options from the found instance, stripping drawerKey and component', () => {
    const instance: VueDrawerOptions = {
      drawerKey: 'drawer-1',
      placement: 'left',
      ariaLabel: 'Label',
      component: {} as any,
    }

    const manager = createMockManager({
      getDrawerInstance: vi.fn().mockReturnValue(instance),
    })
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    expect(manager.getDrawerInstance).toHaveBeenCalledWith('drawer-1')
    expect(api.isOpen.value).toBe(true)
    expect(api.options.value).toEqual({
      placement: 'left',
      ariaLabel: 'Label',
    })
    expect((api.options.value as any).drawerKey).toBeUndefined()
    expect((api.options.value as any).component).toBeUndefined()
  })

  it('subscribes on mount and unsubscribes on beforeUnmount', () => {
    const unsubscribeMock = vi.fn()

    const manager = createMockManager({
      subscribe: vi.fn().mockReturnValue(unsubscribeMock),
    })
    useDrawerContextMock.mockReturnValue(manager)

    useDrawerInstance('drawer-1')

    // simulate mount
    expect(mountedCallbacks).toHaveLength(1)
    mountedCallbacks[0]!()

    expect(manager.subscribe).toHaveBeenCalledTimes(1)
    const listener = (manager.subscribe as Mock).mock.calls[0]![0]
    expect(typeof listener).toBe('function')

    // simulate unmount
    expect(beforeUnmountCallbacks).toHaveLength(1)
    beforeUnmountCallbacks[0]!()

    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
  })

  it('keeps instance in sync when subscription listener is called', () => {
    let capturedListener: ((state: DrawerState<VueDrawerOptions>) => void) | null = null as ((state: DrawerState<VueDrawerOptions>) => void) | null

    const manager = createMockManager({
      subscribe: vi.fn().mockImplementation((listener: any) => {
        capturedListener = listener
        return () => {}
      }),
    })
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    // simulate mount
    mountedCallbacks[0]!()

    const state: DrawerState<VueDrawerOptions> = {
      stack: [
        { drawerKey: 'other' },
        { drawerKey: 'drawer-1', placement: 'bottom', ariaLabel: 'From state' },
      ],
    }

    capturedListener?.(state)

    expect(api.isOpen.value).toBe(true)
    expect(api.options.value).toEqual({
      placement: 'bottom',
      ariaLabel: 'From state',
    })
  })

  it('placement getter returns the current placement or "right" when missing', () => {
    const instanceNoPlacement: VueDrawerOptions = {
      drawerKey: 'drawer-1',
    }

    const manager = createMockManager({
      getDrawerInstance: vi.fn().mockReturnValue(instanceNoPlacement),
    })
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult
    expect(api.placement.value).toBe('right')

    ;(manager.getDrawerInstance as Mock).mockReturnValueOnce({
      drawerKey: 'drawer-1',
      placement: 'top',
    } as VueDrawerOptions)

    const api2 = useDrawerInstance('drawer-1') as UseDrawerInstanceResult
    expect(api2.placement.value).toBe('top')
  })

  it('placement setter calls manager.updateOptions with merged placement', () => {
    const instance: VueDrawerOptions = {
      drawerKey: 'drawer-1',
      placement: 'left',
      ariaLabel: 'Label',
    }

    const manager = createMockManager({
      getDrawerInstance: vi.fn().mockReturnValue(instance),
    })
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    api.placement.value = 'bottom'

    expect(manager.updateOptions).toHaveBeenCalledTimes(1)
    const [key, updater] = (manager.updateOptions as Mock).mock.calls[0]!

    expect(key).toBe('drawer-1')
    expect(typeof updater).toBe('function')

    const prevOptions: DrawerUpdatableOptions<VueDrawerOptions> = {
      placement: 'left',
      ariaLabel: 'Label',
    }

    const next = updater(prevOptions)
    expect(next).toEqual({
      placement: 'bottom',
      ariaLabel: 'Label',
    })
  })

  it('closeOnEscapeKey getter uses true as default when undefined', () => {
    const instance: VueDrawerOptions = {
      drawerKey: 'drawer-1',
    }

    const manager = createMockManager({
      getDrawerInstance: vi.fn().mockReturnValue(instance),
    })
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    expect(api.closeOnEscapeKey.value).toBe(true)

    ;(manager.getDrawerInstance as Mock).mockReturnValueOnce({
      drawerKey: 'drawer-1',
      closeOnEscapeKey: false,
    } as VueDrawerOptions)

    const api2 = useDrawerInstance('drawer-1') as UseDrawerInstanceResult
    expect(api2.closeOnEscapeKey.value).toBe(false)
  })

  it('closeOnEscapeKey setter updates the flag via manager.updateOptions', () => {
    const instance: VueDrawerOptions = {
      drawerKey: 'drawer-1',
      closeOnEscapeKey: false,
    }

    const manager = createMockManager({
      getDrawerInstance: vi.fn().mockReturnValue(instance),
    })
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    api.closeOnEscapeKey.value = true

    expect(manager.updateOptions).toHaveBeenCalledTimes(1)
    const [key, updater] = (manager.updateOptions as Mock).mock.calls[0]!

    expect(key).toBe('drawer-1')

    const prev: DrawerUpdatableOptions<VueDrawerOptions> = {
      closeOnEscapeKey: false,
    }
    const next = updater(prev)

    expect(next).toEqual({
      closeOnEscapeKey: true,
    })
  })

  it('closeOnBackdropClick getter uses true as default when undefined', () => {
    const instance: VueDrawerOptions = {
      drawerKey: 'drawer-1',
    }

    const manager = createMockManager({
      getDrawerInstance: vi.fn().mockReturnValue(instance),
    })
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    expect(api.closeOnBackdropClick.value).toBe(true)

    ;(manager.getDrawerInstance as Mock).mockReturnValueOnce({
      drawerKey: 'drawer-1',
      closeOnBackdropClick: false,
    } as VueDrawerOptions)

    const api2 = useDrawerInstance('drawer-1') as UseDrawerInstanceResult
    expect(api2.closeOnBackdropClick.value).toBe(false)
  })

  it('closeOnBackdropClick setter updates the flag via manager.updateOptions', () => {
    const instance: VueDrawerOptions = {
      drawerKey: 'drawer-1',
      closeOnBackdropClick: false,
    }

    const manager = createMockManager({
      getDrawerInstance: vi.fn().mockReturnValue(instance),
    })
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    api.closeOnBackdropClick.value = true

    expect(manager.updateOptions).toHaveBeenCalledTimes(1)
    const [key, updater] = (manager.updateOptions as Mock).mock.calls[0]!

    expect(key).toBe('drawer-1')

    const prev: DrawerUpdatableOptions<VueDrawerOptions> = {
      closeOnBackdropClick: false,
    }
    const next = updater(prev)

    expect(next).toEqual({
      closeOnBackdropClick: true,
    })
  })

  it('close calls manager.close with the current drawer key', () => {
    const manager = createMockManager()
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    api.close()
    expect(manager.close).toHaveBeenCalledWith('drawer-1')
  })

  it('bringToTop calls manager.bringToTop with the current drawer key', () => {
    const manager = createMockManager()
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    api.bringToTop()
    expect(manager.bringToTop).toHaveBeenCalledWith('drawer-1')
  })

  it('updateOptions passes the updater through to manager.updateOptions with the current key', () => {
    const manager = createMockManager()
    useDrawerContextMock.mockReturnValue(manager)

    const api = useDrawerInstance('drawer-1') as UseDrawerInstanceResult

    const updater = vi.fn()
    api.updateOptions(updater as any)

    expect(manager.updateOptions).toHaveBeenCalledTimes(1)
    const [key, passedUpdater] = (manager.updateOptions as Mock).mock.calls[0]!

    expect(key).toBe('drawer-1')
    expect(passedUpdater).toBe(updater)
  })
})
