import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncTranslation } from '../../contexts/LanguageContext';
import { ApiError } from '../../utils/apiUtils';
import { UserService } from '../../services/userService';
import GoogleLoginButton from '../common/GoogleLoginButton';
import PasswordInput from '../ui/PasswordInput';

type ModalView = 'login' | 'register' | 'forgotPassword' | 'resetPassword' | 'emailSent' | 'resetSuccess';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialView?: ModalView;
  resetToken?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialView = 'login',
  resetToken
}) => {
  const { login, register } = useAuth();
  const { t: tForms } = useAsyncTranslation('forms');
  const { t: tErrors } = useAsyncTranslation('errors');

  // Modal state management
  const [currentView, setCurrentView] = useState<ModalView>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Form data for different views
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({ email: '' });
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Start exit animation
      setIsAnimating(false);

      // Reset form data after animation completes
      const timer = setTimeout(() => {
        setCurrentView(initialView);
        setLoginData({ email: '', password: '' });
        setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
        setForgotPasswordData({ email: '' });
        setResetPasswordData({ password: '', confirmPassword: '' });
        setErrors({});
        setIsLoading(false);
        setSentEmail('');
        setIsTokenValid(null);
      }, 200); // Wait for animation to complete

      return () => clearTimeout(timer);
    } else {
      // Start enter animation after modal is shown
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);

      // Check for saved email for login
      const savedEmail = localStorage.getItem('savedEmail');
      if (savedEmail && currentView === 'login') {
        setLoginData(prev => ({ ...prev, email: savedEmail }));
        setRememberMe(true);
      }

      // If reset token provided, validate it and switch to reset view
      if (resetToken && currentView === 'resetPassword') {
        validateResetToken();
      }

      return () => clearTimeout(timer);
    }
  }, [isOpen, initialView, resetToken]);

  // Validate reset token
  const validateResetToken = async () => {
    if (!resetToken) {
      setIsTokenValid(false);
      return;
    }

    try {
      await UserService.validateResetToken(resetToken);
      setIsTokenValid(true);
    } catch (error) {
      console.error('Token validation failed:', error);
      setIsTokenValid(false);
    }
  };

  // Validation functions for different forms
  const validateLoginForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!loginData.email.trim()) {
      newErrors.email = tForms('validation.required', '此字段为必填项');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = tForms('validation.emailInvalid', '请输入有效的邮箱地址');
    }
    if (!loginData.password.trim()) {
      newErrors.password = tForms('validation.required', '此字段为必填项');
    } else if (loginData.password.length < 6) {
      newErrors.password = tForms('validation.passwordTooShort', '密码至少需要6位').replace('{min}', '6');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!registerData.username.trim()) {
      newErrors.username = tForms('validation.required', '此字段为必填项');
    } else if (registerData.username.length < 2) {
      newErrors.username = tForms('validation.minLength', '至少需要{min}个字符').replace('{min}', '2');
    } else if (registerData.username.length > 20) {
      newErrors.username = tForms('validation.maxLength', '不能超过{max}个字符').replace('{max}', '20');
    }
    if (!registerData.email.trim()) {
      newErrors.email = tForms('validation.required', '此字段为必填项');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      newErrors.email = tForms('validation.emailInvalid', '请输入有效的邮箱地址');
    }
    if (!registerData.password) {
      newErrors.password = tForms('validation.required', '此字段为必填项');
    } else if (registerData.password.length < 6) {
      newErrors.password = tForms('validation.passwordTooShort', '密码至少需要{min}位').replace('{min}', '6');
    } else if (registerData.password.length > 50) {
      newErrors.password = tForms('validation.maxLength', '不能超过{max}个字符').replace('{max}', '50');
    }
    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = tForms('validation.required', '此字段为必填项');
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = tForms('validation.passwordMismatch', '两次输入的密码不一致');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPasswordForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!forgotPasswordData.email.trim()) {
      newErrors.email = tForms('validation.required', '此字段为必填项');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordData.email)) {
      newErrors.email = tForms('validation.emailInvalid', '请输入有效的邮箱地址');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetPasswordForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!resetPasswordData.password) {
      newErrors.password = tForms('validation.required', '此字段为必填项');
    } else if (resetPasswordData.password.length < 6) {
      newErrors.password = tForms('validation.passwordTooShort', '密码至少需要{min}位').replace('{min}', '6');
    } else if (resetPasswordData.password.length > 50) {
      newErrors.password = tForms('validation.maxLength', '不能超过{max}个字符').replace('{max}', '50');
    }
    if (!resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = tForms('validation.required', '此字段为必填项');
    } else if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = tForms('validation.passwordMismatch', '两次输入的密码不一致');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Input change handlers
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleForgotPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleResetPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Submit handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(loginData.email, loginData.password);
      if (rememberMe) {
        localStorage.setItem('savedEmail', loginData.email);
      } else {
        localStorage.removeItem('savedEmail');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof ApiError) {
        switch (error.errorCode) {
          case '1001':
            setErrors({ general: tErrors('auth.invalidCredentials', '邮箱或密码错误') });
            break;
          case '1002':
            setErrors({ general: tErrors('auth.accountNotFound', '账户不存在') });
            break;
          case '1003':
            setErrors({ general: tErrors('validation.invalidFormat', '格式不正确') });
            break;
          default:
            setErrors({ general: error.message || tErrors('auth.invalidCredentials', '邮箱或密码错误') });
        }
      } else {
        setErrors({ general: tErrors('network.connectionFailed', '网络连接失败') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await register(registerData.username, registerData.email, registerData.password);

      // 注册成功后切换到登录界面，并预填邮箱
      setLoginData(prev => ({ ...prev, email: registerData.email }));
      setCurrentView('login');
      setErrors({ general: tForms('auth.registerSuccess', '注册成功！请登录您的账户。') });

    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof ApiError) {
        switch (error.errorCode) {
          case '2001':
            setErrors({ email: tErrors('auth.emailAlreadyExists', '邮箱已被注册') });
            break;
          case '2002':
            setErrors({ username: tErrors('auth.usernameAlreadyExists', '用户名已被使用') });
            break;
          case '1003':
            setErrors({ general: tErrors('validation.invalidFormat', '格式不正确') });
            break;
          default:
            setErrors({ general: error.message || tErrors('auth.registrationFailed', '注册失败') });
        }
      } else {
        setErrors({ general: tErrors('network.connectionFailed', '网络连接失败') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForgotPasswordForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await UserService.forgotPassword(forgotPasswordData.email.trim());
      setSentEmail(forgotPasswordData.email);
      setCurrentView('emailSent');
    } catch (error) {
      console.error('Forgot password failed:', error);
      if (error instanceof ApiError) {
        switch (error.errorCode) {
          case '1004':
            setErrors({ email: tErrors('auth.emailNotRegistered', '邮箱未注册') });
            break;
          case '1018':
            setErrors({ general: tErrors('auth.sendEmailFailed', '发送邮件失败') });
            break;
          default:
            setErrors({ general: error.message || tErrors('auth.forgotPasswordFailed', '重置密码失败') });
        }
      } else {
        setErrors({ general: tErrors('network.connectionFailed', '网络连接失败') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResetPasswordForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await UserService.resetPassword(resetToken!, resetPasswordData.password);
      setCurrentView('resetSuccess');
    } catch (error) {
      console.error('Reset password failed:', error);
      if (error instanceof ApiError) {
        switch (error.errorCode) {
          case '1019':
            setErrors({ general: tErrors('auth.tokenExpired', '重置链接已过期') });
            break;
          case '1020':
            setErrors({ general: tErrors('auth.tokenInvalid', '重置链接无效') });
            break;
          default:
            setErrors({ general: error.message || tErrors('auth.resetFailed', '重置密码失败') });
        }
      } else {
        setErrors({ general: tErrors('network.connectionFailed', '网络连接失败') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Render different views based on current state
  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return renderLoginView();
      case 'register':
        return renderRegisterView();
      case 'forgotPassword':
        return renderForgotPasswordView();
      case 'resetPassword':
        return renderResetPasswordView();
      case 'emailSent':
        return renderEmailSentView();
      case 'resetSuccess':
        return renderResetSuccessView();
      default:
        return renderLoginView();
    }
  };

  const renderLoginView = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#E6E6E6]">
          {tForms('auth.loginToYourAccount', '登录您的账号')}
        </h1>
        <button onClick={onClose} className="text-[#C8C8C8] hover:text-[#ECECEC] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <GoogleLoginButton
        rememberMe={rememberMe}
        onError={(error) => {
          setErrors({ general: error.message || tErrors('auth.googleLoginFailed', 'Google登录失败') });
        }}
        onSuccess={() => {
          onSuccess?.();
          onClose();
        }}
      />

      <div className="flex items-center py-3 my-4 text-sm text-[#C8C8C8] before:flex-1 before:border-t before:border-[#393B42] before:me-6 after:flex-1 after:border-t after:border-[#393B42] after:ms-6">
        {tForms('auth.orDivider', '或使用')}
      </div>

      <form onSubmit={handleLogin}>
        {errors.general && (
          <div className={`rounded-md p-4 mb-4 ${
            errors.general.includes('注册成功') || errors.general.includes('Registration successful')
              ? 'bg-green-50'
              : 'bg-red-50'
          }`}>
            <div className={`text-sm ${
              errors.general.includes('注册成功') || errors.general.includes('Registration successful')
                ? 'text-green-700'
                : 'text-red-700'
            }`}>
              {errors.general}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-[#E6E6E6]">
            {tForms('fields.email', '邮箱')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={loginData.email}
            onChange={handleLoginInputChange}
            className="w-full px-3 py-3 text-sm border rounded-lg focus:outline-none"
            style={{
              backgroundColor: '#26262D',
              borderColor: errors.email ? '#98FF59' : '#393B42',
              color: '#ECECEC'
            }}
            placeholder={tForms('placeholders.email', '请输入邮箱')}
          />
          {errors.email && (
            <p className="text-sm mt-1" style={{color: '#98FF59'}}>{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-[#E6E6E6]">
            {tForms('fields.password', '密码')}
          </label>
          <PasswordInput
            id="password"
            name="password"
            value={loginData.password}
            onChange={handleLoginInputChange}
            placeholder={tForms('placeholders.password', '请输入密码')}
            required
            error={errors.password}
          />
          {errors.password && (
            <p className="text-sm mt-1" style={{color: '#98FF59'}}>{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-start">
            <label className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-[#26262D] border-[#393B42] rounded text-[#98FF59] focus:ring-[#98FF59] focus:ring-2 focus:ring-opacity-50 accent-[#98FF59]"
                style={{
                  accentColor: '#98FF59'
                }}
              />
              <span className="ml-2 text-sm text-[#E6E6E6]">{tForms('auth.rememberMe', '记住密码')}</span>
            </label>
          </div>
          {/* <button
            type="button"
            onClick={() => setCurrentView('forgotPassword')}
            className="font-medium hover:underline" style={{color: '#98FF59'}}
          >
            {tForms('auth.forgotPassword', '忘记密码？')}
          </button> */}
        </div>

        <div className="mb-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-black bg-[#98FF59] hover:bg-[#B3FF7A] font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              tForms('auth.loginButton', '登录')
            )}
          </button>
        </div>

        <p className="text-sm font-light text-center text-[#C8C8C8]">
          {tForms('auth.noAccount', '还没有账户？')}{' '}
          <button
            type="button"
            onClick={() => setCurrentView('register')}
            className="font-medium hover:underline"
            style={{color: '#98FF59'}}
          >
            {tForms('auth.registerButton', '注册')}
          </button>
        </p>
      </form>
    </>
  );

  const renderRegisterView = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#E6E6E6]">
          {tForms('auth.registerYourAccount', '注册您的账号')}
        </h1>
        <button onClick={onClose} className="text-[#C8C8C8] hover:text-[#ECECEC] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="google-login-container">
        <GoogleLoginButton
          rememberMe={false}
          onError={(error) => {
            setErrors({ general: error.message || tErrors('auth.googleLoginFailed', 'Google登录失败') });
          }}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </div>

      <div className="flex items-center py-3 my-2 text-sm text-[#C8C8C8] before:flex-1 before:border-t before:border-[#393B42] before:me-6 after:flex-1 after:border-t after:border-[#393B42] after:ms-6">
        {tForms('auth.orDivider', '或使用')}
      </div>

      <form onSubmit={handleRegister}>
        {errors.general && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-700">{errors.general}</div>
          </div>
        )}

        <div className="mb-2">
          <label htmlFor="username" className="block mb-2 text-sm font-medium text-[#E6E6E6]">
            {tForms('fields.username', '用户名')}
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={registerData.username}
            onChange={handleRegisterInputChange}
            className="w-full px-3 py-3 text-sm border rounded-lg focus:outline-none"
            style={{
              backgroundColor: '#26262D',
              borderColor: errors.username ? '#98FF59' : '#393B42',
              color: '#ECECEC'
            }}
            placeholder={tForms('placeholders.username', '请输入用户名')}
          />
          <div className="h-4 mt-1">
            {errors.username && (
              <p className="text-sm" style={{color: '#98FF59'}}>{errors.username}</p>
            )}
          </div>
        </div>

        <div className="mb-2">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-[#E6E6E6]">
            {tForms('fields.email', '邮箱')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={registerData.email}
            onChange={handleRegisterInputChange}
            className="w-full px-3 py-3 text-sm border rounded-lg focus:outline-none"
            style={{
              backgroundColor: '#26262D',
              borderColor: errors.email ? '#98FF59' : '#393B42',
              color: '#ECECEC'
            }}
            placeholder={tForms('placeholders.email', '请输入邮箱')}
          />
          <div className="h-4 mt-1">
            {errors.email && (
              <p className="text-sm" style={{color: '#98FF59'}}>{errors.email}</p>
            )}
          </div>
        </div>

        <div className="mb-2">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-[#E6E6E6]">
            {tForms('fields.password', '密码')}
          </label>
          <PasswordInput
            id="password"
            name="password"
            value={registerData.password}
            onChange={handleRegisterInputChange}
            placeholder={tForms('placeholders.password', '请输入密码')}
            required
            error={errors.password}
          />
          <div className="h-4 mt-1">
            {errors.password && (
              <p className="text-sm" style={{color: '#98FF59'}}>{errors.password}</p>
            )}
          </div>
        </div>

        <div className="mb-2">
          <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-[#E6E6E6]">
            {tForms('fields.confirmPassword', '确认密码')}
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={registerData.confirmPassword}
            onChange={handleRegisterInputChange}
            placeholder={tForms('placeholders.confirmPassword', '请再次输入密码')}
            required
            error={errors.confirmPassword}
          />
          <div className="h-4 mt-1">
            {errors.confirmPassword && (
              <p className="text-sm" style={{color: '#98FF59'}}>{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-black bg-[#98FF59] hover:bg-[#B3FF7A] font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              tForms('auth.registerButton', '注册')
            )}
          </button>
        </div>

        <p className="text-sm font-light text-center text-[#C8C8C8]">
          {tForms('auth.hasAccount', '已经有账户？')}{' '}
          <button
            type="button"
            onClick={() => setCurrentView('login')}
            className="font-medium hover:underline"
            style={{color: '#98FF59'}}
          >
            {tForms('auth.loginHere', '点击这里登录')}
          </button>
        </p>
      </form>
    </>
  );

  const renderForgotPasswordView = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#E6E6E6]">
          {tForms('auth.resetYourPassword', '重置密码')}
        </h1>
        <button onClick={onClose} className="text-[#C8C8C8] hover:text-[#ECECEC] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleForgotPassword}>
        {errors.general && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-700">{errors.general}</div>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-[#E6E6E6]">
            {tForms('fields.emailAddress', '邮件')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={forgotPasswordData.email}
            onChange={handleForgotPasswordInputChange}
            className="w-full px-3 py-3 text-sm border rounded-lg focus:outline-none"
            style={{
              backgroundColor: '#26262D',
              borderColor: errors.email ? '#98FF59' : '#393B42',
              color: '#ECECEC'
            }}
            placeholder={tForms('placeholders.emailAddress', '请输入您的邮箱地址')}
          />
          <div className="h-4 mt-1">
            {errors.email && (
              <p className="text-sm" style={{color: '#98FF59'}}>{errors.email}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-black bg-[#98FF59] hover:bg-[#B3FF7A] font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              tForms('auth.sendResetEmail', '发送重置邮件')
            )}
          </button>
        </div>

        <p className="text-sm font-light text-center text-[#C8C8C8]">
          {tForms('auth.rememberPassword', '记住密码？')}{' '}
          <button
            type="button"
            onClick={() => setCurrentView('login')}
            className="font-medium hover:underline"
            style={{color: '#98FF59'}}
          >
            {tForms('auth.backToLogin', '返回登录')}
          </button>
        </p>
      </form>
    </>
  );

  const renderEmailSentView = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#E6E6E6]">
          {tForms('auth.emailSent', '邮件已发送')}
        </h1>
        <button onClick={onClose} className="text-[#C8C8C8] hover:text-[#ECECEC] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-6">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="mb-4 text-sm text-[#C8C8C8]">
          {tForms('auth.resetEmailSentTo', '重置密码的邮件已发送到：')}
        </p>
        <p className="mb-6 text-sm font-medium text-lime-300">
          {sentEmail}
        </p>
        <p className="mb-8 text-sm text-[#C8C8C8]">
          {tForms('auth.checkEmailInstructions', '请检查您的邮箱并点击邮件中的链接来重置密码。')}
        </p>

        <div className="mb-6">
          <button
            onClick={() => setCurrentView('login')}
            className="w-full inline-flex justify-center text-black bg-[#98FF59] hover:bg-[#B3FF7A] focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {tForms('auth.backToLogin', '返回登录')}
          </button>
        </div>

        <button
          onClick={() => {
            setCurrentView('forgotPassword');
            setForgotPasswordData({ email: '' });
          }}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          {tForms('auth.resendEmail', '重新发送邮件')}
        </button>
      </div>
    </>
  );

  const renderResetPasswordView = () => {
    if (isTokenValid === null) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      );
    }

    if (isTokenValid === false) {
      return (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-[#E6E6E6]">
              {tForms('auth.linkInvalid', '链接无效')}
            </h1>
            <button onClick={onClose} className="text-[#C8C8C8] hover:text-[#ECECEC] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-center">
            <p className="mb-8 text-sm text-[#C8C8C8]">
              {tForms('auth.linkInvalidDesc', '此重置链接已过期或无效，请重新申请')}
            </p>

            <div className="mb-6">
              <button
                onClick={() => setCurrentView('forgotPassword')}
                className="w-full text-black bg-[#98FF59] hover:bg-[#B3FF7A] focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                {tForms('auth.requestNewReset', '重新申请重置')}
              </button>
            </div>

            <button
              onClick={() => setCurrentView('login')}
              className="text-sm font-medium text-lime-300 hover:underline"
            >
              {tForms('auth.backToLogin', '返回登录')}
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-[#E6E6E6]">
            {tForms('auth.resetPasswordTitle', '重置密码')}
          </h1>
          <button onClick={onClose} className="text-[#C8C8C8] hover:text-[#ECECEC] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-8 text-sm text-[#C8C8C8]">
          {tForms('auth.resetPasswordDesc', '请输入您的新密码')}
        </p>

        <form onSubmit={handleResetPassword}>
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-[#E6E6E6]">
              {tForms('auth.newPassword', '新密码')}
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={resetPasswordData.password}
              onChange={handleResetPasswordInputChange}
              placeholder={tForms('placeholders.password', '请输入密码')}
              required
              error={errors.password}
            />
            <div className="h-4 mt-1">
              {errors.password && (
                <p className="text-sm" style={{color: '#98FF59'}}>{errors.password}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-[#E6E6E6]">
              {tForms('auth.confirmNewPassword', '确认新密码')}
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={resetPasswordData.confirmPassword}
              onChange={handleResetPasswordInputChange}
              placeholder={tForms('placeholders.confirmPassword', '请再次输入密码')}
              required
              error={errors.confirmPassword}
            />
            <div className="h-4 mt-1">
              {errors.confirmPassword && (
                <p className="text-sm" style={{color: '#98FF59'}}>{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-black bg-[#98FF59] hover:bg-[#B3FF7A] focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                tForms('auth.resetPassword', '重置密码')
              )}
            </button>
          </div>

          <p className="text-sm font-light text-center text-[#C8C8C8]">
            {tForms('auth.rememberPassword', '记住密码？')}{' '}
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className="font-medium hover:underline"
            style={{color: '#98FF59'}}
            >
              {tForms('auth.backToLogin', '返回登录')}
            </button>
          </p>
        </form>
      </>
    );
  };

  const renderResetSuccessView = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#E6E6E6]">
          {tForms('auth.resetSuccess', '重置成功')}
        </h1>
        <button onClick={onClose} className="text-[#C8C8C8] hover:text-[#ECECEC] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-6">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mb-8 text-sm text-[#C8C8C8]">
          {tForms('auth.resetSuccessDesc', '您的密码已成功重置，现在可以使用新密码登录')}
        </p>

        <div className="mb-6">
          <button
            onClick={() => setCurrentView('login')}
            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {tForms('auth.goToLogin', '前往登录')}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-[60] flex items-start justify-center p-4 pt-24 transition-all duration-200 ease-out ${
          isOpen && isAnimating
            ? 'bg-opacity-30'
            : 'bg-opacity-0'
        }`}
        onClick={onClose}
      >
        <div
          className={`bg-[#26262D] border border-[#393B42] rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto transition-all duration-200 ease-out ${
            isOpen && isAnimating
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 -translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;