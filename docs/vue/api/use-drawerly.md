# useDrawerly API Reference

Composable that returns the `Drawerly` instance registered by `createDrawerly()`.

```ts
import { useDrawerly } from '@drawerly/vue'

const drawerly = useDrawerly()
```

## Type Signature

```ts
function useDrawerly<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions
>(): Drawerly<TDrawerOptions>
```

Must be called inside a component `setup` context. Throws if no instance has been installed. Outside components, use the `createDrawerly()` instance directly.

The returned instance implements the full core [`DrawerManager` API](/core/api/#drawermanager) plus a reactive `state` ref:

```ts
interface Drawerly<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions
> extends DrawerManager<TDrawerOptions> {
  state: Readonly<ShallowRef<DrawerState<TDrawerOptions>>>
  install: (app: App) => void
}
```

## Properties

### `state`

Reactive drawer state as a readonly shallow ref, updated on every manager change.

```ts
const stack = computed(() => drawerly.state.value.stack)
const drawerCount = computed(() => stack.value.length)
```

In components, prefer deriving reactive values from `state` over calling `getState()`.

## Methods

### `open(options)`

Opens a drawer at the top of the stack. If the key already exists, its options are replaced, not merged; `undefined`/`null` fields fall back to the configured default instead of erasing it. Returns the drawer key.

```ts
drawerly.open({
  drawerKey: 'user-profile',
  component: UserProfile,
  componentProps: { userId: '123' },
  placement: 'right',
})
```

`options` accepts all fields of `VueDrawerOptions`: the required `drawerKey`, the Vue-specific `component` and `componentProps`, the base options (`placement`, `closeOnEscapeKey`, `closeOnBackdropClick`, the ARIA attributes, `dataAttributes`, see the [core API reference](/core/api/#draweroptions)), and any custom fields you defined. The `component` is automatically wrapped with `markRaw()`.

### `close(key?)`

Closes the drawer with the given key, from anywhere in the stack. Without a key, closes the topmost drawer. Does nothing if the key doesn't exist. The container plays the exit animation before the drawer leaves the DOM.

```ts
drawerly.close() // top drawer
drawerly.close('user-profile') // specific drawer
```

### `closeAll()`

Closes all open drawers. Each one plays its exit animation.

### `bringToTop(key)`

Moves an existing drawer to the top of the stack without reopening it. Does nothing if the key doesn't exist or the drawer is already on top. Does not trigger entrance animations.

```ts
drawerly.bringToTop('settings')
```

### `updateOptions(key, patch)`

Merges a patch into an existing drawer's options and triggers state listeners. The drawer's position in the stack is unchanged, and `drawerKey` cannot be modified. `undefined`/`null` entries in the patch are skipped, leaving the current value in place.

```ts
drawerly.updateOptions('user-profile', {
  placement: 'left',
  dataAttributes: { 'data-loading': false },
})
```

### `updateDefaultOptions(patch)`

Merges a patch into the global defaults used for future drawers. Existing drawers keep their options.

```ts
drawerly.updateDefaultOptions({ placement: 'left' })
```

### `isOpen(key)`

Returns whether a drawer with the given key is currently in the stack. Not reactive; for reactive checks derive from `state` or use [`useDrawer`](./use-drawer.md).

### `getState()`

Returns the current drawer state as a non-reactive snapshot: `{ stack: DrawerInstance[] }`. The last item in the stack is the topmost drawer.

### `getDrawerInstance(key)`

Returns the drawer instance with the given key, or `undefined` if it is not in the stack.

### `getTopDrawer()`

Returns the topmost drawer instance, or `undefined` when the stack is empty.

### `getDefaultOptions()`

Returns the current global default options. Always returns an object; the built-in base defaults are `{ placement: 'right', closeOnEscapeKey: true, closeOnBackdropClick: true }`.

### `subscribe(listener)`

Subscribes to state changes and returns an unsubscribe function. The listener is called with the new state whenever the stack changes.

```ts
const unsubscribe = drawerly.subscribe((state) => {
  console.log('Stack changed:', state.stack.length)
})
```

In components, prefer watching the reactive `state` ref, since Vue cleans up its own watchers. When using `subscribe` directly, unsubscribe on unmount.

## Typed Drawer Options

Pass a generic to extend the drawer options with custom fields. TypeScript enforces them on `open()` and knows about them on instances you read back:

```ts
interface ProductDrawerOptions extends VueDrawerOptions {
  productId: string
  price: number
}

const drawerly = useDrawerly<ProductDrawerOptions>()

drawerly.open({
  drawerKey: 'product-123',
  component: ProductDetail,
  productId: '123',
  price: 999.99,
})

const drawer = drawerly.getDrawerInstance('product-123')
console.log(drawer?.price) // typed as number | undefined
```
