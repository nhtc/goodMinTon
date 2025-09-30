import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { cn } from "../../lib/utils"

/**
 * Toast Provider component - Required at app root level
 */
const ToastProvider = ToastPrimitive.Provider

/**
 * Toast Viewport for positioning toasts
 */
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4",
      "sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

/**
 * Toast variant styles using design tokens
 */
const TOAST_VARIANT_STYLES = {
  default: 'border-secondary-200 bg-white text-secondary-900',
  success: 'border-success-200 bg-success-50 text-success-900',
  warning: 'border-warning-200 bg-warning-50 text-warning-900',
  error: 'border-error-200 bg-error-50 text-error-900'
} as const

/**
 * Base toast animation classes
 */
const TOAST_BASE_CLASSES = [
  "group pointer-events-auto relative flex w-full items-center justify-between",
  "space-x-2 overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
  "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
  "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
  "data-[swipe=move]:transition-none data-[state=open]:animate-in",
  "data-[state=closed]:animate-out data-[swipe=end]:animate-out",
  "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
  "data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
].join(" ")

/**
 * Main Toast component with variant support
 */
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
    /** Visual variant of the toast */
    variant?: 'default' | 'success' | 'warning' | 'error'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        TOAST_BASE_CLASSES,
        TOAST_VARIANT_STYLES[variant],
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitive.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border",
      "bg-transparent px-3 text-sm font-medium transition-colors",
      "hover:bg-secondary-100 focus:outline-none focus:ring-1",
      "focus:ring-primary-500 disabled:pointer-events-none disabled:opacity-50",
      "group-[.destructive]:border-error-100 group-[.destructive]:hover:border-error-50",
      "group-[.destructive]:hover:bg-error-50 group-[.destructive]:hover:text-error-900",
      "group-[.destructive]:focus:ring-error-500",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitive.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-secondary-500",
      "opacity-0 transition-opacity hover:text-secondary-900",
      "focus:opacity-100 focus:outline-none focus:ring-1",
      "focus:ring-primary-500 group-hover:opacity-100",
      "group-[.destructive]:text-error-300 group-[.destructive]:hover:text-error-50",
      "group-[.destructive]:focus:ring-error-500 group-[.destructive]:focus:ring-offset-error-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m11.7816 4.03157c.0824-.02409.1215-.079.1262-.1262.0047-.0472-.0206-.0747-.0262-.1262l-.707-.707c-.0515-.0056-.079-.0309-.1262-.0262-.0472.0047-.1038.0438-.1262.1262l-3.75 3.75-3.75-3.75c-.02409-.0824-.079-.1215-.1262-.1262-.04721-.0047-.07471.0206-.1262.0262l-.707.707c-.00565.0515-.03089.079-.02621.1262.00468.0472.04379.1038.1262.1262l3.75 3.75-3.75 3.75c-.08241.0241-.12151.079-.1262.1262-.00468.0472.02056.0747.02621.1262l.707.707c.05149.0056.07899.0309.1262.0262.04721-.0047.10211-.0438.1262-.1262l3.75-3.75 3.75 3.75c.0241.0824.079.1215.1262.1262.0472.0047.0747-.0206.1262-.0262l.707-.707c.0056-.0515.0309-.079.0262-.1262-.0047-.0472-.0438-.1021-.1262-.1262l-3.75-3.75 3.75-3.75z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}