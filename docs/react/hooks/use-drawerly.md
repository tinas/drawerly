# useDrawerly

`useDrawerly(drawerly)` subscribes a component to the instance and returns the manager API together with the reactive `stack`. Use it whenever a component needs to render something based on the drawer state:

```tsx
import { useDrawerly } from '@drawerly/react'
import { drawerly } from './drawerly'

export function DrawerBadge() {
  const { stack, closeAll } = useDrawerly(drawerly)

  if (stack.length === 0)
    return null

  return (
    <button onClick={closeAll}>
      {`Close all (${stack.length})`}
    </button>
  )
}
```

Components that only trigger actions don't need the hook. Calling `drawerly.open()` or `drawerly.close()` on the imported instance works everywhere and avoids re-rendering the component on stack changes. For working with one specific drawer, [`useDrawer`](./use-drawer.md) is usually more convenient.

## Opening and Closing

`open()` adds a drawer to the stack, or replaces its options and brings it to the top if the key is already open. `componentProps` are passed to your component, along with the injected `drawerKey` prop:

```ts
drawerly.open({
  drawerKey: 'edit-42',
  component: EditForm,
  componentProps: {
    itemId: '42',
    onSave: data => console.log('Saved:', data),
  },
})
```

Closing takes an optional key:

```ts
drawerly.close() // topmost drawer
drawerly.close('edit-42') // specific drawer
drawerly.closeAll() // everything
```

Every close path plays the exit animation before the drawer leaves the DOM. To switch between open drawers without reopening them, use `bringToTop(key)`.

## Reactive State

The `stack` returned by the hook updates on every change, so derived values are plain expressions:

```ts
const { stack } = useDrawerly(drawerly)

const isProfileOpen = stack.some(d => d.drawerKey === 'user-profile')
const openCount = stack.length
```

For one-off checks outside rendering, `drawerly.isOpen(key)` and `drawerly.getState()` return plain snapshots. For side effects such as analytics, subscribe to the instance in an effect:

```ts
useEffect(() => {
  return drawerly.subscribe((state) => {
    console.log('Stack changed:', state.stack.map(d => d.drawerKey))
  })
}, [])
```

## Updating Options

`updateOptions(key, patch)` merges a patch into an open drawer, taking effect immediately:

```ts
drawerly.updateOptions('user-profile', {
  dataAttributes: { 'data-loading': true },
})
```

`updateDefaultOptions(patch)` changes the global defaults instead. It only affects drawers opened afterwards; already open drawers keep their options.

## Typed Drawer Options

Pass a generic to extend the drawer options with your own fields:

```ts
import type { ReactDrawerOptions } from '@drawerly/react'

interface ProductDrawerOptions extends ReactDrawerOptions {
  productId: string
  price: number
}

const drawerly = createDrawerly<ProductDrawerOptions>()

drawerly.open({
  drawerKey: 'product-123',
  component: ProductDetail,
  productId: '123',
  price: 999.99,
})
```

TypeScript then enforces the custom fields on `open()` and knows about them on every instance you read back, including through `useDrawerly(drawerly)`.
