# useDrawerContext API Reference

Composable that returns the global drawer manager instance registered by `DrawerPlugin`. Use this to open, close, and manage drawers from any component.

## Import

```ts
import { useDrawerContext } from '@drawerly/vue'
```

## Type Signature

```ts
function useDrawerContext<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions
>(): UseDrawerContextResult<TVueDrawerOptions>
```

## Return Type

```ts
interface UseDrawerContextResult<
  TVueDrawerOptions extends VueDrawerOptions = VueDrawerOptions
> {
  getState: () => DrawerState<TVueDrawerOptions>
  getDrawerInstance: (key: DrawerKey) => DrawerInstance<TVueDrawerOptions> | undefined
  getDefaultOptions: () => VueDrawerDefaultOptionsWithoutComponent<TVueDrawerOptions> | undefined
  subscribe: (listener: DrawerListener<TVueDrawerOptions>) => Unsubscribe
  open: (options: TVueDrawerOptions) => DrawerKey
  close: (key?: DrawerKey) => void
  bringToTop: (key: DrawerKey) => void
  closeAll: () => void
  updateDefaultOptions: (updater: (prev) => VueDrawerDefaultOptionsWithoutComponent<TVueDrawerOptions>) => void
  updateOptions: (key: DrawerKey, updater: (prev) => VueDrawerUpdatableOptionsWithoutComponent<TVueDrawerOptions>) => void
}
```

## Methods

### `getState()`

Returns the current drawer state.

```ts
const { getState } = useDrawerContext()

const state = getState()
console.log('Open drawers:', state.stack.length)
console.log('Stack:', state.stack)
```

**Returns**: `DrawerState<TVueDrawerOptions>`

```ts
interface DrawerState<TDrawerOptions> {
  stack: DrawerInstance<TDrawerOptions>[]
}
```

The stack array contains all open drawers. The last item is the topmost (currently visible) drawer.

### `getDrawerInstance(key)`

Returns a drawer instance by its key, if it exists in the stack.

```ts
const { getDrawerInstance } = useDrawerContext()

const drawer = getDrawerInstance('user-profile')
if (drawer) {
  console.log('Drawer exists:', drawer.drawerKey)
  console.log('Placement:', drawer.placement)
  console.log('Component:', drawer.component)
}
else {
  console.log('Drawer not found')
}
```

**Parameters**:
- `key` (`DrawerKey`) – The unique key of the drawer to retrieve

**Returns**: `DrawerInstance<TVueDrawerOptions> | undefined`

### `getDefaultOptions()`

Returns the current global default options (excluding `component`).

```ts
const { getDefaultOptions } = useDrawerContext()

const defaults = getDefaultOptions()
console.log('Default placement:', defaults?.placement)
console.log('Close on escape:', defaults?.closeOnEscapeKey)
```

**Returns**: `VueDrawerDefaultOptionsWithoutComponent<TVueDrawerOptions> | undefined`

::: info
The `component` field is excluded from defaults to prevent accidental sharing of component instances.
:::

### `subscribe(listener)`

Subscribes to drawer state changes. The listener is called whenever the stack changes.

```ts
const { subscribe } = useDrawerContext()

const unsubscribe = subscribe((state) => {
  console.log('Stack changed:', state.stack.length)
  state.stack.forEach((drawer) => {
    console.log('Drawer:', drawer.drawerKey)
  })
})

// Later, unsubscribe
unsubscribe()
```

**Parameters**:
- `listener` (`(state: DrawerState) => void`) – Function called when state changes

**Returns**: `Unsubscribe` – Function to remove the listener

**State Changes Trigger**:
- Drawer opened (`open()`)
- Drawer closed (`close()`, `closeAll()`)
- Drawer brought to top (`bringToTop()`)
- Drawer options updated (`updateOptions()`)
- Default options updated (`updateDefaultOptions()`)

::: tip
Always unsubscribe when the component unmounts to prevent memory leaks. Use `onUnmounted` or `onBeforeUnmount`.
:::

### `open(options)`

Opens a drawer or updates it if it already exists, and moves it to the top of the stack.

```ts
const { open } = useDrawerContext()

const key = open({
  drawerKey: 'user-profile',
  component: UserProfile,
  componentParams: {
    userId: '123',
  },
  placement: 'right',
  ariaLabel: 'User Profile Drawer',
})

console.log('Opened drawer:', key) // 'user-profile'
```

**Parameters**:
- `options` (`TVueDrawerOptions`) – Full drawer options including `drawerKey` and `component`

**Returns**: `DrawerKey` – The key of the opened drawer

**Options**:
- `drawerKey` (required) – Unique identifier
- `component` (optional) – Vue component to render
- `componentParams` (optional) – Props passed to the component
- `placement` (optional) – Position (`'top'`, `'right'`, `'bottom'`, `'left'`)
- `closeOnEscapeKey` (optional) – Whether Escape key closes the drawer
- `closeOnBackdropClick` (optional) – Whether clicking backdrop closes the drawer
- `ariaLabel` (optional) – ARIA label for accessibility
- `ariaDescribedBy` (optional) – ARIA describedby id
- `ariaLabelledBy` (optional) – ARIA labelledby id
- `dataAttributes` (optional) – Custom data attributes
- Any custom fields you defined

**Behavior**:
- If the drawer key doesn't exist, adds it to the stack
- If the drawer key exists, updates its options and moves it to the top
- Automatically wraps `component` with `markRaw()` for performance

::: info
The component is automatically marked with `markRaw()` to prevent Vue from making it reactive, which improves performance.
:::

### `close(key?)`

Closes a drawer. If no key is provided, closes the topmost drawer.

```ts
const { close } = useDrawerContext()

// Close the top drawer
close()

// Close a specific drawer
close('user-profile')
```

**Parameters**:
- `key` (`DrawerKey`, optional) – The key of the drawer to close. If omitted, closes the topmost drawer.

**Returns**: `void`

**Behavior**:
- Without key: Removes the last item from the stack
- With key: Removes the drawer with that key from anywhere in the stack
- If the key doesn't exist, does nothing
- Triggers any close animations before actually removing the drawer

### `bringToTop(key)`

Moves an existing drawer to the top of the stack without reopening it.

```ts
const { bringToTop } = useDrawerContext()

bringToTop('settings')
```

**Parameters**:
- `key` (`DrawerKey`) – The key of the drawer to bring to top

**Returns**: `void`

**Behavior**:
- Moves the drawer to the end of the stack array (making it topmost)
- If the key doesn't exist, does nothing
- If the drawer is already on top, does nothing
- Does not trigger entrance animations

**Use Cases**:
- Switching between multiple open drawers
- Returning to a previous drawer
- Implementing drawer tabs or navigation

### `closeAll()`

Closes all open drawers.

```ts
const { closeAll } = useDrawerContext()

closeAll()
```

**Returns**: `void`

**Behavior**:
- Empties the entire stack
- Triggers close animations for all drawers (in standard mode)
- Useful for reset operations or navigation events

**Use Cases**:
- User logs out
- Navigating to a different page
- Resetting application state
- Emergency cleanup

### `updateDefaultOptions(updater)`

Updates the global default options used for future drawers.

```ts
const { updateDefaultOptions } = useDrawerContext()

updateDefaultOptions(prev => ({
  ...prev,
  placement: 'left',
  closeOnEscapeKey: false,
}))
```

**Parameters**:
- `updater` (`(prev) => VueDrawerDefaultOptionsWithoutComponent`) – Function that receives current defaults and returns new defaults

**Returns**: `void`

**Behavior**:
- Updates the defaults stored in the manager
- Does not affect existing drawers
- Only affects drawers opened after the update
- The `component` field cannot be changed through this method

::: warning
This only affects new drawers. Existing drawers keep their original options.
:::

### `updateOptions(key, updater)`

Updates options for an existing drawer.

```ts
const { updateOptions } = useDrawerContext()

updateOptions('user-profile', prev => ({
  ...prev,
  placement: 'left',
  dataAttributes: {
    'data-loading': false,
  },
}))
```

**Parameters**:
- `key` (`DrawerKey`) – The key of the drawer to update
- `updater` (`(prev) => VueDrawerUpdatableOptionsWithoutComponent`) – Function that receives current options (without `drawerKey` and `component`) and returns updated options

**Returns**: `void`

**Behavior**:
- Updates the drawer's options in place
- Does not change the drawer's position in the stack
- The `drawerKey` and `component` fields cannot be changed
- If the key doesn't exist, does nothing
- Triggers state listeners

**Use Cases**:
- Toggle loading states
- Update placement dynamically
- Change close behaviors
- Update data attributes for styling

## Notes

- **Plugin Required**: Must be used after `DrawerPlugin` is installed
- **Composition API Only**: Designed for Vue 3 Composition API
- **Component Wrapping**: Components are automatically wrapped with `markRaw()`
- **Type Safety**: Use generics to type custom drawer options
- **Single Manager**: Returns the same manager instance across all components
- **Reactivity**: State changes trigger reactive updates
