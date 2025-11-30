# @drawerly/vue

A lightweight, stack-based drawer system for Vue 3 — with optional headless mode and pluggable UI.

Drawerly gives you a powerful global drawer manager with zero configuration.
Use the built-in animated UI or run completely headless and render your own DOM.

## ✨ Features

- Global drawer stack with predictable behavior
- Framework-agnostic core, Vue-optimized adapter
- Optional headless mode
- Teleport-based rendering
- Built-in animation & layout (importable CSS)
- Type-safe drawer options with extensible component props
- No external dependencies
- Perfect for real-world apps with multiple drawers

## 📦 Installation

```bash
npm install @drawerly/vue
# or
pnpm add @drawerly/vue

```

## 🎨 Styles (optional)

Drawerly ships with configurable CSS variables.
If you want the default Drawerly UI (backdrop, slide animations, panel layout), simply import:

```ts
import '@drawerly/vue/style.css'
```

## 🖌️ Overriding CSS Variables (Global)

Add overrides in your global stylesheet:

```css
/* Example: increase drawer width & change backdrop color */
[data-drawerly-root] {
  --drawerly-panel-width: 480px;
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.65);
  --drawerly-panel-radius: 12px;
}
```

| Variable                         | Description                         | Default           |
| -------------------------------- | ----------------------------------- | ----------------- |
| `--drawerly-panel-width`         | Drawer width (left/right)           | `400px`           |
| `--drawerly-panel-height`        | Drawer height (top/bottom)          | `300px`           |
| `--drawerly-backdrop-bg`         | Backdrop color                      | `rgba(0,0,0,0.5)` |
| `--drawerly-panel-bg`            | Panel background                    | `white`           |
| `--drawerly-panel-shadow`        | Panel shadow                        | subtle shadow     |
| `--drawerly-transition-duration` | Animation duration                  | `300ms`           |
| `--drawerly-transition-timing`   | Easing                              | cubic-bezier      |
| `--drawerly-panel-radius`        | Border radius applied per placement | `8px`             |
| `--drawerly-z-index`             | Global z-index                      | `1000`            |

## 🎯 Placement-Aware Border Radius

Drawerly automatically applies `--drawerly-panel-radius` based on placement:

```css
/* Example override */
[data-drawerly-root] {
  --drawerly-panel-radius: 16px;
}
```

This is interpreted internally as:
- Right drawer → rounded top-left + bottom-left
- Left drawer → rounded top-right + bottom-right
- Top drawer → rounded bottom-left + bottom-right
- Bottom drawer → rounded top-left + top-right

You don’t need to handle corner logic manually.

## 🎨 Runtime Styling with Custom Attributes

Drawerly uses a single global container.
You can attach your own data attributes to this container to dynamically adjust styles at runtime.

```vue
<DrawerlyContainer data-theme="marketing" />
```

Then override variables based on your attribute:

```css
[data-drawerly-root][data-theme="marketing"] {
  --drawerly-panel-width: 600px;
  --drawerly-backdrop-bg: rgba(255, 0, 100, 0.4);
}
```

This does not create multiple containers.
You are simply applying thematic overrides to the one global container that Drawerly uses.

## 🪶 Headless Mode: No Styles Required

```vue
<DrawerlyContainer headless />
```

Headless mode disables:
- Backdrop
- Animations
- Radius & panel styling
- Drawerly’s base layout

You are free to render and animate everything manually.

## 🚀 Quick Start

1. Register the plugin

```ts
import { DrawerPlugin } from '@drawerly/vue'
import { createApp } from 'vue'

import App from './App.vue'
import '@drawerly/vue/style.css' // optional

const app = createApp(App)

app.use(DrawerPlugin, {
  defaultOptions: {
    placement: 'right',
    closeOnBackdrop: true,
  },
})

app.mount('#app')
```

2. Place the container

Drawerly automatically teleports its UI into the DOM:

```vue
<template>
  <DrawerlyContainer />
  <AppContent />
</template>
```

3. Open a drawer

```ts
import { useDrawer } from '@drawerly/vue'
import SettingsDrawer from './SettingsDrawer.vue'

const drawer = useDrawer({
  drawerKey: 'settings',
  component: SettingsDrawer,
  componentProps: {
    userId: '123',
  },
})

drawer.open()
```

4. Drawer component example

```vue
<script setup>
defineProps<{
  userId: string
}>()

defineEmits(['close'])
</script>

<template>
  <div class="p-4">
    <h2>Settings</h2>
    <button @click="$emit('close')">Close</button>
  </div>
</template>
```

When the component emits close, Drawerly will animate & close it automatically.

## 🧩 Defining Drawer Types

Drawerly allows fully typed drawer configurations:

```ts
interface ProfileDrawerOptions extends VueDrawerOptions {
  componentProps: {
    userId: string
    showBilling: boolean
  }
}

const drawer = useDrawer<ProfileDrawerOptions>({
  drawerKey: 'profile',
  component: ProfileDrawer,
  componentProps: {
    userId: '1',
    showBilling: false,
  },
})
```
