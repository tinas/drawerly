# Defining Drawers

The core package provides a framework-agnostic drawer management system that supports **extensible, type-safe custom options**. This guide demonstrates how to extend the base drawer configuration with custom properties to create drawers tailored to specific application requirements.

## The Concept

Every drawer in the system has a set of built-in options like `drawerKey`, `placement`, and accessibility properties. However, real applications require additional capabilities, such as passing product data, user information, or custom callbacks to drawers.

The core package supports extension of the base drawer options with arbitrary properties while maintaining full type safety. Custom fields become part of the drawer's identity and remain accessible throughout all interactions with that drawer.

## Why Extend Drawer Options?

In conventional drawer implementations, drawer-related data is often stored separately from the drawer state. This approach creates synchronization issues and increases maintenance complexity. Extending drawer options provides the following benefits:

**Single Source of Truth**: All data related to a drawer lives together in one place.

**Type Safety**: TypeScript prevents access to non-existent properties and enforces the presence of all required fields.

**Flexibility**: Supports arbitrary data structures including primitives, complex objects, and function references.

**Framework Independence**: The core package imposes no UI constraints, allowing developers to define application-specific data requirements.

## Extending the Base Options

### Understanding DrawerOptions

The base interface provides essential drawer functionality:

- `drawerKey`: Unique identifier for each drawer instance
- `placement`: Where the drawer appears (`'top'`, `'right'`, `'bottom'`, `'left'`)
- `closeOnEscapeKey`: Whether pressing Escape closes the drawer
- `closeOnBackdropClick`: Whether clicking outside closes the drawer
- `ariaLabel`, `ariaDescribedBy`, `ariaLabelledBy`: Accessibility attributes
- `dataAttributes`: Custom data attributes for styling or testing

These options handle the mechanics of drawer behavior and accessibility. Extensions add domain-specific data.

### Creating Custom Drawer Types

To extend the base options, create an interface that extends `DrawerOptions`:

```ts
import type { DrawerOptions } from '@drawerly/core'

interface MyCustomDrawerOptions extends DrawerOptions {
  // Add custom fields to here
  title: string
  data: any
  onAction?: () => void
}
```

Now every drawer using `MyCustomDrawerOptions` will have both the built-in options and defined custom fields.

## Practical Examples

### E-commerce Product Drawer

E-commerce applications typically require product details and purchase action handlers:

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

After defining custom options, instantiate a manager with the appropriate type parameters:

```ts
import { createDrawerManager } from '@drawerly/core'

const productDrawers = createDrawerManager<ProductDrawerOptions>()
const userDrawers = createDrawerManager<UserDrawerOptions>()
const notificationDrawers = createDrawerManager<NotificationDrawerOptions>()
```

Each manager instance is fully typed to its corresponding drawer type. TypeScript enforces compile-time validation, ensuring all required fields are provided when opening drawers.

## Default Options

Default values can be configured to apply to all drawers of a specific type:

```ts
const productDrawers = createDrawerManager<ProductDrawerOptions>(
  undefined, // Initial state
  {
    // Defaults for all product drawers
    placement: 'right',
    closeOnEscapeKey: true,
    closeOnBackdropClick: true,
    inStock: true // Custom default value
  }
)
```

When opening a drawer, these defaults merge with the provided options. Only values that differ from the defaults need to be specified:

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

The `closeOnEscapeKey` and `closeOnBackdropClick` options accept functions that receive the drawer instance, enabling conditional behavior based on custom data:

```ts
productDrawers.open({
  drawerKey: 'premium-product',
  productId: '999',
  productName: 'Premium Laptop',
  price: 2499.99,
  inStock: false,

  // Conditional behavior based on custom fields
  closeOnEscapeKey: drawer => drawer.inStock === true,
  closeOnBackdropClick: drawer => drawer.price < 1000
})
```

For expensive or out-of-stock items, accidental closure can be prevented by configuring the predicate to return `false`.

## Type Safety in Action

TypeScript ensures custom fields remain consistently available with proper type validation:

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

For component-based frameworks, component references can be included in the options:

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

// Implementation of auto-close behavior in application code
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

Extending the base `DrawerOptions` with custom types creates a flexible, type-safe system that adapts to application-specific needs. The drawer manager handles state management and stack operations, while extended types maintain all domain-specific data in a properly structured and accessible format. This separation of concerns promotes code organization and simplifies the development of complex, multi-drawer experiences.
