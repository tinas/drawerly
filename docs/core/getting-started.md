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

Create a manager and open a drawer:

```ts
import { createDrawerManager } from '@drawerly/core'

const manager = createDrawerManager()

manager.open({
  drawerKey: 'example-drawer',
})
```

The manager only tracks state. To render something, use a framework adapter, or subscribe to the manager and drive your own rendering layer. See [Managing the Stack](./concepts/managing-stack) for the full API and [Styling](./concepts/styling) for the optional stylesheet.
