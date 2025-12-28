# Introduction

`@drawerly/react` is the React 18 adapter for Drawerly, providing a complete solution for managing drawer stacks in React applications. It builds on top of [@drawerly/core](/core/introduction) and provides React-specific hooks and components with seamless integration using `useSyncExternalStore`.

## Key Features

- **No Context Provider Required** – Module-level singleton manager, no provider wrapper needed
- **Unified Hook API** – Single `useDrawer` hook works as manager or instance controller
- **SSR Safe** – Built with `useSyncExternalStore` for proper server-side rendering
- **Stable Callbacks** – Hooks return stable function references across renders
- **Automatic Animation** – Smooth slide-in/slide-out transitions out of the box
- **Component Rendering** – Pass React components or render functions as drawer content
- **Headless Mode** – Use without built-in UI for complete customization
- **Type-Safe** – Full TypeScript support with proper generics

## Quick Look

```tsx
import { DrawerlyContainer, useDrawer } from '@drawerly/react'
import '@drawerly/react/style.css'

function App() {
  return (
    <>
      <HomePage />
      <DrawerlyContainer />
    </>
  )
}

function HomePage() {
  const { open } = useDrawer()

  return (
    <button onClick={() => open({
      drawerKey: 'user-profile',
      component: UserProfile,
      componentProps: { userId: '123' },
    })}>
      View Profile
    </button>
  )
}
```

## Architecture

The React adapter provides:

**Module-level Singleton**: The drawer manager is created once at the module level, making it accessible anywhere without React Context.

**DrawerlyContainer**: Component that renders the drawer stack via a portal with animations and handles user interactions.

**useDrawer()**: Unified hook that returns manager controls when called without arguments, or instance controls when called with a drawer key.

**drawer**: Imperative API for opening/closing drawers from anywhere, even outside React components.

## How It Works

1. **Add the Root**: Include `<DrawerlyContainer />` in your app template (typically in `App.tsx`). This component renders all open drawers via a portal.

2. **Open Drawers**: Use `useDrawer()` in any component to access the drawer manager and open drawers with React components.

3. **Component Communication**: Pass props to drawer components via `componentProps` and receive `close` callback automatically.

The drawer manager maintains an in-memory stack. When you open a drawer, it's added to the stack or moved to the top if it already exists. The root component subscribes to stack changes and re-renders accordingly.

## Component-Based Drawers

Render React components inside drawers:

```tsx
open({
  drawerKey: 'product-detail',
  component: ProductDetail,
  componentProps: {
    productId: '123',
    onAddToCart: (id: string) => {
      console.log('Added to cart:', id)
    },
  },
})
```

The root automatically renders your component with the specified props, plus:
- `drawerKey`: The key of the current drawer
- `close`: Callback to close the drawer

## Render Functions

Alternatively, use a render function for inline content:

```tsx
open({
  drawerKey: 'quick-info',
  render: ({ close }) => (
    <div>
      <h2>Quick Info</h2>
      <button onClick={close}>Close</button>
    </div>
  ),
})
```

## Unified Hook API

The `useDrawer` hook has two modes based on arguments:

```tsx
// Manager mode - full control over all drawers
const { open, close, closeAll, stack } = useDrawer()

// Instance mode - control a specific drawer
const { isOpen, close, placement, setPlacement } = useDrawer('my-drawer')
```

This provides a clean API that adapts to your needs.

## Comparison with Core

While `@drawerly/core` is framework-agnostic and focuses purely on state management, `@drawerly/react` provides:

- React 18 `useSyncExternalStore` integration
- Component rendering inside drawers
- Portal-based rendering via `DrawerlyContainer`
- Built-in animations and transitions
- SSR support out of the box
- TypeScript integration with React types

If you need drawer management for non-React code or want to build your own UI layer, use `@drawerly/core`. If you're building a React 18+ application and want a complete solution, use `@drawerly/react`.
