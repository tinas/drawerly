import type {
  DrawerDefaultOptions,
  DrawerManager,
  DrawerState,
  DrawerUpdatableOptions,
} from '@drawerly/core'
import type { Mock } from 'vitest'
import type {
  VueDrawerDefaultOptionsWithoutComponent,
  VueDrawerUpdatableOptionsWithoutComponent,
} from '../src/use-drawer-context'
import type { VueDrawerOptions } from '../src/utils'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { inject, markRaw } from 'vue'
import { useDrawerContext } from '../src/use-drawer-context'

vi.mock('vue', () => ({
  inject: vi.fn(),
  markRaw: vi.fn((value: unknown) => value),
}))

type AnyDrawerManager = DrawerManager<VueDrawerOptions>

const injectMock = inject as unknown as Mock
const markRawMock = markRaw as unknown as Mock

function createMockManager(overrides: Partial<AnyDrawerManager> = {}): AnyDrawerManager {
  const base: AnyDrawerManager = {
    getState: vi.fn<() => DrawerState<VueDrawerOptions>>().mockReturnValue({
      stack: [],
    }),
    getDrawerInstance: vi
      .fn<(key: string) => VueDrawerOptions | undefined>()
      .mockReturnValue(undefined),
    getDefaultOptions: vi
      .fn<() => DrawerDefaultOptions<VueDrawerOptions> | undefined>()
      .mockReturnValue(undefined),
    subscribe: vi.fn().mockReturnValue(() => {}),
    open: vi.fn().mockReturnValue('key-from-open'),
    close: vi.fn(),
    bringToTop: vi.fn(),
    closeAll: vi.fn(),
    updateDefaultOptions: vi.fn(),
    updateOptions: vi.fn(),
  }

  return Object.assign(base, overrides)
}

describe('useDrawerContext', () => {
  beforeEach(() => {
    injectMock.mockReset()
    markRawMock.mockReset()
  })

  it('throws when no drawer manager is provided', () => {
    injectMock.mockReturnValue(undefined)

    expect(() => useDrawerContext()).toThrowError(
      '[@drawerly/vue] useDrawerContext must be used after installing DrawerPlugin.',
    )
  })

  it('forwards basic methods to the underlying manager', () => {
    const manager = createMockManager()
    injectMock.mockReturnValue(manager)

    const ctx = useDrawerContext()

    // getState
    const state = ctx.getState()
    expect(manager.getState).toHaveBeenCalledTimes(1)
    expect(state).toBe((manager.getState as Mock).mock.results[0].value)

    // getDrawerInstance
    ctx.getDrawerInstance('drawer-1')
    expect(manager.getDrawerInstance).toHaveBeenCalledWith('drawer-1')

    // subscribe
    const listener = vi.fn()
    const unsubscribe = ctx.subscribe(listener)
    expect(manager.subscribe).toHaveBeenCalledWith(listener)
    const unsubscribeFromManager = (manager.subscribe as Mock).mock.results[0].value
    expect(unsubscribe).toBe(unsubscribeFromManager)

    // close
    ctx.close('drawer-2')
    expect(manager.close).toHaveBeenCalledWith('drawer-2')

    // bringToTop
    ctx.bringToTop('drawer-3')
    expect(manager.bringToTop).toHaveBeenCalledWith('drawer-3')

    // closeAll
    ctx.closeAll()
    expect(manager.closeAll).toHaveBeenCalledTimes(1)
  })

  it('getDefaultOptions returns undefined when manager has no defaults', () => {
    const manager = createMockManager({
      getDefaultOptions: vi.fn().mockReturnValue(undefined),
    })
    injectMock.mockReturnValue(manager)

    const ctx = useDrawerContext()
    expect(ctx.getDefaultOptions()).toBeUndefined()
    expect(manager.getDefaultOptions).toHaveBeenCalledTimes(1)
  })

  it('getDefaultOptions strips the component field from defaults', () => {
    const component = {} as unknown as object

    const manager = createMockManager({
      getDefaultOptions: vi.fn().mockReturnValue({
        placement: 'left',
        ariaLabel: 'label',
        component,
      } satisfies DrawerDefaultOptions<VueDrawerOptions>),
    })
    injectMock.mockReturnValue(manager)

    const ctx = useDrawerContext()
    const defaults = ctx.getDefaultOptions()

    expect(defaults).toEqual<VueDrawerDefaultOptionsWithoutComponent<VueDrawerOptions>>({
      placement: 'left',
      ariaLabel: 'label',
    })
    // Ensure component is not present
    expect((defaults as any).component).toBeUndefined()
  })

  it('open marks the component as raw and forwards all options to manager.open', () => {
    const manager = createMockManager()
    injectMock.mockReturnValue(manager)

    const ctx = useDrawerContext()

    const component = {} as object

    const key = ctx.open({
      drawerKey: 'drawer-1',
      placement: 'right',
      ariaLabel: 'Drawer',
      component,
    } as VueDrawerOptions)

    // key is returned from manager.open
    expect(key).toBe('key-from-open')

    // markRaw is called with the component
    expect(markRawMock).toHaveBeenCalledTimes(1)
    expect(markRawMock).toHaveBeenCalledWith(component)

    // manager.open receives merged options with markRaw(component)
    expect(manager.open).toHaveBeenCalledTimes(1)
    const openArg = (manager.open as Mock).mock.calls[0][0] as VueDrawerOptions

    expect(openArg.drawerKey).toBe('drawer-1')
    expect(openArg.placement).toBe('right')
    expect(openArg.ariaLabel).toBe('Drawer')
    expect(openArg.component).toBe(component) // markRaw returns same value in this mock
  })

  it('open does not call markRaw when no component is provided', () => {
    const manager = createMockManager()
    injectMock.mockReturnValue(manager)

    const ctx = useDrawerContext()

    ctx.open({
      drawerKey: 'drawer-2',
      placement: 'left',
    } as VueDrawerOptions)

    expect(markRawMock).not.toHaveBeenCalled()
    expect(manager.open).toHaveBeenCalledTimes(1)

    const openArg = (manager.open as Mock).mock.calls[0][0] as VueDrawerOptions
    expect(openArg.drawerKey).toBe('drawer-2')
    // component is explicitly set to undefined by the implementation
    expect(openArg.component).toBeUndefined()
  })

  it('updateDefaultOptions passes defaults without component to the updater and preserves the original component', () => {
    const manager = createMockManager()
    injectMock.mockReturnValue(manager)

    const ctx = useDrawerContext()

    const userUpdater = vi.fn(
      (
        prev: VueDrawerDefaultOptionsWithoutComponent<VueDrawerOptions> | undefined,
      ): VueDrawerDefaultOptionsWithoutComponent<VueDrawerOptions> => {
        expect(prev).toEqual({
          placement: 'left',
          ariaLabel: 'Label',
        })
        return {
          ...prev,
          placement: 'right',
          ariaDescribedBy: 'desc',
        }
      },
    )

    ctx.updateDefaultOptions(userUpdater)

    // Grab the wrapper passed to manager.updateDefaultOptions
    expect(manager.updateDefaultOptions).toHaveBeenCalledTimes(1)
    const wrapper = (manager.updateDefaultOptions as Mock).mock.calls[0][0] as (
      prev: DrawerDefaultOptions<VueDrawerOptions> | undefined,
    ) => DrawerDefaultOptions<VueDrawerOptions>

    // Simulate existing defaults that include a component
    const prevDefaults: DrawerDefaultOptions<VueDrawerOptions> = {
      placement: 'left',
      ariaLabel: 'Label',
      component: {} as object,
    }

    const result = wrapper(prevDefaults)

    // userUpdater should have been called once with defaults minus component
    expect(userUpdater).toHaveBeenCalledTimes(1)

    // Result should preserve original component and apply user changes
    expect(result).toMatchObject<DrawerDefaultOptions<VueDrawerOptions>>({
      placement: 'right',
      ariaLabel: 'Label',
      ariaDescribedBy: 'desc',
      component: prevDefaults.component,
    })
  })

  it('updateDefaultOptions works when previous defaults are undefined', () => {
    const manager = createMockManager()
    injectMock.mockReturnValue(manager)

    const ctx = useDrawerContext()

    const userUpdater = vi.fn(
      (
        prev: VueDrawerDefaultOptionsWithoutComponent<VueDrawerOptions> | undefined,
      ): VueDrawerDefaultOptionsWithoutComponent<VueDrawerOptions> => {
        expect(prev).toEqual({})
        return {
          placement: 'bottom',
          ariaLabel: 'New',
        }
      },
    )

    ctx.updateDefaultOptions(userUpdater)

    expect(manager.updateDefaultOptions).toHaveBeenCalledTimes(1)
    const wrapper = (manager.updateDefaultOptions as Mock).mock.calls[0][0] as (
      prev: DrawerDefaultOptions<VueDrawerOptions> | undefined,
    ) => DrawerDefaultOptions<VueDrawerOptions>

    const result = wrapper(undefined)

    expect(userUpdater).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject<DrawerDefaultOptions<VueDrawerOptions>>({
      placement: 'bottom',
      ariaLabel: 'New',
    })
    expect((result as any).component).toBeUndefined()
  })

  it('updateOptions passes options without component to the updater and preserves the original component even if updater returns one', () => {
    const manager = createMockManager()
    injectMock.mockReturnValue(manager)

    const ctx = useDrawerContext()

    const userUpdater = vi.fn(
      (
        prev: VueDrawerUpdatableOptionsWithoutComponent<VueDrawerOptions>,
      ): VueDrawerUpdatableOptionsWithoutComponent<VueDrawerOptions> => {
        // prev should not contain component
        expect(prev).toEqual({
          placement: 'right',
          ariaLabel: 'Label',
        })

        // Even if we "incorrectly" include component here, it should be ignored
        return {
          ...prev,
          placement: 'left',
          ariaDescribedBy: 'desc',
          // @ts-expect-error: intentionally wrong at type level, to test runtime behavior
          component: { other: 'should-be-ignored' },
        }
      },
    )

    ctx.updateOptions('drawer-1', userUpdater)

    expect(manager.updateOptions).toHaveBeenCalledTimes(1)
    const wrapper = (manager.updateOptions as Mock).mock.calls[0][1] as (
      prev: DrawerUpdatableOptions<VueDrawerOptions>,
    ) => DrawerUpdatableOptions<VueDrawerOptions>

    const prevInstanceOptions: DrawerUpdatableOptions<VueDrawerOptions> = {
      placement: 'right',
      ariaLabel: 'Label',
      component: { name: 'Original' } as object,
    }

    const result = wrapper(prevInstanceOptions)

    // userUpdater called once with options minus component
    expect(userUpdater).toHaveBeenCalledTimes(1)

    // Result should:
    // - use updated fields from updater
    // - preserve original component, ignoring the one returned by updater
    expect(result).toMatchObject<DrawerUpdatableOptions<VueDrawerOptions>>({
      placement: 'left',
      ariaLabel: 'Label',
      ariaDescribedBy: 'desc',
      component: prevInstanceOptions.component,
    })
  })
})
