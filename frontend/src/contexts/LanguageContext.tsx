import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  loadTranslationModule, 
  preloadCoreTranslations, 
  getNestedTranslation,
  interpolateTranslation,
  getCachedTranslationModule,
  isTranslationModuleCached
} from '../utils/translationLoader';
import { 
  saveLanguagePreference,
  getSavedLanguage,
  detectBrowserLanguage 
} from '../components/common/LanguageRouter';

export type Language = 'zh' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'tw';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string, params?: { [key: string]: string | number }) => string;
  isLoading: boolean;
  __internal_setState?: (language: Language) => void;
  __internal_setNavigate?: (navigate: any) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


interface LanguageProviderProps {
  children: ReactNode;
}

// 同步获取初始语言，避免闪烁
const getInitialLanguage = (): Language => {
  // 1. 优先从URL路径检测语言
  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/zh')) {
    return 'zh';
  } else if (currentPath.startsWith('/ja')) {
    return 'ja';
  } else if (currentPath.startsWith('/ko')) {
    return 'ko';
  } else if (currentPath.startsWith('/tw')) {
    return 'tw';
  } else if (currentPath.startsWith('/es')) {
    return 'es';
  } else if (currentPath.startsWith('/fr')) {
    return 'fr';
  } else if (currentPath.startsWith('/de')) {
    return 'de';
  } else if (currentPath.startsWith('/it')) {
    return 'it';
  } else if (currentPath.startsWith('/pt')) {
    return 'pt';
  } else if (currentPath.startsWith('/ru')) {
    return 'ru';
  }
  
  // 2. 其次使用保存的语言偏好
  const savedLanguage = getSavedLanguage();
  if (savedLanguage) {
    return savedLanguage;
  }
  
  // 3. 最后检测浏览器语言
  const detectedLanguage = detectBrowserLanguage();
  saveLanguagePreference(detectedLanguage); // 保存检测到的语言
  return detectedLanguage;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // 获取初始语言（从localStorage或浏览器检测）
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const [navigate, setNavigate] = useState<any>(null);

  // 初始化语言设置 - 只处理异步翻译预加载
  useEffect(() => {
    const initializeTranslations = async () => {
      // 预加载当前语言的核心翻译资源
      try {
        await preloadCoreTranslations(language);
      } catch (error) {
        console.warn('Failed to preload translations:', error);
      }
      
      setIsLoading(false);
    };

    initializeTranslations();
  }, [language]); // 依赖language，当语言变化时重新加载

  const setLanguage = async (lang: Language) => {
    console.log('🌐 Setting language to:', lang);
    
    if (lang === language) return;
    
    setIsLoading(true);
    saveLanguagePreference(lang);
    
    // 生成新的语言路径
    const currentPath = window.location.pathname;
    let pathWithoutLanguage = currentPath;
    
    // 移除当前语言前缀
    if (currentPath.startsWith('/zh')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/ja')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/ko')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/tw')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/es')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/fr')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/de')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/it')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/pt')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/ru')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    }
    
    // 生成新的语言路径
    let newPath: string;
    if (lang === 'zh') {
      newPath = '/zh' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else if (lang === 'ja') {
      newPath = '/ja' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else if (lang === 'ko') {
      newPath = '/ko' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else if (lang === 'tw') {
      newPath = '/tw' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else if (lang === 'es') {
      newPath = '/es' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else if (lang === 'fr') {
      newPath = '/fr' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else if (lang === 'de') {
      newPath = '/de' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else if (lang === 'it') {
      newPath = '/it' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else if (lang === 'pt') {
      newPath = '/pt' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else if (lang === 'ru') {
      newPath = '/ru' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else {
      newPath = pathWithoutLanguage;
    }
    
    // 预加载新语言的核心翻译资源
    try {
      await preloadCoreTranslations(lang);
    } catch (error) {
      console.warn('Failed to preload translations for new language:', error);
    }
    
    // 使用React Router导航（无刷新）或者fallback到页面重载
    if (navigate) {
      console.log('🚀 Using React Router navigation to:', newPath);
      navigate(newPath, { replace: true });
      setLanguageState(lang);
      setIsLoading(false);
    } else {
      console.log('⚠️ Fallback to page reload for:', newPath);
      // Fallback到页面重载
      window.location.href = newPath;
    }
  };

  const t = (
    key: string,
    fallback?: string,
    params?: { [key: string]: string | number }
  ): string => {
    // 简化的翻译函数，现在只返回fallback或key本身
    // 所有翻译都应该通过 useAsyncTranslation hook 来处理
    const finalResult = fallback || key;
    return interpolateTranslation(finalResult, params);
  };

  // 内部setState，用于URL路径同步，不触发页面跳转
  const __internal_setState = (lang: Language) => {
    if (lang !== language) {
      console.log('🔄 LanguageProvider: __internal_setState from', language, 'to', lang);
      setLanguageState(lang);
      saveLanguagePreference(lang);
    }
  };

  // 内部setNavigate，用于注入navigate函数
  const __internal_setNavigate = (navigateFunc: any) => {
    setNavigate(() => navigateFunc);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      isLoading, 
      __internal_setState,
      __internal_setNavigate
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// 导出专门用于异步翻译的hook（优化版，减少闪烁）
export const useAsyncTranslation = (module: string) => {
  const { language } = useLanguage();
  
  // 首先尝试同步获取缓存的翻译
  const cachedTranslations = getCachedTranslationModule(language, module);
  const [translations, setTranslations] = useState<any>(cachedTranslations || {});
  const [loading, setLoading] = useState(!cachedTranslations);

  useEffect(() => {
    // 检查是否已经缓存，如果已缓存则无需重新加载
    if (isTranslationModuleCached(language, module)) {
      const cached = getCachedTranslationModule(language, module);
      if (cached) {
        setTranslations(cached);
        setLoading(false);
        return;
      }
    }

    const loadTranslations = async () => {
      setLoading(true);
      try {
        const moduleTranslations = await loadTranslationModule(language, module);
        setTranslations(moduleTranslations);
      } catch (error) {
        console.error(`Failed to load translations for module ${module}:`, error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language, module]);

  const t = (path: string, fallback?: string, params?: { [key: string]: string | number }) => {
    const result = getNestedTranslation(translations, path, fallback);
    return interpolateTranslation(result, params);
  };

  return { t, loading, translations };
}; 