import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Language } from '../../contexts/LanguageContext';

// 支持的语言列表
export const SUPPORTED_LANGUAGES: Language[] = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'tw'];

// 默认语言
export const DEFAULT_LANGUAGE: Language = 'zh';

// 语言路径映射
export const LANGUAGE_PATHS: Record<Language, string> = {
  zh: '/zh',
  en: '/',
  ja: '/ja',
  ko: '/ko',
  es: '/es',
  fr: '/fr',
  de: '/de',
  it: '/it',
  pt: '/pt',
  ru: '/ru',
  tw: '/tw'
};

// 检测浏览器语言
export const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const browserLang = navigator.language || (navigator as any).userLanguage;
  const lowerLang = browserLang.toLowerCase();

  // 检测是否为中文
  if (lowerLang.includes('zh')) {
    // 检测繁体中文
    if (lowerLang.includes('tw') || lowerLang.includes('hk') || lowerLang.includes('mo')) {
      return 'tw';
    }
    return 'zh';
  }
  // 检测日语
  if (lowerLang.includes('ja')) {
    return 'ja';
  }
  // 检测韩语
  if (lowerLang.includes('ko')) {
    return 'ko';
  }
  // 检测西班牙语
  if (lowerLang.includes('es')) {
    return 'es';
  }
  // 检测法语
  if (lowerLang.includes('fr')) {
    return 'fr';
  }
  // 检测德语
  if (lowerLang.includes('de')) {
    return 'de';
  }
  // 检测意大利语
  if (lowerLang.includes('it')) {
    return 'it';
  }
  // 检测葡萄牙语
  if (lowerLang.includes('pt')) {
    return 'pt';
  }
  // 检测俄语
  if (lowerLang.includes('ru')) {
    return 'ru';
  }

  return 'en';
};

// 从localStorage获取保存的语言偏好
export const getSavedLanguage = (): Language | null => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem('preferred-language');
    if (saved === 'zh' || saved === 'en' || saved === 'ja' || saved === 'ko' || saved === 'es' || saved === 'fr' || saved === 'de' || saved === 'it' || saved === 'pt' || saved === 'ru' || saved === 'tw') {
      return saved;
    }
  } catch (error) {
    console.warn('Failed to read language preference from localStorage:', error);
  }
  return null;
};

// 保存语言偏好到localStorage
export const saveLanguagePreference = (language: Language) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('preferred-language', language);
  } catch (error) {
    console.warn('Failed to save language preference to localStorage:', error);
  }
};

// 获取当前语言
export const getCurrentLanguage = (pathname: string): Language => {
  // 检查路径是否以 /zh 开头
  if (pathname.startsWith('/zh')) {
    return 'zh';
  }
  // 检查路径是否以 /ja 开头
  if (pathname.startsWith('/ja')) {
    return 'ja';
  }
  // 检查路径是否以 /ko 开头
  if (pathname.startsWith('/ko')) {
    return 'ko';
  }
  // 检查路径是否以 /tw 开头
  if (pathname.startsWith('/tw')) {
    return 'tw';
  }
  // 检查路径是否以 /es 开头
  if (pathname.startsWith('/es')) {
    return 'es';
  }
  // 检查路径是否以 /fr 开头
  if (pathname.startsWith('/fr')) {
    return 'fr';
  }
  // 检查路径是否以 /de 开头
  if (pathname.startsWith('/de')) {
    return 'de';
  }
  // 检查路径是否以 /it 开头
  if (pathname.startsWith('/it')) {
    return 'it';
  }
  // 检查路径是否以 /pt 开头
  if (pathname.startsWith('/pt')) {
    return 'pt';
  }
  // 检查路径是否以 /ru 开头
  if (pathname.startsWith('/ru')) {
    return 'ru';
  }
  // 其他情况默认为英文
  return 'en';
};

// 生成语言路径
export const generateLanguagePath = (language: Language, path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (language === 'zh') {
    return `/zh${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (language === 'ja') {
    return `/ja${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (language === 'ko') {
    return `/ko${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (language === 'tw') {
    return `/tw${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (language === 'es') {
    return `/es${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (language === 'fr') {
    return `/fr${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (language === 'de') {
    return `/de${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (language === 'it') {
    return `/it${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (language === 'pt') {
    return `/pt${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (language === 'ru') {
    return `/ru${cleanPath === '/' ? '' : cleanPath}`;
  }
  return cleanPath;
};

// 移除语言前缀的路径
export const removeLanguagePrefix = (pathname: string): string => {
  if (pathname.startsWith('/zh')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  if (pathname.startsWith('/ja')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  if (pathname.startsWith('/ko')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  if (pathname.startsWith('/tw')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  if (pathname.startsWith('/es')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  if (pathname.startsWith('/fr')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  if (pathname.startsWith('/de')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  if (pathname.startsWith('/it')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  if (pathname.startsWith('/pt')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  if (pathname.startsWith('/ru')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  return pathname;
};

// 语言重定向组件
export const LanguageRedirect: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // 如果已经包含语言路径，不做任何操作
  if (currentPath.startsWith('/zh') || currentPath.startsWith('/ja') || currentPath.startsWith('/ko') || currentPath.startsWith('/es') || currentPath.startsWith('/fr') || currentPath.startsWith('/de') || currentPath.startsWith('/it') || currentPath.startsWith('/pt') || currentPath.startsWith('/ru') || currentPath.startsWith('/tw') || currentPath === '/') {
    return null;
  }
  
  // 获取用户偏好的语言
  const preferredLanguage = getSavedLanguage() || detectBrowserLanguage();
  
  // 生成带语言前缀的路径
  const newPath = generateLanguagePath(preferredLanguage, currentPath);
  
  return <Navigate to={newPath} replace />;
};

// URL语言检测Hook
export const useLanguageFromUrl = (): Language => {
  const location = useLocation();
  return getCurrentLanguage(location.pathname);
};

// 语言切换Hook
export const useLanguageSwitch = () => {
  const location = useLocation();
  
  const switchLanguage = (newLanguage: Language): string => {
    const currentPath = removeLanguagePrefix(location.pathname);
    const newPath = generateLanguagePath(newLanguage, currentPath);
    
    // 保存语言偏好
    saveLanguagePreference(newLanguage);
    
    return newPath;
  };
  
  return { switchLanguage };
}; 