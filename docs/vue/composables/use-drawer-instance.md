# useDrawerInstance

The `useDrawerInstance` composable provides reactive bindings to a specific drawer instance. Use this when you want to observe and control a single drawer by its key.

## When to Use

Use `useDrawerInstance` when you need to:
- Check if a specific drawer is open
- Read or modify a drawer's placement
- Control close behaviors (Escape key, backdrop clicks)
- Create two-way bindings to drawer properties
- Update a specific drawer's options
- Close or focus a specific drawer

For opening new drawers or managing multiple drawers, use [`useDrawerContext`](./use-drawer-context.md) instead.

## Basic Usage

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const drawer = useDrawerInstance('my-drawer')
</script>

<template>
  <div>
    <p v-if="drawer.isOpen.value">
      Drawer is open at {{ drawer.placement.value }}
    </p>
    <button v-if="drawer.isOpen.value" @click="drawer.close">
      Close Drawer
    </button>
  </div>
</template>
```

## Checking if Drawer is Open

The `isOpen` property reactively tracks whether the drawer exists in the stack:

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { isOpen } = useDrawerInstance('settings-drawer')
</script>

<template>
  <div>
    <span v-if="isOpen" class="indicator">●</span>
    <span>Settings</span>
  </div>
</template>

<style scoped>
.indicator {
  color: green;
  margin-right: 0.5rem;
}
</style>
```

### With Multiple Drawers

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useDrawerInstance } from '@drawerly/vue'

const profile = useDrawerInstance('user-profile')
const settings = useDrawerInstance('settings')
const notifications = useDrawerInstance('notifications')

const anyOpen = computed(() =>
  profile.isOpen.value || settings.isOpen.value || notifications.isOpen.value
)

const openCount = computed(() =>
  [profile, settings, notifications].filter(d => d.isOpen.value).length
)
</script>

<template>
  <div>
    <p v-if="anyOpen">{{ openCount }} drawer(s) open</p>

    <ul>
      <li :class="{ active: profile.isOpen.value }">Profile</li>
      <li :class="{ active: settings.isOpen.value }">Settings</li>
      <li :class="{ active: notifications.isOpen.value }">Notifications</li>
    </ul>
  </div>
</template>
```

## Two-Way Binding

The composable provides writable computed refs for easy two-way binding:

### Placement Control

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { isOpen, placement } = useDrawerInstance('adjustable-drawer')
</script>

<template>
  <div v-if="isOpen">
    <h3>Drawer Position</h3>
    <select v-model="placement">
      <option value="top">Top</option>
      <option value="right">Right</option>
      <option value="bottom">Bottom</option>
      <option value="left">Left</option>
    </select>
  </div>
</template>
```

### Close Behaviors

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { isOpen, closeOnEscapeKey, closeOnBackdropClick } = useDrawerInstance('form-drawer')
</script>

<template>
  <div v-if="isOpen" class="drawer-controls">
    <label>
      <input type="checkbox" v-model="closeOnEscapeKey">
      Allow Escape key to close
    </label>

    <label>
      <input type="checkbox" v-model="closeOnBackdropClick">
      Allow backdrop click to close
    </label>
  </div>
</template>
```

## Dynamic Drawer Keys

Use refs or computed values for dynamic drawer binding:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDrawerInstance } from '@drawerly/vue'

const userId = ref('123')
const drawerKey = computed(() => `user-profile-${userId.value}`)

const { isOpen, close } = useDrawerInstance(drawerKey)

function switchUser(newUserId: string) {
  userId.value = newUserId
  // Drawer binding automatically updates
}
</script>

<template>
  <div>
    <input v-model="userId" placeholder="User ID">
    <p v-if="isOpen">Profile for user {{ userId }} is open</p>
    <button v-if="isOpen" @click="close">Close Profile</button>
  </div>
</template>
```

## Updating Drawer Options

Use `updateOptions` to modify drawer properties:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDrawerInstance } from '@drawerly/vue'

const { updateOptions } = useDrawerInstance('product-drawer')

const loading = ref(false)

async function refreshData() {
  loading.value = true

  // Show loading state
  updateOptions((prev) => ({
    ...prev,
    dataAttributes: {
      ...prev.dataAttributes,
      'data-loading': true,
    },
  }))

  // Fetch data
  await fetchData()

  // Clear loading state
  updateOptions((prev) => ({
    ...prev,
    dataAttributes: {
      ...prev.dataAttributes,
      'data-loading': false,
    },
  }))

  loading.value = false
}
</script>
```

### Update Multiple Properties

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { updateOptions } = useDrawerInstance('settings-drawer')

function makeSticky() {
  updateOptions((prev) => ({
    ...prev,
    closeOnEscapeKey: false,
    closeOnBackdropClick: false,
    dataAttributes: {
      ...prev.dataAttributes,
      'data-sticky': true,
    },
  }))
}

function makeClosable() {
  updateOptions((prev) => ({
    ...prev,
    closeOnEscapeKey: true,
    closeOnBackdropClick: true,
    dataAttributes: {
      ...prev.dataAttributes,
      'data-sticky': false,
    },
  }))
}
</script>
```

## Bringing Drawer to Top

Use `bringToTop` to focus a drawer that's already open:

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const drawer1 = useDrawerInstance('drawer-1')
const drawer2 = useDrawerInstance('drawer-2')
const drawer3 = useDrawerInstance('drawer-3')

function focusDrawer(drawer: ReturnType<typeof useDrawerInstance>) {
  if (drawer.isOpen.value) {
    drawer.bringToTop()
  }
}
</script>

<template>
  <nav>
    <button @click="focusDrawer(drawer1)">Focus Drawer 1</button>
    <button @click="focusDrawer(drawer2)">Focus Drawer 2</button>
    <button @click="focusDrawer(drawer3)">Focus Drawer 3</button>
  </nav>
</template>
```

## Accessing All Options

The `options` property provides read-only access to all drawer options:

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { isOpen, options } = useDrawerInstance('info-drawer')
</script>

<template>
  <div v-if="isOpen" class="drawer-info">
    <h3>Drawer Information</h3>
    <dl>
      <dt>Placement:</dt>
      <dd>{{ options.placement }}</dd>

      <dt>ARIA Label:</dt>
      <dd>{{ options.ariaLabel || 'None' }}</dd>

      <dt>Close on Escape:</dt>
      <dd>{{ options.closeOnEscapeKey }}</dd>

      <dt>Close on Backdrop:</dt>
      <dd>{{ options.closeOnBackdropClick }}</dd>
    </dl>
  </div>
</template>
```

## TypeScript Support

Use TypeScript generics for type-safe access to custom options:

```ts
import type { VueDrawerOptions } from '@drawerly/vue'
import { useDrawerInstance } from '@drawerly/vue'

interface ProductDrawerOptions extends VueDrawerOptions {
  productId: string
  productName: string
  price: number
  inStock: boolean
}

const { options, updateOptions } = useDrawerInstance<ProductDrawerOptions>('product-drawer')

// TypeScript knows about custom fields
console.log('Product:', options.value.productName)
console.log('Price:', options.value.price)
console.log('In stock:', options.value.inStock)

// TypeScript validates updates
updateOptions(prev => ({
  ...prev,
  price: 899.99, // Type-safe
  inStock: false, // Type-safe
}))
```

## Watching Drawer State

Use Vue's `watch` or `watchEffect` to react to drawer state changes:

```vue
<script setup lang="ts">
import { watch, watchEffect } from 'vue'
import { useDrawerInstance } from '@drawerly/vue'

const { isOpen, placement } = useDrawerInstance('watched-drawer')

// Watch single property
watch(isOpen, (newValue) => {
  console.log('Drawer opened:', newValue)
  if (newValue) {
    // Drawer was opened
    document.body.classList.add('drawer-open')
  }
  else {
    // Drawer was closed
    document.body.classList.remove('drawer-open')
  }
})

// Watch multiple properties
watch([isOpen, placement], ([isOpenValue, placementValue]) => {
  if (isOpenValue) {
    console.log(`Drawer is open at ${placementValue}`)
  }
})

// Watch effect
watchEffect(() => {
  if (isOpen.value) {
    console.log(`Placement: ${placement.value}`)
  }
})
</script>
```

## Common Patterns

### Toggle Button

```vue
<script setup lang="ts">
import { useDrawerContext, useDrawerInstance } from '@drawerly/vue'
import MyDrawer from './MyDrawer.vue'

const { open } = useDrawerContext()
const { isOpen, close } = useDrawerInstance('toggle-drawer')

function toggle() {
  if (isOpen.value) {
    close()
  }
  else {
    open({
      drawerKey: 'toggle-drawer',
      component: MyDrawer,
    })
  }
}
</script>

<template>
  <button @click="toggle">
    {{ isOpen ? 'Close' : 'Open' }} Drawer
  </button>
</template>
```

### Status Indicator

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { isOpen, placement } = useDrawerInstance('status-drawer')
</script>

<template>
  <div class="drawer-status">
    <div class="status-dot" :class="{ open: isOpen }"></div>
    <span v-if="isOpen">Open ({{ placement }})</span>
    <span v-else>Closed</span>
  </div>
</template>

<style scoped>
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: gray;
  margin-right: 0.5rem;
}

.status-dot.open {
  background: green;
  box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
}
</style>
```

### Form with Unsaved Changes Protection

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDrawerInstance } from '@drawerly/vue'

const { closeOnEscapeKey, closeOnBackdropClick } = useDrawerInstance('form-drawer')

const hasUnsavedChanges = ref(false)

// Protect from accidental close when there are unsaved changes
watch(hasUnsavedChanges, (hasChanges) => {
  closeOnEscapeKey.value = !hasChanges
  closeOnBackdropClick.value = !hasChanges
})

function handleFormChange() {
  hasUnsavedChanges.value = true
}

function handleSave() {
  // Save form...
  hasUnsavedChanges.value = false
}
</script>
```

### Responsive Placement

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDrawerInstance } from '@drawerly/vue'
import { useMediaQuery } from '@vueuse/core'

const { placement } = useDrawerInstance('responsive-drawer')
const isMobile = useMediaQuery('(max-width: 768px)')

// Automatically adjust placement based on screen size
watch(isMobile, (mobile) => {
  placement.value = mobile ? 'bottom' : 'right'
}, { immediate: true })
</script>
```

### Drawer Settings Panel

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const drawer = useDrawerInstance('main-drawer')
</script>

<template>
  <div v-if="drawer.isOpen.value" class="settings-panel">
    <h3>Drawer Settings</h3>

    <div class="setting">
      <label>Position</label>
      <select v-model="drawer.placement.value">
        <option value="top">Top</option>
        <option value="right">Right</option>
        <option value="bottom">Bottom</option>
        <option value="left">Left</option>
      </select>
    </div>

    <div class="setting">
      <label>
        <input type="checkbox" v-model="drawer.closeOnEscapeKey.value">
        Close on Escape
      </label>
    </div>

    <div class="setting">
      <label>
        <input type="checkbox" v-model="drawer.closeOnBackdropClick.value">
        Close on Backdrop Click
      </label>
    </div>

    <button @click="drawer.close">Close Drawer</button>
  </div>
</template>
```

### Drawer Tabs

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useDrawerInstance } from '@drawerly/vue'

const tab1 = useDrawerInstance('tab-1')
const tab2 = useDrawerInstance('tab-2')
const tab3 = useDrawerInstance('tab-3')

const tabs = [
  { key: 'tab-1', label: 'Profile', drawer: tab1 },
  { key: 'tab-2', label: 'Settings', drawer: tab2 },
  { key: 'tab-3', label: 'Notifications', drawer: tab3 },
]

const activeTab = computed(() =>
  tabs.find(t => t.drawer.isOpen.value)?.key
)

function switchTab(drawer: ReturnType<typeof useDrawerInstance>) {
  drawer.bringToTop()
}
</script>

<template>
  <nav class="drawer-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="{ active: tab.drawer.isOpen.value }"
      @click="switchTab(tab.drawer)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>
```

## Performance Considerations

The composable uses Vue's reactivity system efficiently:

- Uses `shallowRef` internally for optimal performance
- Automatically subscribes and unsubscribes on mount/unmount
- Updates only when the specific drawer instance changes
- No unnecessary re-renders

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

// Each instance has its own subscription
const drawer1 = useDrawerInstance('drawer-1')
const drawer2 = useDrawerInstance('drawer-2')

// Only drawer1 updates trigger re-render for drawer1 properties
// Only drawer2 updates trigger re-render for drawer2 properties
</script>
```

## Best Practices

**Unique Keys**: Use specific, descriptive keys for drawers.

```ts
// ✅ Good
const drawer = useDrawerInstance('user-profile-123')

// ❌ Bad
const drawer = useDrawerInstance('drawer')
```

**Check Before Acting**: Always check if drawer is open before performing actions.

```ts
// ✅ Good
if (drawer.isOpen.value) {
  drawer.close()
}

// ❌ Bad (works but unnecessary)
drawer.close() // Works even if closed, but wastes cycles
```

**Use Computed for Complex Logic**: When combining multiple drawer states.

```ts
// ✅ Good
const anyDrawerOpen = computed(() =>
  drawer1.isOpen.value || drawer2.isOpen.value
)

// ❌ Bad
const anyDrawerOpen = drawer1.isOpen.value || drawer2.isOpen.value // Not reactive
```

**Don't Modify Options Directly**: Use `updateOptions` method.

```ts
// ❌ Bad
drawer.options.value.placement = 'left' // Won't work

// ✅ Good
drawer.placement.value = 'left' // Updates correctly

// ✅ Also good
drawer.updateOptions(prev => ({
  ...prev,
  placement: 'left',
}))
```
