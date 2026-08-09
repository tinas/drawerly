import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createDrawerly } from '../src/drawerly'
import { useDrawerly } from '../src/use-drawerly'

describe('useDrawerly', () => {
  it('throws when the drawerly instance is not installed', () => {
    const Probe = defineComponent({
      setup() {
        useDrawerly()
        return () => h('div')
      },
    })

    expect(() => mount(Probe)).toThrowError(
      /must be used after installing/,
    )
  })

  it('returns the installed drawerly instance', () => {
    const drawerly = createDrawerly()

    const Probe = defineComponent({
      setup() {
        const injected = useDrawerly()
        injected.open({ drawerKey: 'from-composable' })
        return () => h('div')
      },
    })

    mount(Probe, { global: { plugins: [drawerly] } })

    expect(drawerly.isOpen('from-composable')).toBe(true)
  })
})
