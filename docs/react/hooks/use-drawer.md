# useDrawer

The unified hook for managing drawers in React. Works in two modes based on whether a drawer key is provided.

## Usage

```tsx
import { useDrawer } from '@drawerly/react'

// Manager mode - full control over all drawers
const { open, close, closeAll, stack } = useDrawer()

// Instance mode - control a specific drawer
const { isOpen, close, placement, setPlacement } = useDrawer('my-drawer')
```

## Manager Mode

When called without arguments, `useDrawer()` returns the full manager API:

```tsx
function DrawerManager() {
  const { open, close, closeAll, stack, bringToTop } = useDrawer()

  return (
    <div>
      <p>
        Open drawers:
        {stack.length}
      </p>
      <button onClick={() => open({ drawerKey: 'demo', component: Demo })}>
        Open Demo
      </button>
      <button onClick={() => close()}>Close Top</button>
      <button onClick={closeAll}>Close All</button>
    </div>
  )
}
```

### Manager Mode Return Value

| Property | Type | Description |
|----------|------|-------------|
| `stack` | `DrawerInstance[]` | Current drawer stack (last is topmost) |
| `open` | `(options) => DrawerKey` | Opens a drawer or moves existing to top |
| `close` | `(key?) => void` | Closes top drawer or specific drawer by key |
| `closeAll` | `() => void` | Closes all open drawers |
| `bringToTop` | `(key) => void` | Moves a drawer to the top of the stack |
| `updateOptions` | `(key, updater) => void` | Updates drawer options |
| `getState` | `() => DrawerState` | Returns current state snapshot |
| `getDrawerInstance` | `(key) => DrawerInstance?` | Returns a drawer by key |

## Instance Mode

When called with a drawer key, `useDrawer(key)` returns reactive state and controls for that specific drawer:

```tsx
function DrawerControls({ drawerKey }: { drawerKey: string }) {
  const {
    isOpen,
    placement,
    setPlacement,
    close,
    bringToTop,
  } = useDrawer(drawerKey)

  if (!isOpen)
    return <p>Drawer is closed</p>

  return (
    <div>
      <p>
        Placement:
        {placement}
      </p>
      <button onClick={close}>Close</button>
      <button onClick={() => setPlacement('left')}>Move Left</button>
      <button onClick={bringToTop}>Bring to Top</button>
    </div>
  )
}
```

### Instance Mode Return Value

| Property | Type | Description |
|----------|------|-------------|
| `isOpen` | `boolean` | Whether the drawer is in the stack |
| `placement` | `DrawerPlacement` | Current placement (`'right'`, `'left'`, `'top'`, `'bottom'`) |
| `closeOnEscapeKey` | `boolean` | Whether Escape closes the drawer |
| `closeOnBackdropClick` | `boolean` | Whether backdrop click closes the drawer |
| `options` | `object` | All current options (excluding component/render) |
| `close` | `() => void` | Closes this drawer |
| `bringToTop` | `() => void` | Moves this drawer to top |
| `setPlacement` | `(placement) => void` | Updates placement |
| `setCloseOnEscapeKey` | `(value) => void` | Updates escape key behavior |
| `setCloseOnBackdropClick` | `(value) => void` | Updates backdrop click behavior |
| `updateOptions` | `(updater) => void` | Updates any options |

## Opening Drawers

### With a Component

```tsx
open({
  drawerKey: 'user-profile',
  component: UserProfile,
  componentProps: {
    userId: '123',
  },
})
```

The component receives `drawerKey` and `close` automatically:

```tsx
interface UserProfileProps extends ReactDrawerContentProps {
  userId: string
}

function UserProfile({ userId, drawerKey, close }: UserProfileProps) {
  return (
    <div>
      <h2>
        User
        {userId}
      </h2>
      <button onClick={close}>Close</button>
    </div>
  )
}
```

### With a Render Function

```tsx
open({
  drawerKey: 'quick-info',
  render: ({ drawerKey, close }) => (
    <div>
      <p>
        Drawer:
        {drawerKey}
      </p>
      <button onClick={close}>Close</button>
    </div>
  ),
})
```

## Drawer Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `drawerKey` | `string` | **required** | Unique identifier for the drawer |
| `component` | `ComponentType` | – | React component to render |
| `componentProps` | `object` | – | Props passed to the component |
| `render` | `(props) => ReactNode` | – | Render function (takes precedence over component) |
| `placement` | `'right' \| 'left' \| 'top' \| 'bottom'` | `'right'` | Drawer position |
| `closeOnEscapeKey` | `boolean` | `true` | Close on Escape key press |
| `closeOnBackdropClick` | `boolean` | `true` | Close on backdrop click |
| `ariaLabel` | `string` | – | Accessibility label |
| `ariaLabelledBy` | `string` | – | ID of labelling element |
| `ariaDescribedBy` | `string` | – | ID of describing element |
