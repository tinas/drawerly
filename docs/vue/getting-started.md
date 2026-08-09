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

Create a `Drawerly` instance in its own module so you can reach it from anywhere:

```ts [drawerly.ts]
import { createDrawerly } from '@drawerly/vue'

export const drawerly = createDrawerly({
  defaultOptions: {
    placement: 'right',
  },
})
```

Install the instance and import the stylesheet in your entry file:

```ts [main.ts]
import { createApp } from 'vue'
import App from './App.vue'
import { drawerly } from './drawerly'

import '@drawerly/vue/style.css'

const app = createApp(App)
app.use(drawerly)
app.mount('#app')
```

Add `<DrawerlyContainer />` to your root template. One container per application is enough:

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

## Your First Drawer

Any Vue component can be drawer content:

```vue [UserProfile.vue]
<script setup lang="ts">
defineProps<{ userId: string }>()
</script>

<template>
  <div class="user-profile">
    <h2>User Profile</h2>
    <p>User ID: {{ userId }}</p>
  </div>
</template>
```

Open it with the `useDrawerly` composable, passing your component and its props:

```vue [HomePage.vue]
<script setup lang="ts">
import { useDrawerly } from '@drawerly/vue'
import UserProfile from './UserProfile.vue'

const drawerly = useDrawerly()

function showProfile(userId: string) {
  drawerly.open({
    drawerKey: `user-${userId}`,
    component: UserProfile,
    componentProps: { userId },
  })
}
</script>

<template>
  <button @click="showProfile('123')">
    View Profile
  </button>
</template>
```

Clicking the button slides the drawer in from the right. Press Escape or click the backdrop to close it.
