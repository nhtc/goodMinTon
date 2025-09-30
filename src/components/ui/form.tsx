import * as React from "react"
import * as FormPrimitive from "@radix-ui/react-form"
import { cn } from "../../lib/utils"

const Form = FormPrimitive.Root

const FormField = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Field>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Field>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Field
    ref={ref}
    className={cn("mb-4", className)}
    {...props}
  />
))
FormField.displayName = "FormField"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Label>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Label
    ref={ref}
    className={cn(
      "block text-sm font-medium text-secondary-700 mb-2",
      "peer-invalid:text-error-600",
      className
    )}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Control>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Control>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Control
    ref={ref}
    className={cn("peer", className)}
    {...props}
  />
))
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Message>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Message>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Message
    ref={ref}
    className={cn(
      "text-xs text-error-600 mt-1 flex items-center gap-1",
      className
    )}
    {...props}
  />
))
FormMessage.displayName = "FormMessage"

const FormValidityState = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.ValidityState> & {
    className?: string
  }
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-xs text-success-600 mt-1", className)}>
    <FormPrimitive.ValidityState {...props} />
  </div>
))
FormValidityState.displayName = "FormValidityState"

const FormSubmit = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Submit>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Submit>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Submit
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium",
      "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-primary-500 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "bg-primary-600 text-white hover:bg-primary-700 h-10 px-4 py-2",
      "shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
      className
    )}
    {...props}
  />
))
FormSubmit.displayName = "FormSubmit"

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormValidityState,
  FormSubmit
}