# Getting Started

## Installation

:::code-group
```bash [pnpm]
pnpm add @drawerly/react
```

```bash [npm]
npm install @drawerly/react
```

```bash [yarn]
yarn add @drawerly/react
```
:::

## Setup

Create a `Drawerly` instance with `createDrawerly()` in a module and export it:

```ts [drawerly.ts]
import { createDrawerly } from '@drawerly/react'

export const drawerly = createDrawerly({
  defaultOptions: {
    placement: 'right',
  },
})
```

`defaultOptions` sets global defaults for all drawers, such as `placement` or the close behaviors. See the [createDrawerly API Reference](./api/create-drawerly.md) for the full list.

Import the stylesheet once, in your entry file:

```ts [main.tsx]
import '@drawerly/react/style.css'
```

Then add `<DrawerlyContainer>` to your root component and pass it the instance. It renders the open drawers:

```tsx [App.tsx]
import { DrawerlyContainer } from '@drawerly/react'
import { drawerly } from './drawerly'

export function App() {
  return (
    <>
      <YourAppContent />

      <DrawerlyContainer drawerly={drawerly} />
    </>
  )
}
```

One container per application is enough. Its props (portal target, modal behavior, scroll locking) are documented in the [DrawerlyContainer API Reference](./api/drawer-container.md).

## Your First Drawer

Any React component can be drawer content. The container passes it one extra prop, `drawerKey`; call [`useDrawer`](./hooks/use-drawer.md) with it to close the drawer from inside.

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
    <div className="user-profile">
      <header>
        <h2>User Profile</h2>
        <button onClick={close}>✕</button>
      </header>
      <p>{`User ID: ${userId}`}</p>
    </div>
  )
}
```

Open it by calling `open()` on the instance:

```tsx [HomePage.tsx]
import { drawerly } from './drawerly'
import { UserProfile } from './UserProfile'

function showUserProfile(userId: string) {
  drawerly.open({
    drawerKey: `user-${userId}`,
    component: UserProfile,
    componentProps: {
      userId,
    },
  })
}

export function HomePage() {
  return (
    <button onClick={() => showUserProfile('123')}>
      View User Profile
    </button>
  )
}
```

That's it. Clicking the button slides the drawer in from the right with your component inside.

## Closing Drawers

Pressing Escape or clicking the backdrop closes the top drawer by default. From code, call `close()`:

```ts
drawerly.close() // closes the topmost drawer
drawerly.close('user-123') // closes a specific drawer
drawerly.closeAll() // empties the stack
```

Inside the drawer component, use `useDrawer` as shown above.

## Stacking

Opening another drawer while one is open stacks it on top:

```ts
drawerly.open({ drawerKey: 'settings', component: Settings })
drawerly.open({ drawerKey: 'profile', component: Profile })
// 'profile' is now on top; close() removes it first
```

Use `bringToTop(key)` to move an open drawer back to the top without reopening it.

## Using the Instance Outside Components

The instance is a plain object created at module scope, so it works the same everywhere: event handlers, router loaders, stores, or plain functions:

```ts
import { drawerly } from './drawerly'

router.subscribe(() => {
  drawerly.closeAll()
})
```

## Next Steps

- [useDrawerly](./hooks/use-drawerly.md) subscribes a component to the drawer stack.
- [useDrawer](./hooks/use-drawer.md) binds a component to a single drawer.
- [Styling](./styling.md) customizes the look with CSS variables.
- [Unstyled Mode](./unstyled-mode.md) drops the default styles entirely.
