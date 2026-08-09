# useDrawer API Reference

Hook that binds a component to a single drawer, identified by its key.

```ts
import { useDrawer } from '@drawerly/react'
import { drawerly } from './drawerly'

const drawer = useDrawer(drawerly, 'my-drawer')
```

## Type Signature

```ts
function useDrawer<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions
>(
  drawerly: Drawerly<TDrawerOptions>,
  drawerKey: DrawerKey
): UseDrawerResult<TDrawerOptions>
```

The key is an ordinary argument; passing a different key on the next render rebinds all returned values:

```ts
const drawer = useDrawer(drawerly, 'my-drawer')
const drawer = useDrawer(drawerly, `user-${userId}`)
```

The component re-renders whenever the instance's stack changes.

## Return Type

```ts
interface UseDrawerResult<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions
> {
  isOpen: boolean
  isTop: boolean
  instance: DrawerInstance<TDrawerOptions> | undefined
  close: () => void
  bringToTop: () => void
  updateOptions: (patch: DrawerPatch<TDrawerOptions>) => void
}
```

Every member mirrors a `DrawerManager` operation that takes a drawer key, with the key already bound. To open the drawer, call [`drawerly.open()`](./use-drawerly.md#open-options) directly or through [`useDrawerly`](./use-drawerly.md).

## Properties

### `isOpen`

- **Type**: `boolean`

Whether the drawer currently exists in the stack.

### `isTop`

- **Type**: `boolean`

Whether the drawer is the topmost one in the stack.

### `instance`

- **Type**: `DrawerInstance<TDrawerOptions> | undefined`

The full drawer instance, including any custom fields. `undefined` while the drawer is closed. Do not mutate it directly; use `updateOptions` instead.

```ts
const { instance } = useDrawer(drawerly, 'product-detail')

console.log(instance?.placement)
```

## Methods

### `close()`

Closes the drawer. Equivalent to `drawerly.close(drawerKey)`.

### `bringToTop()`

Brings the drawer to the top of the stack without reopening it. Does nothing if the drawer is already on top or not open.

### `updateOptions(patch)`

Merges a patch into the drawer's options. `drawerKey` cannot be changed, and `undefined`/`null` entries in the patch are skipped, leaving the current value in place.

```ts
const { updateOptions } = useDrawer(drawerly, 'my-drawer')

updateOptions({ placement: 'left' })
```

To compute a patch from the current value, read it off `instance` first:

```ts
const { instance, updateOptions } = useDrawer(drawerly, 'product-detail')

updateOptions({ price: (instance?.price ?? 0) * 0.9 })
```

## Typed Drawer Options

Pass a generic for type-safe access to custom fields:

```ts
interface ProductDrawerOptions extends ReactDrawerOptions {
  productId: string
  price: number
}

const { instance, updateOptions } = useDrawer<ProductDrawerOptions>(drawerly, 'product-drawer')

console.log(instance?.price)
updateOptions({ price: 899.99 })
```
