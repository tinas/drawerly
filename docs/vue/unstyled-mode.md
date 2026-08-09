# Unstyled Mode

Drawerly separates behavior from presentation. The container manages the stack, interactions, accessibility, and animations through a stable set of data attributes; the default stylesheet is just one consumer of them. If CSS variable overrides ([Styling](./styling.md)) aren't enough, drop the stylesheet and design everything yourself.

## Skipping the Stylesheet

Unstyled mode is not a flag. It is simply not importing the default stylesheet:

```ts [main.ts]
import { createDrawerly } from '@drawerly/vue'

// No style import
// import '@drawerly/vue/style.css'

const drawerly = createDrawerly()
```

Everything else keeps working: Escape and backdrop-click closing and scroll locking stay active. You style the structure through the data attributes the container renders:

```css
[data-drawerly-overlay] {
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
}

[data-drawerly-overlay] > * {
  pointer-events: auto;
}

[data-drawerly-backdrop] {
  position: absolute;
  inset: 0;
  background: rgb(15 23 42 / 0.4);
}

[data-drawerly-panel] {
  position: absolute;
  background: white;
  overflow: auto;
}

[data-drawerly-placement='right'] [data-drawerly-panel] {
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
}

/* left, top, and bottom placements follow the same pattern */
```

The full attribute list is in the [DrawerlyContainer API Reference](./api/drawer-container.md#data-attributes).

## Custom Animations

The container is a `<TransitionGroup>`, so Vue drives the timing: it applies `.drawerly-enter-active` while a drawer enters and `.drawerly-leave-active` while it leaves, then waits for `transitionend`/`animationend` before removing a closing drawer from the DOM:

```css
[data-drawerly-overlay].drawerly-enter-active [data-drawerly-panel] {
  animation: my-slide-in 250ms ease-out;
}

[data-drawerly-overlay].drawerly-leave-active [data-drawerly-panel] {
  animation: my-slide-out 250ms ease-in;
}

@keyframes my-slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes my-slide-out {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}
```

::: warning
Vue reads the transition duration off the overlay element itself, not its descendants. Define a transition or animation directly on `[data-drawerly-overlay].drawerly-enter-active` / `.drawerly-leave-active` as well, even a plain opacity fade; a panel-only animation is invisible to Vue's timing and the drawer is removed immediately. The default styles already do this.
:::

Respect `prefers-reduced-motion` in your own animations. When it disables them, Vue detects the zero duration and finishes the transition immediately, so nothing gets stuck.

## Non-Modal Drawers

By default drawers are modal: a backdrop and `aria-modal` semantics. Set `modal` to `false` to keep the page interactive behind the drawers:

```vue
<DrawerlyContainer :modal="false" />
```

Escape handling remains active and still honors each drawer's `closeOnEscapeKey` option. Scroll locking is a separate `lockScroll` prop and can be turned off independently of `modal`. See the [`modal`](./api/drawer-container.md#modal) and [`lockScroll`](./api/drawer-container.md#lockscroll) props for details.

## Building a Custom Container

For complete control over markup and behavior, skip `<DrawerlyContainer>` entirely and render the stack yourself. The instance exposes a reactive `state` ref, so a custom container is ordinary Vue code:

```vue [CustomDrawerContainer.vue]
<script setup lang="ts">
import { resolveDrawerPredicate } from '@drawerly/core'
import { useDrawerly } from '@drawerly/vue'
import { computed, onMounted, onUnmounted } from 'vue'

const drawerly = useDrawerly()

const drawers = computed(() => drawerly.state.value.stack)

function handleEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape')
    return

  const top = drawerly.getTopDrawer()
  if (top && resolveDrawerPredicate(top.closeOnEscapeKey, top))
    drawerly.close(top.drawerKey)
}

onMounted(() => document.addEventListener('keydown', handleEscape))
onUnmounted(() => document.removeEventListener('keydown', handleEscape))
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="drawer" tag="div" class="drawer-root">
      <div
        v-for="drawer in drawers"
        :key="drawer.drawerKey"
        class="drawer-overlay"
        :data-placement="drawer.placement"
      >
        <div
          class="backdrop"
          @click="resolveDrawerPredicate(drawer.closeOnBackdropClick, drawer)
            && drawerly.close(drawer.drawerKey)"
        />
        <div class="panel">
          <component
            :is="drawer.component"
            v-bind="{ ...drawer.componentProps, drawerKey: drawer.drawerKey }"
          />
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>
```

Drawer content closes itself the same way it would inside the built-in container, with `useDrawer(props.drawerKey).close()`.

::: warning Accessibility is your responsibility
The built-in container provides scroll locking (`lockScroll` from [`@drawerly/core/dom`](/core/api/#lockscroll)) and ARIA dialog semantics. A custom container implements none of this automatically. For most applications, unstyled mode with the built-in container is the better trade-off.
:::

## Reading the Stack

The same reactive `state` ref powers any custom UI driven by the stack, such as a drawer count badge or a top-drawer indicator:

```ts
const drawerly = useDrawerly()

const hasDrawers = computed(() => drawerly.state.value.stack.length > 0)
const topDrawer = computed(() => drawerly.state.value.stack.at(-1))
```
