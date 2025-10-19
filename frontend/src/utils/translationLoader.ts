import { Language } from '../contexts/LanguageContext';

// 同步导入所有翻译文件
import enCommon from '../locales/en/common.json';
import enNavigation from '../locales/en/navigation.json';
import enComponents from '../locales/en/components.json';
import enImage from '../locales/en/image.json';
import enHome from '../locales/en/home.json';
import enGenerate from '../locales/en/pages/generate.json';
import enPricing from '../locales/en/pages/pricing.json';
import enCategories from '../locales/en/pages/categories.json';
import enCreations from '../locales/en/pages/creations.json';
import enProfile from '../locales/en/pages/profile.json';
import enTattooPreview from '../locales/en/tattooPreview.json';
import enCategoriesRoot from '../locales/en/categories.json';

import zhCommon from '../locales/zh/common.json';
import zhNavigation from '../locales/zh/navigation.json';
import zhComponents from '../locales/zh/components.json';
import zhImage from '../locales/zh/image.json';
import zhHome from '../locales/zh/home.json';
import zhGenerate from '../locales/zh/pages/generate.json';
import zhPricing from '../locales/zh/pages/pricing.json';
import zhCategories from '../locales/zh/pages/categories.json';
import zhCreations from '../locales/zh/pages/creations.json';
import zhProfile from '../locales/zh/pages/profile.json';
import zhTattooPreview from '../locales/zh/tattooPreview.json';
import zhCategoriesRoot from '../locales/zh/categories.json';

import jaCommon from '../locales/ja/common.json';
import jaNavigation from '../locales/ja/navigation.json';
import jaComponents from '../locales/ja/components.json';
import jaImage from '../locales/ja/image.json';
import jaHome from '../locales/ja/home.json';
import jaGenerate from '../locales/ja/pages/generate.json';
import jaPricing from '../locales/ja/pages/pricing.json';
import jaCategories from '../locales/ja/pages/categories.json';
import jaCreations from '../locales/ja/pages/creations.json';
import jaProfile from '../locales/ja/pages/profile.json';
import jaTattooPreview from '../locales/ja/tattooPreview.json';
import jaCategoriesRoot from '../locales/ja/categories.json';

import koCommon from '../locales/ko/common.json';
import koNavigation from '../locales/ko/navigation.json';
import koComponents from '../locales/ko/components.json';
import koImage from '../locales/ko/image.json';
import koHome from '../locales/ko/home.json';
import koGenerate from '../locales/ko/pages/generate.json';
import koPricing from '../locales/ko/pages/pricing.json';
import koCategories from '../locales/ko/pages/categories.json';
import koCreations from '../locales/ko/pages/creations.json';
import koProfile from '../locales/ko/pages/profile.json';
import koTattooPreview from '../locales/ko/tattooPreview.json';
import koCategoriesRoot from '../locales/ko/categories.json';

import twCommon from '../locales/tw/common.json';
import twNavigation from '../locales/tw/navigation.json';
import twComponents from '../locales/tw/components.json';
import twImage from '../locales/tw/image.json';
import twHome from '../locales/tw/home.json';
import twGenerate from '../locales/tw/pages/generate.json';
import twPricing from '../locales/tw/pages/pricing.json';
import twCategories from '../locales/tw/pages/categories.json';
import twCreations from '../locales/tw/pages/creations.json';
import twProfile from '../locales/tw/pages/profile.json';
import twTattooPreview from '../locales/tw/tattooPreview.json';
import twCategoriesRoot from '../locales/tw/categories.json';

import esCommon from '../locales/es/common.json';
import esNavigation from '../locales/es/navigation.json';
import esComponents from '../locales/es/components.json';
import esImage from '../locales/es/image.json';
import esHome from '../locales/es/home.json';
import esGenerate from '../locales/es/pages/generate.json';
import esPricing from '../locales/es/pages/pricing.json';
import esCategories from '../locales/es/pages/categories.json';
import esCreations from '../locales/es/pages/creations.json';
import esProfile from '../locales/es/pages/profile.json';
import esTattooPreview from '../locales/es/tattooPreview.json';
import esCategoriesRoot from '../locales/es/categories.json';

import frCommon from '../locales/fr/common.json';
import frNavigation from '../locales/fr/navigation.json';
import frComponents from '../locales/fr/components.json';
import frImage from '../locales/fr/image.json';
import frHome from '../locales/fr/home.json';
import frGenerate from '../locales/fr/pages/generate.json';
import frPricing from '../locales/fr/pages/pricing.json';
import frCategories from '../locales/fr/pages/categories.json';
import frCreations from '../locales/fr/pages/creations.json';
import frProfile from '../locales/fr/pages/profile.json';
import frTattooPreview from '../locales/fr/tattooPreview.json';
import frCategoriesRoot from '../locales/fr/categories.json';

import deCommon from '../locales/de/common.json';
import deNavigation from '../locales/de/navigation.json';
import deComponents from '../locales/de/components.json';
import deImage from '../locales/de/image.json';
import deHome from '../locales/de/home.json';
import deGenerate from '../locales/de/pages/generate.json';
import dePricing from '../locales/de/pages/pricing.json';
import deCategories from '../locales/de/pages/categories.json';
import deCreations from '../locales/de/pages/creations.json';
import deProfile from '../locales/de/pages/profile.json';
import deTattooPreview from '../locales/de/tattooPreview.json';
import deCategoriesRoot from '../locales/de/categories.json';

import itCommon from '../locales/it/common.json';
import itNavigation from '../locales/it/navigation.json';
import itComponents from '../locales/it/components.json';
import itImage from '../locales/it/image.json';
import itHome from '../locales/it/home.json';
import itGenerate from '../locales/it/pages/generate.json';
import itPricing from '../locales/it/pages/pricing.json';
import itCategories from '../locales/it/pages/categories.json';
import itCreations from '../locales/it/pages/creations.json';
import itProfile from '../locales/it/pages/profile.json';
import itTattooPreview from '../locales/it/tattooPreview.json';
import itCategoriesRoot from '../locales/it/categories.json';

import ptCommon from '../locales/pt/common.json';
import ptNavigation from '../locales/pt/navigation.json';
import ptComponents from '../locales/pt/components.json';
import ptImage from '../locales/pt/image.json';
import ptHome from '../locales/pt/home.json';
import ptGenerate from '../locales/pt/pages/generate.json';
import ptPricing from '../locales/pt/pages/pricing.json';
import ptCategories from '../locales/pt/pages/categories.json';
import ptCreations from '../locales/pt/pages/creations.json';
import ptProfile from '../locales/pt/pages/profile.json';
import ptTattooPreview from '../locales/pt/tattooPreview.json';
import ptCategoriesRoot from '../locales/pt/categories.json';

import ruCommon from '../locales/ru/common.json';
import ruNavigation from '../locales/ru/navigation.json';
import ruComponents from '../locales/ru/components.json';
import ruImage from '../locales/ru/image.json';
import ruHome from '../locales/ru/home.json';
import ruGenerate from '../locales/ru/pages/generate.json';
import ruPricing from '../locales/ru/pages/pricing.json';
import ruCategories from '../locales/ru/pages/categories.json';
import ruCreations from '../locales/ru/pages/creations.json';
import ruProfile from '../locales/ru/pages/profile.json';
import ruTattooPreview from '../locales/ru/tattooPreview.json';
import ruCategoriesRoot from '../locales/ru/categories.json';

// 翻译资源接口
interface TranslationModule {
  [key: string]: any;
}

interface TranslationCache {
  [language: string]: {
    [module: string]: TranslationModule;
  };
}

// 静态翻译资源映射
const translationModules: TranslationCache = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    components: enComponents,
    image: enImage,
    home: enHome,
    generate: enGenerate,
    pricing: enPricing,
    categories: enCategories,
    creations: enCreations,
    profile: enProfile,
    tattooPreview: enTattooPreview,
    categoriesRoot: enCategoriesRoot,
  },
  zh: {
    common: zhCommon,
    navigation: zhNavigation,
    components: zhComponents,
    image: zhImage,
    home: zhHome,
    generate: zhGenerate,
    pricing: zhPricing,
    categories: zhCategories,
    creations: zhCreations,
    profile: zhProfile,
    tattooPreview: zhTattooPreview,
    categoriesRoot: zhCategoriesRoot,
  },
  ja: {
    common: jaCommon,
    navigation: jaNavigation,
    components: jaComponents,
    image: jaImage,
    home: jaHome,
    generate: jaGenerate,
    pricing: jaPricing,
    categories: jaCategories,
    creations: jaCreations,
    profile: jaProfile,
    tattooPreview: jaTattooPreview,
    categoriesRoot: jaCategoriesRoot,
  },
  ko: {
    common: koCommon,
    navigation: koNavigation,
    components: koComponents,
    image: koImage,
    home: koHome,
    generate: koGenerate,
    pricing: koPricing,
    categories: koCategories,
    creations: koCreations,
    profile: koProfile,
    tattooPreview: koTattooPreview,
    categoriesRoot: koCategoriesRoot,
  },
  tw: {
    common: twCommon,
    navigation: twNavigation,
    components: twComponents,
    image: twImage,
    home: twHome,
    generate: twGenerate,
    pricing: twPricing,
    categories: twCategories,
    creations: twCreations,
    profile: twProfile,
    tattooPreview: twTattooPreview,
    categoriesRoot: twCategoriesRoot,
  },
  es: {
    common: esCommon,
    navigation: esNavigation,
    components: esComponents,
    image: esImage,
    home: esHome,
    generate: esGenerate,
    pricing: esPricing,
    categories: esCategories,
    creations: esCreations,
    profile: esProfile,
    tattooPreview: esTattooPreview,
    categoriesRoot: esCategoriesRoot,
  },
  fr: {
    common: frCommon,
    navigation: frNavigation,
    components: frComponents,
    image: frImage,
    home: frHome,
    generate: frGenerate,
    pricing: frPricing,
    categories: frCategories,
    creations: frCreations,
    profile: frProfile,
    tattooPreview: frTattooPreview,
    categoriesRoot: frCategoriesRoot,
  },
  de: {
    common: deCommon,
    navigation: deNavigation,
    components: deComponents,
    image: deImage,
    home: deHome,
    generate: deGenerate,
    pricing: dePricing,
    categories: deCategories,
    creations: deCreations,
    profile: deProfile,
    tattooPreview: deTattooPreview,
    categoriesRoot: deCategoriesRoot,
  },
  it: {
    common: itCommon,
    navigation: itNavigation,
    components: itComponents,
    image: itImage,
    home: itHome,
    generate: itGenerate,
    pricing: itPricing,
    categories: itCategories,
    creations: itCreations,
    profile: itProfile,
    tattooPreview: itTattooPreview,
    categoriesRoot: itCategoriesRoot,
  },
  pt: {
    common: ptCommon,
    navigation: ptNavigation,
    components: ptComponents,
    image: ptImage,
    home: ptHome,
    generate: ptGenerate,
    pricing: ptPricing,
    categories: ptCategories,
    creations: ptCreations,
    profile: ptProfile,
    tattooPreview: ptTattooPreview,
    categoriesRoot: ptCategoriesRoot,
  },
  ru: {
    common: ruCommon,
    navigation: ruNavigation,
    components: ruComponents,
    image: ruImage,
    home: ruHome,
    generate: ruGenerate,
    pricing: ruPricing,
    categories: ruCategories,
    creations: ruCreations,
    profile: ruProfile,
    tattooPreview: ruTattooPreview,
    categoriesRoot: ruCategoriesRoot,
  },
};

// 翻译资源缓存
const translationCache: TranslationCache = {};

// 加载状态管理（已不再需要，因为所有资源都是同步可用的）
// const loadingPromises: { [key: string]: Promise<TranslationModule> } = {};

/**
 * 同步加载翻译模块（现在使用预先导入的资源）
 */
export const loadTranslationModule = async (
  language: Language,
  module: string
): Promise<TranslationModule> => {
  // 检查缓存
  if (translationCache[language]?.[module]) {
    return translationCache[language][module];
  }
  
  // 从预先导入的静态资源中获取翻译
  const translations = translationModules[language]?.[module];
  
  if (!translations) {
    console.warn(`Translation module not found: ${language}/${module}`);
    return {};
  }
  
  // 缓存翻译资源
  if (!translationCache[language]) {
    translationCache[language] = {};
  }
  translationCache[language][module] = translations;
  
  return translations;
};

/**
 * 批量加载多个翻译模块
 */
export const loadTranslationModules = async (
  language: Language,
  modules: string[]
): Promise<{ [module: string]: TranslationModule }> => {
  const loadPromises = modules.map(async (module) => {
    const translations = await loadTranslationModule(language, module);
    return { module, translations };
  });
  
  const results = await Promise.all(loadPromises);
  
  return results.reduce((acc, { module, translations }) => {
    acc[module] = translations;
    return acc;
  }, {} as { [module: string]: TranslationModule });
};

/**
 * 预加载核心翻译模块
 */
export const preloadCoreTranslations = async (language: Language): Promise<void> => {
  // 预加载所有常用模块，避免页面加载时的翻译闪烁
  const coreModules = [
    'common',
    'navigation',
    'forms',
    'errors',
    'components',  // 组件翻译
    'home',        // 首页翻译
    'pricing',     // 价格页翻译
    'categories',  // 分类页翻译
    'creations',   // 作品页翻译
    'generate'     // 生成页翻译
  ];
  
  try {
    await loadTranslationModules(language, coreModules);
    console.log(`✅ Successfully preloaded ${coreModules.length} translation modules for ${language}`);
  } catch (error) {
    console.warn('Failed to preload some translation modules:', error);
  }
};

/**
 * 获取嵌套路径的翻译值
 * 支持 'common.buttons.save' 这样的路径
 */
export const getNestedTranslation = (
  translations: TranslationModule,
  path: string,
  fallback?: string
): string => {
  const keys = path.split('.');
  let current = translations;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback || path;
    }
  }

  return typeof current === 'string' ? current : fallback || path;
};

/**
 * 带参数插值的翻译函数
 * 支持 'hello {name}' 这样的模板
 */
export const interpolateTranslation = (
  text: string,
  params?: { [key: string]: string | number }
): string => {
  if (!params) return text;
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
};

/**
 * 清除翻译缓存
 */
export const clearTranslationCache = (): void => {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key];
  });
};

/**
 * 同步获取翻译模块（现在直接从静态资源获取，无需缓存检查）
 */
export const getCachedTranslationModule = (
  language: Language,
  module: string
): TranslationModule | null => {
  // 首先检查缓存
  if (translationCache[language]?.[module]) {
    return translationCache[language][module];
  }
  
  // 从静态资源中获取
  const translations = translationModules[language]?.[module];
  if (translations) {
    // 同时缓存起来
    if (!translationCache[language]) {
      translationCache[language] = {};
    }
    translationCache[language][module] = translations;
    return translations;
  }
  
  return null;
};

/**
 * 检查翻译模块是否可用（现在所有模块都是同步可用的）
 */
export const isTranslationModuleCached = (
  language: Language,
  module: string
): boolean => {
  return !!(translationCache[language]?.[module] || translationModules[language]?.[module]);
};

/**
 * 获取缓存状态信息（用于调试）
 */
export const getTranslationCacheInfo = () => {
  return {
    cached: Object.keys(translationCache).reduce((acc, lang) => {
      acc[lang] = Object.keys(translationCache[lang]);
      return acc;
    }, {} as { [lang: string]: string[] }),
    available: Object.keys(translationModules).reduce((acc, lang) => {
      acc[lang] = Object.keys(translationModules[lang]);
      return acc;
    }, {} as { [lang: string]: string[] }),
  };
}; 