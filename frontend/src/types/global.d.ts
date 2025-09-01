// 全局类型定义
export interface MultilingualText {
  en: string;
  zh: string;
  toLowerCase?: () => string;
}

export interface LocalizedText {
  en: string;
  zh: string;
}

export interface Tag {
  id: string;
  tag_id: string;
  name: MultilingualText;
  display_name: MultilingualText;
}

export interface Category {
  id: string;
  categoryId: string;
  name: MultilingualText;
  displayName: MultilingualText;
  display_name: MultilingualText;
  description: string;
  seoTitle?: MultilingualText;
  seoDesc?: MultilingualText;
  hotness: number;
  tagCounts: any[];
  thumbnailUrl: string;
  defaultUrl: string;
  colorUrl?: string;
  coloringUrl?: string;
}

export interface BaseImage {
  id: string;
  name: MultilingualText;
  defaultUrl: string;
  colorUrl?: string;
  tags?: Tag[];
}