# Introduction

`@drawerly/core` provides a drawer stack manager with zero UI dependencies. This package manages drawer state, stacking order, and lifecycle events. Framework adapters consume this package to provide UI components.

## Key Features

- **Stack management** – Open, close, reorder, and clear drawers with a simple API
- **No UI coupling** – Pure state management with no DOM dependencies
- **Type-safe** – Full TypeScript support with generic options
- **Subscription model** – Subscribe to state changes to power any rendering layer

## Basic Example

```ts
import { createDrawerManager } from '@drawerly/core'

const manager = createDrawerManager()

manager.open({
  drawerKey: 'settings',
})

manager.open({
  drawerKey: 'profile',
  placement: 'left',
  ariaLabel: 'Settings Drawer',
})

manager.bringToTop('settings')

manager.close('settings')
```

The manager stores drawers in an in-memory stack. Opening a drawer that already exists updates it and moves it to the top. Closing without a key removes the topmost entry.
