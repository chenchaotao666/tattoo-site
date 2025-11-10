/**
 * 导航工具函数
 */

/**
 * 检查当前路径是否为公开页面
 */
export const isPublicPath = (path: string): boolean => {
  // 移除语言前缀以进行路径检查
  let pathWithoutLanguage = path;
  if (path.startsWith('/zh')) {
    pathWithoutLanguage = path.substring(3) || '/';
  } else if (path.startsWith('/ja')) {
    pathWithoutLanguage = path.substring(3) || '/';
  } else if (path.startsWith('/ko')) {
    pathWithoutLanguage = path.substring(3) || '/';
  } else if (path.startsWith('/tw')) {
    pathWithoutLanguage = path.substring(3) || '/';
  } else if (path.startsWith('/es')) {
    pathWithoutLanguage = path.substring(3) || '/';
  } else if (path.startsWith('/fr')) {
    pathWithoutLanguage = path.substring(3) || '/';
  } else if (path.startsWith('/de')) {
    pathWithoutLanguage = path.substring(3) || '/';
  } else if (path.startsWith('/it')) {
    pathWithoutLanguage = path.substring(3) || '/';
  } else if (path.startsWith('/pt')) {
    pathWithoutLanguage = path.substring(3) || '/';
  } else if (path.startsWith('/ru')) {
    pathWithoutLanguage = path.substring(3) || '/';
  }
  
  const publicPaths = [
    '/', 
    '/categories', 
    '/login', 
    '/register', 
    '/forgot-password', 
    '/reset-password',
    '/price',
    '/create',
    '/blog'
  ];
  
  return publicPaths.some(publicPath => pathWithoutLanguage === publicPath) || 
         pathWithoutLanguage.startsWith('/categories/') || 
         pathWithoutLanguage.startsWith('/image/') ||
         pathWithoutLanguage.startsWith('/blog/');
};

/**
 * 在认证失败时跳转到首页（只有在非公开页面时）
 * 注意：这个函数应该非常保守，只在确实需要时才跳转
 */
export const redirectToHomeIfNeeded = (): boolean => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const isPublic = isPublicPath(currentPath);
    
    console.log('🔍 检查是否需要跳转:', { currentPath, isPublic });
    
    // 更保守的跳转策略：只在真正的私有页面且认证完全失败时才跳转
    if (!isPublic) {
      console.log('🔄 非公开页面，但暂时不跳转，让用户自己处理');
      // 暂时不自动跳转，让用户看到错误信息或手动处理
      return false;
    } else {
      console.log('✅ 公开页面，不执行跳转');
    }
  }
  return false; // 表示没有跳转
};

/**
 * 获取当前语言前缀
 */
export const getCurrentLanguagePrefix = (): string => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/zh')) {
      return '/zh';
    } else if (currentPath.startsWith('/ja')) {
      return '/ja';
    } else if (currentPath.startsWith('/ko')) {
      return '/ko';
    } else if (currentPath.startsWith('/tw')) {
      return '/tw';
    } else if (currentPath.startsWith('/es')) {
      return '/es';
    } else if (currentPath.startsWith('/fr')) {
      return '/fr';
    } else if (currentPath.startsWith('/de')) {
      return '/de';
    } else if (currentPath.startsWith('/it')) {
      return '/it';
    } else if (currentPath.startsWith('/pt')) {
      return '/pt';
    } else if (currentPath.startsWith('/ru')) {
      return '/ru';
    }
  }
  return '';
};

/**
 * 创建带语言前缀的导航路径
 * @param path 目标路径（不包含语言前缀）
 * @returns 包含当前语言前缀的完整路径
 */
export const createLanguageAwarePath = (path: string): string => {
  const languagePrefix = getCurrentLanguagePrefix();

  // 确保路径以/开头
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 如果有语言前缀
  if (languagePrefix) {
    // 如果路径是根路径'/'，只返回语言前缀（不带尾随斜杠）
    if (cleanPath === '/') {
      return languagePrefix;
    }
    // 其他路径正常添加语言前缀
    return `${languagePrefix}${cleanPath}`;
  }

  return cleanPath;
};

/**
 * 语言感知的导航函数
 * @param navigate React Router的navigate函数
 * @param path 目标路径（不包含语言前缀）
 * @param options 导航选项
 */
export const navigateWithLanguage = (
  navigate: (path: string, options?: any) => void,
  path: string,
  options?: any
): void => {
  const fullPath = createLanguageAwarePath(path);
  navigate(fullPath, options);
}; 