# Getting Started

## Installation

Install `@drawerly/core` with your favorite package manager:

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

`@drawerly/core` also provives optional default styles for drawers. You can import these styles into your project as follows:

```ts
import '@drawerly/core/styles.css'
```

These styles provide a basic look and feel for the drawers, but you can customize them further by overriding the CSS variables defined in the stylesheet.

## Usage

After installation, you can start using `@drawerly/core` in your project. Let's look at a basic example of how to create a drawer manager and open a drawer:

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

You can customize the appearance of the drawers by overriding the CSS variables defined in the default stylesheet. For example, to change the background color and width of the drawers, you can add the following CSS to your project:

```css
@import '@drawerly/core/styles.css';

[data-drawerly-root] {
  --drawerly-panel-bg: #1ea08cff;
  --drawerly-panel-width: 50%;
  --drawerly-panel-height: 50dvh;
}
```
