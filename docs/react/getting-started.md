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

Create a `Drawerly` instance in its own module and export it:

```ts [drawerly.ts]
import { createDrawerly } from '@drawerly/react'

export const drawerly = createDrawerly({
  defaultOptions: {
    placement: 'right',
  },
})
```

Import the stylesheet once, in your entry file:

```ts [main.tsx]
import '@drawerly/react/style.css'
```

Add `<DrawerlyContainer>` to your root component and pass it the instance. One container per application is enough:

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

## Your First Drawer

Any React component can be drawer content:

```tsx [UserProfile.tsx]
interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <p>{`User ID: ${userId}`}</p>
    </div>
  )
}
```

Open it by calling `open()` on the instance, passing your component and its props:

```tsx [HomePage.tsx]
import { drawerly } from './drawerly'
import { UserProfile } from './UserProfile'

export function HomePage() {
  return (
    <button
      onClick={() => {
        drawerly.open({
          drawerKey: 'user-123',
          component: UserProfile,
          componentProps: { userId: '123' },
        })
      }}
    >
      View Profile
    </button>
  )
}
```

Clicking the button slides the drawer in from the right. Press Escape or click the backdrop to close it.
