# Introduction

`@drawerly/react` is the React adapter for Drawerly. It renders your components inside stacked drawers, and the instance lives at module scope, so opening a drawer is a single function call from anywhere:

```tsx
import { drawerly } from './drawerly'
import UserProfile from './UserProfile'

function showProfile() {
  drawerly.open({
    drawerKey: 'user-profile',
    component: UserProfile,
    componentProps: {
      userId: '123',
    },
  })
}

export function HomePage() {
  return (
    <button onClick={showProfile}>
      View Profile
    </button>
  )
}
```

Every drawer is identified by a `drawerKey`. Opening a key that is already in the stack replaces that drawer's options and brings it to the top, so you never end up with duplicates.

## What's Included

- `createDrawerly()` creates the instance, once, at module scope. No provider is needed; you import the instance where you use it.
- `<DrawerlyContainer>` renders the open drawers and handles animations and scroll locking.
- [`useDrawerly()`](./hooks/use-drawerly.md) subscribes a component to the stack.
- [`useDrawer()`](./hooks/use-drawer.md) binds a component to a single drawer.

Drawers render as `role="dialog"` panels with a backdrop and `aria-modal` semantics by default. If you want your own design, skip the stylesheet and style the markup yourself. See [Unstyled Mode](./unstyled-mode.md).

## Next

Head to [Getting Started](./getting-started.md) to set it up.
