# Getting Started

This guide will walk you through setting up `@drawerly/vue` in your Vue 3 application and creating your first drawer.

## Installation

Install `@drawerly/vue` with your favorite package manager:

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

::: info
`@drawerly/vue` automatically installs `@drawerly/core` as a dependency, so you don't need to install it separately.
:::

## Plugin Setup

Register the `DrawerPlugin` in your Vue application:

```ts [main.ts]
import { DrawerPlugin } from '@drawerly/vue'
import { createApp } from 'vue'
import App from './App.vue'

import '@drawerly/vue/style.css'

const app = createApp(App)

app.use(DrawerPlugin, {
  // Optional configuration
  defaultOptions: {
    placement: 'right',
    closeOnEscapeKey: true,
    closeOnBackdropClick: true,
  },
  teleportTo: 'body',
  headless: false,
})

app.mount('#app')
```

### Plugin Options

**`defaultOptions`** – Global defaults applied to all drawers:
- `placement`: Default drawer position (`'right'`, `'left'`, `'top'`, `'bottom'`)
- `closeOnEscapeKey`: Whether Escape key closes drawers (default: `true`)
- `closeOnBackdropClick`: Whether clicking backdrop closes drawers (default: `true`)
- Any custom options you define

**`teleportTo`** – CSS selector or element where drawers are rendered (default: `'body'`)

**`headless`** – Disable built-in UI and animations (default: `false`)

## Add the Container

Include the `<DrawerlyContainer />` component in your root template:

```vue [App.vue]
<script setup lang="ts">
// Your app logic
</script>

<template>
  <div id="app">
    <YourAppContent />

    <!-- Add the drawer container -->
    <DrawerlyContainer />
  </div>
</template>
```

The container component:
- Renders all open drawers from the stack
- Handles animations and transitions
- Manages keyboard and backdrop interactions
- Teleports to the target element (default: `body`)

::: tip
You typically only need one `<DrawerlyContainer />` per application. Place it in your root component (`App.vue`).
:::

## Creating Your First Drawer

### Step 1: Create a Drawer Component

Create a Vue component that will be rendered inside the drawer:

```vue [UserProfile.vue]
<script setup lang="ts">
defineProps<{
  userId: string
  drawerKey: string // Automatically injected
  onClose: () => void // Automatically injected
}>()

const userName = 'John Doe'
const userEmail = 'john@example.com'
</script>

<template>
  <div class="user-profile">
    <header>
      <h2>User Profile</h2>
      <button @click="onClose">✕</button>
    </header>

    <div class="content">
      <p><strong>ID:</strong> {{ userId }}</p>
      <p><strong>Name:</strong> {{ userName }}</p>
      <p><strong>Email:</strong> {{ userEmail }}</p>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  height: 100%;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}
</style>
```

### Step 2: Open the Drawer

Use the `useDrawerContext` composable to open your drawer:

```vue [HomePage.vue]
<script setup lang="ts">
import { useDrawerContext } from '@drawerly/vue'
import UserProfile from './UserProfile.vue'

const { open } = useDrawerContext()

function showUserProfile(userId: string) {
  open({
    drawerKey: `user-${userId}`,
    component: UserProfile,
    componentParams: {
      userId,
    },
    ariaLabel: 'User Profile Drawer',
  })
}
</script>

<template>
  <div>
    <h1>Home Page</h1>
    <button @click="showUserProfile('123')">
      View User Profile
    </button>
  </div>
</template>
```

That's it! When you click the button, the drawer will slide in from the right with your `UserProfile` component rendered inside.

## Accessing the Manager Globally

The drawer manager is also available via `this.$drawerly` in Options API components:

```vue
<script>
import SettingsPanel from './SettingsPanel.vue'

export default {
  methods: {
    openSettings() {
      this.$drawerly.open({
        drawerKey: 'settings',
        component: SettingsPanel,
      })
    },
  },
}
</script>
```

## Passing Data to Drawers

Use `componentParams` to pass props to your drawer component:

```ts
open({
  drawerKey: 'edit-product',
  component: ProductEditor,
  componentParams: {
    productId: '123',
    mode: 'edit',
    onSave: (data) => {
      console.log('Product saved:', data)
    },
    onCancel: () => {
      close('edit-product')
    },
  },
})
```

Your drawer component receives these props plus the injected ones:

```vue
<script setup lang="ts">
defineProps<{
  // Your custom props
  productId: string
  mode: 'create' | 'edit'
  onSave?: (data: any) => void
  onCancel?: () => void

  // Injected by the container
  drawerKey: string
  onClose: () => void
}>()
</script>
```

## Styling Your Drawers

The package includes default styles that you can customize with CSS variables:

```css
/* Custom drawer styles */
[data-drawerly-root] {
  --drawerly-panel-bg: #1f2937;
  --drawerly-panel-width: 500px;
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.7);
  --drawerly-transition-duration: 250ms;
}
```

See the [Styling Guide](./styling.md) for detailed customization options.

## Multiple Drawers

You can open multiple drawers, and they'll stack on top of each other:

```ts
// Open first drawer
open({
  drawerKey: 'main-menu',
  component: MainMenu,
})

// Open second drawer on top
open({
  drawerKey: 'settings',
  component: Settings,
})

// Open third drawer on top
open({
  drawerKey: 'profile',
  component: Profile,
})

// Stack: ['main-menu', 'settings', 'profile']
// 'profile' is visible on top
```

Close the topmost drawer:

```ts
close() // Closes 'profile'
```

Or close a specific drawer by key:

```ts
close('settings') // Removes 'settings' from stack
```

## Reactive Drawer State

Use `useDrawerInstance` to create reactive bindings to a specific drawer:

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { isOpen, placement, close } = useDrawerInstance('my-drawer')

// isOpen automatically updates when drawer opens/closes
// placement can be read and written reactively
</script>

<template>
  <div v-if="isOpen">
    Drawer is open at {{ placement }}
    <button @click="close">Close</button>
  </div>
</template>
```

## TypeScript Support

Define custom drawer options with full type safety:

```ts
import type { VueDrawerOptions } from '@drawerly/vue'

interface ProductDrawerOptions extends VueDrawerOptions {
  productId: string
  productName: string
  price: number
}

const { open } = useDrawerContext<ProductDrawerOptions>()

// TypeScript ensures all fields are provided
open({
  drawerKey: 'product-123',
  component: ProductDetail,
  productId: '123', // Required
  productName: 'Laptop', // Required
  price: 999.99, // Required
})
```

## Next Steps

Now that you have the basics working, explore more advanced features:

- [Headless Mode](./headless-mode.md) – Build custom UI without default styles
- [Styling](./styling.md) – Customize appearance with CSS variables
- [useDrawerContext Composable](./composables/use-drawer-context.md) – Detailed API for managing drawers
- [useDrawerInstance Composable](./composables/use-drawer-instance.md) – Reactive bindings to specific drawers
- [API Reference](./api/plugin.md) – Complete API documentation

## Common Patterns

### Close from Inside the Drawer

You can use the injected `onClose` prop:

```vue
<script setup lang="ts">
const { onClose } = defineProps<{
  onClose: () => void
}>()

function handleSave() {
  // Save data...
  onClose() // Close the drawer
}
</script>

<template>
  <button @click="handleSave">Save & Close</button>
</template>
```

Or emit a close event:

```vue
<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

function handleSave() {
  // Save data...
  emit('close') // Close the drawer
}
</script>

<template>
  <button @click="handleSave">Save & Close</button>
</template>
```

### Conditional Close Behavior

```ts
open({
  drawerKey: 'important-form',
  component: ImportantForm,
  closeOnEscapeKey: false, // Prevent accidental close
  closeOnBackdropClick: false,
})
```

### Drawer with Loading State

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{
  userId: string
  onClose: () => void
}>()

const loading = ref(true)
const userData = ref(null)

onMounted(async () => {
  userData.value = await fetchUser()
  loading.value = false
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>{{ userData }}</div>
</template>
```
