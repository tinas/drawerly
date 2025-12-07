import type { Mock } from 'vitest'
import type { VueDrawerOptions } from '../src/utils'

import { createDrawerManager } from '@drawerly/core'
import { DrawerlyContainer } from '../src/drawer-container'
import { DrawerPlugin } from '../src/plugin'
import { DrawerSymbol } from '../src/utils'

vi.mock('@drawerly/core', () => ({
  createDrawerManager: vi.fn(),
}))

vi.mock('../src/drawer-container', () => ({
  DrawerlyContainer: { name: 'DrawerlyContainerImpl' },
}))

const createDrawerManagerMock = createDrawerManager as unknown as Mock

describe('drawerPlugin', () => {
  beforeEach(() => {
    createDrawerManagerMock.mockReset()
  })

  function createAppMock() {
    return {
      provide: vi.fn(),
      component: vi.fn(),
      config: {
        globalProperties: {},
      },
    } as any
  }

  it('installs with default options when no plugin options are provided', () => {
    const manager = {} as any
    createDrawerManagerMock.mockReturnValue(manager)

    const app = createAppMock()

    DrawerPlugin.install!(app)

    expect(createDrawerManagerMock).toHaveBeenCalledTimes(1)
    const [initialStateArg, defaultsArg] = createDrawerManagerMock.mock.calls[0]!

    expect(initialStateArg).toBeUndefined()
    expect(defaultsArg).toEqual({
      placement: 'right',
      closeOnEscapeKey: true,
      closeOnBackdropClick: true,
    })

    expect(app.provide).toHaveBeenCalledTimes(1)
    expect(app.provide).toHaveBeenCalledWith(DrawerSymbol, manager)

    expect(app.config.globalProperties.$drawerly).toBe(manager)

    expect(app.component).toHaveBeenCalledTimes(1)
    const [name, componentDef] = app.component.mock.calls[0]
    expect(name).toBe('DrawerlyContainer')
    expect(componentDef.name).toBe('DrawerlyContainer')

    const slots = { default: vi.fn() }
    const render = componentDef.setup({}, { slots })
    const vnode = render()

    // Mocked DrawerlyContainer from the module
    expect(vnode.type).toBe(DrawerlyContainer)
    expect(vnode.props).toEqual({
      teleportTo: undefined,
      headless: false,
    })
    expect(vnode.children).toBe(slots)
  })

  it('merges user defaultOptions with base defaults and forwards teleport/headless', () => {
    const manager = {} as any
    createDrawerManagerMock.mockReturnValue(manager)

    const app = createAppMock()

    const pluginOptions = {
      defaultOptions: {
        placement: 'left',
        ariaLabel: 'Global label',
      } satisfies Partial<VueDrawerOptions>,
      teleportTo: '#app-root',
      headless: true,
    }

    DrawerPlugin.install!(app, pluginOptions)

    expect(createDrawerManagerMock).toHaveBeenCalledTimes(1)
    const [_, defaultsArg] = createDrawerManagerMock.mock.calls[0]!

    expect(defaultsArg).toEqual({
      placement: 'left',
      closeOnEscapeKey: true,
      closeOnBackdropClick: true,
      ariaLabel: 'Global label',
    })

    expect(app.config.globalProperties.$drawerly).toBe(manager)

    expect(app.component).toHaveBeenCalledTimes(1)
    const [, componentDef] = app.component.mock.calls[0]

    const slots = { default: vi.fn() }
    const render = componentDef.setup({}, { slots })
    const vnode = render()

    expect(vnode.type).toBe(DrawerlyContainer)
    expect(vnode.props).toEqual({
      teleportTo: '#app-root',
      headless: true,
    })
    expect(vnode.children).toBe(slots)
  })
})
