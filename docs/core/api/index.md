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

### DrawerUpdatableOptions

```ts
type DrawerUpdatableOptions<TDrawerOptions extends DrawerOptions = DrawerOptions>
  = DrawerOptionsWithoutKey<TDrawerOptions>
```

Options of a drawer that can be updated at runtime.

`drawerKey` is intentionally excluded.

### DrawerDefaultOptions

```ts
type DrawerDefaultOptions<TDrawerOptions extends DrawerOptions = DrawerOptions>
  = Partial<DrawerOptionsWithoutKey<TDrawerOptions>>
```

Default options applied to new drawers.

Partial version of `DrawerUpdatableOptions`.

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
  stack: DrawerInstance<TDrawerOptions>[]
}
```

Drawer manager state.

#### Properties

**`stack`**: `DrawerInstance<TDrawerOptions>[]`

Current drawer stack. The last item is the topmost drawer.

### DrawerManager

```ts
interface DrawerManager<TDrawerOptions extends DrawerOptions = DrawerOptions> {
  getState: () => DrawerState<TDrawerOptions>
  getDrawerInstance: (key: DrawerKey) => DrawerInstance<TDrawerOptions> | undefined
  getDefaultOptions: () => DrawerDefaultOptions<TDrawerOptions> | undefined
  subscribe: (listener: DrawerListener<TDrawerOptions>) => Unsubscribe
  open: (options: TDrawerOptions) => DrawerKey
  close: (key?: DrawerKey) => void
  bringToTop: (key: DrawerKey) => void
  closeAll: () => void
  updateDefaultOptions: (
    updater: (
      prev: DrawerDefaultOptions<TDrawerOptions> | undefined
    ) => DrawerDefaultOptions<TDrawerOptions>
  ) => void
  updateOptions: (
    key: DrawerKey,
    updater: (
      prev: DrawerUpdatableOptions<TDrawerOptions>
    ) => DrawerUpdatableOptions<TDrawerOptions>
  ) => void
}
```

Public API for managing a stack of drawers.

#### Methods

**`getState()`**: `() => DrawerState<TDrawerOptions>`

Returns the current drawer state.

**`getDrawerInstance(key)`**: `(key: DrawerKey) => DrawerInstance<TDrawerOptions> | undefined`

Returns a drawer instance by key, if it exists.

**`getDefaultOptions()`**: `() => DrawerDefaultOptions<TDrawerOptions> | undefined`

Returns the current global default options.

**`subscribe(listener)`**: `(listener: DrawerListener<TDrawerOptions>) => Unsubscribe`

Subscribes to state changes.

**`open(options)`**: `(options: TDrawerOptions) => DrawerKey`

Opens or updates a drawer and moves it to the top of the stack.

Returns the drawer key.

**`close(key?)`**: `(key?: DrawerKey) => void`

Closes the top drawer or the drawer with the given key.

**`bringToTop(key)`**: `(key: DrawerKey) => void`

Moves the drawer with the given key to the top of the stack.

**`closeAll()`**: `() => void`

Closes all drawers.

**`updateDefaultOptions(updater)`**: `(updater: (prev: DrawerDefaultOptions<TDrawerOptions> | undefined) => DrawerDefaultOptions<TDrawerOptions>) => void`

Updates the global default options used for future drawers.

**`updateOptions(key, updater)`**: `(key: DrawerKey, updater: (prev: DrawerUpdatableOptions<TDrawerOptions>) => DrawerUpdatableOptions<TDrawerOptions>) => void`

Updates options for an existing drawer.

The updater receives the current options without `drawerKey` and must return the full updated options (still without `drawerKey`).

## Functions

### createDrawerManager

```ts
function createDrawerManager<TDrawerOptions extends DrawerOptions = DrawerOptions>(
  initialState?: Partial<DrawerState<TDrawerOptions>>,
  defaultOptions?: DrawerDefaultOptions<TDrawerOptions>
): DrawerManager<TDrawerOptions>
```

Creates a new drawer manager backed by an in-memory stack.

#### Parameters

**`initialState`**: `Partial<DrawerState<TDrawerOptions>>` (optional)

Initial state for the drawer manager. Can include a pre-populated stack.

**`defaultOptions`**: `DrawerDefaultOptions<TDrawerOptions>` (optional)

Default options applied to all new drawers. These options are merged with the options provided when opening a drawer.

#### Returns

`DrawerManager<TDrawerOptions>` - A drawer manager instance with methods to manage the drawer stack.
