# Imperative API

The `drawer` object provides an imperative API for opening and closing drawers from anywhere in your application—even outside React components.

## Usage

```tsx
import { drawer } from '@drawerly/react'

// Open a drawer
drawer.open({
  drawerKey: 'settings',
  component: SettingsPanel,
})

// Close a specific drawer
drawer.close('settings')

// Close the top drawer
drawer.close()

// Close all drawers
drawer.closeAll()
```

## When to Use

The imperative API is useful for:

- **Event handlers outside React** – Browser events, WebSocket handlers, etc.
- **Utility modules** – Non-component code that needs to trigger drawers
- **Third-party integrations** – Libraries that don't have React context access
- **Testing** – Programmatically controlling drawers in tests

For most React component code, prefer the `useDrawer` hook for better integration with React's lifecycle.

## API Reference

### `drawer.open(options)`

Opens a new drawer or updates an existing one and moves it to the top of the stack.

```tsx
const key = drawer.open({
  drawerKey: 'my-drawer',
  component: MyComponent,
  componentProps: { userId: '123' },
  placement: 'right',
  closeOnEscapeKey: true,
  closeOnBackdropClick: true,
})
```

**Parameters:**
- `options` – Same options as `useDrawer().open()`

**Returns:** `DrawerKey` – The key of the opened drawer

### `drawer.close(key?)`

Closes a drawer.

```tsx
// Close a specific drawer
drawer.close('settings')

// Close the topmost drawer
drawer.close()
```

**Parameters:**
- `key` (optional) – The drawer key to close. If omitted, closes the topmost drawer.

### `drawer.closeAll()`

Closes all open drawers.

```tsx
drawer.closeAll()
```

### `drawer.bringToTop(key)`

Moves a drawer to the top of the stack without re-opening it.

```tsx
drawer.bringToTop('background-drawer')
```

**Parameters:**
- `key` – The drawer key to bring to top

### `drawer.getState()`

Returns the current drawer state snapshot.

```tsx
const state = drawer.getState()
console.log(state.stack.length) // Number of open drawers
```

**Returns:** `DrawerState<ReactDrawerOptions>`

### `drawer.getDrawerInstance(key)`

Returns a specific drawer instance by key.

```tsx
const instance = drawer.getDrawerInstance('my-drawer')
if (instance) {
  console.log(instance.placement)
}
```

**Parameters:**
- `key` – The drawer key to look up

**Returns:** `DrawerInstance<ReactDrawerOptions> | undefined`
