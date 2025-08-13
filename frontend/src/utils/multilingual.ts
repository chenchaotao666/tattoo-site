// 多语言支持工具类

export interface MultilingualText {
  en: string;
  zh: string;
}

export type Language = 'en' | 'zh';

/**
 * 获取多语言文本
 * @param text 多语言文本对象或字符串
 * @param language 当前语言
 * @param fallback 回退语言
 * @returns 对应语言的文本
 */
export function getLocalizedText(
  text: MultilingualText | string | null | undefined,
  language: Language = 'en',
  fallback: Language = 'en'
): string {
  if (!text) return '';
  
  // 如果是字符串，直接返回
  if (typeof text === 'string') return text;
  
  // 如果是对象，尝试获取对应语言的文本
  if (typeof text === 'object') {
    return text[language] || text[fallback] || text.en || text.zh || '';
  }
  
  return '';
}

/**
 * 创建多语言文本对象
 * @param en 英文文本
 * @param zh 中文文本
 * @returns 多语言文本对象
 */
export function createMultilingualText(en: string, zh: string): MultilingualText {
  return { en, zh };
}

/**
 * 验证多语言文本对象是否有效
 * @param text 多语言文本对象
 * @returns 是否有效
 */
export function isValidMultilingualText(text: any): text is MultilingualText {
  return text && typeof text === 'object' && 
         typeof text.en === 'string' && typeof text.zh === 'string';
}

/**
 * 安全解析JSON多语言字段
 * @param jsonString JSON字符串
 * @param fallback 解析失败时的回退值
 * @returns 多语言文本对象
 */
export function parseMultilingualJSON(
  jsonString: string | any, 
  fallback: MultilingualText = { en: '', zh: '' }
): MultilingualText {
  try {
    if (typeof jsonString === 'string') {
      const parsed = JSON.parse(jsonString);
      if (isValidMultilingualText(parsed)) {
        return parsed;
      }
    } else if (isValidMultilingualText(jsonString)) {
      return jsonString;
    }
    return fallback;
  } catch (error) {
    console.warn('Failed to parse multilingual JSON:', error);
    return fallback;
  }
}

/**
 * 将多语言文本对象转换为JSON字符串
 * @param text 多语言文本对象
 * @returns JSON字符串
 */
export function stringifyMultilingualText(text: MultilingualText): string {
  return JSON.stringify(text);
}

// 钩子：从localStorage获取当前语言
export function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'en' || saved === 'zh')) {
      return saved;
    }
  }
  return 'en'; // 默认英语
}