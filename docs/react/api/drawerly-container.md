# DrawerlyContainer

The root container component that renders the active drawer stack.

## Usage

```tsx
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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `portalTarget` | `string` | `'body'` | CSS selector for the portal target element |
| `headless` | `boolean` | `false` | Disable built-in animations and styling |
| `children` | `(props: DrawerlyContainerRenderProps) => ReactNode` | – | Render function for custom drawer content when no component is specified |

## How It Works

`DrawerlyContainer` is responsible for:

1. **Subscribing to drawer state** – Uses the `useDrawer()` hook to subscribe to the global drawer manager
2. **Portal rendering** – Creates a portal to render drawers outside the normal DOM hierarchy
3. **Keyboard handling** – Listens for Escape key to close the topmost drawer
4. **SSR safety** – Returns `null` on the server, renders only on the client

## Portal Target

By default, drawers are rendered as children of `<body>`. You can change this:

```tsx
<DrawerlyContainer portalTarget="#drawer-container" />
```

::: warning
The portal target element must exist in the DOM before `DrawerlyContainer` mounts.
:::

## Headless Mode

When `headless` is `true`, the component:

- Does not render the backdrop
- Does not apply animations
- Does not handle backdrop clicks
- Still handles keyboard events

```tsx
<DrawerlyContainer headless />
```

Use headless mode when you want complete control over drawer styling and animations.

## Children Render Prop

The `children` prop accepts a render function that's called for each drawer when no `component` or `render` option is specified. This works similarly to Vue's scoped slots:

```tsx
<DrawerlyContainer headless>
  {({ drawer, contentProps }) => (
    <div className="custom-drawer" data-placement={drawer.placement}>
      <button onClick={contentProps.close}>Close</button>
    </div>
  )}
</DrawerlyContainer>
```

### Render Props

| Prop | Type | Description |
|------|------|-------------|
| `drawer` | `ReactDrawerOptions` | The current drawer instance with all its options |
| `contentProps` | `ReactDrawerContentProps` | Contains `drawerKey` and `close` function |

See [Headless Mode](/react/headless-mode) for more details.

## SSR / Next.js

The component is SSR-safe:

```tsx [app/layout.tsx]
import { DrawerlyContainer } from '@drawerly/react'
import '@drawerly/react/style.css'

export default function RootLayout({ children }) {
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

On the server, `DrawerlyContainer` renders nothing. On the client, it hydrates and begins rendering the drawer stack.

## DOM Structure

When drawers are open, the rendered structure looks like:

```html
<body>
  <!-- Your app content -->

  <!-- Portal target (body by default) -->
  <div data-drawerly-root>
    <div data-drawerly-overlay data-drawerly-key="drawer-1" data-drawerly-index="0">
      <div data-drawerly-backdrop></div>
      <div data-drawerly-panel role="dialog" aria-modal="true">
        <!-- Your drawer content -->
      </div>
    </div>
  </div>
</body>
```

## Data Attributes

The component adds data attributes for styling:

| Attribute | Description |
|-----------|-------------|
| `data-drawerly-root` | Root container |
| `data-headless` | Present when in headless mode |
| `data-drawerly-overlay` | Individual drawer overlay |
| `data-drawerly-key` | Drawer's unique key |
| `data-drawerly-index` | Position in stack (0-based) |
| `data-drawerly-count` | Total number of drawers |
| `data-drawerly-placement` | Current placement |
| `data-top` | Present on the topmost drawer |
| `data-closing` | Present during close animation |
| `data-entering` | Present during open animation |
