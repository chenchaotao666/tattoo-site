import { useState, useCallback } from 'react';

interface ToastState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export const useToast = () => {
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

  return {
    toast,
    showToast,
    hideToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast
  };
};