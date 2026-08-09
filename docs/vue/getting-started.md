# Getting Started

## Installation

:::code-group
```bash [pnpm]
pnpm add @drawerly/vue
```

```bash [npm]
npm install @drawerly/vue
```

```bash [yarn]
yarn add @drawerly/vue
```
:::

## Setup

Create a `Drawerly` instance with `createDrawerly()` and install it in your app:

```ts [main.ts]
import { createDrawerly } from '@drawerly/vue'
import { createApp } from 'vue'
import App from './App.vue'

import '@drawerly/vue/style.css'

const app = createApp(App)

app.use(createDrawerly({
  defaultOptions: {
    placement: 'right',
  },
}))

app.mount('#app')
```

`defaultOptions` sets global defaults for all drawers, such as `placement` or the close behaviors. See the [createDrawerly API Reference](./api/create-drawerly.md) for the full list.

Then add `<DrawerlyContainer />` to your root template. It renders the open drawers:

```vue [App.vue]
<script setup lang="ts">
import { DrawerlyContainer } from '@drawerly/vue'
</script>

<template>
  <div id="app">
    <YourAppContent />

    <DrawerlyContainer />
  </div>
</template>
```

One container per application is enough. Its props (teleport target, modal behavior, scroll locking) are documented in the [DrawerlyContainer API Reference](./api/drawer-container.md).

## Your First Drawer

Any Vue component can be drawer content. The container passes it one extra prop, `drawerKey`; call [`useDrawer`](./composables/use-drawer.md) with it to close the drawer from inside.

```vue [UserProfile.vue]
<script setup lang="ts">
import { useDrawer } from '@drawerly/vue'

const props = defineProps<{
  drawerKey: string
  userId: string
}>()

const { close } = useDrawer(props.drawerKey)
</script>

<template>
  <div class="user-profile">
    <header>
      <h2>User Profile</h2>
      <button @click="close">✕</button>
    </header>
    <p>User ID: {{ userId }}</p>
  </div>
</template>
```

Open it with the `useDrawerly` composable:

```vue [HomePage.vue]
<script setup lang="ts">
import { useDrawerly } from '@drawerly/vue'
import UserProfile from './UserProfile.vue'

const drawerly = useDrawerly()

function showUserProfile(userId: string) {
  drawerly.open({
    drawerKey: `user-${userId}`,
    component: UserProfile,
    componentProps: {
      userId,
    },
  })
}
</script>

<template>
  <button @click="showUserProfile('123')">
    View User Profile
  </button>
</template>
```

That's it. Clicking the button slides the drawer in from the right with your component inside.

## Closing Drawers

Pressing Escape or clicking the backdrop closes the top drawer by default. From code, call `close()`:

```ts
drawerly.close() // closes the topmost drawer
drawerly.close('user-123') // closes a specific drawer
drawerly.closeAll() // empties the stack
```

Inside the drawer component, use `useDrawer` as shown above.

## Stacking

Opening another drawer while one is open stacks it on top:

```ts
drawerly.open({ drawerKey: 'settings', component: Settings })
drawerly.open({ drawerKey: 'profile', component: Profile })
// 'profile' is now on top; close() removes it first
```

Use `bringToTop(key)` to move an open drawer back to the top without reopening it.

## Using the Instance Outside Components

The instance returned by `createDrawerly()` is a plain object, so it also works outside components, for example in router guards or stores:

```ts
import { drawerly } from './drawerly' // your createDrawerly() instance

router.afterEach(() => {
  drawerly.closeAll()
})
```

## Next Steps

- [useDrawerly](./composables/use-drawerly.md) opens and manages drawers from anywhere.
- [useDrawer](./composables/use-drawer.md) gives you reactive bindings to a single drawer.
- [Styling](./styling.md) customizes the look with CSS variables.
- [Unstyled Mode](./unstyled-mode.md) drops the default styles entirely.
