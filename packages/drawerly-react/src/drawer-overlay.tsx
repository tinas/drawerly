import type { AnimationEvent, ReactElement, ReactNode } from 'react'
import type { DrawerInstance, ReactDrawerContentProps, ReactDrawerOptions } from './types'
import {
  createElement,
  useCallback,
  useState,
} from 'react'
import { getDrawerManager } from './manager'

interface DrawerOverlayProps {
  drawer: DrawerInstance<ReactDrawerOptions>
  index: number
  count: number
  headless: boolean
  nextTopKey: string | null
  renderFallback?: (props: {
    drawer: ReactDrawerOptions
    contentProps: ReactDrawerContentProps
  }) => ReactNode
}

/**
 * Handles animation states, backdrop clicks, and content rendering.
 *
 * @internal
 */
export function DrawerOverlay({
  drawer,
  index,
  count,
  headless,
  nextTopKey,
  renderFallback,
}: DrawerOverlayProps): ReactElement {
  const [isClosing, setIsClosing] = useState(false)
  const [isEntering, setIsEntering] = useState(true)
  const manager = getDrawerManager()

  const key = drawer.drawerKey
  const placement = drawer.placement ?? 'right'
  const isTopLike = key === drawer.drawerKey && (index === count - 1 || key === nextTopKey)

  const handleClose = useCallback(() => {
    if (headless) {
      manager.close(key)
    }
    else {
      setIsClosing(true)
    }
  }, [headless, key, manager])

  const handleBackdropClick = useCallback(() => {
    if (headless)
      return

    const closeOnBackdropClick = typeof drawer.closeOnBackdropClick === 'function'
      ? drawer.closeOnBackdropClick(drawer)
      : Boolean(drawer.closeOnBackdropClick ?? true)

    if (closeOnBackdropClick) {
      handleClose()
    }
  }, [headless, drawer, handleClose])

  const handleAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      if (headless)
        return

      const name = event.animationName || ''

      if (isClosing && name.startsWith('drawerly-slide-out-')) {
        if (event.target === event.currentTarget) {
          manager.close(key)
        }
      }

      if (isEntering && name.startsWith('drawerly-slide-in-')) {
        if (event.target === event.currentTarget) {
          setIsEntering(false)
        }
      }
    },
    [headless, isClosing, isEntering, key, manager],
  )

  const contentProps: ReactDrawerContentProps = {
    drawerKey: key,
    close: handleClose,
  }

  const content = drawer.render
    ? drawer.render(contentProps)
    : drawer.component
      ? createElement(drawer.component, {
          ...contentProps,
          ...drawer.componentProps,
        })
      : renderFallback
        ? renderFallback({ drawer, contentProps })
        : null

  const userDataAttributes = drawer.dataAttributes != null
    ? Object.fromEntries(
        Object.entries(drawer.dataAttributes).filter(
          ([name]) => !name.startsWith('data-drawerly'),
        ),
      )
    : undefined

  return (
    <div
      data-drawerly-overlay=""
      data-drawerly-key={key}
      data-drawerly-index={index}
      data-drawerly-count={count}
      data-drawerly-placement={placement}
      {...(isTopLike && { 'data-top': '' })}
      {...(isClosing && { 'data-closing': '' })}
      {...(isEntering && !headless && { 'data-entering': '' })}
      {...userDataAttributes}
    >
      {!headless && (
        <div
          data-drawerly-backdrop=""
          onClick={handleBackdropClick}
        />
      )}
      <div
        data-drawerly-panel=""
        role="dialog"
        aria-modal="true"
        aria-label={drawer.ariaLabel}
        aria-describedby={drawer.ariaDescribedBy}
        aria-labelledby={drawer.ariaLabelledBy}
        onAnimationEnd={handleAnimationEnd}
      >
        {content}
      </div>
    </div>
  )
}
