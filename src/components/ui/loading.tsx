import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "../../lib/utils"

/**
 * Loading Spinner Component with size variants
 */
export interface LoadingSpinnerProps {
  /** Size variant of the spinner */
  size?: 'sm' | 'base' | 'lg'
  /** Additional CSS classes */
  className?: string
}

const SPINNER_SIZE_CLASSES = {
  sm: 'w-4 h-4',
  base: 'w-6 h-6', 
  lg: 'w-8 h-8'
} as const

const SPINNER_BASE_CLASSES = [
  "animate-spin rounded-full border-2 border-transparent",
  "border-t-primary-600 border-r-primary-600"
].join(" ")

/**
 * Loading spinner component with accessibility support
 * 
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'base', 
  className 
}) => {
  return (
    <div 
      className={cn(
        SPINNER_BASE_CLASSES,
        SPINNER_SIZE_CLASSES[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Progress Bar Component using Radix UI primitives
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary-200",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary-600 transition-all duration-300"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

/**
 * Skeleton Component for loading states
 */
export interface SkeletonProps {
  /** Additional CSS classes */
  className?: string
  /** Visual variant of the skeleton */
  variant?: 'text' | 'rectangular' | 'circular'
}

const SKELETON_VARIANT_STYLES = {
  text: 'h-4 w-full',
  rectangular: 'h-12 w-full',
  circular: 'h-12 w-12 rounded-full'
} as const

/**
 * Skeleton loading placeholder component
 * 
 * @example
 * ```tsx
 * <Skeleton variant="circular" />
 * <Skeleton variant="text" />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({ 
  className,
  variant = 'rectangular'
}) => {
  const isCircular = variant === 'circular'
  
  return (
    <div
      className={cn(
        "animate-pulse bg-secondary-200",
        isCircular ? 'rounded-full' : 'rounded-md',
        SKELETON_VARIANT_STYLES[variant],
        className
      )}
    />
  )
}

/**
 * Status Badge Component for displaying status information
 */
export interface StatusBadgeProps {
  /** Status type affecting the styling */
  status: 'success' | 'warning' | 'error' | 'info' | 'default'
  /** Badge content */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Size variant */
  size?: 'sm' | 'base'
}

const STATUS_STYLES = {
  success: 'bg-success-100 text-success-700 border-success-200',
  warning: 'bg-warning-100 text-warning-700 border-warning-200',
  error: 'bg-error-100 text-error-700 border-error-200',
  info: 'bg-info-100 text-info-700 border-info-200',
  default: 'bg-secondary-100 text-secondary-700 border-secondary-200'
} as const

const BADGE_SIZE_STYLES = {
  sm: 'px-2 py-0.5 text-xs',
  base: 'px-2.5 py-1 text-sm'
} as const

/**
 * Status badge component with semantic styling
 * 
 * @example
 * ```tsx
 * <StatusBadge status="success" size="sm">
 *   Completed
 * </StatusBadge>
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className,
  size = 'base'
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium",
        STATUS_STYLES[status],
        BADGE_SIZE_STYLES[size],
        className
      )}
    >
      {children}
    </span>
  )
}

export { Progress }