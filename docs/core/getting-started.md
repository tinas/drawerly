# Getting Started

## Installation

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

## Usage

Create a manager and start opening drawers:

```ts
import { createDrawerManager } from '@drawerly/core'

const manager = createDrawerManager()

manager.open({
  drawerKey: 'example-drawer',
  placement: 'right',
})

// Close the topmost drawer
manager.close()

// Or close a specific drawer by its key
manager.close('example-drawer')
```

The manager only tracks state. To render something, subscribe to its changes and update the DOM from the stack, or use a framework adapter such as [@drawerly/vue](/vue/introduction) that does this for you. See [Managing the Stack](./concepts/managing-stack) for the full state model.

## Styles

The package includes an optional stylesheet used by rendering layers:

```ts
import '@drawerly/core/styles.css'
```

Customize it by overriding CSS variables:

```css
[data-drawerly-root] {
  --drawerly-panel-bg: #1ea08c;
  --drawerly-panel-width: 50%;
}
```

See [Styling](./concepts/styling) for the full reference.
