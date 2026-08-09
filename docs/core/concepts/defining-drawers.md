# Defining Drawers

Every drawer has a set of built-in options: `drawerKey`, `placement`, the close behaviors (`closeOnEscapeKey`, `closeOnBackdropClick`), the ARIA attributes, and `dataAttributes`. The full list is in the [API Reference](../api/#draweroptions).

Real applications usually need more than that: product data, user information, callbacks. Instead of storing that data somewhere else and keeping it in sync, extend the drawer options and let the drawer carry it.

## Extending the Options

Create an interface that extends `DrawerOptions` and pass it to the manager:

```ts
import type { DrawerOptions } from '@drawerly/core'
import { createDrawerManager } from '@drawerly/core'

interface ProductDrawerOptions extends DrawerOptions {
  productId: string
  productName: string
  price: number
  onAddToCart?: (productId: string) => void
}

const manager = createDrawerManager<ProductDrawerOptions>()
```

TypeScript now enforces the custom fields everywhere:

```ts
manager.open({
  drawerKey: 'product-456',
  productId: '456',
  productName: 'Smart Watch',
  price: 199.99,
})

const drawer = manager.getDrawerInstance('product-456')
console.log(drawer?.price) // typed as number | undefined

manager.updateOptions('product-456', {
  price: 149.99, // validated against the interface
})
```

## Default Options

Defaults can be configured per manager and apply to every opened drawer:

```ts
const manager = createDrawerManager<ProductDrawerOptions>({
  defaultOptions: {
    placement: 'left', // overrides the built-in default
    price: 0, // custom fields can have defaults too
  },
})
```

Every manager starts from the built-in `BASE_DRAWER_DEFAULTS` (`placement: 'right'`, `closeOnEscapeKey: true`, `closeOnBackdropClick: true`). Your `defaultOptions` are merged on top, and the options passed to `open()` are merged on top of that, so you only specify what differs. `undefined` and `null` are the exception: they are skipped, so a configured default stays in place instead of being erased. This lets you forward an optional prop as-is, `placement: props.placement`, without an extra check for whether it was actually passed.

## Dynamic Predicates

`closeOnEscapeKey` and `closeOnBackdropClick` also accept a function that receives the drawer instance, including your custom fields. This enables conditional close behavior:

```ts
manager.open({
  drawerKey: 'checkout',
  productId: '999',
  productName: 'Premium Laptop',
  price: 2499.99,

  // Don't let an expensive checkout close by accident
  closeOnBackdropClick: drawer => drawer.price < 1000,
})
```

Adapters evaluate these predicates with the [`resolveDrawerPredicate`](../api/#resolvedrawerpredicate) helper.
