# @drawerly/react

For full documentation, visit **[drawerly.dev](https://drawerly.dev)**

# Roadmap

- **onClose / onOpen lifecycle callbacks**
  Add optional callback props to drawers that fire when a drawer opens or closes. Useful for triggering side effects like analytics, data fetching, or cleanup. Inspired by Sonner's `onDismiss` and `onAutoClose` callbacks.

- **Multiple container support with routing**
  Allow multiple `<DrawerlyContainer />` instances with unique IDs, and route specific drawers to specific containers using a `containerId` option. This enables use cases like having separate drawer stacks for different parts of the UI (e.g., main content vs. modal contexts).
