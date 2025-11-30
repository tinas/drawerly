# @drawerly/core

Lightweight, framework-agnostic drawer state management.

`@drawerly/core` provides the core stack engine used by all Drawerly framework adapters
(Vue, React, Svelte, Solid, Angular, etc.).
It does not render UI and contains **no DOM logic** — only internal drawer lifecycle
and stack control.

## Features

- Framework-agnostic state engine
- Simple, predictable drawer stack model
- Fully typed API with extensible drawer options
- Subscribe to lifecycle changes
- Zero dependencies
- Small footprint — ideal for UI libraries

## Installation

```bash
npm install @drawerly/core
# or
pnpm add @drawerly/core
```

## Quick Example

```ts
import { createDrawerManager } from '@drawerly/core'

const drawer = createDrawerManager()

drawer.open({
  drawerKey: 'settings',
})

drawer.open({
  drawerKey: 'profile',
})

drawer.close('settings')

console.log(drawer.getState().stack)
```
