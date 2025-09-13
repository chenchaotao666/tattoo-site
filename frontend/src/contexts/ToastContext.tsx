import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ToastContextType {
  toast: ToastState;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  hideToast: () => void;
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
  showWarningToast: (message: string) => void;
  showInfoToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    type: 'info'
  });

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    setToast({
      isVisible: true,
      message,
      type
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  const showSuccessToast = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showErrorToast = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const showWarningToast = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const showInfoToast = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  const value = {
    toast,
    showToast,
    hideToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};