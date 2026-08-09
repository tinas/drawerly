// @vitest-environment jsdom

import { lockScroll } from '../src/dom'

describe('lockScroll', () => {
  afterEach(() => {
    document.body.removeAttribute('style')
  })

  it('hides overflow and restores the previous inline value', () => {
    document.body.style.overflow = 'auto'

    const release = lockScroll()
    expect(document.body.style.overflow).toBe('hidden')

    release()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('restores every style it touched', () => {
    const release = lockScroll()
    release()

    expect(document.body.getAttribute('style')).toBe('')
  })

  it('keeps the lock until the last holder releases it', () => {
    const first = lockScroll()
    const second = lockScroll()

    first()
    expect(document.body.style.overflow).toBe('hidden')

    second()
    expect(document.body.style.overflow).toBe('')
  })

  it('ignores repeated release calls', () => {
    const first = lockScroll()
    const second = lockScroll()

    first()
    first()
    expect(document.body.style.overflow).toBe('hidden')

    second()
    expect(document.body.style.overflow).toBe('')
  })
})
