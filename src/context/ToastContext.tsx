"use client"

"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from '../components/Toast';
import styles from './ToastContext.module.css';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    
    setToasts(prevToasts => [...prevToasts, newToast]);

    // Auto-remove toast after duration (if not persistent)
    const duration = toast.duration;
    if (duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    addToast({ title, message, type: 'success', duration });
  }, [addToast]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    addToast({ title, message, type: 'error', duration });
  }, [addToast]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    addToast({ title, message, type: 'warning', duration });
  }, [addToast]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    addToast({ title, message, type: 'info', duration });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      <div className={styles.toastPosition}>
        <Toast toasts={toasts} onRemove={removeToast} />
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
