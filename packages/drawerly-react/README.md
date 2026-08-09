# @drawerly/react

React adapter for Drawerly. Create an instance with `createDrawerly()` at module scope, use it anywhere, and render the stack with `<DrawerlyContainer />`. No provider required.

```ts
// drawerly.ts
import { createDrawerly } from '@drawerly/react'
import '@drawerly/react/style.css'

export const drawerly = createDrawerly()
```

```tsx
import { DrawerlyContainer } from '@drawerly/react'
import { drawerly } from './drawerly'
import UserProfile from './UserProfile'

function showProfile() {
  drawerly.open({
    drawerKey: 'user-profile',
    component: UserProfile,
    componentProps: { userId: '123' },
  })
}

export function App() {
  return (
    <>
      <button onClick={showProfile}>View Profile</button>
      <DrawerlyContainer drawerly={drawerly} />
    </>
  )
}
```

For full documentation, visit **[drawerly.dev](https://drawerly.dev)**
