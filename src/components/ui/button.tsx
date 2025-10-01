import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

// Base button styles following design system
const BASE_BUTTON_STYLES = [
  "inline-flex items-center justify-center whitespace-nowrap gap-2",
  "rounded-lg text-sm font-medium transition-all",
  "duration-200 ease-in-out cursor-pointer",
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-primary-500 focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50",
  "disabled:cursor-not-allowed active:scale-95"
].join(" ")

// Hover animation styles for elevated buttons
const ELEVATED_HOVER_STYLES = "shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95"

/**
 * Button variant configurations using design tokens
 */
const BUTTON_VARIANTS = {
  primary: `bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 hover:border-primary-700 ${ELEVATED_HOVER_STYLES}`,
  secondary: `bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50 hover:border-secondary-400 ${ELEVATED_HOVER_STYLES}`,
  accent: `bg-accent-600 text-white border border-accent-600 hover:bg-accent-700 hover:border-accent-700 ${ELEVATED_HOVER_STYLES}`,
  outline: `bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 hover:border-primary-700 ${ELEVATED_HOVER_STYLES}`,
  ghost: "bg-transparent text-secondary-600 border border-transparent hover:bg-secondary-100 hover:text-secondary-900",
  success: `bg-success-600 text-white border border-success-600 hover:bg-success-700 hover:border-success-700 ${ELEVATED_HOVER_STYLES}`,
  warning: `bg-warning-600 text-white border border-warning-600 hover:bg-warning-700 hover:border-warning-700 ${ELEVATED_HOVER_STYLES}`,
  destructive: `bg-error-600 text-white border border-error-600 hover:bg-error-700 hover:border-error-700 ${ELEVATED_HOVER_STYLES}`,
  link: "text-primary-600 underline-offset-4 hover:underline bg-transparent border-transparent p-0 h-auto",
}

/**
 * Button size configurations using design tokens
 */
const BUTTON_SIZES = {
  sm: "h-8 px-3 text-xs rounded-md min-w-16",
  base: "h-10 px-4 py-2 text-sm rounded-lg min-w-20",
  lg: "h-12 px-6 text-base rounded-lg min-w-24",
  xl: "h-14 px-8 text-lg rounded-xl min-w-28",
  icon: "h-10 w-10 p-0 rounded-lg",
}

const buttonVariants = cva(BASE_BUTTON_STYLES, {
  variants: {
    variant: BUTTON_VARIANTS,
    size: BUTTON_SIZES,
  },
  defaultVariants: {
    variant: "primary",
    size: "base",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a different component using Radix UI Slot */
  asChild?: boolean
  /** Show loading spinner and disable interaction */
  isLoading?: boolean
}

/**
 * Button component built on Radix UI Slot with design system variants
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" isLoading={isSubmitting}>
 *   Submit Form
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { 
      className, 
      variant, 
      size, 
      asChild = false, 
      isLoading = false, 
      disabled, 
      children, 
      ...restProps 
    } = props

    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        data-loading={isLoading}
        {...restProps}
      >
        {isLoading && (
          <div 
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" 
            aria-hidden="true"
          />
        )}
        {children}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
