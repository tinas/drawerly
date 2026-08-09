# API Reference

Complete API documentation for the `@drawerly/core` package.

## Types

### DrawerKey

```ts
type DrawerKey = string
```

Key used to identify a drawer instance.

### DrawerPlacement

```ts
type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'
```

Placement of a drawer relative to the viewport.

### DrawerPredicate

```ts
type DrawerPredicate<TInstance> = boolean | ((instance: TInstance) => boolean)
```

Predicate used for drawer behaviors.

Can be a boolean or a function that receives the drawer instance.

### DrawerOptionsWithoutKey

```ts
type DrawerOptionsWithoutKey<TDrawerOptions extends DrawerOptions = DrawerOptions>
  = Omit<TDrawerOptions, 'drawerKey'>
```

Drawer options without the `drawerKey` field.

### DrawerDefaultOptions

```ts
type DrawerDefaultOptions<TDrawerOptions extends DrawerOptions = DrawerOptions>
  = Partial<DrawerOptionsWithoutKey<TDrawerOptions>>
```

Default options applied to new drawers.

### DrawerPatch

```ts
type DrawerPatch<TDrawerOptions extends DrawerOptions = DrawerOptions>
  = Partial<DrawerOptionsWithoutKey<TDrawerOptions>>
```

Partial set of options merged into a drawer on update.

`drawerKey` is intentionally excluded.

### DrawerInstance

```ts
type DrawerInstance<TDrawerOptions extends DrawerOptions = DrawerOptions>
  = TDrawerOptions
```

Concrete drawer instance (full options including `drawerKey`).

### DrawerListener

```ts
type DrawerListener<TDrawerOptions extends DrawerOptions = DrawerOptions>
  = (state: DrawerState<TDrawerOptions>) => void
```

Listener called whenever the drawer state changes.

### Unsubscribe

```ts
type Unsubscribe = () => void
```

Function that unsubscribes a state listener.

## Interfaces

### DrawerOptions

```ts
interface DrawerOptions {
  drawerKey: DrawerKey
  placement?: DrawerPlacement
  closeOnEscapeKey?: DrawerPredicate<this>
  closeOnBackdropClick?: DrawerPredicate<this>
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaLabelledBy?: string
  dataAttributes?: Record<
    `data-${string}`,
    string | number | boolean | null | undefined
  >
}
```

Shared options for all drawers.

Adapters should extend this interface for framework-specific fields.

#### Properties

**`drawerKey`**: `DrawerKey`

Unique key identifying the drawer instance.

**`placement`**: `DrawerPlacement` (optional)

Drawer placement.

Default: `'right'`

**`closeOnEscapeKey`**: `DrawerPredicate<this>` (optional)

Whether pressing Escape closes the drawer.

When a function is provided, it is called with the drawer instance.

Default: `true`

**`closeOnBackdropClick`**: `DrawerPredicate<this>` (optional)

Whether clicking the backdrop closes the drawer.

When a function is provided, it is called with the drawer instance.

Default: `true`

**`ariaLabel`**: `string` (optional)

ARIA label for the drawer panel.

**`ariaDescribedBy`**: `string` (optional)

ARIA `describedby` id for the drawer panel.

**`ariaLabelledBy`**: `string` (optional)

ARIA `labelledby` id for the drawer panel.

**`dataAttributes`**: `Record<`data-${string}`, string | number | boolean | null | undefined>` (optional)

Extra data attributes applied to the overlay element.

### DrawerState

```ts
interface DrawerState<TDrawerOptions extends DrawerOptions = DrawerOptions> {
  stack: readonly DrawerInstance<TDrawerOptions>[]
}
```

Drawer manager state.

#### Properties

**`stack`**: `readonly DrawerInstance<TDrawerOptions>[]`

Current drawer stack. The last item is the topmost drawer.

### DrawerManagerConfig

```ts
interface DrawerManagerConfig<TDrawerOptions extends DrawerOptions = DrawerOptions> {
  initialStack?: readonly DrawerInstance<TDrawerOptions>[]
  defaultOptions?: DrawerDefaultOptions<TDrawerOptions>
}
```

Configuration accepted by `createDrawerManager`.

#### Properties

**`initialStack`**: `readonly DrawerInstance<TDrawerOptions>[]` (optional)

Drawers present in the stack when the manager is created. Each entry goes through the same default merging as `open()`.

**`defaultOptions`**: `DrawerDefaultOptions<TDrawerOptions>` (optional)

Global default options merged into every opened drawer.

Merged on top of `BASE_DRAWER_DEFAULTS`.

### DrawerManager

```ts
interface DrawerManager<TDrawerOptions extends DrawerOptions = DrawerOptions> {
  getState: () => DrawerState<TDrawerOptions>
  getDrawerInstance: (key: DrawerKey) => DrawerInstance<TDrawerOptions> | undefined
  getTopDrawer: () => DrawerInstance<TDrawerOptions> | undefined
  isOpen: (key: DrawerKey) => boolean
  getDefaultOptions: () => DrawerDefaultOptions<TDrawerOptions>
  subscribe: (listener: DrawerListener<TDrawerOptions>) => Unsubscribe
  open: (options: TDrawerOptions) => DrawerKey
  close: (key?: DrawerKey) => void
  bringToTop: (key: DrawerKey) => void
  closeAll: () => void
  updateDefaultOptions: (patch: DrawerDefaultOptions<TDrawerOptions>) => void
  updateOptions: (key: DrawerKey, patch: DrawerPatch<TDrawerOptions>) => void
}
```

Public API for managing a stack of drawers.

#### Methods

**`getState()`**: `() => DrawerState<TDrawerOptions>`

Returns the current drawer state.

**`getDrawerInstance(key)`**: `(key: DrawerKey) => DrawerInstance<TDrawerOptions> | undefined`

Returns a drawer instance by key, if it exists.

**`getTopDrawer()`**: `() => DrawerInstance<TDrawerOptions> | undefined`

Returns the topmost drawer instance, if any.

**`isOpen(key)`**: `(key: DrawerKey) => boolean`

Returns whether a drawer with the given key is in the stack.

**`getDefaultOptions()`**: `() => DrawerDefaultOptions<TDrawerOptions>`

Returns the current global default options. Always returns an object, since the built-in `BASE_DRAWER_DEFAULTS` are applied to every manager.

**`subscribe(listener)`**: `(listener: DrawerListener<TDrawerOptions>) => Unsubscribe`

Subscribes to state changes.

**`open(options)`**: `(options: TDrawerOptions) => DrawerKey`

Opens a drawer at the top of the stack. If a drawer with the same key is already open, its options are replaced, not merged. Fields set to `undefined` or `null` are skipped, so a configured default stays in place instead of being erased.

Returns the drawer key.

**`close(key?)`**: `(key?: DrawerKey) => void`

Closes the top drawer or the drawer with the given key.

**`bringToTop(key)`**: `(key: DrawerKey) => void`

Moves the drawer with the given key to the top of the stack.

**`closeAll()`**: `() => void`

Closes all drawers.

**`updateDefaultOptions(patch)`**: `(patch: DrawerDefaultOptions<TDrawerOptions>) => void`

Merges a patch into the global default options used for future drawers. `undefined` and `null` entries in the patch are skipped and leave the current default in place.

**`updateOptions(key, patch)`**: `(key: DrawerKey, patch: DrawerPatch<TDrawerOptions>) => void`

Merges a patch into the options of an existing drawer. `drawerKey` cannot be changed through a patch, and `undefined`/`null` entries are skipped, leaving the drawer's current value in place.

## Constants

### BASE_DRAWER_DEFAULTS

```ts
const BASE_DRAWER_DEFAULTS = {
  placement: 'right',
  closeOnEscapeKey: true,
  closeOnBackdropClick: true,
} as const satisfies DrawerDefaultOptions
```

Built-in defaults applied to every drawer manager.

User-provided `defaultOptions` are merged on top of these values.

## Functions

### createDrawerManager

```ts
function createDrawerManager<TDrawerOptions extends DrawerOptions = DrawerOptions>(
  config?: DrawerManagerConfig<TDrawerOptions>
): DrawerManager<TDrawerOptions>
```

Creates a new drawer manager backed by an in-memory stack.

#### Parameters

**`config`**: `DrawerManagerConfig<TDrawerOptions>` (optional)

Manager configuration. `initialStack` pre-populates the drawer stack, going through the same default merging as `open()`. `defaultOptions` provides global defaults merged on top of `BASE_DRAWER_DEFAULTS`.

#### Returns

`DrawerManager<TDrawerOptions>` - A drawer manager instance with methods to manage the drawer stack.

### resolveDrawerPredicate

```ts
function resolveDrawerPredicate<TInstance>(
  predicate: DrawerPredicate<TInstance> | undefined,
  instance: TInstance,
  fallback = true
): boolean
```

Resolves a `DrawerPredicate` against a drawer instance.

Adapters use this helper to evaluate boolean-or-function options such as `closeOnEscapeKey` and `closeOnBackdropClick`.

#### Parameters

**`predicate`**: `DrawerPredicate<TInstance> | undefined`

The predicate to resolve. Booleans are returned as-is, and functions are called with the drawer instance.

**`instance`**: `TInstance`

The drawer instance passed to function predicates.

**`fallback`**: `boolean` (optional)

Value returned when the predicate is `undefined`.

Default: `true`

#### Returns

`boolean` - The resolved predicate value.

## `@drawerly/core/dom`

Framework-agnostic DOM helpers used by the adapters, imported from a separate subpath:

```ts
import { lockScroll } from '@drawerly/core/dom'
```

### lockScroll

```ts
function lockScroll(): () => void
```

Prevents the page from scrolling and returns a release function.

Locks are reference counted: overlapping calls only restore the original styles once the last one is released, so this is safe to call from more than one open drawer at a time. On iOS Safari, where `overflow: hidden` on `<body>` does not stop scrolling, it takes the page out of flow instead and restores the scroll position on release.

#### Returns

`() => void` - Releases this lock. Safe to call more than once.
