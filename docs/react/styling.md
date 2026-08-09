# Styling

The default stylesheet gives drawers a complete look out of the box. Customize it through CSS variables, or target the data attributes the container renders for anything the variables don't cover.

## Including the Styles

Import the stylesheet once, in your entry file:

```ts [main.tsx]
import '@drawerly/react/style.css'
```

## CSS Variables

All visual aspects are controlled by CSS variables defined on `[data-drawerly-root]`:

```css
[data-drawerly-root] {
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.7);
  --drawerly-panel-bg: #1e1e1e;
  --drawerly-panel-width: 500px;
  --drawerly-panel-radius: 12px;
  --drawerly-transition-duration: 250ms;
  --drawerly-z-index: 1000;
}
```

The full list of variables and data attributes is in the [core styling reference](/core/concepts/styling).

## Dark Mode

Scope the variables to your theme selector:

```css
:root[data-theme="dark"] [data-drawerly-root] {
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.8);
  --drawerly-panel-bg: #1e1e1e;
}
```

The same works with `@media (prefers-color-scheme: dark)`.

## Drawer Content

Your component fills the panel, so its layout is ordinary React styling. A typical drawer stretches to full height with a scrollable body:

```tsx
export function DrawerContent() {
  return (
    <div className="drawer">
      <header>...</header>
      <div className="body">...</div>
    </div>
  )
}
```

```css
.drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.body {
  flex: 1;
  overflow-y: auto;
}
```

## Going Further

If variable overrides aren't enough, you can replace the stylesheet entirely and keep all the behavior. See [Unstyled Mode](./unstyled-mode.md).
