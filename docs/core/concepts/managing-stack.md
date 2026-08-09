# Managing the Stack

The drawer manager maintains a stack of open drawers. The first drawer opened sits at the bottom, the most recently opened or focused one at the top. The last item in the stack array is always the topmost drawer, which is what a rendering layer treats as active.

## Opening

`open()` adds a drawer to the stack:

```ts
manager.open({ drawerKey: 'main-menu' })
manager.open({ drawerKey: 'settings' })
manager.open({ drawerKey: 'profile' })

// Stack: ['main-menu', 'settings', 'profile']
```

If the key already exists, the drawer is not duplicated. Its options are replaced with what you pass and it moves to the top:

```ts
manager.open({
  drawerKey: 'product-123',
  price: 79.99, // replaces the previous options entirely
})
```

Fields left out of the call are gone, not merged. To change part of an open drawer instead, use `updateOptions()` below.

## Closing

`close()` without arguments removes the topmost drawer. With a key, it removes that drawer from anywhere in the stack. `closeAll()` empties the stack:

```ts
// Stack: ['drawer-1', 'drawer-2', 'drawer-3']
manager.close() // ['drawer-1', 'drawer-2']
manager.close('drawer-1') // ['drawer-2']
manager.closeAll() // []
```

## Reordering

`bringToTop()` moves an open drawer to the top without reopening it:

```ts
// Stack: ['menu', 'settings', 'profile']
manager.bringToTop('settings')
// Stack: ['menu', 'profile', 'settings']
```

This is how you switch between multiple open drawers, for example tab-like navigation where each tab is a drawer.

## Reading State

```ts
const state = manager.getState() // { stack: [...] }
const top = manager.getTopDrawer() // topmost drawer, or undefined
const drawer = manager.getDrawerInstance('product-123') // by key, or undefined

if (manager.isOpen('product-123')) {
  // key is in the stack
}
```

When only existence matters, prefer `isOpen()` over fetching the instance.

## Subscribing to Changes

`subscribe()` registers a listener that fires on every stack change: open, close, reorder, and option updates. It returns an unsubscribe function:

```ts
const unsubscribe = manager.subscribe((state) => {
  renderDrawers(state.stack)
})

// Later
unsubscribe()
```

This is the primary integration point for rendering layers and side effects like analytics. Multiple listeners can be registered independently. Always unsubscribe when the consumer goes away.

## Updating Options

`updateOptions()` merges a partial patch into an open drawer without reopening it or changing its position in the stack:

```ts
manager.updateOptions('product-123', {
  price: 149.99,
  inStock: false,
})
```

`drawerKey` cannot be changed through a patch. When the new value depends on the current one, read it first:

```ts
const current = manager.getDrawerInstance('product-123')

manager.updateOptions('product-123', {
  price: current!.price * 0.9,
})
```

`updateDefaultOptions()` takes the same kind of patch but applies it to the manager's defaults, affecting only drawers opened afterwards:

```ts
manager.updateDefaultOptions({
  placement: 'left',
  closeOnBackdropClick: false,
})
```

## Example: Master-Detail Navigation

The stack maps naturally to layered navigation. A list drawer opens a detail drawer on top; closing returns to the list:

```ts
manager.open({ drawerKey: 'product-list' })

// User selects a product
manager.open({ drawerKey: 'product-detail-123', productId: '123' })

// Back button
manager.close() // the list is still there underneath
```
