# createDrawerly API Reference

Factory that creates a `Drawerly` instance to be installed with `app.use()`. Installing it provides the instance to the component tree so [`useDrawerly()`](./use-drawerly.md) and [`useDrawer()`](./use-drawer.md) can resolve it.

```ts
import { createDrawerly } from '@drawerly/vue'
import { createApp } from 'vue'
import '@drawerly/vue/style.css'

const app = createApp(App)

app.use(createDrawerly({
  defaultOptions: {
    placement: 'right',
  },
}))

app.mount('#app')
```

## Type Definition

```ts
interface DrawerlyOptions<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions
> {
  /**
   * Global default options applied to new drawers.
   */
  defaultOptions?: DrawerDefaultOptions<TDrawerOptions>
}

interface Drawerly<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions
> extends DrawerManager<TDrawerOptions> {
  /**
   * Reactive drawer state. Updated on every manager change.
   */
  state: Readonly<ShallowRef<DrawerState<TDrawerOptions>>>

  /**
   * Installs the instance into a Vue application.
   */
  install: (app: App) => void
}

function createDrawerly<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions
>(options?: DrawerlyOptions<TDrawerOptions>): Drawerly<TDrawerOptions>
```

## Options

### `defaultOptions`

- **Type**: `DrawerDefaultOptions<VueDrawerOptions>`
- **Default**: `undefined`

Global defaults merged into every opened drawer. Individual drawer options always override them. Any field of `VueDrawerOptions` is accepted (`placement`, `closeOnEscapeKey`, `closeOnBackdropClick`, the ARIA attributes, `dataAttributes`), plus any custom fields you define. The base options are documented in the [core API reference](/core/api/#draweroptions).

::: info
Rendering-related settings (the teleport target, modal behavior, and scroll locking) are props on `<DrawerlyContainer>`, not instance options. See the [DrawerlyContainer API Reference](./drawer-container.md).
:::

## The Drawerly Instance

The returned instance implements the full [`DrawerManager` API](/core/api/#drawermanager) and adds:

### `state`

- **Type**: `Readonly<ShallowRef<DrawerState<VueDrawerOptions>>>`

Reactive drawer state, updated on every manager change. Use it to derive reactive values in components:

```ts
const stack = computed(() => drawerly.state.value.stack)
```

### `install(app)`

Vue plugin hook, invoked by `app.use(drawerly)`.

The instance is a plain object and works outside components too:

```ts [drawerly.ts]
import { drawerly } from './drawerly'

export const drawerly = createDrawerly()
```

```ts [router.ts]
router.beforeEach(() => {
  drawerly.closeAll()
})
```

## What Installing Provides

Installing calls `app.provide(drawerlyInjectionKey, drawerly)` so that [`useDrawerly()`](./use-drawerly.md) and [`useDrawer()`](./use-drawer.md) resolve the instance from any component in the tree. Render the stack by importing `DrawerlyContainer` and placing it once in your app root:

```vue [App.vue]
<script setup lang="ts">
import { DrawerlyContainer } from '@drawerly/vue'
</script>

<template>
  <div id="app">
    <YourAppContent />
    <DrawerlyContainer />
  </div>
</template>
```

Components passed through `open`, `updateOptions`, or `updateDefaultOptions` are automatically wrapped with `markRaw()`, so Vue does not make them reactive.

## Multiple Instances

One instance per application is the intended setup. Installing a second instance into the same app replaces the first for injection, because the second `app.provide()` call overrides the first.

For an independent drawer stack in part of the component tree, create an instance without installing it and provide it to the subtree with the exported injection key. The `<DrawerlyContainer>` and all `useDrawerly()` / `useDrawer()` calls inside that subtree bind to the scoped instance:

```vue [EditorPane.vue]
<script setup lang="ts">
import { createDrawerly, DrawerlyContainer, drawerlyInjectionKey } from '@drawerly/vue'
import { provide } from 'vue'

const editorDrawers = createDrawerly()
provide(drawerlyInjectionKey, editorDrawers)
</script>

<template>
  <EditorContent />

  <!-- Renders only the editor's own stack -->
  <DrawerlyContainer />
</template>
```

Injection follows the component tree, not the teleported DOM, so drawer content components inside the scoped container also resolve the scoped instance.
