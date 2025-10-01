# Component Implementation Guide

## Overview

This guide documents the implementation patterns for components built with Radix UI primitives and our design system. All components follow clean code principles (SRP, KISS, DRY, YAGNI, SOLID) and accessibility-first design.

---

## Radix UI Component Patterns

### Dialog System

Our dialog system is built on Radix UI Dialog primitives with modular, composable components.

#### BaseDialog Implementation

```tsx
import React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock"
import DialogOverlay from "./DialogOverlay"
import DialogHeader from "./DialogHeader"
import DialogBody from "./DialogBody"
import DialogFooter from "./DialogFooter"
import styles from "./BaseDialog.module.css"

interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  size?: "sm" | "base" | "lg" | "xl" | "full"
  className?: string
  disableOverlayClose?: boolean
  modal?: boolean
}

interface BaseDialogComponent extends React.FC<BaseDialogProps> {
  Header: typeof DialogHeader
  Body: typeof DialogBody
  Footer: typeof DialogFooter
  Overlay: typeof DialogOverlay
}

const BaseDialog: BaseDialogComponent = ({
  open,
  onOpenChange,
  children,
  size = "base",
  className = "",
  disableOverlayClose = false,
  modal = true
}) => {
  useBodyScrollLock(open)

  const sizeClasses = {
    sm: styles.sizeSmall,
    base: styles.sizeBase,
    lg: styles.sizeLarge,
    xl: styles.sizeExtraLarge,
    full: styles.sizeFull
  }

  const dialogClasses = [
    styles.content,
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      <Dialog.Portal>
        <DialogOverlay disableClose={disableOverlayClose} />
        <Dialog.Content className={dialogClasses}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Attach subcomponents
BaseDialog.Header = DialogHeader
BaseDialog.Body = DialogBody
BaseDialog.Footer = DialogFooter
BaseDialog.Overlay = DialogOverlay

export default BaseDialog
```

#### Usage Examples

**Simple Dialog:**
```tsx
const SimpleDialog = () => {
  const [open, setOpen] = useState(false)

  return (
    <BaseDialog open={open} onOpenChange={setOpen}>
      <BaseDialog.Header title="Simple Dialog" />
      <BaseDialog.Body>
        <p>This is a simple dialog with minimal content.</p>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <button onClick={() => setOpen(false)}>Close</button>
      </BaseDialog.Footer>
    </BaseDialog>
  )
}
```

**Confirmation Dialog:**
```tsx
import { ConfirmationDialog } from "@/components/Dialog"

const DeleteConfirmation = () => {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    // Delete action
    setOpen(false)
  }

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={setOpen}
      title="Delete Item"
      description="Are you sure you want to delete this item? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={handleConfirm}
      variant="destructive"
    />
  )
}
```

---

### Form System

Our form system uses Radix UI Form primitives with comprehensive validation and error handling.

#### FormSelect Implementation

```tsx
import React from "react"
import * as Select from "@radix-ui/react-select"
import styles from "./FormSelect.module.css"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface FormSelectProps {
  options: SelectOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  hasError?: boolean
  disabled?: boolean
  className?: string
}

const FormSelect: React.FC<FormSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  hasError = false,
  disabled = false,
  className = "",
}) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger
        className={`${styles.trigger} ${hasError ? styles.error : ""} ${className}`}
        aria-label="Select option"
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className={styles.icon}>
          {/* Chevron down icon */}
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179Z"
              fill="currentColor"
            />
          </svg>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className={styles.content} position="popper" sideOffset={4}>
          <Select.ScrollUpButton className={styles.scrollButton}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 3L12 8H3L7.5 3Z" fill="currentColor" />
            </svg>
          </Select.ScrollUpButton>
          
          <Select.Viewport className={styles.viewport}>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={styles.item}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className={styles.itemIndicator}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path
                      d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                      fill="currentColor"
                    />
                  </svg>
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          
          <Select.ScrollDownButton className={styles.scrollButton}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 12L3 7H12L7.5 12Z" fill="currentColor" />
            </svg>
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

export default FormSelect
```

#### Form Component Composition

```tsx
import { FormField, FormLabel, FormInput, FormMessage, FormSelect } from "@/components/Form"

const UserForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  return (
    <form className="space-y-6">
      <FormField>
        <FormLabel htmlFor="name" required>
          Full Name
        </FormLabel>
        <FormInput
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          hasError={!!errors.name}
          placeholder="Enter your full name"
        />
        {errors.name && <FormMessage variant="error">{errors.name}</FormMessage>}
      </FormField>

      <FormField>
        <FormLabel htmlFor="role" required>
          Role
        </FormLabel>
        <FormSelect
          value={formData.role}
          onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          options={[
            { value: "admin", label: "Administrator" },
            { value: "user", label: "User" },
            { value: "guest", label: "Guest" }
          ]}
          hasError={!!errors.role}
          placeholder="Select a role"
        />
        {errors.role && <FormMessage variant="error">{errors.role}</FormMessage>}
      </FormField>
    </form>
  )
}
```

---

### Card System

Our card system provides flexible, reusable card components with multiple variants.

#### BaseCard Implementation

```tsx
import React from "react"
import styles from "./BaseCard.module.css"

interface BaseCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "elevated" | "outlined" | "filled"
  padding?: "none" | "sm" | "base" | "lg"
  interactive?: boolean
  onClick?: () => void
}

const BaseCard: React.FC<BaseCardProps> = ({
  children,
  className = "",
  variant = "default",
  padding = "base",
  interactive = false,
  onClick,
}) => {
  // SRP: Extract variant and padding configurations
  const variantClasses = {
    elevated: styles.elevated,
    outlined: styles.outlined,
    filled: styles.filled,
    default: styles.default
  }

  const paddingClasses = {
    none: styles.paddingNone,
    sm: styles.paddingSm,
    lg: styles.paddingLg,
    base: styles.paddingBase
  }

  const variantClass = variantClasses[variant] || variantClasses.default
  const paddingClass = paddingClasses[padding] || paddingClasses.base
  const interactiveClass = interactive ? styles.interactive : ""
  const clickableClass = onClick ? styles.clickable : ""

  const cardClasses = [
    styles.baseCard,
    variantClass,
    paddingClass,
    interactiveClass,
    clickableClass,
    className
  ].filter(Boolean).join(' ')

  const CardElement = onClick ? 'button' : 'div'

  return (
    <CardElement 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </CardElement>
  )
}

export default BaseCard
```

#### Specialized Card Components

**EventCard:**
```tsx
import React from "react"
import { BaseCard } from "@/components/Card"
import { UserAvatar } from "@/components/Layout"
import { formatDate } from "@/utils/date"

interface EventCardProps {
  event: {
    id: string
    title: string
    date: Date
    participants: Array<{ id: string; name: string; avatar?: string }>
    status: "upcoming" | "ongoing" | "completed"
  }
  onClick?: () => void
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const statusColors = {
    upcoming: "bg-info-50 text-info-700",
    ongoing: "bg-success-50 text-success-700",
    completed: "bg-secondary-50 text-secondary-700"
  }

  return (
    <BaseCard 
      variant="elevated" 
      interactive={!!onClick}
      onClick={onClick}
      className="hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-secondary-800">
          {event.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[event.status]}`}>
          {event.status}
        </span>
      </div>
      
      <p className="text-sm text-secondary-600 mb-4">
        {formatDate(event.date)}
      </p>
      
      <div className="flex -space-x-2">
        {event.participants.slice(0, 4).map((participant) => (
          <UserAvatar
            key={participant.id}
            user={participant}
            size="sm"
            className="border-2 border-white"
          />
        ))}
        {event.participants.length > 4 && (
          <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center text-xs font-medium text-secondary-600 border-2 border-white">
            +{event.participants.length - 4}
          </div>
        )}
      </div>
    </BaseCard>
  )
}

export default EventCard
```

---

### Layout Components

Our layout system provides consistent structure and spacing across the application.

#### PageHeader Implementation

```tsx
import React from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  className?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description,
  actions,
  breadcrumb,
  className = '' 
}) => {
  const headerClasses = [styles.pageHeader, className].filter(Boolean).join(' ')

  return (
    <header className={headerClasses}>
      {breadcrumb && (
        <div className={styles.breadcrumb}>
          {breadcrumb}
        </div>
      )}
      
      <div className={styles.headerContent}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{title}</h1>
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
        
        {actions && (
          <div className={styles.actions}>
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

export default PageHeader
```

#### Container and Section Components

```tsx
// Container.tsx
import React from 'react'
import styles from './Container.module.css'

interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'base' | 'lg' | 'xl' | 'full'
  className?: string
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  size = 'base', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: styles.sizeSmall,
    base: styles.sizeBase,
    lg: styles.sizeLarge,
    xl: styles.sizeExtraLarge,
    full: styles.sizeFull
  }

  const containerClasses = [
    styles.container,
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      {children}
    </div>
  )
}

// Section.tsx
import React from 'react'
import styles from './Section.module.css'

interface SectionProps {
  children: React.ReactNode
  spacing?: 'none' | 'sm' | 'base' | 'lg' | 'xl'
  className?: string
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  spacing = 'base', 
  className = '' 
}) => {
  const spacingClasses = {
    none: styles.spacingNone,
    sm: styles.spacingSmall,
    base: styles.spacingBase,
    lg: styles.spacingLarge,
    xl: styles.spacingExtraLarge
  }

  const sectionClasses = [
    styles.section,
    spacingClasses[spacing],
    className
  ].filter(Boolean).join(' ')

  return (
    <section className={sectionClasses}>
      {children}
    </section>
  )
}
```

---

## Component Styling Patterns

### CSS Module Structure

Each component follows a consistent CSS module structure:

```css
/* Component.module.css */

/* ========================================
 * BASE COMPONENT STYLES
 * ======================================== */

.componentName {
  /* Base styles using design tokens */
  background-color: var(--card-background);
  border: 1px solid var(--card-border-color);
  border-radius: var(--card-border-radius);
  padding: var(--card-padding);
  transition: all var(--transition-duration-base) var(--transition-timing-ease);
}

/* ========================================
 * COMPONENT VARIANTS
 * ======================================== */

.variant-primary {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-200);
}

.variant-secondary {
  background-color: var(--color-secondary-50);
  border-color: var(--color-secondary-200);
}

/* ========================================
 * COMPONENT STATES
 * ======================================== */

.componentName:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.componentName:focus-visible {
  outline: var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

.componentName[aria-disabled="true"] {
  opacity: var(--state-disabled-opacity);
  pointer-events: none;
}

/* ========================================
 * RESPONSIVE BEHAVIOR
 * ======================================== */

@media (max-width: 767px) {
  .componentName {
    padding: var(--spacing-4);
    font-size: var(--font-size-sm);
  }
}

@media (min-width: 768px) {
  .componentName {
    padding: var(--spacing-6);
    font-size: var(--font-size-base);
  }
}
```

### Utility Classes

Common utility classes are defined in `utilities.css`:

```css
/* Button utilities */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
  border: 2px solid var(--color-primary-600);
  color: var(--color-secondary-50);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-duration-base) var(--transition-timing-ease);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary-800) 100%);
  border-color: var(--color-primary-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Focus utilities */
.focus-ring:focus-visible {
  outline: var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Spacing utilities */
.dt-spacing-4 { margin: var(--spacing-4); }
.dt-spacing-6 { margin: var(--spacing-6); }
.dt-spacing-8 { margin: var(--spacing-8); }
```

---

## Accessibility Implementation

### Focus Management

All interactive components implement proper focus management:

```tsx
// Example: Custom Button Component
const Button: React.FC<ButtonProps> = ({ children, variant, ...props }) => {
  return (
    <button
      className={`btn-${variant} focus-ring`}
      {...props}
    >
      {children}
    </button>
  )
}

// Example: Dialog with Focus Trap
const Dialog: React.FC<DialogProps> = ({ open, children, ...props }) => {
  const focusTrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && focusTrapRef.current) {
      const firstFocusable = focusTrapRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      
      firstFocusable?.focus()
    }
  }, [open])

  return (
    <RadixDialog.Root open={open} {...props}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="dialog-overlay" />
        <RadixDialog.Content ref={focusTrapRef} className="dialog-content">
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
```

### Keyboard Navigation

Radix UI components provide built-in keyboard navigation:

```tsx
// Select component keyboard navigation
<Select.Root>
  <Select.Trigger aria-label="Select option">
    <Select.Value />
    <Select.Icon />
  </Select.Trigger>
  <Select.Content>
    <Select.Viewport>
      {options.map(option => (
        <Select.Item key={option.value} value={option.value}>
          <Select.ItemText>{option.label}</Select.ItemText>
        </Select.Item>
      ))}
    </Select.Viewport>
  </Select.Content>
</Select.Root>

// Navigation menu with arrow key support
<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Menu Item</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link href="/link">Submenu Item</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>
```

### Screen Reader Support

All components include proper ARIA attributes:

```tsx
// Form field with proper labeling
<div role="group" aria-labelledby="field-label">
  <label id="field-label" htmlFor="input">
    Field Label
  </label>
  <input
    id="input"
    aria-describedby="field-description field-error"
    aria-invalid={hasError}
  />
  <div id="field-description">Field description</div>
  {error && (
    <div id="field-error" role="alert" aria-live="polite">
      {error}
    </div>
  )}
</div>

// Status announcements
const StatusAnnouncer: React.FC<{ message: string }> = ({ message }) => (
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
)
```

---

## Migration from Legacy Components

### Step 1: Identify Equivalent Radix UI Component

**Legacy Custom Modal → Radix UI Dialog:**
```tsx
// Old custom modal
<Modal isOpen={open} onClose={close}>
  <ModalHeader title="Title" />
  <ModalBody>Content</ModalBody>
  <ModalFooter>Actions</ModalFooter>
</Modal>

// New Radix UI Dialog
<BaseDialog open={open} onOpenChange={setOpen}>
  <BaseDialog.Header title="Title" />
  <BaseDialog.Body>Content</BaseDialog.Body>
  <BaseDialog.Footer>Actions</BaseDialog.Footer>
</BaseDialog>
```

### Step 2: Apply Design Tokens

**Before (hardcoded values):**
```css
.modal {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

**After (design tokens):**
```css
.modal {
  background: var(--card-background);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-lg);
}
```

### Step 3: Implement Accessibility Features

**Before (basic implementation):**
```tsx
const Modal = ({ isOpen, children }) => (
  <div className={isOpen ? 'modal-open' : 'modal-closed'}>
    {children}
  </div>
)
```

**After (full accessibility):**
```tsx
const Modal = ({ open, onOpenChange, children }) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content aria-describedby="dialog-description">
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
```

---

## Performance Optimization

### Bundle Size Optimization

Import only the Radix UI components you need:

```tsx
// ✅ Good: Import specific components
import * as Dialog from "@radix-ui/react-dialog"
import * as Select from "@radix-ui/react-select"

// ❌ Bad: Import entire library
import * as RadixUI from "@radix-ui/react"
```

### CSS Optimization

Use design tokens to reduce CSS duplication:

```css
/* ✅ Good: Reusable with design tokens */
.card, .modal, .panel {
  background: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-base);
}

/* ❌ Bad: Duplicate styles */
.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.modal { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.panel { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
```

### Component Lazy Loading

Implement lazy loading for large components:

```tsx
import { lazy, Suspense } from 'react'

const LazyDialog = lazy(() => import('./Dialog/BaseDialog'))

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyDialog />
  </Suspense>
)
```

---

## Testing Guidelines

### Component Testing

Test components with accessibility in mind:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('should be accessible via keyboard', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    await user.tab()
    
    expect(button).toHaveFocus()
    
    await user.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalled()
  })

  it('should have proper ARIA attributes', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })
})
```

### Integration Testing

Test component composition:

```tsx
import { render, screen } from '@testing-library/react'
import { BaseDialog } from './Dialog'

describe('Dialog Integration', () => {
  it('should compose dialog parts correctly', () => {
    render(
      <BaseDialog open={true} onOpenChange={() => {}}>
        <BaseDialog.Header title="Test Dialog" />
        <BaseDialog.Body>Test content</BaseDialog.Body>
        <BaseDialog.Footer>
          <button>Close</button>
        </BaseDialog.Footer>
      </BaseDialog>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })
})
```

---

## Conclusion

This component implementation guide provides the foundation for building accessible, maintainable, and performant components using Radix UI primitives and our design system. By following these patterns and guidelines, you can create consistent user experiences while maintaining high code quality and accessibility standards.

For specific component documentation and examples, refer to the individual component files in the `src/components/` directory.