# Defining Drawers

The core package provides a framework-agnostic drawer management system that supports **extensible, type-safe custom options**. This guide shows you how to extend the base drawer configuration with your own properties to create drawers tailored to your application's needs.

## The Concept

Every drawer in the system has a set of built-in options like `drawerKey`, `placement`, and accessibility properties. But real applications need more (you might want to pass product data, user information, or custom callbacks to your drawers).

The core package is designed to let you **extend** the base drawer options with any properties you need, while maintaining full type safety. Your custom fields become part of the drawer's identity and are available everywhere you interact with that drawer.

## Why Extend Drawer Options?

In traditional drawer implementations, you might store drawer-related data separately from the drawer state. This creates synchronization issues and makes your code harder to maintain. By extending drawer options, you get:

**Single Source of Truth**: All data related to a drawer lives together in one place.

**Type Safety**: TypeScript ensures you never access properties that don't exist or forget required fields.

**Flexibility**: Add any data structure your application needs (primitives, objects, functions, etc.).

**Framework Independence**: The core package doesn't impose UI constraints. You define what data matters.

## Extending the Base Options

### Understanding DrawerOptions

The base interface provides essential drawer functionality:

- `drawerKey`: Unique identifier for each drawer instance
- `placement`: Where the drawer appears (`'top'`, `'right'`, `'bottom'`, `'left'`)
- `closeOnEscapeKey`: Whether pressing Escape closes the drawer
- `closeOnBackdropClick`: Whether clicking outside closes the drawer
- `ariaLabel`, `ariaDescribedBy`, `ariaLabelledBy`: Accessibility attributes
- `dataAttributes`: Custom data attributes for styling or testing

These options handle the mechanics of drawer behavior and accessibility. Your extensions add domain-specific data.

### Creating Custom Drawer Types

To extend the base options, create an interface that extends `DrawerOptions`:

```ts
import type { DrawerOptions } from '@drawerly/core'

interface MyCustomDrawerOptions extends DrawerOptions {
  // Add your custom fields here
  title: string
  data: any
  onAction?: () => void
}
```

Now every drawer using `MyCustomDrawerOptions` will have both the built-in options and your custom fields.

## Practical Examples

### E-commerce Product Drawer

For an e-commerce application, you might need product details and purchase actions:

```ts
interface ProductDrawerOptions extends DrawerOptions {
  productId: string
  productName: string
  price: number
  imageUrl?: string
  inStock: boolean
  onAddToCart?: (productId: string) => void
  onWishlist?: (productId: string) => void
}
```

This drawer carries all the information needed to display and interact with a product.

### User Profile Drawer

For a user management system:

```ts
interface UserDrawerOptions extends DrawerOptions {
  userId: string
  username: string
  email: string
  role: 'admin' | 'user' | 'guest'
  avatar?: string
  isOnline: boolean
  onSendMessage?: (userId: string) => void
  onBlock?: (userId: string) => void
}
```

### Multi-Step Form Drawer

For wizards or multi-step processes:

```ts
interface WizardDrawerOptions extends DrawerOptions {
  wizardId: string
  currentStep: number
  totalSteps: number
  stepData: Record<string, any>
  canGoBack: boolean
  canGoNext: boolean
  onStepChange?: (step: number) => void
  onComplete?: (data: Record<string, any>) => void
}
```

### Notification Drawer

For displaying notifications or alerts:

```ts
interface NotificationDrawerOptions extends DrawerOptions {
  notificationId: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}
```

## Creating a Typed Manager

Once you've defined your custom options, create a manager typed to those options:

```ts
import { createDrawerManager } from '@drawerly/core'

const productDrawers = createDrawerManager<ProductDrawerOptions>()
const userDrawers = createDrawerManager<UserDrawerOptions>()
const notificationDrawers = createDrawerManager<NotificationDrawerOptions>()
```

Each manager is now fully typed to its specific drawer type. TypeScript will enforce that you provide the correct fields when opening drawers.

## Default Options

You can set default values that apply to all drawers of a specific type:

```ts
const productDrawers = createDrawerManager<ProductDrawerOptions>(
  undefined, // Initial state
  {
    // Defaults for all product drawers
    placement: 'right',
    closeOnEscapeKey: true,
    closeOnBackdropClick: true,
    inStock: true // Your custom default
  }
)
```

When you open a drawer, these defaults merge with the options you provide. You only need to specify what's different:

```ts
productDrawers.open({
  drawerKey: 'product-123',
  productId: '123',
  productName: 'Wireless Headphones',
  price: 99.99
  // placement, closeOnEscapeKey, etc. come from defaults
})
```

## Dynamic Predicates

The `closeOnEscapeKey` and `closeOnBackdropClick` options can be functions that receive the drawer instance. This lets you make decisions based on your custom data:

```ts
productDrawers.open({
  drawerKey: 'premium-product',
  productId: '999',
  productName: 'Premium Laptop',
  price: 2499.99,
  inStock: false,

  // Conditional behavior based on your custom fields
  closeOnEscapeKey: drawer => drawer.inStock === true,
  closeOnBackdropClick: drawer => drawer.price < 1000
})
```

When the drawer is expensive or out of stock, you can prevent accidental closes by making the predicate return `false`.

## Type Safety in Action

TypeScript ensures your custom fields are always available and correctly typed:

```ts
// Opening a drawer - TypeScript requires all fields
productDrawers.open({
  drawerKey: 'product-456',
  productId: '456', // Required
  productName: 'Smart Watch', // Required
  price: 199.99, // Required
  inStock: true, // Required
  imageUrl: '/watch.jpg' // Optional
})

// Getting a drawer - TypeScript knows the type
const drawer = productDrawers.getDrawerInstance('product-456')
if (drawer) {
  console.log(drawer.productName) // TypeScript knows this exists
  console.log(drawer.price) // And this

  // TypeScript prevents typos
  // console.log(drawer.pricee) // Error: Property 'pricee' does not exist
}

// Updating a drawer - TypeScript validates the fields
productDrawers.updateOptions('product-456', current => ({
  ...current,
  price: 149.99, // TypeScript knows this is a number
  inStock: false // TypeScript knows this is a boolean
}))
```

## Common Patterns

### Component-Based Drawers

If your framework uses components, you can reference them in your options:

```ts
interface ComponentDrawerOptions extends DrawerOptions {
  component: React.ComponentType | VueComponent | string
  props: Record<string, any>
}
```

### Async Data Loading

For drawers that fetch data:

```ts
interface AsyncDrawerOptions extends DrawerOptions {
  isLoading: boolean
  error?: string
  data?: any
  refetch?: () => Promise<void>
}
```

### Tracking Relationships

For drawers that need to track their relationship to other drawers:

```ts
interface RelatedDrawerOptions extends DrawerOptions {
  parentDrawerKey?: string // Reference to parent drawer
  relatedDrawers?: string[] // Keys of related drawers
  groupId?: string // Group multiple drawers together
}
```

### Time-Based Actions

For drawers with auto-close or timeout behavior:

```ts
interface TimedDrawerOptions extends DrawerOptions {
  autoCloseAfter?: number // Milliseconds before auto-close
  createdAt: Date
  expiresAt?: Date
}

// Usage
const manager = createDrawerManager<TimedDrawerOptions>()

manager.open({
  drawerKey: 'notification',
  autoCloseAfter: 3000,
  createdAt: new Date()
})

// Implement auto-close in your application code
manager.subscribe((state) => {
  state.stack.forEach((drawer) => {
    if (drawer.autoCloseAfter) {
      setTimeout(() => {
        manager.close(drawer.drawerKey)
      }, drawer.autoCloseAfter)
    }
  })
})
```

By defining custom drawer types that extend the base `DrawerOptions`, you create a flexible, type-safe system that adapts to your application's specific needs. The drawer manager handles state management and stack operations, while your extended types ensure all the domain-specific data is properly structured and accessible throughout your application. This separation of concerns keeps your code organized and makes it easier to build complex, multi-drawer experiences.
