# Managing the Stack

The drawer manager maintains a **stack** of open drawers, where each drawer is layered on top of the previous one. Understanding how to manage this stack is essential for creating intuitive multi-drawer experiences.

## The Stack Concept

Think of the drawer stack like a deck of cards:

- **Bottom of the stack**: The first drawer opened
- **Top of the stack**: The most recently opened or brought forward drawer
- **Stacking behavior**: New drawers slide in on top of existing ones
- **Closing behavior**: Drawers can be removed from anywhere in the stack

The last item in the stack array is always the topmost (visible) drawer. This is important for rendering and user interaction.

## Opening Drawers

### Basic Opening

The `open()` method adds a drawer to the stack or updates it if it already exists:

```ts
const manager = createDrawerManager<MyDrawerOptions>()

manager.open({
  drawerKey: 'drawer-1',
  // ... your custom options
})
```

### Opening Multiple Drawers

You can open multiple drawers, and they'll stack on top of each other:

```ts
// First drawer opens
manager.open({
  drawerKey: 'main-menu',
  title: 'Main Menu'
})

// Second drawer opens on top
manager.open({
  drawerKey: 'settings',
  title: 'Settings'
})

// Third drawer opens on top of both
manager.open({
  drawerKey: 'profile',
  title: 'User Profile'
})

// Stack is now: ['main-menu', 'settings', 'profile']
// 'profile' is visible on top
```

### Update Existing Drawer

If you call `open()` with a `drawerKey` that already exists, the drawer moves to the top and its options update:

```ts
// Open initial drawer
manager.open({
  drawerKey: 'product-123',
  productName: 'Headphones',
  price: 99.99
})

// Later, update and bring to top
manager.open({
  drawerKey: 'product-123', // Same key
  productName: 'Headphones',
  price: 79.99 // Updated price
})
```

This is useful for refreshing drawer content or bringing a drawer back to focus.

## Closing Drawers

### Close the Top Drawer

Calling `close()` without arguments closes the topmost drawer:

```ts
// Stack: ['drawer-1', 'drawer-2', 'drawer-3']
manager.close()
// Stack: ['drawer-1', 'drawer-2']
```

This is the most common closing pattern, typically triggered by:
- User clicking a close button
- User pressing Escape key
- User clicking the backdrop
- Completing an action in the drawer

### Close a Specific Drawer

Pass a `drawerKey` to close a specific drawer, regardless of its position:

```ts
// Stack: ['drawer-1', 'drawer-2', 'drawer-3']
manager.close('drawer-2')
// Stack: ['drawer-1', 'drawer-3']
```

This is useful when:
- A background process completes
- A drawer becomes irrelevant due to user action elsewhere
- You want to close a specific drawer without affecting others

### Close All Drawers

Use `closeAll()` to clear the entire stack:

```ts
// Stack: ['drawer-1', 'drawer-2', 'drawer-3']
manager.closeAll()
// Stack: []
```

Common use cases:
- User logs out
- Navigating to a different page
- Resetting the application state
- Emergency cleanup

## Reordering the Stack

### Bring to Top

Move a drawer from anywhere in the stack to the top:

```ts
// Stack: ['menu', 'settings', 'profile', 'notifications']
manager.bringToTop('settings')
// Stack: ['menu', 'profile', 'notifications', 'settings']
```

This is particularly useful for:
- "Return to previous drawer" functionality
- Switching between multiple open drawers
- Responding to external events (like notifications)

### Practical Example: Drawer Tabs

```ts
// Open multiple "tab" drawers
const tabs = ['home', 'search', 'favorites', 'history']
tabs.forEach((tab) => {
  manager.open({
    drawerKey: tab,
    title: tab.charAt(0).toUpperCase() + tab.slice(1)
  })
})

// User clicks a tab - bring that drawer to front
function switchTab(tabKey: string) {
  manager.bringToTop(tabKey)
}
```

## Reading the Stack State

### Get Current State

Access the complete stack at any time:

```ts
const state = manager.getState()

console.log(`${state.stack.length} drawers open`)
state.stack.forEach((drawer, index) => {
  console.log(`[${index}] ${drawer.drawerKey}`)
})

// Get the topmost drawer
if (state.stack.length > 0) {
  const topDrawer = state.stack[state.stack.length - 1]
  console.log(`Top drawer: ${topDrawer.drawerKey}`)
}
```

### Get Specific Drawer

Look up a drawer by its key:

```ts
const drawer = manager.getDrawerInstance('product-123')

if (drawer) {
  console.log('Drawer exists:', drawer.drawerKey)
  console.log('Custom data:', drawer.productName)
}
else {
  console.log('Drawer not found')
}
```

This is useful for:
- Checking if a drawer is currently open
- Accessing drawer data without subscribing to state changes
- Conditional logic based on drawer existence

## Subscribing to State Changes

### The Subscribe Pattern

Subscribe to be notified every time the stack changes:

```ts
const unsubscribe = manager.subscribe((state) => {
  console.log('Stack changed!')
  console.log(`Now ${state.stack.length} drawer(s) open`)

  // Update your UI based on the new state
  renderDrawers(state.stack)
})

// Later, stop listening
unsubscribe()
```

### When State Changes

The subscription callback fires when:
- A drawer opens (`open()`)
- A drawer closes (`close()` or `closeAll()`)
- A drawer is brought to top (`bringToTop()`)
- Drawer options are updated (`updateOptions()`)
- Default options change (`updateDefaultOptions()`)

### Multiple Subscribers

You can have multiple listeners for different purposes:

```ts
// Update the UI
manager.subscribe((state) => {
  updateDrawerUI(state.stack)
})

// Log for debugging
manager.subscribe((state) => {
  console.log('[Drawer State]', state.stack.map(d => d.drawerKey))
})

// Track analytics
manager.subscribe((state) => {
  analytics.track('drawer_stack_changed', {
    count: state.stack.length,
    topDrawer: state.stack[state.stack.length - 1]?.drawerKey
  })
})
```

## Updating Drawer Options

### Update a Specific Drawer

Change options for an open drawer without reopening it:

```ts
manager.updateOptions('product-123', current => ({
  ...current,
  price: 149.99, // Update just the price
  inStock: false // And stock status
}))
```

The updater function receives the current options (minus `drawerKey`) and returns the new options. This triggers state listeners.

### Common Update Scenarios

**Loading States**:
```ts
// Start loading
manager.updateOptions('user-profile', current => ({
  ...current,
  isLoading: true
}))

// Finish loading
manager.updateOptions('user-profile', current => ({
  ...current,
  isLoading: false,
  data: fetchedData
}))
```

**Progress Tracking**:
```ts
manager.updateOptions('upload-wizard', current => ({
  ...current,
  currentStep: current.currentStep + 1
}))
```

**Error Handling**:
```ts
manager.updateOptions('form-drawer', current => ({
  ...current,
  error: 'Invalid email address',
  isSubmitting: false
}))
```

## Updating Default Options

Change the defaults that apply to future drawers:

```ts
// Initial defaults
const manager = createDrawerManager<MyDrawerOptions>(undefined, {
  placement: 'right',
  closeOnEscapeKey: true
})

// Later, update defaults
manager.updateDefaultOptions(prev => ({
  ...prev,
  placement: 'left', // Switch side
  closeOnBackdropClick: false // Make drawers sticky
}))

// New drawers use the updated defaults
manager.open({
  drawerKey: 'new-drawer',
  // placement is 'left', closeOnBackdropClick is false
})
```

## Practical Patterns

### Master-Detail Navigation

```ts
// Open master list
manager.open({
  drawerKey: 'product-list',
  title: 'Products'
})

// User clicks a product - open detail drawer on top
manager.open({
  drawerKey: 'product-detail-123',
  productId: '123',
  title: 'Product Details'
})

// User clicks back - close detail, return to list
manager.close() // Closes 'product-detail-123'
```

### Multi-Step Wizard

```ts
const steps = ['basic-info', 'preferences', 'review', 'confirm']
let currentStepIndex = 0

function nextStep() {
  if (currentStepIndex < steps.length - 1) {
    currentStepIndex++
    manager.open({
      drawerKey: steps[currentStepIndex],
      step: currentStepIndex + 1,
      totalSteps: steps.length
    })
  }
}

function previousStep() {
  if (currentStepIndex > 0) {
    manager.close() // Close current
    currentStepIndex--
    // Previous drawer is already in stack
  }
}
```

### Contextual Drawers

```ts
// Main content drawer
manager.open({
  drawerKey: 'document',
  documentId: '123'
})

// User selects text - show formatting drawer on top
manager.open({
  drawerKey: 'formatting',
  selectedText: 'Hello World'
})

// User deselects - close formatting drawer
manager.close('formatting')
// Document drawer remains open
```

### Notification Queue

```ts
function showNotification(id: string, message: string) {
  manager.open({
    drawerKey: `notification-${id}`,
    message,
    placement: 'top'
  })

  // Auto-close after 3 seconds
  setTimeout(() => {
    manager.close(`notification-${id}`)
  }, 3000)
}
```

## Stack Depth Considerations

### Limiting Stack Depth

For most applications, you should limit how many drawers can stack:

```ts
const MAX_STACK_DEPTH = 3

manager.subscribe((state) => {
  if (state.stack.length > MAX_STACK_DEPTH) {
    // Close the oldest drawer
    const oldestKey = state.stack[0].drawerKey
    manager.close(oldestKey)
  }
})
```

### Visual Indicators

Show users where they are in the stack:

```ts
manager.subscribe((state) => {
  const depth = state.stack.length

  if (depth > 1) {
    // Show breadcrumb or back button
    showBreadcrumb(state.stack.map(d => d.title || d.drawerKey))
  }

  if (depth >= MAX_STACK_DEPTH) {
    // Warn user they're at max depth
    showMaxDepthWarning()
  }
})
```

## Best Practices

**Use Unique Keys**: Ensure each drawer has a unique `drawerKey` to prevent accidental updates.

**Clean Up Subscriptions**: Always unsubscribe when components unmount to prevent memory leaks.

**Batch Operations**: If you need to make multiple changes, consider using `closeAll()` and reopening rather than closing individually.

**Preserve Order**: When reordering is important, use `bringToTop()` rather than closing and reopening.

**Handle Empty Stack**: Always check `state.stack.length` before accessing stack items.

```ts
const state = manager.getState()

if (state.stack.length > 0) {
  const topDrawer = state.stack[state.stack.length - 1]
  // Safe to use topDrawer
}
```

**Communicate State**: Use the subscription system to keep your UI in sync with the drawer stack.
