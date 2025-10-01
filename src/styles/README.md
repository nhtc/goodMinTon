# Design System Style Guide

## Overview

This style guide documents the design system for the goodMinTon application, built with a modern, professional approach using CSS design tokens, Radix UI components, and Tailwind CSS for optimal accessibility, maintainability, and user experience.

## Core Principles

- **Accessibility First**: WCAG 2.1 AA compliance through Radix UI's built-in accessibility features
- **Design Token Based**: Consistent theming using CSS custom properties
- **Mobile First**: Responsive design with progressive enhancement
- **Component Composition**: Radix UI primitives as building blocks
- **Performance Optimized**: Minimal bundle size with tree-shaking and efficient imports

---

## Color Palette

Our color system is built on a professional palette with proper contrast ratios and semantic meaning.

### Primary Colors (Blue Family)
Used for main actions, branding, and primary interactive elements.

```css
--color-primary-50: #eff6ff   /* Lightest - backgrounds, subtle highlights */
--color-primary-100: #dbeafe  /* Light - hover states, disabled backgrounds */
--color-primary-200: #bfdbfe  /* Light-medium - borders, dividers */
--color-primary-300: #93c5fd  /* Medium-light - secondary buttons */
--color-primary-400: #60a5fa  /* Medium - interactive states */
--color-primary-500: #3b82f6  /* Standard - default primary color */
--color-primary-600: #2563eb  /* Main primary - buttons, links, brand */
--color-primary-700: #1d4ed8  /* Dark - hover states, pressed */
--color-primary-800: #1e40af  /* Darker - text, emphasis */
--color-primary-900: #1e3a8a  /* Darkest - high contrast text */
--color-primary-950: #172554  /* Ultra dark - maximum contrast */
```

**Usage Examples:**
- Main buttons: `--color-primary-600`
- Button hover: `--color-primary-700`
- Link text: `--color-primary-600`
- Brand elements: `--color-primary-600`

### Secondary Colors (Gray Family)
Used for neutral elements, text, borders, and backgrounds.

```css
--color-secondary-50: #f9fafb   /* Lightest - page backgrounds */
--color-secondary-100: #f3f4f6  /* Light - card backgrounds, subtle areas */
--color-secondary-200: #e5e7eb  /* Light-medium - borders, dividers */
--color-secondary-300: #d1d5db  /* Medium-light - input borders */
--color-secondary-400: #9ca3af  /* Medium - placeholder text */
--color-secondary-500: #6b7280  /* Standard - secondary text */
--color-secondary-600: #4b5563  /* Main secondary - body text */
--color-secondary-700: #374151  /* Dark - headings, emphasis */
--color-secondary-800: #1f2937  /* Main dark - primary text */
--color-secondary-900: #111827  /* Darkest - high contrast */
--color-secondary-950: #030712  /* Ultra dark - maximum contrast */
```

**Usage Examples:**
- Primary text: `--color-secondary-800`
- Secondary text: `--color-secondary-600`
- Placeholder text: `--color-secondary-400`
- Borders: `--color-secondary-200`

### Accent Colors (Green Family)
Used for success states, highlights, and positive actions.

```css
--color-accent-50: #ecfdf5   /* Light backgrounds */
--color-accent-100: #d1fae5  /* Success backgrounds */
--color-accent-500: #10b981  /* Main accent color */
--color-accent-600: #059669  /* Primary accent actions */
--color-accent-700: #047857  /* Hover states */
```

### Semantic Colors

#### Success (Green)
```css
--color-success-50: #ecfdf5   /* Success message backgrounds */
--color-success-500: #10b981  /* Success icons, text */
--color-success-600: #059669  /* Success buttons */
```

#### Warning (Amber)
```css
--color-warning-50: #fffbeb   /* Warning message backgrounds */
--color-warning-500: #f59e0b  /* Warning icons, text */
--color-warning-600: #d97706  /* Warning buttons */
```

#### Error (Red)
```css
--color-error-50: #fef2f2     /* Error message backgrounds */
--color-error-500: #ef4444    /* Error icons, text */
--color-error-600: #dc2626    /* Error buttons */
```

#### Info (Blue)
```css
--color-info-50: #eff6ff      /* Info message backgrounds */
--color-info-500: #3b82f6     /* Info icons, text */
--color-info-600: #2563eb     /* Info buttons */
```

---

## Typography System

Our typography system is built on the Inter font family with a consistent scale and hierarchy.

### Font Families
```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'Fira Code', 'Consolas', 'Monaco', monospace;
```

### Font Scale
```css
--font-size-xs: 0.75rem    /* 12px - Fine print, captions */
--font-size-sm: 0.875rem   /* 14px - Small text, labels */
--font-size-base: 1rem     /* 16px - Body text, default */
--font-size-lg: 1.125rem   /* 18px - Large body text */
--font-size-xl: 1.25rem    /* 20px - Subheadings */
--font-size-2xl: 1.5rem    /* 24px - Section headings */
--font-size-3xl: 1.875rem  /* 30px - Page headings */
--font-size-4xl: 2.25rem   /* 36px - Large headings */
--font-size-5xl: 3rem      /* 48px - Hero headings */
```

### Font Weights
```css
--font-weight-light: 300     /* Light text, subtle emphasis */
--font-weight-normal: 400    /* Body text, default */
--font-weight-medium: 500    /* Emphasis, labels */
--font-weight-semibold: 600  /* Subheadings, strong emphasis */
--font-weight-bold: 700      /* Headings, very strong emphasis */
--font-weight-extrabold: 800 /* Hero text, maximum emphasis */
```

### Line Heights
```css
--line-height-tight: 1.25    /* Headings, compact text */
--line-height-snug: 1.375    /* Subheadings */
--line-height-normal: 1.5    /* Body text, default */
--line-height-relaxed: 1.625 /* Comfortable reading */
--line-height-loose: 2       /* Maximum readability */
```

### Usage Examples
```css
/* Page heading */
.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-secondary-800);
}

/* Body text */
.body-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-secondary-600);
}

/* Label text */
.label-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary-700);
}
```

---

## Spacing System

Consistent spacing based on a rem scale for predictable layouts.

### Spacing Scale
```css
--spacing-0: 0          /* No spacing */
--spacing-1: 0.25rem    /* 4px - Minimal spacing */
--spacing-2: 0.5rem     /* 8px - Small spacing */
--spacing-3: 0.75rem    /* 12px - Standard spacing */
--spacing-4: 1rem       /* 16px - Default spacing */
--spacing-5: 1.25rem    /* 20px - Medium spacing */
--spacing-6: 1.5rem     /* 24px - Large spacing */
--spacing-8: 2rem       /* 32px - Section spacing */
--spacing-10: 2.5rem    /* 40px - Component spacing */
--spacing-12: 3rem      /* 48px - Layout spacing */
--spacing-16: 4rem      /* 64px - Page spacing */
--spacing-20: 5rem      /* 80px - Large layout spacing */
--spacing-24: 6rem      /* 96px - Maximum spacing */
```

### Usage Guidelines
- **Component internal spacing**: `--spacing-3` to `--spacing-6`
- **Form elements**: `--spacing-3` for padding, `--spacing-4` for margins
- **Card content**: `--spacing-6` for padding
- **Section spacing**: `--spacing-8` to `--spacing-12`
- **Page layout**: `--spacing-16` to `--spacing-24`

---

## Component Tokens

### Border Radius
```css
--border-radius-none: 0        /* Sharp corners */
--border-radius-sm: 0.125rem   /* 2px - Minimal rounding */
--border-radius-base: 0.25rem  /* 4px - Standard rounding */
--border-radius-md: 0.375rem   /* 6px - Medium rounding */
--border-radius-lg: 0.5rem     /* 8px - Large rounding */
--border-radius-xl: 0.75rem    /* 12px - Extra large rounding */
--border-radius-2xl: 1rem      /* 16px - Maximum rounding */
--border-radius-full: 9999px   /* Fully rounded (pills, avatars) */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)     /* Subtle shadow */
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1)    /* Default shadow */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)   /* Medium shadow */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1) /* Large shadow */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1) /* Extra large shadow */
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05) /* Inner shadow */
```

### Component Dimensions
```css
/* Buttons */
--button-height-sm: 2rem      /* 32px - Small button */
--button-height-base: 2.5rem  /* 40px - Default button */
--button-height-lg: 3rem      /* 48px - Large button */

/* Inputs */
--input-height-sm: 2rem       /* 32px - Small input */
--input-height-base: 2.5rem   /* 40px - Default input */
--input-height-lg: 3rem       /* 48px - Large input */

/* Cards */
--card-padding: var(--spacing-6)         /* Standard card padding */
--card-border-radius: var(--border-radius-lg) /* Card corner radius */
```

---

## Responsive Design

### Breakpoints
```css
--breakpoint-sm: 640px    /* Small devices (landscape phones) */
--breakpoint-md: 768px    /* Medium devices (tablets) */
--breakpoint-lg: 1024px   /* Large devices (laptops) */
--breakpoint-xl: 1280px   /* Extra large devices (desktops) */
--breakpoint-2xl: 1536px  /* 2X large devices (large desktops) */
```

### Mobile-First Approach
Always design for mobile first, then enhance for larger screens:

```css
/* Mobile first (default) */
.component {
  padding: var(--spacing-4);
  font-size: var(--font-size-sm);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: var(--spacing-6);
    font-size: var(--font-size-base);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: var(--spacing-8);
    font-size: var(--font-size-lg);
  }
}
```

---

## Using Design Tokens

### CSS Implementation
```css
/* Direct token usage */
.button-primary {
  background-color: var(--color-primary-600);
  color: white;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: background-color var(--transition-duration-base) var(--transition-timing-ease);
}

.button-primary:hover {
  background-color: var(--color-primary-700);
}

.button-primary:focus-visible {
  outline: var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

### Tailwind CSS Classes
```html
<!-- Using Tailwind classes that map to design tokens -->
<button class="bg-primary text-white px-6 py-3 rounded-md text-base font-medium transition-colors hover:bg-primary-700 focus-ring">
  Primary Button
</button>

<!-- Card using design tokens -->
<div class="bg-white p-6 rounded-lg shadow-base border border-secondary-200">
  <h3 class="text-xl font-semibold text-secondary-800 mb-4">Card Title</h3>
  <p class="text-base text-secondary-600">Card content using design system tokens.</p>
</div>
```

### Component Creation Guidelines

#### 1. Always Use Design Tokens
```css
/* ✅ Good - Uses design tokens */
.custom-component {
  color: var(--color-secondary-800);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-lg);
}

/* ❌ Bad - Hardcoded values */
.custom-component {
  color: #1f2937;
  padding: 16px;
  border-radius: 8px;
}
```

#### 2. Follow Naming Conventions
- Use descriptive names that indicate purpose
- Group related tokens with consistent prefixes
- Use semantic names over decorative names

#### 3. Maintain Consistency
- Use the spacing scale consistently
- Apply the color palette systematically
- Follow typography hierarchy

---

## Accessibility Features

### Focus Management
```css
/* Built-in focus ring utility */
.focus-ring {
  &:focus-visible {
    outline: var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
}

/* Color-specific focus rings */
.focus-ring-primary:focus-visible {
  outline-color: var(--color-primary-500);
}

.focus-ring-accent:focus-visible {
  outline-color: var(--color-accent-500);
}
```

### Color Contrast
All color combinations meet WCAG 2.1 AA standards:
- Primary text: `--color-secondary-800` on white (contrast ratio: 12.6:1)
- Secondary text: `--color-secondary-600` on white (contrast ratio: 7.6:1)
- Link text: `--color-primary-600` on white (contrast ratio: 7.2:1)

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Radix UI Integration

### Component Composition
Radix UI provides accessible, unstyled primitives that we enhance with our design system:

```tsx
import * as Dialog from '@radix-ui/react-dialog';

const CustomDialog = () => (
  <Dialog.Root>
    <Dialog.Trigger className="bg-primary text-white px-6 py-3 rounded-md focus-ring">
      Open Dialog
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg max-w-modal">
        <Dialog.Title className="text-xl font-semibold text-secondary-800 mb-4">
          Dialog Title
        </Dialog.Title>
        <Dialog.Description className="text-base text-secondary-600 mb-6">
          Dialog description goes here.
        </Dialog.Description>
        <Dialog.Close className="bg-secondary text-secondary-800 px-4 py-2 rounded-md focus-ring">
          Close
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

### State Management
Radix UI components come with built-in state management and accessibility features:

```css
/* Radix UI state utilities */
.radix-state-open {
  opacity: var(--state-hover-opacity);
}

.radix-state-closed {
  opacity: 1;
}

.radix-disabled {
  opacity: var(--state-disabled-opacity);
  pointer-events: none;
}
```

---

## Performance Optimization

### Bundle Size Optimization
- Import only the Radix UI components you need
- Use tree-shaking to eliminate unused code
- Leverage CSS custom properties for dynamic theming

### CSS Optimization
- Minimize CSS specificity conflicts
- Use design tokens to reduce CSS duplication
- Implement critical CSS loading for above-the-fold content

### Loading Performance
- Progressive enhancement for interactive components
- Smooth animations using design token timing functions
- Optimized font loading with font-display: swap

---

## Browser Support

### Target Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Fallbacks
```css
/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(1px)) {
  .modal-overlay {
    background: var(--color-secondary-900);
    opacity: 0.9;
  }
}

/* Safari-specific optimizations */
@supports (-webkit-appearance: none) {
  .backdrop-blur {
    -webkit-backdrop-filter: blur(12px);
  }
}
```

---

## Migration Guide

### From Hardcoded Values
1. Replace hardcoded colors with design token variables
2. Update spacing values to use the spacing scale
3. Convert typography styles to use font tokens
4. Replace custom shadows with design token shadows

### From Old Components
1. Identify the equivalent Radix UI primitive
2. Wrap the primitive with design token styling
3. Ensure accessibility features are preserved
4. Test keyboard navigation and screen reader compatibility

### Best Practices
- Migrate one component at a time
- Maintain backward compatibility during transition
- Document changes for team members
- Test thoroughly across browsers and devices

---

## Conclusion

This design system provides a solid foundation for building accessible, maintainable, and visually consistent user interfaces. By leveraging design tokens, Radix UI primitives, and modern CSS features, we ensure that our application scales effectively while maintaining high standards for accessibility and user experience.

For questions or suggestions about the design system, please refer to the component documentation or reach out to the development team.