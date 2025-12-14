# Styling

The Vue adapter uses the same CSS styling system as `@drawerly/core`, with full support for CSS custom properties and data attributes. This guide shows you how to customize the appearance of your Vue drawers.

## Including the Styles

Import the default stylesheet when installing the plugin:

```ts [main.ts]
import { DrawerPlugin } from '@drawerly/vue'
import { createApp } from 'vue'
import App from './App.vue'

import '@drawerly/vue/style.css' // Import default styles

const app = createApp(App)

app.use(DrawerPlugin)
app.mount('#app')
```

::: info
`@drawerly/vue/style.css` re-exports the styles from `@drawerly/core`, so you don't need to import both.
:::

## CSS Architecture

The styling uses data attributes for state-based styling:

- `[data-drawerly-root]` – Root container element
- `[data-drawerly-overlay]` – Wrapper for each drawer
- `[data-drawerly-backdrop]` – Semi-transparent backdrop
- `[data-drawerly-panel]` – The drawer panel containing your component
- `[data-drawerly-placement]` – Position attribute (`'top'`, `'right'`, `'bottom'`, `'left'`)
- `[data-top]` – Marks the topmost (active) drawer
- `[data-entering]` – Applied during entrance animation
- `[data-closing]` – Applied during exit animation

## Customization with CSS Variables

The easiest way to customize drawers is by overriding CSS variables:

```css
/* In your global styles or App.vue */
[data-drawerly-root] {
  /* Backdrop */
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.7);

  /* Panel appearance */
  --drawerly-panel-bg: #1e1e1e;
  --drawerly-panel-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  --drawerly-panel-width: 500px;
  --drawerly-panel-height: 400px;
  --drawerly-panel-radius: 12px;

  /* Animations */
  --drawerly-transition-duration: 250ms;
  --drawerly-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-index */
  --drawerly-z-index: 1000;
}
```

## Placement-Specific Styling

Customize drawers based on their placement:

```css
/* Right-side drawers (default) */
[data-drawerly-placement="right"] {
  --drawerly-panel-width: 600px;
}

/* Left-side drawers */
[data-drawerly-placement="left"] {
  --drawerly-panel-width: 300px;
}

/* Bottom drawers (mobile sheets) */
[data-drawerly-placement="bottom"] {
  --drawerly-panel-height: 400px;
  --drawerly-panel-radius: 16px 16px 0 0;
}

/* Top drawers (notifications) */
[data-drawerly-placement="top"] {
  --drawerly-panel-height: 120px;
  --drawerly-panel-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

## Styling with Scoped CSS

In Vue SFC (Single File Components), you can style drawer content using scoped styles:

```vue [UserProfile.vue]
<script setup lang="ts">
defineProps<{
  userId: string
  onClose: () => void
}>()
</script>

<template>
  <div class="user-profile">
    <header class="header">
      <h2>User Profile</h2>
      <button class="close-btn" @click="onClose">✕</button>
    </header>

    <div class="content">
      <!-- Content -->
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.header {
  flex-shrink: 0;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #111827;
}
</style>
```

## Theme Support

### Dark Mode

Implement dark mode with CSS variables and Vue's reactive theming:

```vue [App.vue]
<script setup lang="ts">
import { ref, watch } from 'vue'

const isDark = ref(false)

watch(isDark, (dark) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
})
</script>

<template>
  <div id="app">
    <button @click="isDark = !isDark">
      Toggle Theme
    </button>

    <DrawerlyContainer />
  </div>
</template>

<style>
/* Light theme (default) */
:root[data-theme="light"] [data-drawerly-root] {
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.3);
  --drawerly-panel-bg: #ffffff;
  --drawerly-panel-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Dark theme */
:root[data-theme="dark"] [data-drawerly-root] {
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.8);
  --drawerly-panel-bg: #1e1e1e;
  --drawerly-panel-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}
</style>
```

### System Preference

Respond to system color scheme preference:

```css
@media (prefers-color-scheme: dark) {
  [data-drawerly-root] {
    --drawerly-backdrop-bg: rgba(0, 0, 0, 0.8);
    --drawerly-panel-bg: #1e1e1e;
  }
}
```

## Custom Data Attributes

Use the `dataAttributes` option to add styling hooks to specific drawers:

```ts
const { open } = useDrawerContext()

open({
  drawerKey: 'premium-feature',
  component: PremiumFeature,
  dataAttributes: {
    'data-premium': true,
    'data-category': 'settings',
  },
})
```

Then target these attributes in your CSS:

```css
/* Premium drawers get gold styling */
[data-drawerly-overlay][data-premium="true"] {
  --drawerly-panel-bg: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

/* Category-based styling */
[data-drawerly-overlay][data-category="settings"] [data-drawerly-panel] {
  border-left: 4px solid #3b82f6;
}
```

## Responsive Design

Create responsive drawer styles that adapt to screen size:

```css
/* Mobile: Bottom sheets */
@media (max-width: 768px) {
  [data-drawerly-placement="right"] [data-drawerly-panel],
  [data-drawerly-placement="left"] [data-drawerly-panel] {
    top: auto !important;
    right: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 80vh !important;
    max-height: 80vh !important;
    border-radius: 16px 16px 0 0 !important;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  [data-drawerly-root] {
    --drawerly-panel-width: 360px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  [data-drawerly-root] {
    --drawerly-panel-width: 480px;
  }
}

/* Full-screen on small devices */
@media (max-width: 640px) {
  [data-drawerly-panel] {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }
}
```

## Animations

### Custom Animation Timing

```css
[data-drawerly-root] {
  /* Faster animations */
  --drawerly-transition-duration: 200ms;

  /* Or slower */
  --drawerly-transition-duration: 500ms;

  /* Custom easing curve */
  --drawerly-transition-timing: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Custom Slide Animations

Override the default slide animations:

```css
/* Fade only, no slide */
@keyframes custom-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

[data-drawerly-overlay][data-entering] {
  animation: custom-fade-in var(--drawerly-transition-duration) ease-out;
}

/* Scale and fade */
@keyframes scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

[data-drawerly-overlay][data-entering] [data-drawerly-panel] {
  animation: scale-in var(--drawerly-transition-duration)
    cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Reduced Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  [data-drawerly-root] {
    --drawerly-transition-duration: 0.001ms;
  }

  [data-drawerly-backdrop],
  [data-drawerly-panel] {
    animation: none !important;
    transition: none !important;
  }
}
```

## Stack Visualization

Show depth by styling non-top drawers differently:

```css
/* Non-top drawers are slightly scaled */
[data-drawerly-overlay]:not([data-top]) [data-drawerly-panel] {
  transform: scale(0.95);
  filter: brightness(0.9);
  opacity: 0.8;
}

/* Staggered offset for depth effect */
[data-drawerly-placement="right"]:not([data-top]) [data-drawerly-panel] {
  right: 20px;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.2);
}

/* Progressive dimming for deeper drawers */
[data-drawerly-overlay]:nth-last-child(3) [data-drawerly-panel] {
  transform: scale(0.90);
}

[data-drawerly-overlay]:nth-last-child(4) [data-drawerly-panel] {
  transform: scale(0.85);
}
```

## Panel Content Styling

### Scrollable Content

```css
[data-drawerly-panel] {
  overflow-y: auto;
  overflow-x: hidden;
}

/* Custom scrollbar */
[data-drawerly-panel]::-webkit-scrollbar {
  width: 8px;
}

[data-drawerly-panel]::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

[data-drawerly-panel]::-webkit-scrollbar-track {
  background: transparent;
}
```

### Safe Area Insets

Support for mobile safe areas (notches, home indicators):

```css
[data-drawerly-panel] {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

## Backdrop Customization

### Blur Effect

```css
[data-drawerly-backdrop] {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

### Gradient Backdrop

```css
[data-drawerly-backdrop] {
  background: linear-gradient(
    135deg,
    rgba(66, 135, 245, 0.3),
    rgba(139, 92, 246, 0.3)
  );
}
```

### No Backdrop

```css
[data-drawerly-backdrop] {
  display: none;
}
```

## Component-Level Styling

Create reusable drawer components with built-in styles:

```vue [BaseDrawer.vue]
<script setup lang="ts">
defineProps<{
  title?: string
  onClose: () => void
}>()

defineSlots<{
  default: () => any
  header?: () => any
  footer?: () => any
}>()
</script>

<template>
  <div class="base-drawer">
    <header v-if="$slots.header || title" class="drawer-header">
      <slot name="header">
        <h2>{{ title }}</h2>
      </slot>
      <button class="close-button" @click="onClose">
        ✕
      </button>
    </header>

    <main class="drawer-body">
      <slot />
    </main>

    <footer v-if="$slots.footer" class="drawer-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.base-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--drawer-bg, white);
}

.drawer-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--drawer-border, #e5e7eb);
  background: var(--drawer-header-bg, transparent);
}

.drawer-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.drawer-footer {
  flex-shrink: 0;
  padding: 1.5rem;
  border-top: 1px solid var(--drawer-border, #e5e7eb);
  background: var(--drawer-footer-bg, transparent);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--drawer-text-secondary, #6b7280);
  transition: color 0.2s;
  padding: 0.25rem;
  line-height: 1;
}

.close-button:hover {
  color: var(--drawer-text-primary, #111827);
}
</style>
```

Use it in your drawers:

```vue
<script setup lang="ts">
import BaseDrawer from '@/components/BaseDrawer.vue'

defineProps<{
  userId: string
  onClose: () => void
}>()
</script>

<template>
  <BaseDrawer title="User Profile" :on-close="onClose">
    <template #footer>
      <button @click="onClose">Close</button>
    </template>

    <!-- Main content -->
    <div>User details...</div>
  </BaseDrawer>
</template>
```

## Loading States

Style drawers with loading states using custom data attributes:

```ts
const { open, updateOptions } = useDrawerContext()

// Open with loading state
open({
  drawerKey: 'user-profile',
  component: UserProfile,
  dataAttributes: {
    'data-loading': true,
  },
})

// Later, remove loading state
updateOptions('user-profile', prev => ({
  ...prev,
  dataAttributes: {
    'data-loading': false,
  },
}))
```

```css
/* Loading overlay */
[data-drawerly-overlay][data-loading] [data-drawerly-panel] {
  pointer-events: none;
  position: relative;
}

[data-drawerly-overlay][data-loading] [data-drawerly-panel]::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Loading spinner */
[data-drawerly-overlay][data-loading] [data-drawerly-panel]::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  z-index: 11;
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
```

## Best Practices

**CSS Variables Over Direct Overrides**: Always prefer customizing through CSS variables rather than directly overriding drawer element styles. This ensures your customizations remain compatible with future updates.

**Z-Index at Root Level**: Only set `--drawerly-z-index` on `[data-drawerly-root]` to position the entire drawer system within your app's layer hierarchy. Never set z-index on individual drawer elements as this will break the stack ordering.

**Data Attributes for Custom Styling**: Use the `dataAttributes` option to add custom styling hooks to specific drawers rather than relying on drawer keys or component names in your CSS selectors.

**Loading State Management**: When implementing loading states, use custom data attributes (like `data-loading`) to toggle visual feedback, allowing you to style different loading scenarios without modifying component code.
