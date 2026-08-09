# DrawerlyContainer API Reference

Component that renders and animates the active drawer stack of the instance it receives. One container per application is enough, placed in your root component:

```tsx
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

## Props

### `drawerly`

- **Type**: `Drawerly`
- **Required**

The instance created by `createDrawerly()` whose stack this container renders.

### `portalTo`

- **Type**: `string`
- **Default**: `'body'`

CSS selector for the element the drawer stack is portaled to. The target must exist in the DOM before the container mounts.

```tsx
<DrawerlyContainer drawerly={drawerly} portalTo="#drawer-portal" />
```

### `modal`

- **Type**: `boolean`
- **Default**: `true`

Renders drawers as modal dialogs. In modal mode the container renders a backdrop behind each drawer and sets `aria-modal="true"` on the panel.

With `modal={false}` neither applies and the page stays interactive behind the drawers. Escape handling remains active and honors each drawer's `closeOnEscapeKey` option.

```tsx
<DrawerlyContainer drawerly={drawerly} modal={false} />
```

### `lockScroll`

- **Type**: `boolean`
- **Default**: `true`

Locks body scrolling, restoring the previous inline styles, while a modal drawer is on screen. The lock is held until any exit animation finishes and is reference counted, so it composes safely with a scroll lock used elsewhere in the page. Backed by [`lockScroll`](/core/api/#lockscroll) from `@drawerly/core/dom`. Has no effect when `modal` is `false`.

```tsx
<DrawerlyContainer drawerly={drawerly} lockScroll={false} />
```

## Render Prop

### `children`

- **Type**: `(props: { drawer: DrawerInstance, close: () => void }) => ReactNode`

Fallback content for drawers opened without a `component`. The render prop receives the drawer instance (with all its options and custom fields) and a function that closes that drawer:

```tsx
<DrawerlyContainer drawerly={drawerly}>
  {({ drawer, close }) => (
    <div className="my-drawer-content">
      <h2>{drawer.title}</h2>
      <button onClick={close}>Close</button>
    </div>
  )}
</DrawerlyContainer>
```

```ts
// No component: renders through the render prop
drawerly.open({
  drawerKey: 'my-drawer',
  title: 'Hello',
})
```

When a `component` is provided, it is rendered instead of the render prop.

## Callbacks

### `onDrawerOpened`

Called when a drawer enters the stack. Payload: `{ key: DrawerKey }`.

### `onDrawerClosed`

Called when a drawer finishes closing, after its exit animation completes. Payload: `{ key: DrawerKey }`.

### `onAllClosed`

Called when the last drawer has finished closing and the stack is empty. No payload.

```tsx
<DrawerlyContainer
  drawerly={drawerly}
  onDrawerOpened={({ key }) => console.log('opened', key)}
  onDrawerClosed={({ key }) => console.log('closed', key)}
  onAllClosed={() => console.log('all closed')}
/>
```

## Accessibility

Each panel renders with `role="dialog"` and, in modal mode, `aria-modal="true"`. The `ariaLabel` / `ariaLabelledBy` / `ariaDescribedBy` drawer options are forwarded to it. Focus trapping, initial focus, and focus restore are not implemented yet.

## Animations

The container toggles the `drawerly-enter-active` class while a drawer enters and `drawerly-leave-active` while it leaves, then awaits `Element.getAnimations({ subtree: true })` on the overlay before removing it from the DOM. Every path that removes a drawer, a single close, `closeAll()`, or a direct call on the instance, plays the exit animation this way, and body scroll stays locked for as long as a closing drawer is still visible. When `prefers-reduced-motion` disables animations there is nothing to await, so the drawer is removed immediately. See [Custom Animations](../unstyled-mode.md#custom-animations) for the CSS contract.

## DOM Structure

```html
<div data-drawerly-root>
  <div data-drawerly-overlay
       data-drawerly-key="drawer-1"
       data-drawerly-index="0"
       data-drawerly-count="1"
       data-drawerly-placement="right"
       data-top>
    <div data-drawerly-backdrop></div>
    <div data-drawerly-panel
         role="dialog"
         tabindex="-1"
         aria-modal="true"
         aria-label="...">
      <!-- Your component or render prop content renders here -->
    </div>
  </div>
</div>
```

In non-modal mode the backdrop element and `aria-modal` are omitted.

## Data Attributes

- `[data-drawerly-root]`: root container
- `[data-drawerly-overlay]`: wrapper for each drawer
- `[data-drawerly-backdrop]`: backdrop element
- `[data-drawerly-panel]`: the drawer panel
- `[data-drawerly-placement]`: position (`'top'`, `'right'`, `'bottom'`, `'left'`)
- `[data-drawerly-key]`: drawer key
- `[data-drawerly-index]`: position in the stack, 0-based
- `[data-drawerly-count]`: total number of drawers
- `[data-top]`: present on the topmost drawer

Custom attributes from the drawer's `dataAttributes` option are also applied to the overlay element. Names starting with `data-drawerly` are reserved and filtered out. Enter and leave animations key off the `drawerly-enter-active` / `drawerly-leave-active` classes instead, see [Animations](#animations) above.

## Notes

Portals cannot render during SSR, so the stack is mounted client-side only.
