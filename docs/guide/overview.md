# Overview

Drawerly is a drawer stack management system built around a framework-agnostic core and framework-specific adapters.

## Architecture

The system consists of two types of packages:

**Core Package** (`@drawerly/core`)
Manages the drawer stack (opening, closing, reordering, and updating drawers). Completely framework-agnostic with no dependencies on any UI library.

**Framework Adapters** (e.g., `@drawerly/vue`)
Wrap the core with framework-specific components, composables, and rendering logic. Adapters handle teleporting, lifecycle hooks, and reactivity integration.

## How It Works

At its simplest, the core provides a manager that tracks a stack of drawer instances:

```ts
import { createDrawerManager } from '@drawerly/core'

const manager = createDrawerManager()

manager.open({
  drawerKey: 'settings',
  placement: 'right',
})
```

The manager maintains the stack, determines which drawer is on top, and provides methods like `bringToTop()`, `closeAll()`, and `updateOptions()`. Framework adapters add the rendering layer (components that read from the manager and update the DOM accordingly).

## Available Packages

| Package | Purpose | Documentation |
| --- | --- | --- |
| `@drawerly/core` | Framework-agnostic drawer stack manager | [Core Introduction](/core/introduction) |
| `@drawerly/vue` | Vue 3 adapter with components and composables | [Vue Introduction](/vue/introduction) |

## Reading Order

| If you need… | Start here |
| --- | --- |
| Conceptual understanding of the stack | [Managing the Stack](/core/concepts/managing-stack) |
| Installation and setup for Vue | [Vue Getting Started](/vue/getting-started) |
| API documentation | [Core API](/core/api/) or [Vue API](/vue/api/plugin) |
| Styling and customization | [Vue Styling](/vue/styling) or [Headless Mode](/vue/headless-mode) |

## Building Your Own Adapter

The core is designed to be wrapped. To create an adapter for another framework:

1. Create a manager instance with `createDrawerManager()`
2. Subscribe to state changes with `manager.subscribe()`
3. Render drawers based on the `state.stack` array
4. Expose framework-specific helpers (hooks, components, etc.)

The Vue adapter serves as a reference implementation.
