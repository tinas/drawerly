# DrawerlyContainer API Reference

Component that renders and animates the active drawer stack. This component is automatically registered globally by the `DrawerPlugin`.

## Usage

```vue
<template>
  <div id="app">
    <YourAppContent />

    <!-- Renders all open drawers -->
    <DrawerlyContainer />
  </div>
</template>
```

::: tip
You typically only need one `<DrawerlyContainer />` per application, placed in your root component (`App.vue`).
:::

## Props

### `teleportTo`

- **Type**: `string`
- **Default**: `'body'`
- **Optional**: Yes

CSS selector or element ID where the drawer container is teleported.

```vue
<DrawerlyContainer teleport-to="body" />

<!-- Or custom target -->
<DrawerlyContainer teleport-to="#drawer-portal" />
```

::: info
This prop is automatically set by the `DrawerPlugin` configuration. You typically don't need to set it manually.
:::

### `headless`

- **Type**: `boolean`
- **Default**: `false`
- **Optional**: Yes

Enables headless mode, disabling all built-in UI, animations, and interactions.

```vue
<DrawerlyContainer :headless="true" />
```

In headless mode, use the scoped slot to implement custom UI:

```vue
<DrawerlyContainer :headless="true">
  <template #default="{ drawer, close }">
    <div class="my-custom-drawer">
      <component :is="drawer.component" v-bind="drawer.componentParams" />
      <button @click="close">Close</button>
    </div>
  </template>
</DrawerlyContainer>
```

::: info
This prop is automatically set by the `DrawerPlugin` configuration.
:::

## Slots

### Default Slot

- **Available**: When no `component` is passed to `open()`
- **Props**: `{ drawer: DrawerInstance, close: () => void }`

Scoped slot that receives the current drawer instance and a close function. This slot is used as a fallback when you don't provide a `component` in the drawer options.

```vue
<DrawerlyContainer>
  <template #default="{ drawer, close }">
    <!-- Renders when open() is called without a component -->
    <div class="my-drawer-content">
      <h2>{{ drawer.title }}</h2>
      <p>{{ drawer.message }}</p>
      <button @click="close">Close</button>
    </div>
  </template>
</DrawerlyContainer>
```

```ts
// Open drawer without component - uses default slot
open({
  drawerKey: 'my-drawer',
  title: 'Hello',
  message: 'This will render in the default slot',
})
```

**Slot Props**:

- **`drawer`** (`DrawerInstance<VueDrawerOptions>`) – The drawer instance with all its options:
  - `drawerKey` – Unique identifier
  - `placement` – Position (`'top'`, `'right'`, `'bottom'`, `'left'`)
  - `component` – Vue component to render
  - `componentParams` – Props to pass to the component
  - `closeOnEscapeKey` – Escape key behavior
  - `closeOnBackdropClick` – Backdrop click behavior
  - `ariaLabel` – ARIA label
  - `ariaDescribedBy` – ARIA describedby id
  - `ariaLabelledBy` – ARIA labelledby id
  - `dataAttributes` – Custom data attributes
  - Any custom fields you defined

- **`close`** (`() => void`) – Function to close this specific drawer

::: tip
The default slot is used when you call `open()` without providing a `component`. If you pass a component, that component will be rendered instead.
:::

## Events

The `DrawerlyContainer` emits several lifecycle events:

### `drawer-opened`

Emitted when a drawer appears in the stack.

**Payload**: `{ key: DrawerKey }`

```vue
<DrawerlyContainer @drawer-opened="handleOpened" />
```

```ts
function handleOpened(payload: { key: string }) {
  console.log('Drawer opened:', payload.key)
}
```

### `drawer-closed`

Emitted when a drawer finishes closing (after animation).

**Payload**: `{ key: DrawerKey, mode: 'single' | 'bulk' }`

```vue
<DrawerlyContainer @drawer-closed="handleClosed" />
```

```ts
function handleClosed(payload: { key: string, mode: 'single' | 'bulk' }) {
  console.log('Drawer closed:', payload.key)
  console.log('Close mode:', payload.mode)
}
```

The `mode` indicates whether the drawer was closed individually (`'single'`) or as part of a `closeAll()` operation (`'bulk'`).

### `drawer-close-all-start`

Emitted when a bulk close operation starts (e.g., `closeAll()` is called).

**Payload**: `{ keys: DrawerKey[] }`

```vue
<DrawerlyContainer @drawer-close-all-start="handleCloseAllStart" />
```

```ts
function handleCloseAllStart(payload: { keys: string[] }) {
  console.log('Closing all drawers:', payload.keys)
}
```

### `drawer-close-all-complete`

Emitted when a bulk close operation completes (all closing animations finished).

**Payload**: None

```vue
<DrawerlyContainer @drawer-close-all-complete="handleCloseAllComplete" />
```

```ts
function handleCloseAllComplete() {
  console.log('All drawers closed')
}
```

## Behavior

### Standard Mode

In standard mode (default), the container:

1. **Renders Drawers**: Displays all drawers from the stack with backdrop and panel
2. **Animates Transitions**: Applies slide-in/slide-out animations
3. **Handles Keyboard**: Listens for Escape key to close drawers
4. **Handles Clicks**: Closes drawers when backdrop is clicked (if enabled)
5. **Manages Z-Index**: Layers drawers correctly with proper stacking

### Headless Mode

In headless mode:

1. **No UI**: Does not render backdrop or panel elements
2. **No Animations**: Drawers appear/disappear instantly
3. **No Interactions**: Keyboard and backdrop click handling are disabled
4. **Raw Data**: Provides drawer data through scoped slot
5. **Full Control**: You implement all presentation and interaction logic

## DOM Structure

### Standard Mode

```html
<div data-drawerly-root>
  <div data-drawerly-overlay
       data-drawerly-key="drawer-1"
       data-drawerly-placement="right"
       data-top>
    <div data-drawerly-backdrop></div>
    <div data-drawerly-panel
         role="dialog"
         aria-modal="true"
         aria-label="...">
      <!-- Your component renders here -->
    </div>
  </div>
</div>
```

### Headless Mode

```html
<div data-drawerly-root data-headless>
  <!-- Content from your default slot -->
</div>
```

## Data Attributes

The container uses data attributes for styling and state:

- `[data-drawerly-root]` – Root container
- `[data-drawerly-overlay]` – Wrapper for each drawer
- `[data-drawerly-backdrop]` – Semi-transparent backdrop
- `[data-drawerly-panel]` – The drawer panel
- `[data-drawerly-placement]` – Position (`'top'`, `'right'`, `'bottom'`, `'left'`)
- `[data-drawerly-key]` – Drawer key
- `[data-drawerly-index]` – Position in stack (0-based)
- `[data-drawerly-count]` – Total number of drawers
- `[data-top]` – Present on the topmost drawer
- `[data-entering]` – Applied during entrance animation
- `[data-closing]` – Applied during exit animation
- `[data-headless]` – Present when in headless mode

Additional custom data attributes from `drawer.dataAttributes` are also applied to the overlay element.

## Notes

- **Single Container**: Use only one `<DrawerlyContainer />` per app unless using multiple teleport targets.

- **Automatic Registration**: The component is registered globally by `DrawerPlugin`, no import needed.

- **Reactivity**: The container automatically re-renders when the drawer stack changes.

- **Performance**: Uses `shallowRef` internally for optimal performance with large stacks.

- **Teleport**: Uses Vue's `<Teleport>` component to render drawers at the target element.
