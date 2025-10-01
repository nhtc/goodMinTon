// Dialog system using Radix UI primitives
export { default as BaseDialog } from "./BaseDialog"
export { default as DialogHeader } from "./DialogHeader"
export { default as DialogBody } from "./DialogBody"
export { default as DialogFooter } from "./DialogFooter"
export { default as DialogOverlay } from "./DialogOverlay"

// Specialized dialog variants
export { default as ConfirmationDialog } from "./ConfirmationDialog"
export { default as AlertDialog } from "./AlertDialog"
export { default as FormDialog } from "./FormDialog"

// Re-export Radix UI dialog primitives for advanced usage
export * as RadixDialog from "@radix-ui/react-dialog"