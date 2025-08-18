import { ApiUtils } from '../utils/apiUtils';
import type { MultilingualText } from '../utils/multilingual';

// 样式接口定义
export interface Style {
  id: string;
  title: MultilingualText;
  prompt: MultilingualText;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

class StylesService {
  /**
   * 获取所有样式
   */
  async getAll(): Promise<Style[]> {
    return await ApiUtils.get<Style[]>('/api/styles');
  }

  /**
   * 根据ID获取样式
   */
  async getById(id: string): Promise<Style> {
    const response = await ApiUtils.get<Style>(`/api/styles/${id}`);
    return response;
  }
}

export default new StylesService();