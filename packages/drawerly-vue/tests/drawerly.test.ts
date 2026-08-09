import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, isReactive, nextTick, watchEffect } from 'vue'
import { createDrawerly } from '../src/drawerly'
import { useDrawerly } from '../src/use-drawerly'

describe('createDrawerly', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

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

  it('keeps a reactive state ref in sync with the manager', async () => {
    const drawerly = createDrawerly()

    expect(drawerly.state.value.stack).toEqual([])

    drawerly.open({ drawerKey: 'a' })
    await nextTick()

    expect(drawerly.state.value.stack.map(d => d.drawerKey)).toEqual(['a'])
  })

  it('tracks manager reads inside computed properties', async () => {
    const drawerly = createDrawerly()
    const seen: boolean[] = []

    const Probe = defineComponent({
      setup() {
        const isOpen = computed(() => drawerly.isOpen('a'))
        watchEffect(() => seen.push(isOpen.value))
        return () => h('div')
      },
    })

    mount(Probe, { global: { plugins: [drawerly] } })

    drawerly.open({ drawerKey: 'a' })
    await nextTick()

    expect(seen).toEqual([false, true])
  })

  it('marks components as raw on open and update', () => {
    const drawerly = createDrawerly()
    const component = defineComponent({ render: () => h('div') })

    drawerly.open({ drawerKey: 'a', component })
    expect(isReactive(drawerly.getDrawerInstance('a')?.component)).toBe(false)

    const replacement = defineComponent({ render: () => h('span') })
    drawerly.updateOptions('a', { component: replacement })
    expect(drawerly.getDrawerInstance('a')?.component).toBe(replacement)
  })

  it('replaces the injected instance when a second one is installed in the same app', () => {
    const first = createDrawerly()
    const second = createDrawerly()

    let injected: ReturnType<typeof useDrawerly> | undefined
    const Probe = defineComponent({
      setup() {
        injected = useDrawerly()
        return () => h('div')
      },
    })

    mount(Probe, {
      global: { plugins: [first, second] },
    })

    expect(injected).toBe(second)
  })

  it('provides the instance on install', () => {
    const drawerly = createDrawerly()

    const Probe = defineComponent({
      setup() {
        const injected = useDrawerly()
        expect(injected).toBe(drawerly)
        return () => h('div')
      },
    })

    mount(Probe, {
      global: { plugins: [drawerly] },
    })
  })
})
