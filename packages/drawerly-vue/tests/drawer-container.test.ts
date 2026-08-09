import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, provide } from 'vue'
import { DrawerlyContainer } from '../src/drawer-container'
import { createDrawerly } from '../src/drawerly'
import { drawerlyInjectionKey } from '../src/injection'
import { useDrawer } from '../src/use-drawer'

enableAutoUnmount(afterEach)

// TransitionGroup finishes enter and leave across animation frames.
async function flushTransition(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await nextTick()
}

const ContentProbe = defineComponent({
  props: {
    drawerKey: { type: String, required: true },
    label: { type: String, default: '' },
  },
  setup(props) {
    const { close } = useDrawer(props.drawerKey)

    return () =>
      h(
        'button',
        {
          'data-testid': `content-${props.drawerKey}`,
          'onClick': close,
        },
        props.label,
      )
  },
})

function mountContainer(
  drawerly = createDrawerly(),
  props: Record<string, unknown> = {},
) {
  const wrapper = mount(DrawerlyContainer, {
    props,
    global: {
      plugins: [drawerly],
      // Real TransitionGroup is required to exercise enter/leave hooks.
      stubs: { 'transition-group': false },
    },
  })

  return { drawerly, wrapper }
}

function queryOverlays(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-drawerly-overlay]')]
}

describe('drawerlyContainer', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.removeAttribute('style')
  })

  it('throws when mounted without an installed drawerly instance', () => {
    expect(() => mount(DrawerlyContainer)).toThrowError(
      /must be used after installing/,
    )
  })

  it('renders the stack teleported to body with contract attributes', async () => {
    const { drawerly } = mountContainer()

    drawerly.open({ drawerKey: 'a', placement: 'left' })
    drawerly.open({ drawerKey: 'b' })
    await nextTick()

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

  it('renders drawer components with the drawer key and closes through useDrawer', async () => {
    const { drawerly } = mountContainer()

    drawerly.open({
      drawerKey: 'a',
      component: ContentProbe,
      componentProps: { label: 'Hello' },
    })
    await nextTick()

    const content = document.querySelector<HTMLElement>(
      '[data-testid="content-a"]',
    )
    expect(content?.textContent).toBe('Hello')

    content?.click()
    await flushTransition()

    expect(drawerly.isOpen('a')).toBe(false)
    expect(queryOverlays()).toHaveLength(0)
  })

  it('does not re-render existing drawer content when the stack changes', async () => {
    const renders: string[] = []

    const CountingContent = defineComponent({
      props: {
        drawerKey: { type: String, required: true },
        label: { type: String, default: '' },
      },
      setup(props) {
        return () => {
          renders.push(props.drawerKey)
          return h('span', props.label || props.drawerKey)
        }
      },
    })

    const { drawerly } = mountContainer()

    drawerly.open({ drawerKey: 'a', component: CountingContent })
    drawerly.open({ drawerKey: 'b', component: CountingContent })
    drawerly.open({ drawerKey: 'c', component: CountingContent })
    await nextTick()

    renders.length = 0

    drawerly.open({ drawerKey: 'd', component: CountingContent })
    await nextTick()
    drawerly.bringToTop('a')
    await nextTick()

    expect(renders).toEqual(['d'])

    drawerly.updateOptions('a', { componentProps: { label: 'second' } })
    await nextTick()

    expect(renders).toEqual(['d', 'a'])
    expect(document.body.textContent).toContain('second')
  })

  it('renders the default slot with the drawer and a close handler', async () => {
    const drawerly = createDrawerly()

    mount(DrawerlyContainer, {
      global: {
        plugins: [drawerly],
        stubs: { 'transition-group': false },
      },
      slots: {
        default: ({ drawer, close }: any) =>
          h(
            'button',
            { 'data-testid': 'slotted', 'onClick': close },
            drawer.drawerKey,
          ),
      },
    })

    drawerly.open({ drawerKey: 'a' })
    await nextTick()

    const slotted = document.querySelector<HTMLElement>('[data-testid="slotted"]')
    expect(slotted?.textContent).toBe('a')

    slotted?.click()
    await flushTransition()

    expect(drawerly.isOpen('a')).toBe(false)
  })

  it('closes the drawer on backdrop click unless disabled', async () => {
    const { drawerly } = mountContainer()

    drawerly.open({ drawerKey: 'a', closeOnBackdropClick: false })
    await nextTick()

    const backdrop = document.querySelector<HTMLElement>(
      '[data-drawerly-backdrop]',
    )
    backdrop?.click()
    await nextTick()
    expect(drawerly.isOpen('a')).toBe(true)

    drawerly.updateOptions('a', { closeOnBackdropClick: true })
    await nextTick()

    backdrop?.click()
    await nextTick()
    expect(drawerly.isOpen('a')).toBe(false)
  })

  it('closes the top drawer on Escape honoring its predicate', async () => {
    const { drawerly } = mountContainer()

    drawerly.open({ drawerKey: 'a' })
    drawerly.open({ drawerKey: 'b', closeOnEscapeKey: false })
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    // top drawer refuses to close
    expect(drawerly.isOpen('b')).toBe(true)

    drawerly.updateOptions('b', { closeOnEscapeKey: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(drawerly.isOpen('b')).toBe(false)
    expect(drawerly.isOpen('a')).toBe(true)
  })

  it('plays the exit animation for drawers closed through the manager API', async () => {
    const { drawerly } = mountContainer()

    drawerly.open({ drawerKey: 'a' })
    drawerly.open({ drawerKey: 'b' })
    await nextTick()

    drawerly.closeAll()
    await nextTick()

    // still on screen while leaving
    expect(queryOverlays()).toHaveLength(2)

    await flushTransition()
    expect(queryOverlays()).toHaveLength(0)
  })

  it('emits drawer-opened, drawer-closed and all-closed once their animations finish', async () => {
    const { drawerly, wrapper } = mountContainer()

    drawerly.open({ drawerKey: 'a' })
    drawerly.open({ drawerKey: 'b' })
    await flushTransition()

    expect(wrapper.emitted('drawer-opened')).toEqual([
      [{ key: 'a' }],
      [{ key: 'b' }],
    ])

    drawerly.close('b')
    await flushTransition()

    expect(wrapper.emitted('drawer-closed')).toEqual([[{ key: 'b' }]])
    expect(wrapper.emitted('all-closed')).toBeUndefined()

    drawerly.closeAll()
    await flushTransition()

    expect(wrapper.emitted('drawer-closed')).toHaveLength(2)
    expect(wrapper.emitted('all-closed')).toHaveLength(1)
  })

  it('locks body scroll until the exit animation finishes', async () => {
    const { drawerly } = mountContainer()

    drawerly.open({ drawerKey: 'a' })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    drawerly.close('a')
    await nextTick()

    // the drawer is still visible, so the page must stay locked
    expect(queryOverlays()).toHaveLength(1)
    expect(document.body.style.overflow).toBe('hidden')

    await flushTransition()
    expect(document.body.style.overflow).toBe('')
  })

  it('does not lock scroll when lockScroll is false', async () => {
    const { drawerly } = mountContainer(createDrawerly(), { lockScroll: false })

    drawerly.open({ drawerKey: 'a' })
    await nextTick()

    expect(document.body.style.overflow).toBe('')
  })

  it('does not lock scroll in non-modal mode', async () => {
    const { drawerly } = mountContainer(createDrawerly(), { modal: false })

    drawerly.open({ drawerKey: 'a' })
    await nextTick()

    expect(document.body.style.overflow).toBe('')
  })

  it('non-modal mode renders no backdrop or aria-modal but keeps Escape handling', async () => {
    const { drawerly } = mountContainer(createDrawerly(), { modal: false })

    drawerly.open({ drawerKey: 'a' })
    drawerly.open({ drawerKey: 'b' })
    await nextTick()

    expect(document.querySelector('[data-drawerly-backdrop]')).toBeNull()

    const panel = document.querySelector('[data-drawerly-panel]')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.hasAttribute('aria-modal')).toBe(false)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(drawerly.isOpen('b')).toBe(false)
  })

  it('applies dialog semantics in modal mode', async () => {
    const { drawerly } = mountContainer()

    drawerly.open({ drawerKey: 'a', ariaLabel: 'Custom' })
    await nextTick()

    const panel = document.querySelector('[data-drawerly-panel]')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(panel?.getAttribute('aria-label')).toBe('Custom')
    expect(panel?.getAttribute('tabindex')).toBe('-1')
  })

  it('forwards user data attributes but protects the drawerly contract', async () => {
    const { drawerly } = mountContainer()

    drawerly.open({
      drawerKey: 'a',
      dataAttributes: {
        'data-analytics': 'settings',
        'data-drawerly-key': 'hijacked',
      },
    })
    await nextTick()

    const overlay = queryOverlays()[0]
    expect(overlay?.getAttribute('data-analytics')).toBe('settings')
    expect(overlay?.getAttribute('data-drawerly-key')).toBe('a')
  })

  it('binds to the nearest provided instance for scoped stacks', async () => {
    const appInstance = createDrawerly()
    const scoped = createDrawerly()

    const Host = defineComponent({
      setup() {
        provide(drawerlyInjectionKey, scoped)
        return () => h(DrawerlyContainer)
      },
    })

    mount(Host, {
      global: {
        plugins: [appInstance],
        stubs: { 'transition-group': false },
      },
    })

    scoped.open({ drawerKey: 'scoped-drawer' })
    appInstance.open({ drawerKey: 'app-drawer' })
    await nextTick()

    expect(
      document.querySelector('[data-drawerly-key="scoped-drawer"]'),
    ).not.toBeNull()
    expect(
      document.querySelector('[data-drawerly-key="app-drawer"]'),
    ).toBeNull()
  })

  it('teleports to a custom target', async () => {
    const target = document.createElement('div')
    target.id = 'custom-target'
    document.body.appendChild(target)

    const { drawerly } = mountContainer(createDrawerly(), {
      teleportTo: '#custom-target',
    })

    drawerly.open({ drawerKey: 'a' })
    await nextTick()

    expect(target.querySelector('[data-drawerly-overlay]')).not.toBeNull()
  })
})
