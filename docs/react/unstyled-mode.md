# Unstyled Mode

Drawerly separates behavior from presentation. The container manages the stack, interactions, accessibility, and animations through a stable set of data attributes; the default stylesheet is just one consumer of them. If CSS variable overrides ([Styling](./styling.md)) aren't enough, drop the stylesheet and design everything yourself.

## Skipping the Stylesheet

Unstyled mode is not a flag. It is simply not importing the default stylesheet:

```ts [drawerly.ts]
import { createDrawerly } from '@drawerly/react'

// No style import
// import '@drawerly/react/style.css'

export const drawerly = createDrawerly()
```

Everything else keeps working: Escape and backdrop-click closing and scroll locking stay active. You style the structure through the data attributes the container renders:

```css
[data-drawerly-overlay] {
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
}

[data-drawerly-overlay] > * {
  pointer-events: auto;
}

[data-drawerly-backdrop] {
  position: absolute;
  inset: 0;
  background: rgb(15 23 42 / 0.4);
}

[data-drawerly-panel] {
  position: absolute;
  background: white;
  overflow: auto;
}

[data-drawerly-placement='right'] [data-drawerly-panel] {
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
}

/* left, top, and bottom placements follow the same pattern */
```

The full attribute list is in the [core styling reference](/core/concepts/styling#data-attributes).

## Custom Animations

The container toggles `drawerly-enter-active` while a drawer enters and `drawerly-leave-active` while it leaves, then waits for `Element.getAnimations()` on the overlay to settle before removing a closing drawer from the DOM. It asks for the whole subtree, so an animation anywhere inside the overlay works, including one defined only on the panel:

```css
[data-drawerly-overlay].drawerly-enter-active [data-drawerly-panel] {
  animation: my-slide-in 250ms ease-out;
}

[data-drawerly-overlay].drawerly-leave-active [data-drawerly-panel] {
  animation: my-slide-out 250ms ease-in;
}

@keyframes my-slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes my-slide-out {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}
```

Respect `prefers-reduced-motion` in your own animations. When it disables them there is nothing for `getAnimations()` to find, so the container finishes immediately and nothing gets stuck.

## Non-Modal Drawers

By default drawers are modal: a backdrop and `aria-modal` semantics. Set `modal` to `false` to keep the page interactive behind the drawers:

```tsx
<DrawerlyContainer drawerly={drawerly} modal={false} />
```

Escape handling remains active and still honors each drawer's `closeOnEscapeKey` option. Scroll locking is a separate `lockScroll` prop and can be turned off independently of `modal`.

## Building a Custom Container

For complete control over markup and behavior, skip `<DrawerlyContainer>` entirely and render the stack yourself. `useDrawerly` exposes the reactive stack, so a custom container is ordinary React code:

```tsx [CustomDrawerContainer.tsx]
import { resolveDrawerPredicate } from '@drawerly/core'
import { useDrawerly } from '@drawerly/react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { drawerly } from './drawerly'

export function CustomDrawerContainer() {
  const { stack } = useDrawerly(drawerly)

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape')
        return

      const top = drawerly.getTopDrawer()
      if (top && resolveDrawerPredicate(top.closeOnEscapeKey, top))
        drawerly.close(top.drawerKey)
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return createPortal(
    <div className="drawer-root">
      {stack.map(drawer => (
        <div
          key={drawer.drawerKey}
          className="drawer-overlay"
          data-placement={drawer.placement}
        >
          <div
            className="backdrop"
            onClick={() => {
              if (resolveDrawerPredicate(drawer.closeOnBackdropClick, drawer))
                drawerly.close(drawer.drawerKey)
            }}
          />
          <div className="panel">
            {drawer.component && (
              <drawer.component
                {...drawer.componentProps}
                drawerKey={drawer.drawerKey}
              />
            )}
          </div>
        </div>
      ))}
    </div>,
    document.body,
  )
}
```

Drawer content closes itself the same way it would inside the built-in container, with `useDrawer(drawerly, props.drawerKey).close()`.

::: warning Accessibility is your responsibility
The built-in container provides scroll locking, exit animations, and ARIA dialog semantics. A custom container implements none of this automatically. For most applications, unstyled mode with the built-in container is the better trade-off.
:::

## Reading the Stack

The same reactive stack powers any custom UI driven by it, such as a drawer count badge or a top-drawer indicator:

```ts
const { stack } = useDrawerly(drawerly)

const hasDrawers = stack.length > 0
const topDrawer = stack.at(-1)
```
