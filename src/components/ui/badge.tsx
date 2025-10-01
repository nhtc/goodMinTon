import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-800 border border-primary-200",
        secondary: "bg-secondary-100 text-secondary-800 border border-secondary-200",
        success: "bg-success-100 text-success-800 border border-success-200",
        warning: "bg-warning-100 text-warning-800 border border-warning-200",
        error: "bg-error-100 text-error-800 border border-error-200",
        outline: "bg-transparent text-secondary-700 border border-secondary-300",
        solid: "bg-secondary-900 text-white border border-secondary-900",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        base: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "base",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }