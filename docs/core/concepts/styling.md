# Styling

The core package includes a complete, customizable CSS styling system. While the package is framework-agnostic and focuses on state management, it provides default styles that you can use as-is or customize to match your design system.

## The Styling Approach

The styling system is built on:

**CSS Custom Properties (Variables)**: All visual aspects are controlled through CSS variables, making customization simple.

**Data Attributes**: Drawers use data attributes for state-based styling, avoiding class name conflicts.

**Animations**: Smooth transitions and animations that respect user preferences.

**Zero JavaScript**: All visual effects are pure CSS, keeping the core package lightweight.

## Including the Styles

### Import the CSS

If you're using a bundler that handles CSS imports:

```ts
import '@drawerly/core/styles.css'
```

### Link in HTML

Or include it in your HTML:

```html
<link rel="stylesheet" href="node_modules/@drawerly/core/dist/styles.css">
```

### Copy and Customize

For full control, copy the styles into your project and modify them directly.

## CSS Architecture

### Data Attributes

The styling system uses data attributes to avoid specificity issues:

- `[data-drawerly-root]`: Container element (typically on `:root` or `body`)
- `[data-drawerly-overlay]`: The overlay wrapper for each drawer
- `[data-drawerly-backdrop]`: The semi-transparent backdrop behind the drawer
- `[data-drawerly-panel]`: The actual drawer panel containing your content
- `[data-drawerly-placement]`: Indicates drawer position (`'top'`, `'right'`, `'bottom'`, `'left'`)
- `[data-top]`: Marks the topmost drawer in the stack
- `[data-entering]`: Applied during drawer entrance animation
- `[data-closing]`: Applied during drawer exit animation

### Visual Hierarchy

```
[data-drawerly-root]          ← Root container
  └─[data-drawerly-overlay]           ← Positioned container
      ├─ [data-drawerly-backdrop]     ← Semi-transparent overlay
      └─ [data-drawerly-panel]        ← Drawer content area
```

## Customization with CSS Variables

### Available Variables

The default styles define these CSS variables on `[data-drawerly-root]`:

```css
[data-drawerly-root] {
  /* Backdrop */
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.5);

  /* Panel appearance */
  --drawerly-panel-bg: white;
  --drawerly-panel-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  --drawerly-panel-width: 400px;
  --drawerly-panel-height: 300px;
  --drawerly-panel-radius: 16px;

  /* Animations */
  --drawerly-transition-duration: 300ms;
  --drawerly-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);

  /* Layering */
  --drawerly-z-index: 1000;
}
```

### Basic Customization

Override variables in your own CSS:

```css
[data-drawerly-root] {
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.7);
  --drawerly-panel-bg: #1a1a1a;
  --drawerly-panel-width: 500px;
  --drawerly-panel-radius: 8px;
}
```

### Theme Support

#### Dark Mode

```css
/* Dark theme */
[data-drawerly-root][data-theme="dark"] {
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.8);
  --drawerly-panel-bg: #1e1e1e;
  --drawerly-panel-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

/* Light theme */
[data-drawerly-root][data-theme="light"] {
  --drawerly-backdrop-bg: rgba(0, 0, 0, 0.3);
  --drawerly-panel-bg: #ffffff;
  --drawerly-panel-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

#### Automatic System Theme

```css
@media (prefers-color-scheme: dark) {
  [data-drawerly-root] {
    --drawerly-backdrop-bg: rgba(0, 0, 0, 0.8);
    --drawerly-panel-bg: #1e1e1e;
  }
}
```

## Placement-Specific Styling

### Understanding Placement

Drawers can slide in from four edges:

- `'right'`: Slides from the right edge (most common)
- `'left'`: Slides from the left edge
- `'top'`: Slides from the top edge
- `'bottom'`: Slides from the bottom edge (mobile sheets)

### Customizing by Placement

Target specific placements:

```css
/* Right-side drawers are wider */
[data-drawerly-placement="right"] {
  --drawerly-panel-width: 600px;
}

/* Bottom drawers (mobile sheets) are shorter */
[data-drawerly-placement="bottom"] {
  --drawerly-panel-height: 400px;
  --drawerly-panel-radius: 16px 16px 0 0;
}

/* Top notifications are minimal */
[data-drawerly-placement="top"] {
  --drawerly-panel-height: 100px;
  --drawerly-panel-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Left-side navigation is full height */
[data-drawerly-placement="left"] {
  --drawerly-panel-width: 280px;
  --drawerly-panel-radius: 0;
}
```

## Custom Data Attributes

Use the `dataAttributes` option to add custom styling hooks:

```ts
manager.open({
  drawerKey: 'product-drawer',
  dataAttributes: {
    'data-product-type': 'premium',
    'data-has-discount': true,
    'data-priority': 'high'
  }
})
```

Then style based on those attributes:

```css
/* Premium products get gold accent */
[data-drawerly-overlay][data-product-type="premium"] [data-drawerly-panel] {
  border-left: 4px solid gold;
}

/* Discounted items get a badge */
[data-drawerly-overlay][data-has-discount="true"]::before {
  content: "SALE";
  position: absolute;
  top: 20px;
  right: 20px;
  background: red;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}

/* High priority drawers are more prominent */
[data-drawerly-overlay][data-priority="high"] [data-drawerly-backdrop] {
  background: rgba(0, 0, 0, 0.8);
}
```

## Animation Customization

### Adjusting Timing

```css
[data-drawerly-root] {
  /* Faster animations */
  --drawerly-transition-duration: 200ms;

  /* Or slower */
  --drawerly-transition-duration: 500ms;

  /* Custom easing */
  --drawerly-transition-timing: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Custom Animations

Override the default slide animations:

```css
/* Fade only, no slide */
@keyframes custom-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

[data-drawerly-placement="right"][data-entering] [data-drawerly-panel] {
  animation: custom-fade-in var(--drawerly-transition-duration) ease-out;
}

/* Scale and fade */
@keyframes custom-scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

[data-drawerly-overlay][data-entering] [data-drawerly-panel] {
  animation: custom-scale-in var(--drawerly-transition-duration)
    cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Disable Animations

For users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  [data-drawerly-root] {
    --drawerly-transition-duration: 0.001ms;
  }

  [data-drawerly-backdrop],
  [data-drawerly-panel] {
    animation: none !important;
    transition: none !important;
  }
}
```

## Responsive Design

### Mobile Optimization

```css
/* Mobile: Bottom sheets instead of side panels */
@media (max-width: 768px) {
  [data-drawerly-placement="right"] [data-drawerly-panel],
  [data-drawerly-placement="left"] [data-drawerly-panel] {
    /* Override to bottom placement */
    top: auto !important;
    right: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 80% !important;
    max-height: 80% !important;
    border-radius: 16px 16px 0 0 !important;
  }
}

/* Tablet: Narrower drawers */
@media (min-width: 769px) and (max-width: 1024px) {
  [data-drawerly-root] {
    --drawerly-panel-width: 320px;
  }
}

/* Desktop: Wider drawers */
@media (min-width: 1025px) {
  [data-drawerly-root] {
    --drawerly-panel-width: 480px;
  }
}
```

### Full-Screen on Small Screens

```css
@media (max-width: 640px) {
  [data-drawerly-panel] {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    border-radius: 0 !important;
  }
}
```

## Stack Visualization

### Showing Depth

Make stacked drawers visible behind the top drawer:

```css
/* Non-top drawers are slightly scaled down */
[data-drawerly-overlay]:not([data-top]) [data-drawerly-panel] {
  transform: scale(0.95);
  filter: brightness(0.9);
}

/* Even deeper drawers are more scaled */
[data-drawerly-overlay]:nth-last-child(3) [data-drawerly-panel] {
  transform: scale(0.90);
}

[data-drawerly-overlay]:nth-last-child(4) [data-drawerly-panel] {
  transform: scale(0.85);
}
```

### Staggered Offset

```css
/* Right-side drawers offset slightly left when stacked */
[data-drawerly-placement="right"]:not([data-top]) [data-drawerly-panel] {
  right: 20px;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
}

/* Bottom drawers offset slightly up when stacked */
[data-drawerly-placement="bottom"]:not([data-top]) [data-drawerly-panel] {
  bottom: 20px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
}
```

## Panel Content Styling

### Internal Padding

The panel itself has no internal padding by default. Add it based on your needs:

```css
[data-drawerly-panel] {
  padding: 24px;
}

/* Or responsive padding */
[data-drawerly-panel] {
  padding: clamp(16px, 5vw, 32px);
}
```

### Scrollable Content

```css
[data-drawerly-panel] {
  overflow-y: auto;
  overflow-x: hidden;
}

/* Custom scrollbar */
[data-drawerly-panel]::-webkit-scrollbar {
  width: 8px;
}

[data-drawerly-panel]::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

[data-drawerly-panel]::-webkit-scrollbar-track {
  background: transparent;
}
```

### Header and Footer

If your drawers have headers and footers:

```css
[data-drawerly-panel] {
  display: flex;
  flex-direction: column;
}

.drawer-header {
  flex-shrink: 0;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.02);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.drawer-footer {
  flex-shrink: 0;
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.02);
}
```

## Backdrop Customization

### Blur Effect

```css
[data-drawerly-backdrop] {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

### Gradient Backdrop

```css
[data-drawerly-backdrop] {
  background: linear-gradient(
    135deg,
    rgba(66, 135, 245, 0.3),
    rgba(139, 92, 246, 0.3)
  );
}
```

### No Backdrop

```css
[data-drawerly-backdrop] {
  display: none;
}
```

## Advanced Patterns

### Nested Drawer Styling

```css
/* First level */
[data-drawerly-overlay]:nth-last-child(1) {
  --drawerly-panel-bg: #ffffff;
}

/* Second level - slightly different color */
[data-drawerly-overlay]:nth-last-child(2) {
  --drawerly-panel-bg: #f9f9f9;
}

/* Third level - even lighter */
[data-drawerly-overlay]:nth-last-child(3) {
  --drawerly-panel-bg: #f3f3f3;
}
```

### Focus States

```css
/* Highlight the top drawer */
[data-drawerly-overlay][data-top] [data-drawerly-panel] {
  box-shadow: 0 0 0 2px rgba(66, 135, 245, 0.5),
              0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Dim non-focused drawers */
[data-drawerly-overlay]:not([data-top]) [data-drawerly-panel] {
  opacity: 0.7;
}
```

### Loading States

Using custom data attributes:

```ts
manager.updateOptions('my-drawer', current => ({
  ...current,
  dataAttributes: {
    'data-loading': true
  }
}))
```

```css
[data-drawerly-overlay][data-loading] [data-drawerly-panel] {
  pointer-events: none;
  opacity: 0.6;
}

[data-drawerly-overlay][data-loading] [data-drawerly-panel]::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Best Practices

**Use CSS Variables**: Always customize through variables first before overriding rules.

**Avoid Important**: The default styles don't use `!important`, so you shouldn't need it either.

**Respect User Preferences**: The default styles include support for `prefers-reduced-motion`. Maintain this accessibility feature in your customizations.

**Z-Index Management**: If you have other overlays (modals, tooltips), ensure `--drawerly-z-index` fits your layering system.

```css
/* Example z-index hierarchy */
[data-drawerly-root] {
  --drawerly-z-index: 1000; /* Drawers */
}

.tooltip {
  z-index: 1100; /* Tooltips above drawers */
}

.modal {
  z-index: 1200; /* Modals above everything */
}
```

**Performance Considerations**: Be mindful of expensive CSS properties like `filter` and `backdrop-filter` which can impact performance on lower-end devices.

**Data Attributes for State**: Use the `dataAttributes` option to add custom styling hooks rather than relying on JavaScript class manipulation.
