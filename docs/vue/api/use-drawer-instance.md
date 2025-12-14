# useDrawerInstance API Reference

Composable that provides reactive bindings to a specific drawer instance. Use this to observe and control a single drawer by its key.

## Import

```ts
import { useDrawerInstance } from '@drawerly/vue'
```

## Type Signature

```ts
function useDrawerInstance<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions
>(
  drawerKey: MaybeRef<DrawerKey>
): UseDrawerInstanceResult<TVueDrawerOptions>
```

## Parameters

**`drawerKey`** – `MaybeRef<DrawerKey>`

The unique key of the drawer to bind to. Can be a string or a ref.

```ts
// With string
const drawer = useDrawerInstance('my-drawer')

// With ref
const key = ref('my-drawer')
const drawer = useDrawerInstance(key)

// With computed
const key = computed(() => `user-${userId.value}`)
const drawer = useDrawerInstance(key)
```

## Return Type

```ts
interface UseDrawerInstanceResult<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions
> {
  isOpen: ComputedRef<boolean>
  placement: WritableComputedRef<DrawerPlacement>
  closeOnEscapeKey: WritableComputedRef<boolean>
  closeOnBackdropClick: WritableComputedRef<boolean>
  options: ComputedRef<VueDrawerOptionsWithoutComponent<TVueDrawerOptions>>
  close: () => void
  bringToTop: () => void
  updateOptions: (updater: (prev) => VueDrawerUpdatableOptionsWithoutComponent<TVueDrawerOptions>) => void
}
```

## Properties

### `isOpen`

- **Type**: `ComputedRef<boolean>`
- **Read-only**: Yes

Whether the drawer with the given key currently exists in the stack.

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { isOpen } = useDrawerInstance('my-drawer')
</script>

<template>
  <div v-if="isOpen">
    Drawer is open
  </div>
  <div v-else>
    Drawer is closed
  </div>
</template>
```

Automatically updates when the drawer is opened or closed.

### `placement`

- **Type**: `WritableComputedRef<DrawerPlacement>`
- **Read-write**: Yes

Two-way binding for the drawer's placement.

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { placement } = useDrawerInstance('my-drawer')

// Read
console.log('Current placement:', placement.value) // 'right'

// Write
placement.value = 'left' // Moves drawer to left side
</script>

<template>
  <select v-model="placement">
    <option value="top">Top</option>
    <option value="right">Right</option>
    <option value="bottom">Bottom</option>
    <option value="left">Left</option>
  </select>
</template>
```

**Default**: `'right'` (when not explicitly set)

Writing to this property immediately updates the drawer's position.

### `closeOnEscapeKey`

- **Type**: `WritableComputedRef<boolean>`
- **Read-write**: Yes

Two-way binding for the Escape key close behavior.

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { closeOnEscapeKey } = useDrawerInstance('my-drawer')

// Read
console.log('Escape closes:', closeOnEscapeKey.value)

// Write
closeOnEscapeKey.value = false // Disable Escape key
</script>

<template>
  <label>
    <input type="checkbox" v-model="closeOnEscapeKey">
    Allow Escape to close
  </label>
</template>
```

**Default**: `true` (when not explicitly set)

::: info
This property only handles the boolean form. If the drawer uses a function predicate, this property reflects the result but cannot be used to set a function.
:::

### `closeOnBackdropClick`

- **Type**: `WritableComputedRef<boolean>`
- **Read-write**: Yes

Two-way binding for the backdrop click close behavior.

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { closeOnBackdropClick } = useDrawerInstance('my-drawer')

// Read
console.log('Backdrop closes:', closeOnBackdropClick.value)

// Write
closeOnBackdropClick.value = false // Disable backdrop click
</script>

<template>
  <label>
    <input type="checkbox" v-model="closeOnBackdropClick">
    Allow backdrop click to close
  </label>
</template>
```

**Default**: `true` (when not explicitly set)

::: info
This property only handles the boolean form. If the drawer uses a function predicate, this property reflects the result but cannot be used to set a function.
:::

### `options`

- **Type**: `ComputedRef<VueDrawerOptionsWithoutComponent<TVueDrawerOptions>>`
- **Read-only**: Yes

Read-only view of all drawer options, excluding `drawerKey` and `component`.

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { options } = useDrawerInstance('my-drawer')

// Access all options
console.log('Placement:', options.value.placement)
console.log('ARIA label:', options.value.ariaLabel)
console.log('Data attrs:', options.value.dataAttributes)

// Access custom fields (if extended)
console.log('Custom field:', options.value.customField)
</script>

<template>
  <div>
    <p>Placement: {{ options.placement }}</p>
    <p>ARIA Label: {{ options.ariaLabel }}</p>
  </div>
</template>
```

Returns an empty object if the drawer doesn't exist.

## Methods

### `close()`

Closes this drawer instance.

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { isOpen, close } = useDrawerInstance('my-drawer')

function handleClose() {
  close()
}
</script>

<template>
  <div v-if="isOpen">
    <button @click="close">Close Drawer</button>
  </div>
</template>
```

**Returns**: `void`

Equivalent to calling `useDrawerContext().close(drawerKey)`.

### `bringToTop()`

Brings this drawer to the top of the stack without reopening it.

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { isOpen, bringToTop } = useDrawerInstance('my-drawer')

function focusDrawer() {
  if (isOpen.value) {
    bringToTop()
  }
}
</script>

<template>
  <button @click="focusDrawer">Focus This Drawer</button>
</template>
```

**Returns**: `void`

If the drawer is already on top or doesn't exist, does nothing.

### `updateOptions(updater)`

Updates options for this drawer instance.

```vue
<script setup lang="ts">
import { useDrawerInstance } from '@drawerly/vue'

const { updateOptions } = useDrawerInstance('my-drawer')

function setLoadingState(loading: boolean) {
  updateOptions((prev) => ({
    ...prev,
    dataAttributes: {
      ...prev.dataAttributes,
      'data-loading': loading,
    },
  }))
}

function changePosition() {
  updateOptions((prev) => ({
    ...prev,
    placement: 'left',
  }))
}
</script>
```

**Parameters**:
- `updater` – Function that receives current options (without `drawerKey` and `component`) and returns updated options

**Returns**: `void`

The `drawerKey` and `component` fields cannot be changed through this method.

## Notes

- **No Opening**: This composable does not open drawers. Use `useDrawerContext().open()` to create drawers.

- **Key Required**: The drawer key must exist in the stack for most properties to be meaningful.

- **Empty State**: If the drawer doesn't exist, `isOpen` is `false` and `options` is an empty object.

- **Component Changes**: The `component` field cannot be accessed or changed through this API.

- **Plugin Required**: Must be used after `DrawerPlugin` is installed.

- **Automatic Cleanup**: Subscriptions are automatically cleaned up when the component unmounts.

- **Ref Support**: The drawer key can be a ref or computed, allowing dynamic drawer binding.
