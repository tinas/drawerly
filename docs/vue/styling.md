# Styling

The default stylesheet gives drawers a complete look out of the box. Customize it through CSS variables, or target the data attributes the container renders for anything the variables don't cover.

## Including the Styles

Import the stylesheet once, next to where you install the instance:

```ts [main.ts]
import '@drawerly/vue/style.css'
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

The full list of variables and data attributes is in the [styling reference](/core/concepts/styling).

## Styling by Placement

Each drawer's overlay carries a `data-drawerly-placement` attribute, so different placements can look different:

```css
[data-drawerly-placement="right"] {
  --drawerly-panel-width: 600px;
}

/* Bottom sheets on mobile */
[data-drawerly-placement="bottom"] {
  --drawerly-panel-height: 400px;
  --drawerly-panel-radius: 16px 16px 0 0;
}
```

## Dark Mode

Scope the variables to your theme selector:

```css
:root[data-theme="dark"] [data-drawerly-root] {
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.8);
  --drawerly-panel-bg: #1e1e1e;
}
```

The same works with `@media (prefers-color-scheme: dark)`.

## Styling Specific Drawers

The `dataAttributes` option adds custom attributes to a drawer's overlay element, which you can target from CSS:

```ts
drawerly.open({
  drawerKey: 'settings',
  component: SettingsPanel,
  dataAttributes: {
    'data-category': 'settings',
  },
})
```

```css
[data-drawerly-overlay][data-category="settings"] [data-drawerly-panel] {
  border-left: 4px solid #3b82f6;
}
```

You can also update these attributes on an open drawer with `updateOptions`, for example to toggle a `data-loading` state.

## Drawer Content

Your component fills the panel, so its layout is ordinary Vue styling. A typical drawer stretches to full height with a scrollable body:

```vue
<template>
  <div class="drawer">
    <header>...</header>
    <div class="body">...</div>
  </div>
</template>

<style scoped>
.drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.body {
  flex: 1;
  overflow-y: auto;
}
</style>
```

## Going Further

If variable overrides aren't enough, you can replace the stylesheet entirely and keep all the behavior. See [Unstyled Mode](./unstyled-mode.md).
