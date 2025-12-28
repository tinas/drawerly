import type { DrawerState } from '@drawerly/core'
import type { ReactDrawerOptions } from '../src/types'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

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

const { DrawerlyContainer } = await import('../src/drawerly-container')

beforeAll(() => {
  if (typeof AnimationEvent === 'undefined') {
    class AnimationEventStub extends Event {
      animationName: string

      constructor(type: string, init?: { animationName?: string }) {
        super(type, { bubbles: true })
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
    currentState = { stack: [] }
    listeners.clear()
    vi.clearAllMocks()
    addListenerSpy = vi.spyOn(document, 'addEventListener')
    removeListenerSpy = vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    addListenerSpy.mockRestore()
    removeListenerSpy.mockRestore()
    cleanup()
    document.body.innerHTML = ''
  })

  it('renders nothing when stack is empty', () => {
    render(<DrawerlyContainer />)

    const root = document.querySelector('[data-drawerly-root]')
    expect(root).toBeNull()
  })

  it('renders the stack and respects placement', () => {
    setState([
      {
        drawerKey: 'd1',
        placement: 'left',
        ariaLabel: 'First drawer',
      },
    ])

    render(<DrawerlyContainer />)

    const overlays = document.querySelectorAll('[data-drawerly-overlay]')
    expect(overlays.length).toBe(1)

    const overlay = overlays[0] as HTMLElement
    expect(overlay.getAttribute('data-drawerly-key')).toBe('d1')
    expect(overlay.getAttribute('data-drawerly-placement')).toBe('left')
  })

  it('filters internal data-drawerly-* attributes but keeps user data-* attributes', () => {
    setState([
      {
        drawerKey: 'd1',
        placement: 'right',
        dataAttributes: {
          'data-foo': 'bar',
          'data-drawerly-internal': 'should-be-filtered',
        },
      } as ReactDrawerOptions,
    ])

    render(<DrawerlyContainer />)

    const overlay = document.querySelector('[data-drawerly-overlay]') as HTMLElement
    expect(overlay.getAttribute('data-foo')).toBe('bar')
    expect(overlay.hasAttribute('data-drawerly-internal')).toBe(false)
  })

  it('renders backdrop in non-headless mode', () => {
    setState([{ drawerKey: 'd1', placement: 'right' }])

    render(<DrawerlyContainer />)

    const backdrop = document.querySelector('[data-drawerly-backdrop]')
    expect(backdrop).not.toBeNull()
  })

  it('does not render backdrop in headless mode', () => {
    setState([{ drawerKey: 'd1', placement: 'right' }])

    render(<DrawerlyContainer headless />)

    const backdrop = document.querySelector('[data-drawerly-backdrop]')
    expect(backdrop).toBeNull()
  })

  it('adds data-headless attribute in headless mode', () => {
    setState([{ drawerKey: 'd1', placement: 'right' }])

    render(<DrawerlyContainer headless />)

    const root = document.querySelector('[data-drawerly-root]')
    expect(root?.hasAttribute('data-headless')).toBe(true)
  })

  it('attaches keydown listener in non-headless mode', () => {
    setState([{ drawerKey: 'd1', placement: 'right' }])

    render(<DrawerlyContainer />)

    expect(
      addListenerSpy.mock.calls.some((call: unknown[]) => call[0] === 'keydown'),
    ).toBe(true)
  })

  it('does not attach keydown listener in headless mode', () => {
    setState([{ drawerKey: 'd1', placement: 'right' }])

    render(<DrawerlyContainer headless />)

    expect(
      addListenerSpy.mock.calls.some((call: unknown[]) => call[0] === 'keydown'),
    ).toBe(false)
  })

  it('closes top drawer on Escape when allowed', async () => {
    setState([
      {
        drawerKey: 'd1',
        placement: 'right',
        closeOnEscapeKey: true,
      },
    ])

    render(<DrawerlyContainer />)

    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(keyEvent)

    expect(mockClose).toHaveBeenCalledWith('d1')
  })

  it('does not close on Escape when closeOnEscapeKey is false', () => {
    setState([
      {
        drawerKey: 'd1',
        placement: 'right',
        closeOnEscapeKey: false,
      },
    ])

    render(<DrawerlyContainer />)

    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(keyEvent)

    expect(mockClose).not.toHaveBeenCalled()
  })

  it('does not close on Escape in headless mode', () => {
    setState([
      {
        drawerKey: 'd1',
        placement: 'right',
        closeOnEscapeKey: true,
      },
    ])

    render(<DrawerlyContainer headless />)

    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(keyEvent)

    expect(mockClose).not.toHaveBeenCalled()
  })

  it('closeOnEscapeKey function predicate is respected', () => {
    const predicate = vi.fn().mockReturnValue(false)

    setState([
      {
        drawerKey: 'd1',
        placement: 'right',
        closeOnEscapeKey: predicate,
      },
    ])

    render(<DrawerlyContainer />)

    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(keyEvent)

    expect(predicate).toHaveBeenCalled()
    expect(mockClose).not.toHaveBeenCalled()
  })

  it('renders multiple drawers in stack order', () => {
    setState([
      { drawerKey: 'd1', placement: 'right' },
      { drawerKey: 'd2', placement: 'left' },
    ])

    render(<DrawerlyContainer />)

    const overlays = document.querySelectorAll('[data-drawerly-overlay]')
    expect(overlays.length).toBe(2)

    expect((overlays[0] as HTMLElement).getAttribute('data-drawerly-key')).toBe('d1')
    expect((overlays[0] as HTMLElement).getAttribute('data-drawerly-index')).toBe('0')

    expect((overlays[1] as HTMLElement).getAttribute('data-drawerly-key')).toBe('d2')
    expect((overlays[1] as HTMLElement).getAttribute('data-drawerly-index')).toBe('1')
  })

  it('marks topmost drawer with data-top attribute', () => {
    setState([
      { drawerKey: 'd1', placement: 'right' },
      { drawerKey: 'd2', placement: 'left' },
    ])

    render(<DrawerlyContainer />)

    const overlays = document.querySelectorAll('[data-drawerly-overlay]')
    expect((overlays[0] as HTMLElement).hasAttribute('data-top')).toBe(false)
    expect((overlays[1] as HTMLElement).hasAttribute('data-top')).toBe(true)
  })

  it('sets data-drawerly-count on each overlay', () => {
    setState([
      { drawerKey: 'd1', placement: 'right' },
      { drawerKey: 'd2', placement: 'left' },
    ])

    render(<DrawerlyContainer />)

    const overlays = document.querySelectorAll('[data-drawerly-overlay]')
    overlays.forEach((overlay) => {
      expect((overlay as HTMLElement).getAttribute('data-drawerly-count')).toBe('2')
    })
  })

  it('renders drawer panel with correct ARIA attributes', () => {
    setState([
      {
        drawerKey: 'd1',
        placement: 'right',
        ariaLabel: 'Test Label',
        ariaDescribedBy: 'desc-id',
        ariaLabelledBy: 'label-id',
      },
    ])

    render(<DrawerlyContainer />)

    const panel = document.querySelector('[data-drawerly-panel]') as HTMLElement
    expect(panel).not.toBeNull()
    expect(panel.getAttribute('role')).toBe('dialog')
    expect(panel.getAttribute('aria-modal')).toBe('true')
    expect(panel.getAttribute('aria-label')).toBe('Test Label')
    expect(panel.getAttribute('aria-describedby')).toBe('desc-id')
    expect(panel.getAttribute('aria-labelledby')).toBe('label-id')
  })

  it('reacts to stack changes', async () => {
    render(<DrawerlyContainer />)

    expect(document.querySelector('[data-drawerly-overlay]')).toBeNull()

    act(() => {
      setState([{ drawerKey: 'd1', placement: 'right' }])
    })

    await waitFor(() => {
      const overlays = document.querySelectorAll('[data-drawerly-overlay]')
      expect(overlays.length).toBe(1)
    })
  })

  it('removes keydown listener on unmount', () => {
    setState([{ drawerKey: 'd1', placement: 'right' }])

    const { unmount } = render(<DrawerlyContainer />)

    unmount()

    expect(
      removeListenerSpy.mock.calls.some((call: unknown[]) => call[0] === 'keydown'),
    ).toBe(true)
  })

  describe('children render prop', () => {
    it('uses children render prop when drawer has no component', () => {
      setState([{ drawerKey: 'd1', placement: 'right' }])

      render(
        <DrawerlyContainer headless>
          {({ contentProps }) => (
            <div data-testid="custom-content">
              Drawer:
              {' '}
              {contentProps.drawerKey}
            </div>
          )}
        </DrawerlyContainer>,
      )

      expect(screen.getByTestId('custom-content')).toBeDefined()
      expect(screen.getByText('Drawer: d1')).toBeDefined()
    })

    it('provides close function in contentProps', () => {
      setState([{ drawerKey: 'd1', placement: 'right' }])

      let capturedClose: (() => void) | undefined

      render(
        <DrawerlyContainer headless>
          {({ contentProps }) => {
            capturedClose = contentProps.close
            return <div>Content</div>
          }}
        </DrawerlyContainer>,
      )

      expect(capturedClose).toBeDefined()

      act(() => {
        capturedClose?.()
      })

      expect(mockClose).toHaveBeenCalled()
    })

    it('provides drawer options in render prop', () => {
      setState([
        {
          drawerKey: 'd1',
          placement: 'left',
          ariaLabel: 'Test',
        },
      ])

      let capturedDrawer: ReactDrawerOptions | undefined

      render(
        <DrawerlyContainer headless>
          {({ drawer }) => {
            capturedDrawer = drawer
            return <div>Content</div>
          }}
        </DrawerlyContainer>,
      )

      expect(capturedDrawer?.drawerKey).toBe('d1')
      expect(capturedDrawer?.placement).toBe('left')
      expect(capturedDrawer?.ariaLabel).toBe('Test')
    })

    it('component takes precedence over children render prop', () => {
      const TestComponent = ({ drawerKey }: { drawerKey: string }) => (
        <div data-testid="component-content">
          Component:
          {drawerKey}
        </div>
      )

      setState([
        {
          drawerKey: 'd1',
          placement: 'right',
          component: TestComponent,
        },
      ])

      render(
        <DrawerlyContainer headless>
          {({ contentProps }) => (
            <div data-testid="children-content">
              Children:
              {' '}
              {contentProps.drawerKey}
            </div>
          )}
        </DrawerlyContainer>,
      )

      expect(screen.queryByTestId('children-content')).toBeNull()
      expect(screen.getByTestId('component-content')).toBeDefined()
    })

    it('render function takes precedence over children render prop', () => {
      setState([
        {
          drawerKey: 'd1',
          placement: 'right',
          render: ({ drawerKey }) => (
            <div data-testid="render-content">
              Render:
              {drawerKey}
            </div>
          ),
        },
      ])

      render(
        <DrawerlyContainer headless>
          {({ contentProps }) => (
            <div data-testid="children-content">
              Children:
              {' '}
              {contentProps.drawerKey}
            </div>
          )}
        </DrawerlyContainer>,
      )

      expect(screen.queryByTestId('children-content')).toBeNull()
      expect(screen.getByTestId('render-content')).toBeDefined()
    })
  })
})
