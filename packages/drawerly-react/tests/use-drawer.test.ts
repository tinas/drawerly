import type { DrawerKey } from '@drawerly/core'
import type { UseDrawerResult } from '../src/use-drawer'
import { act, cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import { createDrawerly } from '../src/drawerly'
import { useDrawer } from '../src/use-drawer'

function renderUseDrawer(drawerly = createDrawerly(), key: DrawerKey = 'a') {
  let current!: UseDrawerResult

  function Probe({ drawerKey }: { drawerKey: DrawerKey }): null {
    current = useDrawer(drawerly, drawerKey)
    return null
  }

  const utils = render(createElement(Probe, { drawerKey: key }))

  return {
    drawerly,
    result: () => current,
    setKey: (next: DrawerKey) =>
      utils.rerender(createElement(Probe, { drawerKey: next })),
  }
}

describe('useDrawer', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('tracks isOpen reactively', () => {
    const { drawerly, result } = renderUseDrawer()

    expect(result().isOpen).toBe(false)

    act(() => {
      drawerly.open({ drawerKey: 'a' })
    })
    expect(result().isOpen).toBe(true)

    act(() => {
      drawerly.close('a')
    })
    expect(result().isOpen).toBe(false)
  })

  it('tracks isTop reactively', () => {
    const { drawerly, result } = renderUseDrawer()

    act(() => {
      drawerly.open({ drawerKey: 'a' })
    })
    expect(result().isTop).toBe(true)

    act(() => {
      drawerly.open({ drawerKey: 'b' })
    })
    expect(result().isTop).toBe(false)

    act(() => {
      result().bringToTop()
    })
    expect(result().isTop).toBe(true)
  })

  it('exposes the drawer instance', () => {
    const { drawerly, result } = renderUseDrawer()

    expect(result().instance).toBeUndefined()

    act(() => {
      drawerly.open({ drawerKey: 'a', ariaLabel: 'Panel' })
    })

    expect(result().instance?.ariaLabel).toBe('Panel')
  })

  it('closes the bound drawer', () => {
    const { drawerly, result } = renderUseDrawer()

    act(() => {
      drawerly.open({ drawerKey: 'a' })
      drawerly.open({ drawerKey: 'b' })
    })

    act(() => {
      result().close()
    })

    expect(drawerly.isOpen('a')).toBe(false)
    expect(drawerly.isOpen('b')).toBe(true)
  })

  it('merges patches into the bound drawer through updateOptions', () => {
    const { drawerly, result } = renderUseDrawer()

    act(() => {
      drawerly.open({ drawerKey: 'a', ariaLabel: 'Original', placement: 'left' })
      result().updateOptions({ ariaLabel: 'Updated' })
    })

    expect(drawerly.getDrawerInstance('a')).toMatchObject({
      ariaLabel: 'Updated',
      placement: 'left',
    })
  })

  it('follows key changes across re-renders', () => {
    const { drawerly, result, setKey } = renderUseDrawer()

    act(() => {
      drawerly.open({ drawerKey: 'a' })
      drawerly.open({ drawerKey: 'b' })
    })

    expect(result().isOpen).toBe(true)
    expect(result().instance?.drawerKey).toBe('a')

    setKey('b')

    expect(result().instance?.drawerKey).toBe('b')
    expect(result().isTop).toBe(true)
  })
})
