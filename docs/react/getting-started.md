# Getting Started

This guide will walk you through setting up `@drawerly/react` in your React 18 application and creating your first drawer.

## Installation

Install `@drawerly/react` with your favorite package manager:

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

::: info
`@drawerly/react` automatically installs `@drawerly/core` as a dependency, so you don't need to install it separately.
:::

## Basic Setup

Add the `DrawerlyContainer` component to your application root:

```tsx [App.tsx]
import { DrawerlyContainer } from '@drawerly/react'
import '@drawerly/react/style.css'

function App() {
  return (
    <>
      <YourAppContent />
      <DrawerlyContainer />
    </>
  )
}
```

That's it! No provider wrapper or context setup required.

### DrawerlyContainer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `portalTarget` | `string` | `'body'` | CSS selector for portal target |
| `headless` | `boolean` | `false` | Disable built-in UI and animations |

## Creating Your First Drawer

### Step 1: Create a Drawer Component

Create a React component that will be rendered inside the drawer:

```tsx [UserProfile.tsx]
import type { ReactDrawerContentProps } from '@drawerly/react'

interface UserProfileProps extends ReactDrawerContentProps {
  userId: string
}

function UserProfile({ userId, close }: UserProfileProps) {
  const userName = 'John Doe'
  const userEmail = 'john@example.com'

  return (
    <div className="user-profile">
      <header>
        <h2>User Profile</h2>
        <button onClick={close}>✕</button>
      </header>

      <div className="content">
        <p><strong>ID:</strong> {userId}</p>
        <p><strong>Name:</strong> {userName}</p>
        <p><strong>Email:</strong> {userEmail}</p>
      </div>
    </div>
  )
}
```

### Step 2: Open the Drawer

Use the `useDrawer` hook to open your drawer:

```tsx [HomePage.tsx]
import { useDrawer } from '@drawerly/react'
import UserProfile from './UserProfile'

function HomePage() {
  const { open } = useDrawer()

  function showUserProfile(userId: string) {
    open({
      drawerKey: `user-${userId}`,
      component: UserProfile,
      componentProps: { userId },
      ariaLabel: 'User Profile Drawer',
    })
  }

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={() => showUserProfile('123')}>
        View User Profile
      </button>
    </div>
  )
}
```

When you click the button, the drawer will slide in from the right with your `UserProfile` component rendered inside.

## Using the Imperative API

You can also open drawers from anywhere using the imperative `drawer` API:

```tsx
import { drawer } from '@drawerly/react'

// Works anywhere, even outside React components
drawer.open({
  drawerKey: 'settings',
  component: SettingsPanel,
})

drawer.close('settings')
drawer.closeAll()
```

## Passing Data to Drawers

Use `componentProps` to pass props to your drawer component:

```tsx
open({
  drawerKey: 'edit-product',
  component: ProductEditor,
  componentProps: {
    productId: '123',
    mode: 'edit',
    onSave: (data) => {
      console.log('Product saved:', data)
    },
    onCancel: () => {
      drawer.close('edit-product')
    },
  },
})
```

Your drawer component receives these props plus the injected ones:

```tsx
interface ProductEditorProps extends ReactDrawerContentProps {
  productId: string
  mode: 'create' | 'edit'
  onSave?: (data: any) => void
  onCancel?: () => void
}

function ProductEditor({
  productId,
  mode,
  onSave,
  onCancel,
  drawerKey, // Injected
  close,     // Injected
}: ProductEditorProps) {
  // ...
}
```

## Using Render Functions

For simple content, use a render function instead of a component:

```tsx
open({
  drawerKey: 'quick-info',
  render: ({ drawerKey, close }) => (
    <div className="quick-info">
      <h2>Quick Info</h2>
      <p>Drawer key: {drawerKey}</p>
      <button onClick={close}>Close</button>
    </div>
  ),
})
```

## Styling Your Drawers

The package includes default styles that you can customize with CSS variables:

```css
[data-drawerly-root] {
  --drawerly-panel-bg: #1f2937;
  --drawerly-panel-width: 500px;
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.7);
  --drawerly-transition-duration: 250ms;
}
```

See the [Styling Guide](./styling.md) for detailed customization options.

## Multiple Drawers

You can open multiple drawers, and they'll stack on top of each other:

```tsx
// Open first drawer
open({ drawerKey: 'main-menu', component: MainMenu })

// Open second drawer on top
open({ drawerKey: 'settings', component: Settings })

// Open third drawer on top
open({ drawerKey: 'profile', component: Profile })

// Stack: ['main-menu', 'settings', 'profile']
// 'profile' is visible on top
```

Close the topmost drawer:

```tsx
close() // Closes 'profile'
```

Or close a specific drawer by key:

```tsx
close('settings') // Removes 'settings' from stack
```

## Reactive Drawer State

Use `useDrawer` with a key to get reactive bindings to a specific drawer:

```tsx
import { useDrawer } from '@drawerly/react'

function DrawerStatus() {
  const { isOpen, placement, close, setPlacement } = useDrawer('my-drawer')

  if (!isOpen) return null

  return (
    <div>
      Drawer is open at {placement}
      <button onClick={close}>Close</button>
      <button onClick={() => setPlacement('left')}>Move Left</button>
    </div>
  )
}
```

## Next.js / SSR Setup

The library is SSR-safe by design:

```tsx [app/layout.tsx]
import { DrawerlyContainer } from '@drawerly/react'
import '@drawerly/react/style.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <DrawerlyContainer />
      </body>
    </html>
  )
}
```

The `DrawerlyContainer` renders nothing on the server and hydrates correctly on the client.

## Next Steps

Now that you have the basics working, explore more advanced features:

- [useDrawer Hook](./hooks/use-drawer.md) – Detailed API reference
- [Headless Mode](./headless-mode.md) – Build custom UI without default styles
- [Styling](./styling.md) – Customize appearance with CSS variables
- [API Reference](./api/drawerly-root.md) – Complete API documentation

## Common Patterns

### Close from Inside the Drawer

Use the injected `close` prop:

```tsx
function MyDrawer({ close }: ReactDrawerContentProps) {
  function handleSave() {
    // Save data...
    close() // Close the drawer
  }

  return <button onClick={handleSave}>Save & Close</button>
}
```

### Conditional Close Behavior

```tsx
open({
  drawerKey: 'important-form',
  component: ImportantForm,
  closeOnEscapeKey: false, // Prevent accidental close
  closeOnBackdropClick: false,
})
```

### Drawer with Loading State

```tsx
function UserDrawer({ userId, close }: UserDrawerProps) {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUserData(data)
      setLoading(false)
    })
  }, [userId])

  if (loading) return <div>Loading...</div>
  return <div>{userData?.name}</div>
}
```
