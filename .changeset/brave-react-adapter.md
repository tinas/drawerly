---
'@drawerly/react': minor
---

Initial release of the React adapter.

- `createDrawerly()` creates a store-style instance at module scope, usable both inside components and outside of them (event handlers, stores, ...). No provider is required.
- `useDrawerly(drawerly)` subscribes to the instance and returns the manager API together with the drawer stack. Its manager reads come from the subscribed snapshot, so render output stays consistent with the stack a render was given.
- `useDrawer(drawerly, key)` mirrors the manager operations that take a drawer key with the key already bound: `isOpen`, `isTop`, `instance`, `close`, `bringToTop` and `updateOptions`.
- `<DrawerlyContainer drawerly={instance} />` renders and animates the stack through a portal (`portalTo`, default `body`), with `modal` and `lockScroll` props matching the Vue adapter.
- Drawer content receives only its own `componentProps` plus `drawerKey`; call `useDrawer(drawerly, props.drawerKey).close()` to close it. Drawers without a `component` render through the container's `children` render prop, which also receives `close`.
- Exit animations are awaited through `Element.getAnimations()`, so every close path plays its animation, delays and iteration counts are respected, and no timers are involved. Body scroll stays locked until the animation finishes.
- Lifecycle callbacks are `onDrawerOpened`, `onDrawerClosed` and `onAllClosed`, each called after the matching animation.
- The package is ESM only.

Focus management (focus trap, initial focus, focus restore and background `inert`) is not part of this release and lands in a follow-up, together with the Vue adapter.
