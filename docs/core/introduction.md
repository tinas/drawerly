# Introduction

`@drawerly/core` is a framework-agnostic drawer stack manager. It tracks which drawers are open, in what order, and with what options. There is no DOM or UI code in it; framework adapters such as [@drawerly/vue](/vue/introduction) consume this package and add the rendering layer.

```ts
import { createDrawerManager } from '@drawerly/core'

const manager = createDrawerManager()

manager.open({
  drawerKey: 'settings',
})

manager.open({
  drawerKey: 'profile',
  placement: 'left',
})

manager.bringToTop('settings')

manager.close('settings')
```

The manager stores drawers in an in-memory stack. Opening a key that already exists replaces its options and moves it to the top. Closing without a key removes the topmost entry. Subscribers are notified on every change, which is how a rendering layer stays in sync.

Drawer options are fully typed and extensible: add your own fields to `DrawerOptions` and TypeScript enforces them across the whole API. See [Defining Drawers](./concepts/defining-drawers).
