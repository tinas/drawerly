# useDrawer

`useDrawer(key)` binds to a single drawer, identified by its key. Where [`useDrawerly`](./use-drawerly.md) opens drawers and manages the whole stack, `useDrawer` observes and adjusts one that already exists:

```vue
<script setup lang="ts">
import { useDrawer } from '@drawerly/vue'

const { isOpen, isTop, close } = useDrawer('settings')
</script>

<template>
  <span v-if="isOpen" :class="{ top: isTop }">Settings is open</span>
  <button v-if="isOpen" @click="close">Close Settings</button>
</template>
```

Drawers are created with [`useDrawerly().open()`](./use-drawerly.md#opening-and-closing). Reach for `useDrawer` once you have a key and want to read or adjust that specific drawer, most commonly from inside the drawer's own content component.

## Reactive Values

`isOpen` tracks whether the drawer is in the stack, and `isTop` whether it is the topmost one. Both update automatically:

```vue
<script setup lang="ts">
const { isOpen, isTop, bringToTop } = useDrawer('settings')
</script>

<template>
  <button v-if="isOpen && !isTop" @click="bringToTop">
    Focus Settings
  </button>
</template>
```

`instance` exposes the full drawer instance reactively, including any custom fields, and is `undefined` while the drawer is closed:

```ts
const { instance } = useDrawer('product-detail')

console.log(instance.value?.placement)
```

## Updating Options

`updateOptions` merges a patch into the drawer:

```ts
const { updateOptions } = useDrawer('form')

updateOptions({ closeOnEscapeKey: false })
```

To compute a patch from the current value, read it off `instance` first:

```ts
const { instance, updateOptions } = useDrawer('product-detail')

updateOptions({ price: (instance.value?.price ?? 0) * 0.9 })
```

## Closing Yourself

The most common use of `useDrawer` is inside the drawer's own content component, closing itself with the `drawerKey` prop the container passes in:

```vue [UserProfile.vue]
<script setup lang="ts">
import { useDrawer } from '@drawerly/vue'

const props = defineProps<{ drawerKey: string, userId: string }>()

const { close } = useDrawer(props.drawerKey)
</script>

<template>
  <button @click="close">Close</button>
</template>
```

## Dynamic Keys

The key can be a plain string, a ref, or a getter. All bindings follow key changes reactively:

```ts
const userId = ref('123')

const { isOpen, close } = useDrawer(() => `user-profile-${userId.value}`)
// changing userId rebinds everything to the new key
```

## Typed Drawer Options

Pass a generic for type-safe access to custom fields:

```ts
const { instance, updateOptions } = useDrawer<ProductDrawerOptions>('product-drawer')

console.log(instance.value?.price)
updateOptions({ price: 899.99 })
```

## Full API

The composable returns `isOpen`, `isTop`, and `instance`, plus the `close`, `bringToTop`, and `updateOptions` methods. Each is documented in the [useDrawer API Reference](../api/use-drawer.md).
