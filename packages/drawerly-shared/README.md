# @drawerly/shared

Shared UI contracts and default styles for all Drawerly framework adapters.

This package contains:

- 📐 Shared drawer UI types (`DrawerUiOptions`, `DrawerPlacement`)
- 🧱 Component configuration types (`DrawerComponentConfig`)
- 🎨 The default Drawerly stylesheet (`styles.css`)
- 🧩 No framework-specific logic

It is consumed by adapter packages (e.g. `@drawerly/vue`, `@drawerly/react`).

## Installation

```bash
npm install @drawerly/shared
# or
pnpm add @drawerly/shared
```

## When to Use

If you're building a Drawerly framework adapter (Vue, React, Svelte, etc.)
or creating custom rendering logic, import the shared types and CSS:

```ts
import type { DrawerUiOptions } from '@drawerly/shared'
import '@drawerly/shared/styles.css'
```

### Stylesheet

`styles.css` contains:
- Drawer placement animations
- Backdrop transitions
- Panel transitions
- Reduced-motion support
- Border-radius variables
- Z-index + CSS variables for theming

Applications may override CSS variables:

```css
[data-drawerly-root] {
  --drawerly-panel-bg: #fff;
  --drawerly-panel-width: 420px;
  --drawerly-border-radius: 10px;
  /* ... */
}
```
