# Getting Started

## Installation

Install `@drawerly/core` with preferred package manager:

:::code-group
```bash [pnpm]
pnpm add @drawerly/core
```

```bash [npm]
npm install @drawerly/core
```

```bash [yarn]
yarn add @drawerly/core
```
:::

## Importing Styles

`@drawerly/core` also provives optional default styles for drawers. To import these styles into the project, add the following import statement:

```ts
import '@drawerly/core/styles.css'
```

These styles provide a basic look and feel for the drawers. Additional customization may be achieved by overriding the CSS variables defined in the stylesheet.

## Usage

After installation, `@drawerly/core` is ready to be used in the project. The following example demonstrates how to create a drawer manager and open a drawer:

```ts
import { createDrawerManager } from '@drawerly/core'

// Create a drawer manager
const manager = createDrawerManager()

// Open a drawer
manager.open({
  drawerKey: 'example-drawer',
  placement: 'right',
  ariaLabel: 'Example Drawer',
})

// Close the topmost drawer
manager.close()

// or close a specific drawer by its key
manager.close('example-drawer')
```

### Customizing Styles

The appearance of drawers can be customized by overriding the CSS variables defined in the default stylesheet. The following example demonstrates how to modify the background color and dimensions of the drawers:

```css
@import '@drawerly/core/styles.css';

[data-drawerly-root] {
  --drawerly-panel-bg: #1ea08cff;
  --drawerly-panel-width: 50%;
  --drawerly-panel-height: 50dvh;
}
```
