# Styling

The core package ships an optional stylesheet that gives drawers a complete default look. Everything visual is driven by CSS variables and data attributes, so you can customize as little or as much as you want. The state management itself has no styling dependency; skipping the stylesheet entirely is also supported.

## Including the Styles

```ts
import '@drawerly/core/styles.css'
```

Or link it in HTML:

```html
<link rel="stylesheet" href="node_modules/@drawerly/core/dist/styles.css">
```

## Data Attributes

Rendering layers mark the drawer elements with data attributes, which the stylesheet (and your own CSS) targets. There are no class names to conflict with:

- `[data-drawerly-root]`: root container
- `[data-drawerly-overlay]`: wrapper for each drawer
- `[data-drawerly-backdrop]`: backdrop behind the drawer
- `[data-drawerly-panel]`: the drawer panel containing your content
- `[data-drawerly-placement]`: position (`'top'`, `'right'`, `'bottom'`, `'left'`)
- `[data-top]`: present on the topmost drawer

```
[data-drawerly-root]
  └─ [data-drawerly-overlay]
      ├─ [data-drawerly-backdrop]
      └─ [data-drawerly-panel]
```

## CSS Variables

The default styles define these variables on `[data-drawerly-root]`:

```css
[data-drawerly-root] {
  /* Backdrop */
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.5);

  /* Panel appearance */
  --drawerly-panel-bg: white;
  --drawerly-panel-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  --drawerly-panel-width: 400px;
  --drawerly-panel-height: 300px;
  --drawerly-panel-radius: 16px;

  /* Animations */
  --drawerly-transition-duration: 300ms;
  --drawerly-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);

  /* Layering */
  --drawerly-z-index: 1000;
}
```

Override them in your own CSS:

```css
[data-drawerly-root] {
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.7);
  --drawerly-panel-bg: #1a1a1a;
  --drawerly-panel-width: 500px;
}
```

Set `--drawerly-z-index` only on the root to position the whole drawer system within your app's layering. Setting z-index on individual drawer elements breaks the stack ordering.

## Styling by Placement

Drawers slide in from one of four edges. Target a placement to give it its own dimensions:

```css
[data-drawerly-placement="right"] {
  --drawerly-panel-width: 600px;
}

/* Bottom sheets */
[data-drawerly-placement="bottom"] {
  --drawerly-panel-height: 400px;
  --drawerly-panel-radius: 16px 16px 0 0;
}
```

## Custom Data Attributes

The `dataAttributes` option adds your own attributes to a drawer's overlay, giving specific drawers styling hooks without coupling CSS to drawer keys:

```ts
manager.open({
  drawerKey: 'product-drawer',
  dataAttributes: {
    'data-product-type': 'premium',
  },
})
```

```css
[data-drawerly-overlay][data-product-type="premium"] [data-drawerly-panel] {
  border-left: 4px solid gold;
}
```

These attributes can be toggled on an open drawer with `updateOptions()`, which is a convenient way to style transient states such as loading:

```ts
manager.updateOptions('my-drawer', {
  dataAttributes: { 'data-loading': true },
})
```

```css
[data-drawerly-overlay][data-loading] [data-drawerly-panel] {
  pointer-events: none;
  opacity: 0.6;
}
```

## Animations

Timing and easing are variables:

```css
[data-drawerly-root] {
  --drawerly-transition-duration: 200ms;
  --drawerly-transition-timing: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

Enter and leave animations key off two classes applied to `[data-drawerly-overlay]` while it transitions: `.drawerly-enter-active` and `.drawerly-leave-active`. For different motion entirely, override them:

```css
@keyframes custom-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

[data-drawerly-overlay].drawerly-enter-active [data-drawerly-panel] {
  animation: custom-fade-in var(--drawerly-transition-duration) ease-out;
}
```

Each adapter has its own rules for how long it keeps a closing drawer mounted while waiting for these animations; check its unstyled mode guide ([Vue](/vue/unstyled-mode), [React](/react/unstyled-mode)) before writing an animation that targets only the panel.

The default styles respect `prefers-reduced-motion` and disable animations for users who request it. Keep that behavior in your customizations:

```css
@media (prefers-reduced-motion: reduce) {
  [data-drawerly-overlay].drawerly-enter-active,
  [data-drawerly-overlay].drawerly-leave-active,
  [data-drawerly-panel] {
    animation: none !important;
    transition: none !important;
  }
}
```

## Stack Depth

`[data-top]` distinguishes the active drawer from the ones underneath, which is enough to visualize depth:

```css
[data-drawerly-overlay]:not([data-top]) [data-drawerly-panel] {
  transform: scale(0.95);
  filter: brightness(0.9);
}
```

## Panel Content

The panel has no internal padding and no scrolling behavior by default; your content decides its own layout:

```css
[data-drawerly-panel] {
  padding: 24px;
  overflow-y: auto;
}
```

The backdrop is a plain element too, so effects like `backdrop-filter: blur(10px)` or `display: none` are one-liners on `[data-drawerly-backdrop]`.
