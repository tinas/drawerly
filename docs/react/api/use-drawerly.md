# useDrawerly API Reference

Hook that subscribes a component to a `Drawerly` instance and returns its manager API together with the reactive drawer stack.

```ts
import { useDrawerly } from '@drawerly/react'
import { drawerly } from './drawerly'

const { stack, open, close } = useDrawerly(drawerly)
```

## Type Signature

```ts
function useDrawerly<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions
>(drawerly: Drawerly<TDrawerOptions>): UseDrawerlyResult<TDrawerOptions>

interface UseDrawerlyResult<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions
> extends Drawerly<TDrawerOptions> {
  stack: DrawerInstance<TDrawerOptions>[]
}
```

The component re-renders whenever the stack changes. Components that only trigger actions can call the same methods on the `createDrawerly()` instance directly, without the hook and without the re-renders.

## Properties

### `stack`

Current drawer stack, updated on every change. The last item is the topmost drawer.

```ts
const { stack } = useDrawerly(drawerly)

const drawerCount = stack.length
const topDrawer = stack.at(-1)
```

In components, prefer deriving values from `stack` over calling `getState()`.

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

`options` accepts all fields of `ReactDrawerOptions`: the required `drawerKey`, the React-specific `component` and `componentProps`, the base options (`placement`, `closeOnEscapeKey`, `closeOnBackdropClick`, the ARIA attributes, `dataAttributes`, see the [core API reference](/core/api/#draweroptions)), and any custom fields you defined.

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

Returns whether a drawer with the given key is currently in the stack. Not reactive; for reactive checks derive from `stack` or use [`useDrawer`](./use-drawer.md).

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
useEffect(() => {
  return drawerly.subscribe((state) => {
    console.log('Stack changed:', state.stack.length)
  })
}, [])
```

In components, prefer the reactive `stack` for rendering; `subscribe` is for side effects, with the unsubscribe returned as the effect cleanup.

## Typed Drawer Options

The generic comes from the instance, so type `createDrawerly()` once and every hook call is typed with it. TypeScript enforces the custom fields on `open()` and knows about them on instances you read back:

```ts
interface ProductDrawerOptions extends ReactDrawerOptions {
  productId: string
  price: number
}

export const drawerly = createDrawerly<ProductDrawerOptions>()

drawerly.open({
  drawerKey: 'product-123',
  component: ProductDetail,
  productId: '123',
  price: 999.99,
})

const drawer = drawerly.getDrawerInstance('product-123')
console.log(drawer?.price) // typed as number | undefined
```
