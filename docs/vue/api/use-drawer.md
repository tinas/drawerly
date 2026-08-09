# useDrawer API Reference

Composable that provides reactive bindings to a single drawer, identified by its key.

```ts
import { useDrawer } from '@drawerly/vue'

const drawer = useDrawer('my-drawer')
```

## Type Signature

```ts
function useDrawer<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions
>(
  drawerKey: MaybeRefOrGetter<DrawerKey>
): UseDrawerResult<TDrawerOptions>
```

`drawerKey` can be a plain string, a ref, or a getter. All returned bindings follow key changes reactively:

```ts
const drawer = useDrawer('my-drawer')
const drawer = useDrawer(keyRef)
const drawer = useDrawer(() => `user-${userId.value}`)
```

Must be called after the instance created by `createDrawerly()` is installed. All bindings are computed values derived from the instance's reactive `state` ref, so no manual cleanup is needed.

## Return Type

```ts
interface UseDrawerResult<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions
> {
  isOpen: ComputedRef<boolean>
  isTop: ComputedRef<boolean>
  instance: ComputedRef<DrawerInstance<TDrawerOptions> | undefined>
  close: () => void
  bringToTop: () => void
  updateOptions: (patch: DrawerPatch<TDrawerOptions>) => void
}
```

Every member mirrors a `DrawerManager` operation that takes a drawer key, with the key already bound. To open the drawer, use [`useDrawerly().open()`](./use-drawerly.md#open-options).

## Properties

### `isOpen`

- **Type**: `ComputedRef<boolean>`

Whether the drawer currently exists in the stack.

### `isTop`

- **Type**: `ComputedRef<boolean>`

Whether the drawer is the topmost one in the stack.

### `instance`

- **Type**: `ComputedRef<DrawerInstance<TDrawerOptions> | undefined>`

Reactive view of the full drawer instance, including any custom fields. `undefined` while the drawer is closed. Do not mutate it directly; use `updateOptions` instead.

```ts
const { instance } = useDrawer('product-detail')

console.log(instance.value?.placement)
```

## Methods

### `close()`

Closes the drawer. Equivalent to `useDrawerly().close(drawerKey)`.

### `bringToTop()`

Brings the drawer to the top of the stack without reopening it. Does nothing if the drawer is already on top or not open.

### `updateOptions(patch)`

Merges a patch into the drawer's options. `drawerKey` cannot be changed, and `undefined`/`null` entries in the patch are skipped, leaving the current value in place.

```ts
const { updateOptions } = useDrawer('my-drawer')

updateOptions({ placement: 'left' })
```

To compute a patch from the current value, read it off `instance` first:

```ts
const { instance, updateOptions } = useDrawer('product-detail')

updateOptions({ price: (instance.value?.price ?? 0) * 0.9 })
```

## Typed Drawer Options

Pass a generic for type-safe access to custom fields:

```ts
interface ProductDrawerOptions extends VueDrawerOptions {
  productId: string
  price: number
}

const { instance, updateOptions } = useDrawer<ProductDrawerOptions>('product-drawer')

console.log(instance.value?.price)
updateOptions({ price: 899.99 })
```
