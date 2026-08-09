import type { UseDrawerlyResult } from '../src/use-drawerly'
import { act, cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import { createDrawerly } from '../src/drawerly'
import { useDrawerly } from '../src/use-drawerly'

function renderUseDrawerly(drawerly = createDrawerly()) {
  let current!: UseDrawerlyResult

  function Probe(): null {
    current = useDrawerly(drawerly)
    return null
  }

  render(createElement(Probe))

  return { drawerly, result: () => current }
}

describe('useDrawerly', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('throws without an instance', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    function Probe(): null {
      useDrawerly(undefined as never)
      return null
    }

    expect(() => render(createElement(Probe))).toThrowError(
      /requires an instance/,
    )

    error.mockRestore()
  })

  it('exposes the manager API of the given instance', () => {
    const { drawerly, result } = renderUseDrawerly()

    act(() => {
      result().open({ drawerKey: 'a' })
    })

    expect(drawerly.isOpen('a')).toBe(true)
    expect(result().getTopDrawer()?.drawerKey).toBe('a')
  })

  it('keeps the stack in sync with the manager', () => {
    const { drawerly, result } = renderUseDrawerly()

    expect(result().stack).toEqual([])

    act(() => {
      drawerly.open({ drawerKey: 'a' })
    })

    expect(result().stack.map(d => d.drawerKey)).toEqual(['a'])

    act(() => {
      drawerly.close('a')
    })

    expect(result().stack).toEqual([])
  })
})
