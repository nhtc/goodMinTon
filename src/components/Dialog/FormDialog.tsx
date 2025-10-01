import React from "react"
import BaseDialog from "./BaseDialog"

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "base" | "lg" | "xl"
  actions?: React.ReactNode
  loading?: boolean
}

const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "base",
  actions,
  loading = false,
}) => {
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      size={size}
      disableOverlayClose={loading}
    >
      <BaseDialog.Header
        title={title}
        description={description}
        showCloseButton={!loading}
      />
      
      <BaseDialog.Body>
        {children}
      </BaseDialog.Body>
      
      {actions && (
        <BaseDialog.Footer>
          {actions}
        </BaseDialog.Footer>
      )}
    </BaseDialog>
  )
}

export default FormDialog