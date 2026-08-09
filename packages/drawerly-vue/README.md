# @drawerly/vue

Vue 3 adapter for Drawerly. Create an instance with `createDrawerly()`, install it with `app.use()`, and render the stack with `<DrawerlyContainer />`.

```ts
import { createDrawerly } from '@drawerly/vue'
import '@drawerly/vue/style.css'

const drawerly = createDrawerly()
app.use(drawerly)
```

```vue
<script setup lang="ts">
import { useDrawerly } from '@drawerly/vue'
import UserProfile from './UserProfile.vue'

const drawerly = useDrawerly()

function showProfile() {
  drawerly.open({
    drawerKey: 'user-profile',
    component: UserProfile,
    componentProps: { userId: '123' },
  })
}
</script>

<template>
  <button @click="showProfile">View Profile</button>
  <DrawerlyContainer />
</template>
```

For full documentation, visit **[drawerly.dev](https://drawerly.dev)**
