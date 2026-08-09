import { createDrawerly } from '../src/drawerly'

describe('createDrawerly', () => {
  it('exposes the manager API on the instance itself', () => {
    const drawerly = createDrawerly()

    drawerly.open({ drawerKey: 'a' })

    expect(drawerly.isOpen('a')).toBe(true)
    expect(drawerly.getTopDrawer()?.drawerKey).toBe('a')

    drawerly.close('a')
    expect(drawerly.isOpen('a')).toBe(false)
  })

  it('applies defaultOptions to opened drawers', () => {
    const drawerly = createDrawerly({
      defaultOptions: { placement: 'left' },
    })

    drawerly.open({ drawerKey: 'a' })

    expect(drawerly.getDrawerInstance('a')?.placement).toBe('left')
  })

  it('notifies subscribers outside of components', () => {
    const drawerly = createDrawerly()
    const listener = vi.fn()

    const unsubscribe = drawerly.subscribe(listener)
    drawerly.open({ drawerKey: 'a' })

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: [expect.objectContaining({ drawerKey: 'a' })],
      }),
    )

    unsubscribe()
    drawerly.close('a')
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
