import * as React from "react"

import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Show error state styling */
  error?: boolean
  /** Show success state styling */
  success?: boolean
}

// Base input styles using design tokens
const BASE_INPUT_STYLES = [
  "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm font-family-primary",
  "border-secondary-300 text-secondary-900 placeholder:text-secondary-400",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
  "focus-visible:border-primary-500 transition-all duration-200",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary-50",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  "hover:border-secondary-400"
].join(" ")

const ERROR_STYLES = "border-error-500 focus-visible:ring-error-500 focus-visible:border-error-500"
const SUCCESS_STYLES = "border-success-500 focus-visible:ring-success-500 focus-visible:border-success-500"

/**
 * Input component with design system styling and state variants
 * 
 * @example
 * ```tsx
 * <Input 
 *   type="email" 
 *   placeholder="Enter your email"
 *   error={hasError}
 *   success={isValid}
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const { className, type, error, success, ...restProps } = props

    return (
      <input
        type={type}
        className={cn(
          BASE_INPUT_STYLES,
          error && ERROR_STYLES,
          success && SUCCESS_STYLES,
          className
        )}
        ref={ref}
        {...restProps}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
