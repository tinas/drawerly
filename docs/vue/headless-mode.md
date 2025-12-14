# Headless Mode

Headless mode gives you complete control over drawer presentation by disabling all built-in UI, animations, and interactions. This is perfect when you want to implement custom animations, use a different UI library, or have specific design requirements that don't fit the default styling.

## What is Headless Mode?

When headless mode is enabled:

**No Animations**: Drawers appear and disappear instantly without slide transitions.

**No Backdrop**: The semi-transparent backdrop is not rendered.

**No Keyboard Handling**: Escape key handling is disabled (you implement it yourself).

**No Backdrop Clicks**: Clicking outside doesn't close drawers (you implement it yourself).

**No Default Styles**: Only the drawer stack structure is maintained; all styling is your responsibility.

**Full Control**: You receive raw drawer data and implement all presentation logic.

::: warning Do You Really Need Headless Mode?
Before implementing headless mode, consider that Drawerly's default mode is already highly customizable through CSS variables. You can achieve most design requirements by simply overriding CSS variables to match your design system without the complexity of headless mode.

**Headless mode is only necessary when:**
- You need fundamentally different animations that can't be achieved with CSS
- You're building a component that wraps Drawerly and needs complete UI control
- You have architectural requirements that demand full rendering control

For most applications, customizing the default styles through CSS variables will be simpler, more maintainable, and require significantly less code than building a custom container from scratch.
:::

## Enabling Headless Mode

Enable headless mode when installing the plugin:

```ts [main.ts]
import { DrawerPlugin } from '@drawerly/vue'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(DrawerPlugin, {
  headless: true, // Enable headless mode
})

app.mount('#app')
```

::: warning
In headless mode, you should NOT import the default styles:
```ts
// ❌ Don't import when using headless mode
import '@drawerly/vue/style.css'
```
:::

## Using Scoped Slots

In headless mode, the backdrop is not rendered, but drawers opened with a `component` option are still rendered automatically. The scoped slot is only used when you open a drawer **without** specifying a component:

```ts
// This drawer will NOT use the scoped slot
open({
  drawerKey: 'user-profile',
  component: UserProfile, // Component is rendered automatically
  componentParams: { userId: '123' },
})

// This drawer WILL use the scoped slot
open({
  drawerKey: 'custom-drawer',
  // No component specified, uses scoped slot instead
})
```

When using the scoped slot:

```vue
<template>
  <DrawerlyContainer>
    <template #default="{ drawer, close }">
      <!-- Your custom drawer UI (only for drawers without component) -->
      <div class="my-drawer">
        <button @click="close">Close</button>
        <!-- Render your custom content here -->
      </div>
    </template>
  </DrawerlyContainer>
</template>
```

### Slot Props

**`drawer`** – The current drawer instance with all its options:
- `drawer.drawerKey` – Unique drawer identifier
- `drawer.placement` – Position (`'top'`, `'right'`, `'bottom'`, `'left'`)
- Any custom fields you defined

**`close`** – Function to close this specific drawer

::: tip
Most applications won't need the scoped slot in headless mode. Simply pass your components when opening drawers, and they'll be rendered automatically without the default backdrop and animations.
:::

## Complete Headless Example

Here's a full example implementing custom drawer UI with a custom backdrop in headless mode:

```vue [App.vue]
<script setup lang="ts">
import { useDrawerContext } from '@drawerly/vue'

const { close } = useDrawerContext()

function handleBackdropClick(drawer) {
  // Check if this drawer allows backdrop clicks
  const canClose = typeof drawer.closeOnBackdropClick === 'function'
    ? drawer.closeOnBackdropClick(drawer)
    : Boolean(drawer.closeOnBackdropClick ?? true)

  if (canClose) {
    close(drawer.drawerKey)
  }
}
</script>

<template>
  <div id="app">
    <YourAppContent />

    <DrawerlyContainer>
      <template #default="{ drawer, close }">
        <Transition :name="`slide-${drawer.placement}`">
          <div
            :key="drawer.drawerKey"
            class="custom-drawer-overlay"
            :data-placement="drawer.placement"
          >
            <!-- Custom backdrop -->
            <div
              class="custom-backdrop"
              @click="handleBackdropClick(drawer)"
            />

            <!-- Drawer panel -->
            <div class="custom-drawer-panel">
              <component
                :is="drawer.component"
                v-bind="{
                  ...drawer.componentParams,
                  drawerKey: drawer.drawerKey,
                  onClose: close,
                }"
              />
            </div>
          </div>
        </Transition>
      </template>
    </DrawerlyContainer>
  </div>
</template>

<style>
/* Overlay wrapper */
.custom-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
}

.custom-drawer-overlay > * {
  pointer-events: auto;
}

/* Custom backdrop styling */
.custom-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* Custom panel */
.custom-drawer-panel {
  position: absolute;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: auto;
}

/* Placement-specific positioning */
.custom-drawer-overlay[data-placement="right"] .custom-drawer-panel {
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
}

.custom-drawer-overlay[data-placement="left"] .custom-drawer-panel {
  top: 0;
  left: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
}

.custom-drawer-overlay[data-placement="top"] .custom-drawer-panel {
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  max-height: 50vh;
}

.custom-drawer-overlay[data-placement="bottom"] .custom-drawer-panel {
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  max-height: 50vh;
}

/* Custom animations */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active,
.slide-top-enter-active,
.slide-top-leave-active,
.slide-bottom-enter-active,
.slide-bottom-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from .custom-drawer-panel,
.slide-right-leave-to .custom-drawer-panel {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-enter-from .custom-backdrop,
.slide-right-leave-to .custom-backdrop {
  opacity: 0;
}

.slide-left-enter-from .custom-drawer-panel,
.slide-left-leave-to .custom-drawer-panel {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-enter-from .custom-backdrop,
.slide-left-leave-to .custom-backdrop {
  opacity: 0;
}

.slide-bottom-enter-from .custom-drawer-panel,
.slide-bottom-leave-to .custom-drawer-panel {
  transform: translateY(100%);
  opacity: 0;
}

.slide-bottom-enter-from .custom-backdrop,
.slide-bottom-leave-to .custom-backdrop {
  opacity: 0;
}

.slide-top-enter-from .custom-drawer-panel,
.slide-top-leave-to .custom-drawer-panel {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-top-enter-from .custom-backdrop,
.slide-top-leave-to .custom-backdrop {
  opacity: 0;
}
</style>
```

::: tip
In headless mode, you have complete control over the backdrop. You can:
- Use a custom backdrop element with your own styling
- Implement custom click handling logic
- Add blur, gradient, or other visual effects
- Omit the backdrop entirely if not needed
:::

## Implementing Custom Interactions

In headless mode, you must implement interactions yourself. Use a separate backdrop element with click handling, similar to the default implementation:

### Custom Backdrop Click

```vue
<script setup lang="ts">
function handleBackdropClick(drawer, close) {
  // Check if this drawer allows backdrop clicks
  const canClose = typeof drawer.closeOnBackdropClick === 'function'
    ? drawer.closeOnBackdropClick(drawer)
    : Boolean(drawer.closeOnBackdropClick ?? true)

  if (canClose) {
    close(drawer.drawerKey)
  }
}
</script>

<template>
  <div class="overlay" :data-placement="drawer.placement">
    <!-- Separate backdrop element -->
    <div
      class="backdrop"
      @click="handleBackdropClick(drawer, close)"
    />

    <div class="panel">
      <!-- Content -->
    </div>
  </div>
</template>
```

### Custom Keyboard Handling

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDrawerContext } from '@drawerly/vue'

const { getState, close } = useDrawerContext()

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    const state = getState()
    const topDrawer = state.stack[state.stack.length - 1]

    if (!topDrawer) return

    const canClose = typeof topDrawer.closeOnEscapeKey === 'function'
      ? topDrawer.closeOnEscapeKey(topDrawer)
      : Boolean(topDrawer.closeOnEscapeKey ?? true)

    if (canClose) {
      close(topDrawer.drawerKey)
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>
```

## Accessing Drawer Stack State

::: tip
The `DrawerlyContainer` automatically renders all drawers in the stack for you. The scoped slot receives each drawer one at a time, and you typically don't need to manually access the stack.
:::

If you need to access the drawer stack for custom logic (like displaying drawer count, checking which drawer is on top, or implementing custom UI based on stack state), use `subscribe` to make the state reactive:

```vue
<script setup lang="ts">
import { useDrawerContext } from '@drawerly/vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const { getState, subscribe } = useDrawerContext()

const stack = ref(getState().stack)
const hasDrawers = computed(() => stack.value.length > 0)
const drawerCount = computed(() => stack.value.length)
const topDrawer = computed(() =>
  stack.value[stack.value.length - 1]
)

let unsubscribe: (() => void) | undefined

onMounted(() => {
  unsubscribe = subscribe((state) => {
    stack.value = state.stack
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<template>
  <div>
    <!-- Display stack information -->
    <div v-if="hasDrawers" class="drawer-info">
      {{ drawerCount }} drawer(s) open
      <div>Top drawer: {{ topDrawer?.drawerKey }}</div>
    </div>

    <!-- DrawerlyContainer handles rendering each drawer -->
    <DrawerlyContainer>
      <template #default="{ drawer, close }">
        <div class="custom-drawer" :data-placement="drawer.placement">
          <component :is="drawer.component" v-bind="drawer.componentParams" />
        </div>
      </template>
    </DrawerlyContainer>
  </div>
</template>
```

::: warning
The drawer manager is framework-agnostic and doesn't use Vue's reactivity system. You **must** use `subscribe` to track state changes reactively. Using `computed(() => getState().stack)` will not work.
:::

## Using External Animation Libraries

Headless mode works great with animation libraries like GSAP, Framer Motion, or Anime.js:

### With GSAP

```vue
<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'

const panelRef = ref<HTMLElement>()

function onBeforeEnter() {
  gsap.set(panelRef.value, { x: '100%' })
}

function onEnter(el: Element, done: () => void) {
  gsap.to(panelRef.value, {
    x: 0,
    duration: 0.3,
    ease: 'power3.out',
    onComplete: done,
  })
}

function onLeave(el: Element, done: () => void) {
  gsap.to(panelRef.value, {
    x: '100%',
    duration: 0.3,
    ease: 'power3.in',
    onComplete: done,
  })
}
</script>

<template>
  <DrawerlyContainer>
    <template #default="{ drawer, close }">
      <Transition
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
        :css="false"
      >
        <div v-if="drawer" ref="panelRef" class="drawer">
          <component :is="drawer.component" />
        </div>
      </Transition>
    </template>
  </DrawerlyContainer>
</template>
```

## Building a Custom Container

::: warning
In most cases, you should use the built-in `DrawerlyContainer` with the scoped slot. Only bypass it if you need complete control over the rendering logic.
:::

If you must build a completely custom container (not recommended for most use cases):

```vue [CustomDrawerContainer.vue]
<script setup lang="ts">
import { useDrawerContext } from '@drawerly/vue'
import { ref, onMounted, onUnmounted } from 'vue'

const { getState, subscribe, close } = useDrawerContext()

const drawers = ref(getState().stack)

let unsubscribe: (() => void) | undefined

function handleEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape') return

  const topDrawer = drawers.value[drawers.value.length - 1]
  if (!topDrawer) return

  // Check if escape key is enabled for this drawer
  const canClose = typeof topDrawer.closeOnEscapeKey === 'function'
    ? topDrawer.closeOnEscapeKey(topDrawer)
    : Boolean(topDrawer.closeOnEscapeKey ?? true)

  if (canClose) {
    close(topDrawer.drawerKey)
  }
}

function handleBackdropClick(drawer: any) {
  const canClose = typeof drawer.closeOnBackdropClick === 'function'
    ? drawer.closeOnBackdropClick(drawer)
    : Boolean(drawer.closeOnBackdropClick ?? true)

  if (canClose) {
    close(drawer.drawerKey)
  }
}

onMounted(() => {
  unsubscribe = subscribe((state) => {
    drawers.value = state.stack
  })

  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  unsubscribe?.()
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="drawers.length > 0" class="drawer-root">
      <TransitionGroup name="drawer">
        <div
          v-for="(drawer, index) in drawers"
          :key="drawer.drawerKey"
          class="drawer-overlay"
          :data-placement="drawer.placement"
          :data-index="index"
        >
          <div
            class="backdrop"
            @click="handleBackdropClick(drawer)"
          />
          <div class="panel">
            <component
              :is="drawer.component"
              v-bind="{
                ...drawer.componentParams,
                drawerKey: drawer.drawerKey,
                onClose: () => close(drawer.drawerKey),
              }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.drawer-overlay > * {
  pointer-events: auto;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.panel {
  position: absolute;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: auto;
}

.drawer-overlay[data-placement="right"] .panel {
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
}

/* Transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from .panel,
.drawer-leave-to .panel {
  transform: translateX(100%);
  opacity: 0;
}

.drawer-enter-from .backdrop,
.drawer-leave-to .backdrop {
  opacity: 0;
}
</style>
```

::: tip
Notice this custom implementation needs to handle:
- Backdrop click logic with `closeOnBackdropClick` checks
- Keyboard handling with `closeOnEscapeKey` checks
- Proper pointer-events management
- Placement-specific positioning
- Subscribe to drawer state changes for reactivity

Using the built-in `DrawerlyContainer` with the scoped slot is much simpler and handles all of this for you.
:::

### Using Your Custom Container

Once you've created your custom container component, use it in your app instead of the global `DrawerlyContainer`:

```vue [App.vue]
<script setup lang="ts">
import CustomDrawerContainer from './components/CustomDrawerContainer.vue'
</script>

<template>
  <div id="app">
    <YourAppContent />

    <!-- Use your custom container instead of DrawerlyContainer -->
    <CustomDrawerContainer />
  </div>
</template>
```

Your custom container will now handle all drawer rendering with your custom logic, animations, and styling.

## When to Use Headless Mode

**Use headless mode when:**
- You need custom animations or transitions
- You have specific design requirements that don't match the defaults
- You want complete control over rendering and styling
- You're building a design system with custom drawer behavior

**Use standard mode when:**
- You want quick setup with good defaults
- The default animations and styling work for your use case
- You don't need deep customization
- You want to minimize custom code

## Performance Considerations

In headless mode:
- Animations don't trigger automatically, reducing overhead
- You control rendering, so optimize as needed
- No unnecessary DOM elements or event listeners from the library
- Smaller bundle size if you don't import default styles

However, you're responsible for:
- Efficient animation implementations
- Proper cleanup of event listeners
- Optimized rendering of drawer components
