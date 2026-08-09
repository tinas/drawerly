# createDrawerly API Reference

Factory that creates a `Drawerly` instance. Create it once at module scope and export it; there is no provider to install. Hooks and the container take the instance directly:

```ts [drawerly.ts]
import { createDrawerly } from '@drawerly/react'

export const drawerly = createDrawerly({
  defaultOptions: {
    placement: 'right',
  },
})
```

## Type Definition

```ts
interface DrawerlyOptions<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions
> {
  /**
   * Global default options applied to new drawers.
   */
  defaultOptions?: DrawerDefaultOptions<TDrawerOptions>
}

type Drawerly<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions
> = DrawerManager<TDrawerOptions>

function createDrawerly<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions
>(options?: DrawerlyOptions<TDrawerOptions>): Drawerly<TDrawerOptions>
```

## Options

### `defaultOptions`

- **Type**: `DrawerDefaultOptions<ReactDrawerOptions>`
- **Default**: `undefined`

Global defaults merged into every opened drawer. Individual drawer options always override them. Any field of `ReactDrawerOptions` is accepted (`placement`, `closeOnEscapeKey`, `closeOnBackdropClick`, the ARIA attributes, `dataAttributes`), plus any custom fields you define. The base options are documented in the [core API reference](/core/api/#draweroptions).

::: info
Rendering-related settings (the portal target, modal behavior, and scroll locking) are props on `<DrawerlyContainer>`, not instance options. See the [DrawerlyContainer API Reference](./drawer-container.md).
:::

## The Drawerly Instance

The returned instance implements the full [`DrawerManager` API](/core/api/#drawermanager). It is a plain object, so it works the same inside and outside components:

```ts
// router.ts
import { drawerly } from './drawerly'

router.subscribe(() => {
  drawerly.closeAll()
})
```

Inside components, [`useDrawerly(drawerly)`](./use-drawerly.md) subscribes to the same instance and adds the reactive `stack`.

## Typed Drawer Options

Pass a generic to extend the drawer options with custom fields. The type flows through the instance to every hook and container that receives it:

```ts
import type { ReactDrawerOptions } from '@drawerly/react'

interface ProductDrawerOptions extends ReactDrawerOptions {
  productId: string
  price: number
}

export const drawerly = createDrawerly<ProductDrawerOptions>()
```

## Multiple Instances

One instance per application is the intended setup. For an independent drawer stack in part of the UI, create a second instance and render a container for it:

```tsx [EditorPane.tsx]
import { createDrawerly, DrawerlyContainer } from '@drawerly/react'

export const editorDrawers = createDrawerly()

export function EditorPane() {
  return (
    <>
      <EditorContent />

      {/* Renders only the editor's own stack */}
      <DrawerlyContainer drawerly={editorDrawers} />
    </>
  )
}
```

Each container renders only the stack of the instance it received, so the two stacks never interfere.
