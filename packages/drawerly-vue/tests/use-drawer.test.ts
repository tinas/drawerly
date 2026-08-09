import type { UseDrawerResult } from '../src/use-drawer'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { createDrawerly } from '../src/drawerly'
import { useDrawer } from '../src/use-drawer'

function mountUseDrawer(
  drawerly = createDrawerly(),
  key: Parameters<typeof useDrawer>[0] = 'a',
) {
  let result!: UseDrawerResult

  const Probe = defineComponent({
    setup() {
      result = useDrawer(key)
      return () => h('div')
    },
  })

  const wrapper = mount(Probe, { global: { plugins: [drawerly] } })

  return { drawerly, wrapper, result }
}

describe('useDrawer', () => {
  it('tracks isOpen reactively', async () => {
    const { drawerly, result } = mountUseDrawer()

    expect(result.isOpen.value).toBe(false)

    drawerly.open({ drawerKey: 'a' })
    await nextTick()
    expect(result.isOpen.value).toBe(true)

    drawerly.close('a')
    await nextTick()
    expect(result.isOpen.value).toBe(false)
  })

  it('tracks isTop reactively', async () => {
    const { drawerly, result } = mountUseDrawer()

    drawerly.open({ drawerKey: 'a' })
    await nextTick()
    expect(result.isTop.value).toBe(true)

    drawerly.open({ drawerKey: 'b' })
    await nextTick()
    expect(result.isTop.value).toBe(false)

    result.bringToTop()
    await nextTick()
    expect(result.isTop.value).toBe(true)
  })

  it('exposes the drawer instance', async () => {
    const { drawerly, result } = mountUseDrawer()

    expect(result.instance.value).toBeUndefined()

    drawerly.open({ drawerKey: 'a', ariaLabel: 'Panel' })
    await nextTick()

    expect(result.instance.value?.ariaLabel).toBe('Panel')
  })

  it('closes the bound drawer', async () => {
    const { drawerly, result } = mountUseDrawer()

    drawerly.open({ drawerKey: 'a' })
    drawerly.open({ drawerKey: 'b' })
    await nextTick()

    result.close()
    await nextTick()

    expect(drawerly.isOpen('a')).toBe(false)
    expect(drawerly.isOpen('b')).toBe(true)
  })

  it('merges patches into the bound drawer through updateOptions', async () => {
    const { drawerly, result } = mountUseDrawer()

    drawerly.open({ drawerKey: 'a', ariaLabel: 'Original', placement: 'left' })
    result.updateOptions({ ariaLabel: 'Updated' })
    await nextTick()

    expect(drawerly.getDrawerInstance('a')).toMatchObject({
      ariaLabel: 'Updated',
      placement: 'left',
    })
  })

  it('follows reactive key changes', async () => {
    const key = ref('a')
    const { drawerly, result } = mountUseDrawer(createDrawerly(), key)

    drawerly.open({ drawerKey: 'a' })
    drawerly.open({ drawerKey: 'b' })
    await nextTick()

    expect(result.isOpen.value).toBe(true)
    expect(result.instance.value?.drawerKey).toBe('a')

    key.value = 'b'
    await nextTick()

    expect(result.instance.value?.drawerKey).toBe('b')
    expect(result.isTop.value).toBe(true)
  })
})
