import { IdeaSuggestion } from '../services/generateService';

// 从数组中随机选择指定数量的元素
export const getRandomSuggestions = (suggestions: { zh: IdeaSuggestion[], en: IdeaSuggestion[], ja?: IdeaSuggestion[], ko?: IdeaSuggestion[], es?: IdeaSuggestion[], fr?: IdeaSuggestion[], de?: IdeaSuggestion[] , it?: IdeaSuggestion[] , pt?: IdeaSuggestion[], ru?: IdeaSuggestion[], tw?: IdeaSuggestion[] }, count: number = 6, language: 'zh' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'tw' = 'zh'): IdeaSuggestion[] => {
  const languageSuggestions = suggestions[language] || suggestions['en'] || [];
  const shuffled = [...languageSuggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};