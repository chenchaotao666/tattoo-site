import React, { createContext, useContext, useState, ReactNode } from 'react';

type ModalView = 'login' | 'register' | 'forgotPassword' | 'resetPassword' | 'emailSent' | 'resetSuccess';

interface LoginModalContextType {
  isLoginModalOpen: boolean;
  modalView: ModalView;
  resetToken?: string;
  openLoginModal: (view?: ModalView) => void;
  openRegisterModal: () => void;
  openForgotPasswordModal: () => void;
  openResetPasswordModal: (token: string) => void;
  closeLoginModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

export const useLoginModal = () => {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
};

interface LoginModalProviderProps {
  children: ReactNode;
}

export const LoginModalProvider: React.FC<LoginModalProviderProps> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('login');
  const [resetToken, setResetToken] = useState<string | undefined>();

  const openLoginModal = (view: ModalView = 'login') => {
    setModalView(view);
    setIsLoginModalOpen(true);
  };

  const openRegisterModal = () => {
    setModalView('register');
    setIsLoginModalOpen(true);
  };

  const openForgotPasswordModal = () => {
    setModalView('forgotPassword');
    setIsLoginModalOpen(true);
  };

  const openResetPasswordModal = (token: string) => {
    setModalView('resetPassword');
    setResetToken(token);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setModalView('login');
    setResetToken(undefined);
  };

  return (
    <LoginModalContext.Provider
      value={{
        isLoginModalOpen,
        modalView,
        resetToken,
        openLoginModal,
        openRegisterModal,
        openForgotPasswordModal,
        openResetPasswordModal,
        closeLoginModal
      }}
    >
      {children}
    </LoginModalContext.Provider>
  );
};