# useDrawerContext

The `useDrawerContext` composable provides access to the global drawer manager, allowing you to open, close, and manage drawers from anywhere in your Vue application.

## When to Use

Use `useDrawerContext` when you need to:
- Open new drawers
- Close all drawers
- Access the current drawer stack
- Subscribe to drawer state changes
- Update global default options
- Manage multiple drawers at once

For working with a single specific drawer instance, consider using [`useDrawerInstance`](./use-drawer-instance.md) instead.

## Basic Usage

```vue
<script setup lang="ts">
import { useDrawerContext } from '@drawerly/vue'
import UserProfile from './UserProfile.vue'

const { open, close, closeAll } = useDrawerContext()

function showProfile() {
  open({
    drawerKey: 'user-profile',
    component: UserProfile,
    componentParams: {
      userId: '123',
    },
  })
}

function hideProfile() {
  close('user-profile')
}

function hideAll() {
  closeAll()
}
</script>

<template>
  <div>
    <button @click="showProfile">Show Profile</button>
    <button @click="hideProfile">Hide Profile</button>
    <button @click="hideAll">Hide All Drawers</button>
  </div>
</template>
```

## Opening Drawers

The `open` method is the primary way to create and display drawers:

```vue
<script setup lang="ts">
import { useDrawerContext } from '@drawerly/vue'
import SettingsPanel from './SettingsPanel.vue'
import ProductDetail from './ProductDetail.vue'

const { open } = useDrawerContext()

function openSettings() {
  open({
    drawerKey: 'settings',
    component: SettingsPanel,
    placement: 'left',
    ariaLabel: 'Settings Panel',
  })
}

function openProduct(productId: string, productName: string) {
  open({
    drawerKey: `product-${productId}`,
    component: ProductDetail,
    componentParams: {
      productId,
      productName,
    },
    placement: 'right',
    closeOnBackdropClick: true,
    closeOnEscapeKey: true,
  })
}
</script>

<template>
  <div>
    <button @click="openSettings">Settings</button>
    <button @click="openProduct('123', 'Laptop')">View Product</button>
  </div>
</template>
```

### Passing Data to Drawer Components

Use `componentParams` to pass props to your drawer component:

```vue
<script setup lang="ts">
const { open } = useDrawerContext()

function openEditForm(itemId: string, itemData: any) {
  open({
    drawerKey: `edit-${itemId}`,
    component: EditForm,
    componentParams: {
      itemId,
      initialData: itemData,
      onSave: (data) => {
        console.log('Saved:', data)
        // Handle save
      },
      onCancel: () => {
        close(`edit-${itemId}`)
      },
    },
  })
}
</script>
```

Your drawer component receives these props:

```vue
<!-- EditForm.vue -->
<script setup lang="ts">
defineProps<{
  itemId: string
  initialData: any
  onSave?: (data: any) => void
  onCancel?: () => void
  drawerKey: string // Automatically injected
  onClose: () => void // Automatically injected
}>()
</script>
```

## Closing Drawers

### Close Specific Drawer

```vue
<script setup lang="ts">
const { close } = useDrawerContext()

// Close by key
function closeSettings() {
  close('settings')
}
</script>
```

### Close Top Drawer

```vue
<script setup lang="ts">
const { close } = useDrawerContext()

// Close without key removes the topmost drawer
function closeTop() {
  close()
}
</script>
```

### Close All Drawers

```vue
<script setup lang="ts">
const { closeAll } = useDrawerContext()

// Close all drawers at once
function reset() {
  closeAll()
}

// Common pattern: close all on navigation
import { useRouter } from 'vue-router'

const router = useRouter()

router.afterEach(() => {
  closeAll()
})
</script>
```

## Managing the Stack

### Check if Drawer is Open

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDrawerContext } from '@drawerly/vue'

const { getState, subscribe } = useDrawerContext()

const stack = ref(getState().stack)

const isProfileOpen = computed(() => {
  return stack.value.some(d => d.drawerKey === 'user-profile')
})

const openDrawerCount = computed(() => {
  return stack.value.length
})

let unsubscribe: (() => void) | undefined

onMounted(() => {
  unsubscribe = subscribe((state) => {
    stack.value = state.stack
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<template>
  <div>
    <p v-if="isProfileOpen">Profile is currently open</p>
    <p>{{ openDrawerCount }} drawer(s) open</p>
  </div>
</template>
```

### Bring Drawer to Top

```vue
<script setup lang="ts">
const { bringToTop } = useDrawerContext()

// Switch between multiple open drawers
function focusSettings() {
  bringToTop('settings')
}

function focusProfile() {
  bringToTop('user-profile')
}
</script>

<template>
  <nav>
    <button @click="focusSettings">Settings</button>
    <button @click="focusProfile">Profile</button>
  </nav>
</template>
```

## Subscribing to State Changes

Subscribe to be notified when the drawer stack changes:

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useDrawerContext } from '@drawerly/vue'

const { subscribe } = useDrawerContext()

const drawerCount = ref(0)
let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribe((state) => {
    drawerCount.value = state.stack.length
    console.log('Stack changed:', state.stack.map(d => d.drawerKey))
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<template>
  <div>
    <p>Active drawers: {{ drawerCount }}</p>
  </div>
</template>
```

### Analytics Example

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDrawerContext } from '@drawerly/vue'

const { subscribe } = useDrawerContext()

let unsubscribe: (() => void) | null = null

onMounted(() => {
  let previousStack: any[] = []

  unsubscribe = subscribe((state) => {
    const currentStack = state.stack

    // Track opened drawers
    currentStack.forEach((drawer) => {
      const wasOpen = previousStack.some(d => d.drawerKey === drawer.drawerKey)
      if (!wasOpen) {
        analytics.track('drawer_opened', {
          drawerKey: drawer.drawerKey,
          placement: drawer.placement,
        })
      }
    })

    // Track closed drawers
    previousStack.forEach((drawer) => {
      const stillOpen = currentStack.some(d => d.drawerKey === drawer.drawerKey)
      if (!stillOpen) {
        analytics.track('drawer_closed', {
          drawerKey: drawer.drawerKey,
        })
      }
    })

    previousStack = currentStack
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>
```

## Updating Options

### Update Specific Drawer

::: tip
`updateOptions` immediately updates an **existing open drawer**. The changes take effect right away on the currently open drawer instance.
:::

```vue
<script setup lang="ts">
import { useDrawerContext } from '@drawerly/vue'

const { updateOptions } = useDrawerContext()

async function loadUserData(userId: string) {
  // Set loading state - updates the open drawer immediately
  updateOptions('user-profile', (prev) => ({
    ...prev,
    dataAttributes: {
      ...prev.dataAttributes,
      'data-loading': true,
    },
  }))

  // Fetch data
  const userData = await fetchUser(userId)

  // Update with data - changes apply immediately to the open drawer
  updateOptions('user-profile', (prev) => ({
    ...prev,
    componentParams: {
      ...prev.componentParams,
      userData,
    },
    dataAttributes: {
      ...prev.dataAttributes,
      'data-loading': false,
    },
  }))
}
</script>
```

### Update Default Options

::: warning
`updateDefaultOptions` only affects **future drawers** that are opened after the update. It does **not** modify any existing open drawers. To update an already open drawer, use `updateOptions` instead.
:::

```vue
<script setup lang="ts">
import { useDrawerContext } from '@drawerly/vue'

const { updateDefaultOptions } = useDrawerContext()

// Change default behavior for all future drawers
function enableStickyDrawers() {
  updateDefaultOptions((prev) => ({
    ...prev,
    closeOnEscapeKey: false,
    closeOnBackdropClick: false,
  }))

  // This only affects drawers opened AFTER this call
  // Existing open drawers remain unchanged
}

function setMobileDefaults() {
  updateDefaultOptions((prev) => ({
    ...prev,
    placement: 'bottom',
  }))

  // Future drawers will open at bottom
  // Current drawers keep their original placement
}
</script>
```

## TypeScript Support

Define custom drawer options with full type safety:

```ts
import type { VueDrawerOptions } from '@drawerly/vue'
import { useDrawerContext } from '@drawerly/vue'

interface ProductDrawerOptions extends VueDrawerOptions {
  productId: string
  productName: string
  price: number
  inStock: boolean
  onAddToCart?: (productId: string) => void
}

const { open, getDrawerInstance } = useDrawerContext<ProductDrawerOptions>()

// TypeScript ensures all required fields
open({
  drawerKey: 'product-123',
  component: ProductDetail,
  productId: '123', // Required
  productName: 'Laptop', // Required
  price: 999.99, // Required
  inStock: true, // Required
  onAddToCart: (id) => {
    console.log('Added to cart:', id)
  },
})

// TypeScript knows about custom fields
const drawer = getDrawerInstance('product-123')
if (drawer) {
  console.log(drawer.productName) // Type-safe access
  console.log(drawer.price)
  console.log(drawer.inStock)
}
```

## Best Practices

**Unique Keys**: Always use unique drawer keys to prevent conflicts.

```ts
// ❌ Bad: Reusing keys
open({ drawerKey: 'details', component: ProductDetail })
open({ drawerKey: 'details', component: UserDetail }) // Updates previous

// ✅ Good: Unique keys
open({ drawerKey: 'product-details-123', component: ProductDetail })
open({ drawerKey: 'user-details-456', component: UserDetail })
```

**Clean Up Subscriptions**: Always unsubscribe when components unmount.

```ts
onMounted(() => {
  unsubscribe = subscribe((state) => {
    // Handle state changes
  })
})

onUnmounted(() => {
  unsubscribe?.() // Clean up
})
```

**Use Computed for Checks**: When checking drawer state, use subscribe to track changes reactively.

```ts
// ✅ Good: Reactive with subscribe
const stack = ref(getState().stack)

onMounted(() => {
  unsubscribe = subscribe((state) => {
    stack.value = state.stack
  })
})

const isOpen = computed(() =>
  stack.value.some(d => d.drawerKey === 'my-drawer')
)

// ❌ Bad: Not reactive
const isOpen = computed(() =>
  getState().stack.some(d => d.drawerKey === 'my-drawer')
)
```

**Component Props**: Keep drawer component props simple and typed.

```ts
// ✅ Good: Clear, typed props
interface DrawerProps {
  userId: string
  onClose: () => void
}

// ❌ Bad: Unclear, untyped
const props = { data: { stuff: 'things' } }
```
