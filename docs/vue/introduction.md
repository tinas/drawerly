# Introduction

`@drawerly/vue` is the Vue 3 adapter for Drawerly, providing a complete solution for managing drawer stacks in Vue applications. It builds on top of [@drawerly/core](/core/introduction) and provides Vue-specific components, composables, and seamless integration with Vue's reactivity system.

## Key Features

- **Vue Plugin** – Register globally with a single plugin installation
- **Reactive Composables** – `useDrawerContext` and `useDrawerInstance` for reactive drawer state management
- **Automatic Animation** – Smooth slide-in/slide-out transitions out of the box
- **Component Rendering** – Pass Vue components as drawer content with props
- **Headless Mode** – Use without built-in UI for complete customization
- **Type-Safe** – Full TypeScript support with Vue component type inference
- **Teleportation** – Render drawers anywhere in the DOM tree
- **Global Access** – Available via `$drawerly` on all component instances

## Quick Look

```vue
<script setup lang="ts">
import { useDrawerContext } from '@drawerly/vue'
import UserProfile from './UserProfile.vue'

const { open } = useDrawerContext()

function showProfile() {
  open({
    drawerKey: 'user-profile',
    component: UserProfile,
    componentParams: {
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

## Architecture

The Vue adapter wraps the core drawer manager and provides:

**DrawerPlugin**: Vue plugin that installs the drawer manager globally and registers the container component.

**DrawerlyContainer**: Component that renders the drawer stack with animations and handles user interactions.

**useDrawerContext()**: Composable that returns the global drawer manager API with automatic `markRaw` handling for components.

**useDrawerInstance()**: Composable that provides reactive bindings to a specific drawer instance.

## How It Works

1. **Install the Plugin**: Register `DrawerPlugin` in your Vue app, which creates a global drawer manager and provides it to all components.

2. **Add the Container**: Include `<DrawerlyContainer />` in your app template (typically in `App.vue`). This component renders all open drawers.

3. **Open Drawers**: Use `useDrawerContext()` in any component to access the drawer manager and open drawers with Vue components.

4. **Component Communication**: Pass props to drawer components and receive close callbacks automatically.

The drawer manager maintains an in-memory stack. When you open a drawer, it's added to the stack or moved to the top if it already exists. The container component subscribes to stack changes and re-renders accordingly.

## Component-Based Drawers

The key difference from the core package is the ability to render Vue components inside drawers:

```ts
open({
  drawerKey: 'product-detail',
  component: ProductDetail,
  componentParams: {
    productId: '123',
    onAddToCart: (id: string) => {
      console.log('Added to cart:', id)
    },
  },
})
```

The container automatically renders your component with the specified props, plus:
- `drawerKey`: The key of the current drawer
- `onClose`: Callback to close the drawer

## Reactivity

All composables return reactive refs and computed values that automatically update when the drawer state changes:

```vue
<script setup lang="ts">
const { isOpen, placement, close } = useDrawerInstance('my-drawer')

// isOpen is automatically true/false based on stack state
// placement can be read and written
// close() removes the drawer from the stack
</script>

<template>
  <div v-if="isOpen">
    Drawer is open at {{ placement }}
    <button @click="close">Close</button>
  </div>
</template>
```

## Extending Drawer Options

Like the core package, you can extend drawer options with custom fields:

```ts
interface MyDrawerOptions extends VueDrawerOptions {
  title: string
  data: any
  onSave?: (data: any) => void
}

const { open } = useDrawerContext<MyDrawerOptions>()

open({
  drawerKey: 'custom-drawer',
  component: MyComponent,
  title: 'Edit Product',
  data: { id: '123' },
  onSave: (data) => {
    console.log('Saved:', data)
  },
})
```

The component field is automatically wrapped with `markRaw()` to prevent Vue from making it reactive, which improves performance and prevents unnecessary re-renders.

## Comparison with Core

While `@drawerly/core` is framework-agnostic and focuses purely on state management, `@drawerly/vue` provides:

- Vue 3 plugin architecture
- Component rendering inside drawers
- Automatic reactivity with composables
- Built-in animations and transitions
- Event system for drawer lifecycle
- Teleportation support
- TypeScript integration with Vue types

If you need drawer management for non-Vue code or want to build your own UI layer, use `@drawerly/core`. If you're building a Vue 3 application and want a complete solution, use `@drawerly/vue`.
