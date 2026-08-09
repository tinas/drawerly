import type { ReactElement } from 'react'
import type { DrawerContentProps } from '../src/types'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { DrawerlyContainer } from '../src/drawer-container'
import { createDrawerly } from '../src/drawerly'
import { useDrawer } from '../src/use-drawer'

interface ContentProbeProps extends DrawerContentProps {
  label?: string
}

function renderContainer(
  drawerly = createDrawerly(),
  props: Record<string, unknown> = {},
) {
  const utils = render(createElement(DrawerlyContainer, { drawerly, ...props }))

  return { drawerly, utils }
}

function queryOverlays(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-drawerly-overlay]')]
}

// jsdom runs no animations, so overlays would finish entering and leaving
// synchronously. Stubbing one keeps them in flight long enough to observe.
function withPendingAnimation() {
  let finish!: () => void
  const finished = new Promise<void>((resolve) => {
    finish = resolve
  })

  const original = Element.prototype.getAnimations
  Element.prototype.getAnimations = () => [{ finished } as unknown as Animation]

  return {
    finish,
    restore: () => {
      if (original)
        Element.prototype.getAnimations = original
      else
        Reflect.deleteProperty(Element.prototype, 'getAnimations')
    },
  }
}

describe('drawerlyContainer', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    document.body.removeAttribute('style')
  })

  it('throws when rendered without a drawerly instance', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(createElement(DrawerlyContainer, {} as never)),
    ).toThrowError(/requires a `drawerly` instance/)

    error.mockRestore()
  })

  it('renders the stack portaled to body with contract attributes', () => {
    const { drawerly } = renderContainer()

    act(() => {
      drawerly.open({ drawerKey: 'a', placement: 'left' })
      drawerly.open({ drawerKey: 'b' })
    })

    const overlays = queryOverlays()
    expect(overlays).toHaveLength(2)

    const root = document.querySelector('[data-drawerly-root]')
    expect(root).not.toBeNull()

    expect(overlays[0]?.getAttribute('data-drawerly-key')).toBe('a')
    expect(overlays[0]?.getAttribute('data-drawerly-placement')).toBe('left')
    expect(overlays[0]?.hasAttribute('data-top')).toBe(false)

    expect(overlays[1]?.getAttribute('data-drawerly-key')).toBe('b')
    expect(overlays[1]?.getAttribute('data-drawerly-index')).toBe('1')
    expect(overlays[1]?.getAttribute('data-drawerly-count')).toBe('2')
    expect(overlays[1]?.hasAttribute('data-top')).toBe(true)
  })

  it('renders drawer components with the drawer key and closes through useDrawer', () => {
    const drawerly = createDrawerly()

    // A real app imports its module scoped instance the same way.
    function ContentProbe({ drawerKey, label = '' }: ContentProbeProps): ReactElement {
      const { close } = useDrawer(drawerly, drawerKey)

      return createElement(
        'button',
        { 'data-testid': `content-${drawerKey}`, 'onClick': close },
        label,
      )
    }

    renderContainer(drawerly)

    act(() => {
      drawerly.open({
        drawerKey: 'a',
        component: ContentProbe,
        componentProps: { label: 'Hello' },
      })
    })

    const content = document.querySelector<HTMLElement>(
      '[data-testid="content-a"]',
    )
    expect(content?.textContent).toBe('Hello')

    act(() => {
      fireEvent.click(content!)
    })

    expect(drawerly.isOpen('a')).toBe(false)
    expect(queryOverlays()).toHaveLength(0)
  })

  it('does not re-render existing drawer content when the stack changes', () => {
    const renders: string[] = []

    function CountingContent({ drawerKey }: DrawerContentProps): ReactElement {
      renders.push(drawerKey)
      return createElement('span', null, drawerKey)
    }

    const { drawerly } = renderContainer()

    act(() => {
      drawerly.open({ drawerKey: 'a', component: CountingContent })
      drawerly.open({ drawerKey: 'b', component: CountingContent })
      drawerly.open({ drawerKey: 'c', component: CountingContent })
    })

    renders.length = 0

    act(() => {
      drawerly.open({ drawerKey: 'd', component: CountingContent })
    })
    act(() => {
      drawerly.bringToTop('a')
    })

    expect(renders).toEqual(['d'])
  })

  it('re-renders drawer content when its options change', () => {
    const renders: string[] = []

    function CountingContent({ drawerKey, label }: ContentProbeProps): ReactElement {
      renders.push(drawerKey)
      return createElement('span', null, label)
    }

    const { drawerly } = renderContainer()

    act(() => {
      drawerly.open({
        drawerKey: 'a',
        component: CountingContent,
        componentProps: { label: 'first' },
      })
      drawerly.open({ drawerKey: 'b', component: CountingContent })
    })

    renders.length = 0

    act(() => {
      drawerly.updateOptions('a', { componentProps: { label: 'second' } })
    })

    expect(renders).toEqual(['a'])
    expect(document.body.textContent).toContain('second')
  })

  it('renders the children render prop with the drawer and a close handler', () => {
    const drawerly = createDrawerly()

    render(
      createElement(DrawerlyContainer, {
        drawerly,
        children: ({ drawer, close }) =>
          createElement(
            'button',
            { 'data-testid': 'slotted', 'onClick': close },
            drawer.drawerKey,
          ),
      }),
    )

    act(() => {
      drawerly.open({ drawerKey: 'a' })
    })

    const slotted = document.querySelector<HTMLElement>('[data-testid="slotted"]')
    expect(slotted?.textContent).toBe('a')

    act(() => {
      fireEvent.click(slotted!)
    })

    expect(drawerly.isOpen('a')).toBe(false)
  })

  it('closes the drawer on backdrop click unless disabled', () => {
    const { drawerly } = renderContainer()

    act(() => {
      drawerly.open({ drawerKey: 'a', closeOnBackdropClick: false })
    })

    const backdrop = document.querySelector<HTMLElement>(
      '[data-drawerly-backdrop]',
    )
    fireEvent.click(backdrop!)
    expect(drawerly.isOpen('a')).toBe(true)

    act(() => {
      drawerly.updateOptions('a', { closeOnBackdropClick: true })
    })

    fireEvent.click(backdrop!)
    expect(drawerly.isOpen('a')).toBe(false)
  })

  it('closes the top drawer on Escape honoring its predicate', () => {
    const { drawerly } = renderContainer()

    act(() => {
      drawerly.open({ drawerKey: 'a' })
      drawerly.open({ drawerKey: 'b', closeOnEscapeKey: false })
    })

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    // top drawer refuses to close
    expect(drawerly.isOpen('b')).toBe(true)

    act(() => {
      drawerly.updateOptions('b', { closeOnEscapeKey: true })
    })
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(drawerly.isOpen('b')).toBe(false)
    expect(drawerly.isOpen('a')).toBe(true)
  })

  it('plays the exit animation for drawers closed through the manager API', () => {
    const { drawerly } = renderContainer()

    act(() => {
      drawerly.open({ drawerKey: 'a' })
      drawerly.open({ drawerKey: 'b' })
    })

    act(() => {
      drawerly.closeAll()
    })

    expect(queryOverlays()).toHaveLength(0)
  })

  it('keeps a closing drawer mounted and the page locked until its animation ends', async () => {
    const animation = withPendingAnimation()
    const { drawerly } = renderContainer()

    act(() => {
      drawerly.open({ drawerKey: 'a' })
    })
    expect(document.body.style.overflow).toBe('hidden')

    act(() => {
      drawerly.close('a')
    })

    // the drawer is still visible, so the page must stay locked
    expect(queryOverlays()).toHaveLength(1)
    expect(queryOverlays()[0]?.classList.contains('drawerly-leave-active')).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')

    await act(async () => {
      animation.finish()
    })

    expect(queryOverlays()).toHaveLength(0)
    expect(document.body.style.overflow).toBe('')

    animation.restore()
  })

  it('calls onDrawerOpened once the enter animation finishes', async () => {
    const animation = withPendingAnimation()
    const onDrawerOpened = vi.fn()
    const { drawerly } = renderContainer(createDrawerly(), { onDrawerOpened })

    act(() => {
      drawerly.open({ drawerKey: 'a' })
    })

    expect(queryOverlays()[0]?.classList.contains('drawerly-enter-active')).toBe(true)
    expect(onDrawerOpened).not.toHaveBeenCalled()

    await act(async () => {
      animation.finish()
    })

    expect(onDrawerOpened).toHaveBeenCalledWith({ key: 'a' })

    animation.restore()
  })

  it('calls onDrawerOpened, onDrawerClosed and onAllClosed', () => {
    const onDrawerOpened = vi.fn()
    const onDrawerClosed = vi.fn()
    const onAllClosed = vi.fn()

    const { drawerly } = renderContainer(createDrawerly(), {
      onDrawerOpened,
      onDrawerClosed,
      onAllClosed,
    })

    act(() => {
      drawerly.open({ drawerKey: 'a' })
      drawerly.open({ drawerKey: 'b' })
    })

    expect(onDrawerOpened.mock.calls).toEqual([
      [{ key: 'a' }],
      [{ key: 'b' }],
    ])

    act(() => {
      drawerly.close('b')
    })

    expect(onDrawerClosed.mock.calls).toEqual([[{ key: 'b' }]])
    expect(onAllClosed).not.toHaveBeenCalled()

    act(() => {
      drawerly.closeAll()
    })

    expect(onDrawerClosed).toHaveBeenCalledTimes(2)
    expect(onAllClosed).toHaveBeenCalledTimes(1)
  })

  it('locks body scroll while a drawer is open', () => {
    const { drawerly } = renderContainer()

    act(() => {
      drawerly.open({ drawerKey: 'a' })
    })
    expect(document.body.style.overflow).toBe('hidden')

    act(() => {
      drawerly.close('a')
    })
    expect(document.body.style.overflow).toBe('')
  })

  it('does not lock scroll when lockScroll is false', () => {
    const { drawerly } = renderContainer(createDrawerly(), { lockScroll: false })

    act(() => {
      drawerly.open({ drawerKey: 'a' })
    })

    expect(document.body.style.overflow).toBe('')
  })

  it('does not lock scroll in non-modal mode', () => {
    const { drawerly } = renderContainer(createDrawerly(), { modal: false })

    act(() => {
      drawerly.open({ drawerKey: 'a' })
    })

    expect(document.body.style.overflow).toBe('')
  })

  it('non-modal mode renders no backdrop or aria-modal but keeps Escape handling', () => {
    const { drawerly } = renderContainer(createDrawerly(), { modal: false })

    act(() => {
      drawerly.open({ drawerKey: 'a' })
      drawerly.open({ drawerKey: 'b' })
    })

    expect(document.querySelector('[data-drawerly-backdrop]')).toBeNull()

    const panel = document.querySelector('[data-drawerly-panel]')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.hasAttribute('aria-modal')).toBe(false)

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(drawerly.isOpen('b')).toBe(false)
  })

  it('applies dialog semantics in modal mode', () => {
    const { drawerly } = renderContainer()

    act(() => {
      drawerly.open({ drawerKey: 'a', ariaLabel: 'Custom' })
    })

    const panel = document.querySelector('[data-drawerly-panel]')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(panel?.getAttribute('aria-label')).toBe('Custom')
    expect(panel?.getAttribute('tabindex')).toBe('-1')
  })

  it('forwards user data attributes but protects the drawerly contract', () => {
    const { drawerly } = renderContainer()

    act(() => {
      drawerly.open({
        drawerKey: 'a',
        dataAttributes: {
          'data-analytics': 'settings',
          'data-drawerly-key': 'hijacked',
        },
      })
    })

    const overlay = queryOverlays()[0]
    expect(overlay?.getAttribute('data-analytics')).toBe('settings')
    expect(overlay?.getAttribute('data-drawerly-key')).toBe('a')
  })

  it('renders only the stack of its own instance for scoped stacks', () => {
    const appInstance = createDrawerly()
    const scoped = createDrawerly()

    renderContainer(scoped)

    act(() => {
      scoped.open({ drawerKey: 'scoped-drawer' })
      appInstance.open({ drawerKey: 'app-drawer' })
    })

    expect(
      document.querySelector('[data-drawerly-key="scoped-drawer"]'),
    ).not.toBeNull()
    expect(
      document.querySelector('[data-drawerly-key="app-drawer"]'),
    ).toBeNull()
  })

  it('portals to a custom target', () => {
    const target = document.createElement('div')
    target.id = 'custom-target'
    document.body.appendChild(target)

    const { drawerly } = renderContainer(createDrawerly(), {
      portalTo: '#custom-target',
    })

    act(() => {
      drawerly.open({ drawerKey: 'a' })
    })

    expect(target.querySelector('[data-drawerly-overlay]')).not.toBeNull()
  })
})
