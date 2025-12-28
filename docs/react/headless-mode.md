# Headless Mode

Headless mode gives you complete control over drawer presentation by disabling all built-in UI, animations, and interactions. This is perfect when you want to implement custom animations, use a different UI library, or have specific design requirements that don't fit the default styling.

## What is Headless Mode?

When headless mode is enabled:

**No Animations**: Drawers appear and disappear instantly without slide transitions.

**No Backdrop**: The semi-transparent backdrop is not rendered.

**No Keyboard Handling**: Escape key handling is disabled (you implement it yourself).

**No Backdrop Clicks**: Clicking outside doesn't close drawers (you implement it yourself).

**No Default Styles**: Only the drawer stack structure is maintained; all styling is your responsibility.

**Full Control**: You receive raw drawer data and implement all presentation logic.

::: warning Do You Really Need Headless Mode?
Before implementing headless mode, consider that Drawerly's default mode is already highly customizable through CSS variables. You can achieve most design requirements by simply overriding CSS variables to match your design system without the complexity of headless mode.

**Headless mode is only necessary when:**
- You need fundamentally different animations that can't be achieved with CSS
- You're building a component that wraps Drawerly and needs complete UI control
- You have architectural requirements that demand full rendering control

For most applications, customizing the default styles through CSS variables will be simpler, more maintainable, and require significantly less code than building a custom container from scratch.
:::

## Enabling Headless Mode

Enable headless mode by setting the `headless` prop on `DrawerlyContainer`:

```tsx [App.tsx]
import { DrawerlyContainer } from '@drawerly/react'

function App() {
  return (
    <>
      <YourAppContent />
      <DrawerlyContainer headless />
    </>
  )
}
```

::: warning
In headless mode, you should NOT import the default styles:
```tsx
// ❌ Don't import when using headless mode
import '@drawerly/react/style.css'
```
:::

## DOM Structure in Headless Mode

In headless mode, the library still renders the drawer structure, but without the backdrop:

```html
<div data-drawerly-root data-headless>
  <div data-drawerly-overlay data-drawerly-key="my-drawer" data-drawerly-placement="right">
    <!-- No backdrop rendered in headless mode -->
    <div data-drawerly-panel role="dialog" aria-modal="true">
      <!-- Your drawer content -->
    </div>
  </div>
</div>
```

## Basic Headless Example

Here's a minimal example showing how to use headless mode:

```tsx [App.tsx]
import { DrawerlyContainer, useDrawer } from '@drawerly/react'

function App() {
  return (
    <>
      <MainContent />
      <DrawerlyContainer headless />
    </>
  )
}

function MainContent() {
  const { open } = useDrawer()

  return (
    <button
      onClick={() =>
        open({
          drawerKey: 'my-drawer',
          component: MyDrawerContent,
        })}
    >
      Open Drawer
    </button>
  )
}

function MyDrawerContent({ close }: { close: () => void }) {
  return (
    <div className="my-custom-drawer">
      <h2>Custom Drawer</h2>
      <button onClick={close}>Close</button>
    </div>
  )
}
```

## Using Children Render Prop

`DrawerlyContainer` accepts a `children` render function that's used when a drawer is opened without a `component` or `render` option.

```tsx [App.tsx]
import { DrawerlyContainer, useDrawer } from '@drawerly/react'

function App() {
  const { open } = useDrawer()

  return (
    <>
      <button onClick={() => open({ drawerKey: 'my-drawer' })}>
        Open Drawer
      </button>

      <DrawerlyContainer headless>
        {({ drawer, contentProps }) => (
          <div
            className="custom-drawer-overlay"
            data-placement={drawer.placement}
          >
            <div className="custom-backdrop" />
            <div className="custom-drawer-panel">
              <h2>
                Drawer:
                {contentProps.drawerKey}
              </h2>
              <button onClick={contentProps.close}>Close</button>
            </div>
          </div>
        )}
      </DrawerlyContainer>
    </>
  )
}
```

### Render Props

| Prop | Type | Description |
|------|------|-------------|
| `drawer` | `ReactDrawerOptions` | The current drawer instance with all its options |
| `contentProps` | `ReactDrawerContentProps` | Contains `drawerKey` and `close` function |

::: tip
Most applications won't need the children render prop in headless mode. Simply pass your components when opening drawers, and they'll be rendered automatically without the default backdrop and animations.
:::

## Implementing Custom Backdrop

In headless mode, no backdrop is rendered. You can add your own backdrop using data attributes for styling:

```css [styles.css]
/* Custom backdrop using ::before pseudo-element */
[data-drawerly-overlay] {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

[data-drawerly-overlay]::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

[data-drawerly-panel] {
  position: absolute;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: auto;
}

/* Right placement */
[data-drawerly-placement="right"] [data-drawerly-panel] {
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
}

/* Left placement */
[data-drawerly-placement="left"] [data-drawerly-panel] {
  top: 0;
  left: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
}

/* Top placement */
[data-drawerly-placement="top"] [data-drawerly-panel] {
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  max-height: 50vh;
}

/* Bottom placement */
[data-drawerly-placement="bottom"] [data-drawerly-panel] {
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  max-height: 50vh;
}
```

## Implementing Custom Interactions

In headless mode, you must implement keyboard and backdrop click handling yourself.

### Custom Keyboard Handling

```tsx [useEscapeKey.ts]
import { drawer } from '@drawerly/react'
import { useEffect } from 'react'

export function useEscapeKey() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape')
        return

      const state = drawer.getState()
      const topDrawer = state.stack[state.stack.length - 1]

      if (!topDrawer)
        return

      const canClose
        = typeof topDrawer.closeOnEscapeKey === 'function'
          ? topDrawer.closeOnEscapeKey(topDrawer)
          : Boolean(topDrawer.closeOnEscapeKey ?? true)

      if (canClose) {
        drawer.close(topDrawer.drawerKey)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
```

Use it in your app:

```tsx [App.tsx]
import { DrawerlyContainer } from '@drawerly/react'
import { useEscapeKey } from './useEscapeKey'

function App() {
  useEscapeKey()

  return (
    <>
      <YourAppContent />
      <DrawerlyContainer headless />
    </>
  )
}
```

### Custom Backdrop Click Handling

For backdrop click handling, you can use event delegation to detect clicks outside the drawer panel:

```tsx [useBackdropClick.ts]
import { drawer } from '@drawerly/react'
import { useEffect } from 'react'

export function useBackdropClick() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement
      const overlay = target.closest('[data-drawerly-overlay]')
      const panel = target.closest('[data-drawerly-panel]')

      // Clicked on overlay but not on the panel (i.e., backdrop area)
      if (overlay && !panel) {
        const key = overlay.getAttribute('data-drawerly-key')
        if (!key)
          return

        const instance = drawer.getDrawerInstance(key)
        if (!instance)
          return

        const canClose
          = typeof instance.closeOnBackdropClick === 'function'
            ? instance.closeOnBackdropClick(instance)
            : Boolean(instance.closeOnBackdropClick ?? true)

        if (canClose) {
          drawer.close(key)
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])
}
```

## Using Animation Libraries

Headless mode works great with animation libraries like Framer Motion or React Spring:

### With Framer Motion

```tsx [AnimatedDrawer.tsx]
import { DrawerlyContainer, useDrawer } from '@drawerly/react'
import { AnimatePresence, motion } from 'framer-motion'

function AnimatedDrawerContainer() {
  const { stack, close } = useDrawer()

  return (
    <AnimatePresence>
      {stack.map(d => (
        <motion.div
          key={d.drawerKey}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="custom-drawer-panel"
        >
          {d.component && <d.component {...d.componentProps} close={() => close(d.drawerKey)} />}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
```

## Building a Completely Custom Container

If you need complete control over rendering, you can build your own container that bypasses `DrawerlyContainer` entirely.

::: tip
For most use cases, prefer using `DrawerlyContainer` with the `children` render prop. Only use the direct subscription approach when you need complete control over the rendering lifecycle.
:::

```tsx [CustomDrawerContainer.tsx]
import { drawer, useDrawer } from '@drawerly/react'
import { createElement, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

export function CustomDrawerContainer() {
  const { stack, close, getDrawerInstance } = useDrawer()

  // Custom escape key handling
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape')
        return

      const topDrawer = stack[stack.length - 1]
      if (!topDrawer)
        return

      const canClose
        = typeof topDrawer.closeOnEscapeKey === 'function'
          ? topDrawer.closeOnEscapeKey(topDrawer)
          : Boolean(topDrawer.closeOnEscapeKey ?? true)

      if (canClose) {
        close(topDrawer.drawerKey)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [stack, close])

  const handleBackdropClick = useCallback((key: string) => {
    const instance = getDrawerInstance(key)
    if (!instance)
      return

    const canClose
      = typeof instance.closeOnBackdropClick === 'function'
        ? instance.closeOnBackdropClick(instance)
        : Boolean(instance.closeOnBackdropClick ?? true)

    if (canClose) {
      close(key)
    }
  }, [getDrawerInstance, close])

  if (stack.length === 0) {
    return null
  }

  return createPortal(
    <div className="custom-drawer-root">
      {stack.map((d, index) => (
        <div
          key={d.drawerKey}
          className="custom-drawer-overlay"
          data-placement={d.placement ?? 'right'}
          data-index={index}
        >
          {/* Custom backdrop */}
          <div
            className="custom-backdrop"
            onClick={() => handleBackdropClick(d.drawerKey)}
          />

          {/* Drawer panel */}
          <div className="custom-drawer-panel" role="dialog" aria-modal="true">
            {d.render
              ? d.render({ drawerKey: d.drawerKey, close: () => close(d.drawerKey) })
              : d.component
                ? createElement(d.component, {
                    drawerKey: d.drawerKey,
                    close: () => close(d.drawerKey),
                    ...d.componentProps,
                  })
                : null}
          </div>
        </div>
      ))}
    </div>,
    document.body
  )
}
```

```css [custom-drawer.css]
.custom-drawer-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
}

.custom-drawer-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.custom-drawer-overlay > * {
  pointer-events: auto;
}

.custom-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.custom-drawer-panel {
  position: absolute;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: auto;
}

.custom-drawer-overlay[data-placement="right"] .custom-drawer-panel {
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
}

.custom-drawer-overlay[data-placement="left"] .custom-drawer-panel {
  top: 0;
  left: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
}
```

::: tip
Building a custom container requires you to handle:
- Backdrop click logic with `closeOnBackdropClick` checks
- Keyboard handling with `closeOnEscapeKey` checks
- Proper pointer-events management
- Placement-specific positioning
- Subscribing to drawer state changes

Using the built-in `DrawerlyContainer` with `headless` prop is simpler for most use cases.
:::

## When to Use Headless Mode

**Use headless mode when:**
- You need custom animations or transitions
- You have specific design requirements that don't match the defaults
- You want complete control over rendering and styling
- You're building a design system with custom drawer behavior

**Use standard mode when:**
- You want quick setup with good defaults
- The default animations and styling work for your use case
- You don't need deep customization
- You want to minimize custom code

## Performance Considerations

In headless mode:
- Animations don't trigger automatically, reducing overhead
- You control rendering, so optimize as needed
- No unnecessary DOM elements or event listeners from the library
- Smaller bundle size if you don't import default styles

However, you're responsible for:
- Efficient animation implementations
- Proper cleanup of event listeners
- Optimized rendering of drawer components
