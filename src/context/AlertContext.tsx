"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AlertModal from '../components/AlertModal';

export interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface AlertConfig {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  actions?: AlertAction[];
  showCloseButton?: boolean;
  onClose?: () => void;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

  const handleClose = useCallback(() => {
    if (alertConfig?.onClose) {
      alertConfig.onClose();
    }
    hideAlert();
  }, [alertConfig, hideAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertConfig && (
        <AlertModal
          isOpen={true}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type || 'info'}
          actions={alertConfig.actions}
          showCloseButton={alertConfig.showCloseButton !== false}
          onClose={handleClose}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

// Convenience methods for common alert types
export function useAlertActions() {
  const { showAlert } = useAlert();

  const showSuccess = useCallback((title: string, message: string, onClose?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      onClose,
      actions: [
        {
          label: 'OK',
          onClick: () => {},
          variant: 'primary'
        }
      ]
    });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string, onClose?: () => void) => {
    showAlert({
      title,
      message,
      type: 'error',
      onClose,
      actions: [
        {
          label: 'OK',
          onClick: () => {},
          variant: 'danger'
        }
      ]
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, onClose?: () => void) => {
    showAlert({
      title,
      message,
      type: 'warning',
      onClose,
      actions: [
        {
          label: 'OK',
          onClick: () => {},
          variant: 'primary'
        }
      ]
    });
  }, [showAlert]);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmLabel: string = 'Confirm',
    cancelLabel: string = 'Cancel'
  ) => {
    showAlert({
      title,
      message,
      type: 'warning',
      showCloseButton: false,
      actions: [
        {
          label: cancelLabel,
          onClick: onCancel || (() => {}),
          variant: 'secondary'
        },
        {
          label: confirmLabel,
          onClick: onConfirm,
          variant: 'danger'
        }
      ]
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, onClose?: () => void) => {
    showAlert({
      title,
      message,
      type: 'info',
      onClose,
      actions: [
        {
          label: 'OK',
          onClick: () => {},
          variant: 'primary'
        }
      ]
    });
  }, [showAlert]);

  return {
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    showInfo
  };
}
