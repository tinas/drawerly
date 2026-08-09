# @drawerly/vue

## 0.2.0

### Minor Changes

- [#6](https://github.com/tinas/drawerly/pull/6) [`47e674c`](https://github.com/tinas/drawerly/commit/47e674cb99adc0e796e488637ecff492526aa871) Thanks [@tinas](https://github.com/tinas)! - Rework the public API of both packages ahead of the first stable release.

  **@drawerly/core**

  - `createDrawerManager` now accepts a single `DrawerManagerConfig` object (`initialStack`, `defaultOptions`) instead of positional arguments. Drawers passed through `initialStack` go through the same default merging as `open`.
  - Built-in defaults (`BASE_DRAWER_DEFAULTS`) are always applied; `getDefaultOptions()` always returns an object.
  - Options passed as `undefined` or `null` no longer erase a configured default.
  - `open` documents its replace semantics: opening an already open key replaces its options rather than merging them.
  - `updateOptions` and `updateDefaultOptions` accept a patch object. The updater-function form is removed; read the current value with `getDrawerInstance` or `getDefaultOptions` instead.
  - State changes are dispatched in order when a listener opens or closes a drawer while being notified.
  - `DrawerState.stack` is now `readonly`.
  - Added `getTopDrawer()`, `isOpen(key)`, and the `resolveDrawerPredicate` helper. Removed the `DrawerUpdatableOptions` type in favor of `DrawerPatch`.
  - New `@drawerly/core/dom` entry point exporting `lockScroll`, a reference counted body scroll lock with scrollbar compensation.
  - The stylesheet now drives enter and leave animations through `drawerly-enter-active` / `drawerly-leave-active` classes on the overlay instead of the `data-entering` / `data-closing` attributes. Custom stylesheets need to be updated.
  - The package is now ESM only.

  **@drawerly/vue**

  - `DrawerPlugin` is replaced by the `createDrawerly()` factory. The returned instance exposes the full manager API plus a reactive `state` ref, installs with `app.use()`, and is usable outside components. Its manager reads are derived from `state`, so they work inside computed properties and render functions.
  - `useDrawerContext()` is replaced by `useDrawerly()`; `useDrawerInstance()` is replaced by `useDrawer()`, which adds `isTop` and `instance`. Drawers are opened through `useDrawerly().open()`.
  - `useDrawer()` mirrors the manager operations that take a drawer key with the key already bound, and nothing else. The `placement`, `closeOnEscapeKey` and `closeOnBackdropClick` two-way bindings are removed; read them from `instance` and write them through `updateOptions`, which also keeps function predicates intact.
  - `componentParams` is renamed to `componentProps`.
  - Drawer content receives only its own `componentProps` plus `drawerKey`. The injected `onClose` prop is removed; call `useDrawer(props.drawerKey).close()` instead.
  - `teleportTo` moved from plugin options to a `<DrawerlyContainer>` prop, alongside the new `modal` and `lockScroll` props. The `headless` mode is removed.
  - The container is rebuilt on `<TransitionGroup>`: transition timing is handled by Vue, every close path plays the exit animation, and body scroll stays locked until it finishes.
  - Container events are now `drawer-opened`, `drawer-closed` and `all-closed`, each emitted after the matching animation.
  - `install` registers the container idempotently and warns when a second instance is installed into the same app; independent scoped stacks are supported by providing `drawerlyInjectionKey` in a subtree.
  - The package is now ESM only.

  Focus management (focus trap, initial focus, focus restore and background `inert`) is not part of this release and lands in a follow-up.

### Patch Changes

- Updated dependencies [[`47e674c`](https://github.com/tinas/drawerly/commit/47e674cb99adc0e796e488637ecff492526aa871)]:
  - @drawerly/core@0.2.0

## 0.1.0

### Minor Changes

- [#1](https://github.com/tinas/drawerly/pull/1) [`87f2841`](https://github.com/tinas/drawerly/commit/87f28412c8affbbf97afee12d4c235bc3abf0271) Thanks [@tinas](https://github.com/tinas)! - Initial release of Drawerly - A flexible drawer/modal management library.

  - drawerly-core: Core drawer management system with stack handling and styling
  - drawerly-vue: Vue 3 integration with composables, plugin, and components

### Patch Changes

- Updated dependencies [[`87f2841`](https://github.com/tinas/drawerly/commit/87f28412c8affbbf97afee12d4c235bc3abf0271)]:
  - @drawerly/core@0.1.0
