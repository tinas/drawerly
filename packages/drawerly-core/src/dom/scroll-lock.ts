let activeLocks = 0
let restoreStyles: (() => void) | null = null

function isIOS(): boolean {
  if (typeof navigator === 'undefined')
    return false

  // iPadOS reports itself as a Mac, so touch points are the only reliable tell.
  return /iP(?:hone|ad|od)/.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent))
}

function applyLock(): () => void {
  const { body, documentElement } = document
  const { overflow, paddingRight, position, top, width } = body.style
  const scrollbarWidth = window.innerWidth - documentElement.clientWidth
  const scrollY = window.scrollY

  const restore = (): void => {
    body.style.overflow = overflow
    body.style.paddingRight = paddingRight
    body.style.position = position
    body.style.top = top
    body.style.width = width
  }

  if (scrollbarWidth > 0) {
    const current = Number.parseFloat(getComputedStyle(body).paddingRight) || 0
    body.style.paddingRight = `${current + scrollbarWidth}px`
  }

  // iOS Safari ignores `overflow: hidden` on the body, so the page has to be
  // taken out of flow and scrolled back on release.
  if (isIOS()) {
    body.style.position = 'fixed'
    body.style.top = `${-scrollY}px`
    body.style.width = '100%'

    return () => {
      restore()
      window.scrollTo(0, scrollY)
    }
  }

  body.style.overflow = 'hidden'

  return restore
}

/**
 * Prevents the page from scrolling and returns a release function.
 *
 * Locks are reference counted; styles are restored when the last one is
 * released.
 *
 * @public
 */
export function lockScroll(): () => void {
  if (typeof document === 'undefined')
    return () => {}

  if (activeLocks === 0)
    restoreStyles = applyLock()

  activeLocks++

  let released = false

  return () => {
    if (released)
      return

    released = true
    activeLocks--

    if (activeLocks === 0) {
      restoreStyles?.()
      restoreStyles = null
    }
  }
}
