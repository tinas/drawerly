import type { DrawerState } from '@drawerly/core'
import type { VueDrawerOptions } from '../src/utils'

import { mount } from '@vue/test-utils'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { DrawerlyContainer } from '../src/drawer-container'
import { DrawerSymbol } from '../src/utils'

type Listener = (state: DrawerState<VueDrawerOptions>) => void

interface MockManager {
  getState: () => DrawerState<VueDrawerOptions>
  subscribe: (listener: Listener) => () => void
  close: (key: string) => void
  bringToTop: (key: string) => void
  closeAll: () => void
  updateDefaultOptions: (...args: any[]) => void
  updateOptions: (...args: any[]) => void
}

/**
 * Helper to create a mock manager with a mutable state and listeners.
 */
function createMockManager(initialStack: VueDrawerOptions[] = []) {
  let state: DrawerState<VueDrawerOptions> = { stack: initialStack }
  const listeners: Listener[] = []

  const manager: MockManager = {
    getState: () => state,
    subscribe: (listener: Listener) => {
      listeners.push(listener)
      return () => {
        const idx = listeners.indexOf(listener)
        if (idx !== -1)
          listeners.splice(idx, 1)
      }
    },
    close: vi.fn(),
    bringToTop: vi.fn(),
    closeAll: vi.fn(),
    updateDefaultOptions: vi.fn(),
    updateOptions: vi.fn(),
  }

  const setStack = (nextStack: VueDrawerOptions[]) => {
    const nextState: DrawerState<VueDrawerOptions> = { stack: nextStack }
    state = nextState
    listeners.forEach(l => l(nextState))
  }

  return { manager, setStack }
}

// Polyfill AnimationEvent for Node/jsdom if needed
beforeAll(() => {
  if (typeof AnimationEvent === 'undefined') {
    class AnimationEventStub extends Event {
      animationName: string

      constructor(type: string, init?: { animationName?: string }) {
        super(type)
        this.animationName = init?.animationName ?? ''
      }
    }

    // @ts-expect-error: assign to global for test env
    globalThis.AnimationEvent = AnimationEventStub
  }
})

describe('drawerlyContainer', () => {
  let addListenerSpy: ReturnType<typeof vi.spyOn>
  let removeListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addListenerSpy = vi.spyOn(document, 'addEventListener')
    removeListenerSpy = vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    addListenerSpy.mockRestore()
    removeListenerSpy.mockRestore()
    document.body.innerHTML = ''
  })

  it('throws if used without a provided DrawerManager', () => {
    expect(() => {
      mount(DrawerlyContainer, {
        props: { headless: false },
      })
    }).toThrowError(
      '[@drawerly/vue] DrawerlyContainer must be used within DrawerPlugin',
    )
  })

  it('renders the stack, filters data-* attributes, and respects placement', () => {
    const { manager } = createMockManager([
      {
        drawerKey: 'd1',
        placement: 'left',
        ariaLabel: 'First drawer',
        dataAttributes: {
          'data-foo': 'bar',
          'data-drawerly-internal': 'should-be-filtered',
        },
      } as VueDrawerOptions,
    ])

    const wrapper = mount(DrawerlyContainer, {
      props: {
        headless: false,
        teleportTo: 'body',
      },
      global: {
        provide: {
          [DrawerSymbol as symbol]: manager,
        },
      },
    })

    const overlays = document.querySelectorAll('[data-drawerly-overlay]')
    expect(overlays.length).toBe(1)

    const overlay = overlays[0] as HTMLElement
    expect(overlay.getAttribute('data-drawerly-key')).toBe('d1')
    expect(overlay.getAttribute('data-drawerly-placement')).toBe('left')

    // Keeps user data-* but drops internal data-drawerly-* keys
    expect(overlay.getAttribute('data-foo')).toBe('bar')
    expect(overlay.hasAttribute('data-drawerly-internal')).toBe(false)

    const backdrop = overlay.querySelector('[data-drawerly-backdrop]')
    expect(backdrop).not.toBeNull()

    wrapper.unmount()
  })

  it('backdrop click respects closeOnBackdropClick predicates and emits events', () => {
    const close = vi.fn()
    const { manager } = createMockManager([
      {
        drawerKey: 'd1',
        placement: 'right',
        closeOnBackdropClick: true,
      } as VueDrawerOptions,
    ])

    manager.close = close

    const wrapper = mount(DrawerlyContainer, {
      props: {
        headless: false,
        teleportTo: 'body',
      },
      global: {
        provide: {
          [DrawerSymbol as symbol]: manager,
        },
      },
    })

    const backdrop = document.querySelector(
      '[data-drawerly-backdrop]',
    ) as HTMLElement
    expect(backdrop).not.toBeNull()

    backdrop.click()

    const panel = document.querySelector(
      '[data-drawerly-panel]',
    ) as HTMLElement
    expect(panel).not.toBeNull()

    const animationEvent = new AnimationEvent('animationend', {
      animationName: 'drawerly-slide-out-right',
    })
    panel.dispatchEvent(animationEvent)

    expect(close).toHaveBeenCalledWith('d1')

    // Should emit drawer-closed with mode single
    const closedEmits = wrapper.emitted('drawer-closed') ?? []
    expect(closedEmits.length).toBeGreaterThan(0)
    const lastClosed = closedEmits[closedEmits.length - 1]?.[0] as {
      key: string
      mode: 'single' | 'bulk'
    }

    expect(lastClosed).toEqual({ key: 'd1', mode: 'single' })

    wrapper.unmount()
  })

  it('closes top drawer on Escape when allowed and emits drawer-closed', () => {
    const close = vi.fn()
    const { manager } = createMockManager([
      {
        drawerKey: 'd1',
        placement: 'right',
        closeOnEscapeKey: true,
      } as VueDrawerOptions,
    ])
    manager.close = close

    const wrapper = mount(DrawerlyContainer, {
      props: {
        headless: false,
        teleportTo: 'body',
      },
      global: {
        provide: {
          [DrawerSymbol as symbol]: manager,
        },
      },
    })

    expect(addListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    )

    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(keyEvent)

    const panel = document.querySelector(
      '[data-drawerly-panel]',
    ) as HTMLElement
    const animationEvent = new AnimationEvent('animationend', {
      animationName: 'drawerly-slide-out-right',
    })
    panel.dispatchEvent(animationEvent)

    expect(close).toHaveBeenCalledWith('d1')

    const closedEmits = wrapper.emitted('drawer-closed') ?? []
    expect(closedEmits.length).toBeGreaterThan(0)
    const lastClosed = closedEmits[closedEmits.length - 1]?.[0] as {
      key: string
      mode: 'single' | 'bulk'
    }

    expect(lastClosed).toEqual({ key: 'd1', mode: 'single' })

    wrapper.unmount()
  })

  it('does not attach keydown listener or render backdrop in headless mode', () => {
    const { manager } = createMockManager([
      {
        drawerKey: 'd1',
        placement: 'right',
      } as VueDrawerOptions,
    ])

    const wrapper = mount(DrawerlyContainer, {
      props: {
        headless: true,
        teleportTo: 'body',
      },
      global: {
        provide: {
          [DrawerSymbol as symbol]: manager,
        },
      },
    })

    expect(
      addListenerSpy.mock.calls.some((call: unknown[]) => call[0] === 'keydown'),
    ).toBe(false)

    const backdrop = document.querySelector('[data-drawerly-backdrop]')
    expect(backdrop).toBeNull()

    wrapper.unmount()
  })

  it('animates closeAll and emits bulk events', async () => {
    const d1: VueDrawerOptions = { drawerKey: 'd1', placement: 'right' }
    const d2: VueDrawerOptions = { drawerKey: 'd2', placement: 'right' }

    const { manager, setStack } = createMockManager([d1, d2])

    const wrapper = mount(DrawerlyContainer, {
      props: {
        headless: false,
        teleportTo: 'body',
      },
      global: {
        provide: {
          [DrawerSymbol as symbol]: manager,
        },
      },
    })

    let overlays = document.querySelectorAll('[data-drawerly-overlay]')
    expect(overlays.length).toBe(2)

    // Simulate closeAll: state goes from non-empty to empty
    setStack([])
    await wrapper.vm.$nextTick()

    overlays = document.querySelectorAll('[data-drawerly-overlay]')
    expect(overlays.length).toBe(2)
    overlays.forEach((overlay) => {
      expect(overlay.hasAttribute('data-closing')).toBe(true)
    })

    // Should emit start event with both keys
    const startEmits
      = (wrapper.emitted('drawer-close-all-start') ?? [])[0]?.[0] as
      | { keys: string[] }
      | undefined
    expect(startEmits).toBeDefined()
    expect(startEmits?.keys.sort()).toEqual(['d1', 'd2'])

    const panels = document.querySelectorAll('[data-drawerly-panel]')
    panels.forEach((panel) => {
      const ev = new AnimationEvent('animationend', {
        animationName: 'drawerly-slide-out-right',
      })
      panel.dispatchEvent(ev)
    })

    await wrapper.vm.$nextTick()

    overlays = document.querySelectorAll('[data-drawerly-overlay]')
    expect(overlays.length).toBe(0)

    // Should emit drawer-closed twice with mode "bulk"
    const closedEmits = wrapper.emitted('drawer-closed') ?? []
    const bulkPayloads = closedEmits.map(e => e[0]) as {
      key: string
      mode: 'single' | 'bulk'
    }[]

    expect(bulkPayloads.filter(p => p.mode === 'bulk').length).toBe(2)
    const keys = bulkPayloads.map(p => p.key).sort()
    expect(keys).toEqual(['d1', 'd2'])

    // And a final complete event
    const completeEmits = wrapper.emitted('drawer-close-all-complete') ?? []
    expect(completeEmits.length).toBe(1)

    wrapper.unmount()
  })
})
