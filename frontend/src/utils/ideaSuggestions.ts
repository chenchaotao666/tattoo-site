import { IdeaSuggestion } from '../services/generateService';

// 从数组中随机选择指定数量的元素
export const getRandomSuggestions = (suggestions: { zh: IdeaSuggestion[], en: IdeaSuggestion[], ja?: IdeaSuggestion[] }, count: number = 6, language: 'zh' | 'en' | 'ja' = 'zh'): IdeaSuggestion[] => {
  const languageSuggestions = suggestions[language] || suggestions['en'] || [];
  const shuffled = [...languageSuggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};