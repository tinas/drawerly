# Introduction

`@drawerly/vue` is the Vue 3 adapter for Drawerly. It renders your components inside stacked drawers and keeps everything reactive, so opening a drawer is a single function call:

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
  <button @click="showProfile">
    View Profile
  </button>
</template>
```

Every drawer is identified by a `drawerKey`. Opening a key that is already in the stack replaces that drawer's options and brings it to the top, so you never end up with duplicates.

## What's Included

The package has four building blocks:

[`createDrawerly()`](./api/create-drawerly.md) creates the instance you install with `app.use()`. [`<DrawerlyContainer>`](./api/drawer-container.md) renders the open drawers and handles animations and scroll locking. [`useDrawerly()`](./composables/use-drawerly.md) gives any component access to the instance, and [`useDrawer()`](./composables/use-drawer.md) provides reactive bindings to a single drawer.

Drawers render as `role="dialog"` panels with a backdrop and `aria-modal` semantics by default. If you want your own design, skip the stylesheet and style the markup yourself. See [Unstyled Mode](./unstyled-mode.md).

## Next

Head to [Getting Started](./getting-started.md) to set it up.
