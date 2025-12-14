# DrawerPlugin API Reference

Vue plugin that registers a global drawer manager and the `DrawerlyContainer` component.

## Installation

```ts
import { DrawerPlugin } from '@drawerly/vue'
import { createApp } from 'vue'
import '@drawerly/vue/style.css'

const app = createApp(App)

app.use(DrawerPlugin, {
  // Optional configuration
  defaultOptions: {
    placement: 'right',
    closeOnEscapeKey: true,
    closeOnBackdropClick: true,
  },
  teleportTo: 'body',
  headless: false,
})

app.mount('#app')
```

## Type Definition

```ts
interface DrawerPluginOptions {
  /**
   * Global default options applied to new drawers.
   */
  defaultOptions?: DrawerDefaultOptions<VueDrawerOptions>

  /**
   * Teleport target for the drawer container.
   *
   * @defaultValue 'body'
   */
  teleportTo?: string

  /**
   * Enables headless mode on the container.
   *
   * @defaultValue false
   */
  headless?: boolean
}

const DrawerPlugin: Plugin
```

## Options

### `defaultOptions`

- **Type**: `DrawerDefaultOptions<VueDrawerOptions>`
- **Optional**: Yes
- **Default**: `undefined`

Global default options applied to all drawers. These options are merged with the options provided when opening a drawer.

```ts
app.use(DrawerPlugin, {
  defaultOptions: {
    placement: 'right',
    closeOnEscapeKey: true,
    closeOnBackdropClick: true,
    ariaLabel: 'Drawer',
  },
})
```

Available default options:

- `placement` – Default drawer position (`'top'`, `'right'`, `'bottom'`, `'left'`)
- `closeOnEscapeKey` – Whether Escape key closes drawers (default: `true`)
- `closeOnBackdropClick` – Whether clicking backdrop closes drawers (default: `true`)
- `ariaLabel` – Default ARIA label for drawer panels
- `ariaDescribedBy` – Default ARIA describedby id
- `ariaLabelledBy` – Default ARIA labelledby id
- `dataAttributes` – Default data attributes applied to all drawers
- Any custom fields you define in your extended drawer options

::: tip
Individual drawer options always override these defaults.
:::

### `teleportTo`

- **Type**: `string`
- **Optional**: Yes
- **Default**: `'body'`

CSS selector or element where the drawer container is teleported. This determines where drawers are rendered in the DOM tree.

```ts
app.use(DrawerPlugin, {
  teleportTo: 'body', // Default
})

// Or target a specific element
app.use(DrawerPlugin, {
  teleportTo: '#drawer-root',
})
```

::: warning
Ensure the target element exists in the DOM before the container mounts. For dynamic targets, consider using a `ref` and conditional rendering.
:::

### `headless`

- **Type**: `boolean`
- **Optional**: Yes
- **Default**: `false`

Enables headless mode, which disables all built-in UI, animations, and interactions. In headless mode, you have complete control over drawer presentation through scoped slots.

```ts
app.use(DrawerPlugin, {
  headless: true,
})
```

When headless mode is enabled:
- No animations or transitions
- No backdrop rendering
- No keyboard (Escape) handling
- No backdrop click handling
- You must implement all UI logic

See the [Headless Mode Guide](../headless-mode.md) for details.

## What the Plugin Provides

### Global Drawer Manager

The plugin creates a global `DrawerManager` instance and provides it to all components via:

**Vue 3 Composition API**:
```ts
import { useDrawerContext } from '@drawerly/vue'

const { open, close, closeAll } = useDrawerContext()
```

**Vue 3 Options API**:
```ts
export default {
  methods: {
    openDrawer() {
      this.$drawerly.open({
        drawerKey: 'my-drawer',
        component: MyComponent,
      })
    },
  },
}
```

**Type Definition** (for Options API):
```ts
declare module 'vue' {
  interface ComponentCustomProperties {
    /**
     * Global drawer manager registered by DrawerPlugin.
     */
    $drawerly: DrawerManager<VueDrawerOptions>
  }
}
```

### Global DrawerlyContainer Component

The plugin registers `DrawerlyContainer` as a global component:

```vue
<template>
  <div id="app">
    <YourAppContent />

    <!-- No import needed - registered globally -->
    <DrawerlyContainer />
  </div>
</template>
```

**Type Definition**:
```ts
declare module 'vue' {
  interface GlobalComponents {
    /**
     * Root container that renders the active drawer stack.
     */
    DrawerlyContainer: typeof DrawerlyContainer
  }
}
```

## Notes

- **Single Installation**: Install the plugin once in your application's main entry file.

- **Global State**: The drawer manager is shared across all components in the app.

- **Type Safety**: Use TypeScript to extend `VueDrawerOptions` for custom drawer types.

- **Plugin Order**: Install `DrawerPlugin` before mounting the app but after other plugins that may affect routing or state management.
