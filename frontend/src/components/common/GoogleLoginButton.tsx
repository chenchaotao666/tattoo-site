import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, useAsyncTranslation } from '../../contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { navigateWithLanguage } from '../../utils/navigationUtils';

interface GoogleLoginButtonProps {
  rememberMe?: boolean;
  onError?: (error: Error) => void;
}

// 将应用语言映射到Google支持的locale
const getGoogleLocale = (language: string): string => {
  // Google支持的主要语言代码
  const localeMap: { [key: string]: string } = {
    'zh': 'zh',        // 简体中文 - 尝试使用更简单的格式
    'zh-CN': 'zh',     // 简体中文
    'zh-TW': 'zh_TW',  // 繁体中文
    'en': 'en',        // 英文
    'ja': 'ja',        // 日文
    'ko': 'ko',        // 韩文
    'tw': 'zh_TW',     // 繁体中文
    'fr': 'fr',        // 法文
    'de': 'de',        // 德文
    'es': 'es',        // 西班牙文
    'pt': 'pt',        // 葡萄牙文
    'ru': 'ru',        // 俄文
    'ar': 'ar',        // 阿拉伯文
    'it': 'it',        // 意大利
  };
  
  // 提取语言代码（去掉地区后缀）
  const langCode = language.split('-')[0].toLowerCase();
  
  return localeMap[language] || localeMap[langCode] || 'en';
};

// 强制重置Google Sign-In的方法
const forceResetGoogleSignIn = () => {
  try {
    // 清除可能的缓存
    if (window.google?.accounts?.id) {
      // 清除所有Google相关的iframe
      const allFrames = document.querySelectorAll('iframe[src*="accounts.google.com"], iframe[src*="gstatic.com"], iframe[src*="google.com"]');
      allFrames.forEach(frame => frame.remove());
      
      // 清除所有可能的Google相关DOM元素
      const gButtons = document.querySelectorAll('[data-idomelements], .abcRioButton, .g_id_signin');
      gButtons.forEach(btn => btn.remove());
      
      // 清除可能的内部缓存和状态
      delete (window as any).__GOOGLE_ACCOUNTS__;
      delete (window as any).google;
      
      // 移除原有的Google脚本
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    }
  } catch (error) {
    console.warn('Could not reset Google Sign-In:', error);
  }
};

// 重新加载Google脚本的方法
const reloadGoogleScript = (locale: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 先清除现有脚本
    forceResetGoogleSignIn();
    
    // 创建新的脚本标签，带上语言参数
    const script = document.createElement('script');
    script.src = `https://accounts.google.com/gsi/client?hl=${locale}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log(`✅ Google script reloaded with locale: ${locale}`);
      resolve();
    };
    
    script.onerror = () => {
      console.error(`❌ Failed to reload Google script with locale: ${locale}`);
      reject(new Error('Failed to load Google script'));
    };
    
    document.head.appendChild(script);
  });
};

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  rememberMe = true,
  onError
}) => {
  const { googleLogin } = useAuth();
  const { language } = useLanguage();
  const { t } = useAsyncTranslation('components');
  const navigate = useNavigate();
  const location = useLocation();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialResponse = useCallback(async (response: any) => {
    console.log('📱 Google credential response received:', response);
    try {
      setIsLoading(false);
      const token = response.credential;
      console.log('🔑 Google token received, attempting login...');
      await googleLogin(token, rememberMe);
      console.log('✅ Google login successful');

      // 登录成功，跳转到首页或之前的页面
      const redirectTo = location.state?.from?.pathname || '/';
      console.log('🚀 Redirecting to:', redirectTo);
      navigateWithLanguage(navigate, redirectTo, { replace: true });
    } catch (error) {
      console.error('❌ Google login failed:', error);
      setIsLoading(false);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [googleLogin, rememberMe, navigate, location.state, onError]);

  const handleGoogleLogin = () => {
    if (!window.google?.accounts?.id) {
      console.error('Google Sign-In not loaded');
      if (onError) {
        onError(new Error('Google Sign-In not loaded'));
      }
      return;
    }

    setIsLoading(true);

    try {
      // 直接触发Google登录弹窗
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // 如果prompt不显示，设置loading为false
          setIsLoading(false);
          console.log('Google prompt not displayed or skipped');
        }
      });
    } catch (error) {
      console.error('Error triggering Google login:', error);
      setIsLoading(false);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  // 简化的Google脚本初始化
  useEffect(() => {
    const loadGoogleScript = async () => {
      if (typeof window === 'undefined') return;

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
      if (clientId === 'YOUR_GOOGLE_CLIENT_ID') {
        console.warn(t('googleLogin.configError'));
        return;
      }

      try {
        // 检查脚本是否已加载
        if (!window.google?.accounts?.id) {
          console.log('🔄 Loading Google script for locale:', getGoogleLocale(language));
          await reloadGoogleScript(getGoogleLocale(language));
        }

        // 初始化Google Sign-In
        if (window.google?.accounts?.id) {
          console.log('🚀 Initializing Google Sign-In with callback...');
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          console.log('✅ Google Sign-In initialized successfully');
        }

        setIsGoogleLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load Google Sign-In:', error);
        setIsGoogleLoaded(false);
      }
    };

    loadGoogleScript();
  }, [language, handleCredentialResponse, t]);


  return (
    <div className="w-full">
      {!isGoogleLoaded ? (
        <div className="flex items-center justify-center h-11">
          <div className="text-center text-gray-400 text-sm">
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              {/* Google Icon SVG */}
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="white"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="white"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="white"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="white"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-white text-sm font-medium">
                {t('googleLogin.continueWith')}
              </span>
            </div>
          )}
        </button>
      )}
    </div>
  );
};

// 声明Google对象类型
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
        };
      };
    };
  }
}

export default GoogleLoginButton; 