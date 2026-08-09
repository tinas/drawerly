# useDrawerly

`useDrawerly()` returns the `Drawerly` instance installed by `createDrawerly()`. It is the main entry point for opening, closing, and managing drawers from any component:

```vue
<script setup lang="ts">
import { useDrawerly } from '@drawerly/vue'
import UserProfile from './UserProfile.vue'

const drawerly = useDrawerly()

function showProfile() {
  drawerly.open({
    drawerKey: 'user-profile',
    component: UserProfile,
    componentProps: {
      userId: '123',
    },
  })
}
</script>

<template>
  <button @click="showProfile">Show Profile</button>
</template>
```

For working with one specific drawer, [`useDrawer`](./use-drawer.md) is usually more convenient. Outside components (router guards, stores), call the same methods on the `createDrawerly()` instance directly.

## Opening and Closing

`open()` adds a drawer to the stack, or replaces its options and brings it to the top if the key is already open. `componentProps` are passed to your component, along with the injected `drawerKey` prop:

```ts
drawerly.open({
  drawerKey: 'edit-42',
  component: EditForm,
  componentProps: {
    itemId: '42',
    onSave: data => console.log('Saved:', data),
  },
})
```

Closing takes an optional key:

```ts
drawerly.close() // topmost drawer
drawerly.close('edit-42') // specific drawer
drawerly.closeAll() // everything
```

Every close path plays the exit animation before the drawer leaves the DOM. To switch between open drawers without reopening them, use `bringToTop(key)`.

## Reactive State

The instance exposes a readonly `state` ref that updates on every change. Derive whatever you need from it with `computed`:

```ts
const drawerly = useDrawerly()

const isProfileOpen = computed(() =>
  drawerly.state.value.stack.some(d => d.drawerKey === 'user-profile')
)

const openCount = computed(() => drawerly.state.value.stack.length)
```

For one-off checks outside reactive contexts, `drawerly.isOpen(key)` and `drawerly.getState()` return plain snapshots. In components, prefer deriving from `state` so your template stays in sync.

You can also `watch` the ref, for example to track drawer opens in analytics:

```ts
watch(drawerly.state, (state) => {
  console.log('Stack changed:', state.stack.map(d => d.drawerKey))
})
```

## Updating Options

`updateOptions(key, patch)` merges a patch into an open drawer, taking effect immediately:

```ts
drawerly.updateOptions('user-profile', {
  dataAttributes: { 'data-loading': true },
})
```

`updateDefaultOptions(patch)` changes the global defaults instead. It only affects drawers opened afterwards; already open drawers keep their options.

## Typed Drawer Options

Pass a generic to extend the drawer options with your own fields:

```ts
import type { VueDrawerOptions } from '@drawerly/vue'

interface ProductDrawerOptions extends VueDrawerOptions {
  productId: string
  price: number
}

const drawerly = useDrawerly<ProductDrawerOptions>()

drawerly.open({
  drawerKey: 'product-123',
  component: ProductDetail,
  productId: '123',
  price: 999.99,
})
```

TypeScript then enforces the custom fields on `open()` and knows about them on every instance you read back.
