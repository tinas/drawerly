# useDrawer

`useDrawer(drawerly, key)` binds a component to a single drawer. Where [`useDrawerly`](./use-drawerly.md) exposes the whole stack, `useDrawer` binds to one key and gives you its state and controls directly:

```tsx
import { useDrawer } from '@drawerly/react'
import { drawerly } from './drawerly'

export function SettingsStatus() {
  const { isOpen, isTop, close } = useDrawer(drawerly, 'settings')

  if (!isOpen)
    return null

  return (
    <span className={isTop ? 'top' : ''}>
      Settings is open
      <button onClick={close}>Close</button>
    </span>
  )
}
```

Drawers are created with [`drawerly.open()`](./use-drawerly.md#opening-and-closing). Reach for `useDrawer` once you have a key and want to read or adjust that specific drawer, most commonly from inside the drawer's own content component.

## Reactive Values

`isOpen` tracks whether the drawer is in the stack, and `isTop` whether it is the topmost one. Both update automatically:

```tsx
export function FocusSettingsButton() {
  const { isOpen, isTop, bringToTop } = useDrawer(drawerly, 'settings')

  if (!isOpen || isTop)
    return null

  return (
    <button onClick={bringToTop}>
      Focus Settings
    </button>
  )
}
```

`instance` exposes the full drawer instance, including any custom fields, and is `undefined` while the drawer is closed:

```ts
const { instance } = useDrawer(drawerly, 'product-detail')

console.log(instance?.placement)
```

## Updating Options

`updateOptions` merges a patch into the drawer:

```ts
const { updateOptions } = useDrawer(drawerly, 'form')

updateOptions({ closeOnEscapeKey: false })
```

To compute a patch from the current value, read it off `instance` first:

```ts
const { instance, updateOptions } = useDrawer(drawerly, 'product-detail')

updateOptions({ price: (instance?.price ?? 0) * 0.9 })
```

## Closing Yourself

The most common use of `useDrawer` is inside the drawer's own content component, closing itself with the `drawerKey` prop the container passes in:

```tsx [UserProfile.tsx]
import { useDrawer } from '@drawerly/react'
import { drawerly } from './drawerly'

interface UserProfileProps {
  drawerKey: string
  userId: string
}

export function UserProfile({ drawerKey, userId }: UserProfileProps) {
  const { close } = useDrawer(drawerly, drawerKey)

  return (
    <div>
      <button onClick={close}>Close</button>
      <p>{`User ID: ${userId}`}</p>
    </div>
  )
}
```

## Dynamic Keys

The key is an ordinary argument, so a computed key rebinds everything on the next render:

```ts
const { isOpen, close } = useDrawer(drawerly, `user-profile-${userId}`)
// changing userId rebinds everything to the new key
```

## Typed Drawer Options

Like `useDrawerly`, a generic types the custom fields:

```ts
const { instance, updateOptions } = useDrawer<ProductDrawerOptions>(drawerly, 'product-drawer')

console.log(instance?.price)
updateOptions({ price: 899.99 })
```
