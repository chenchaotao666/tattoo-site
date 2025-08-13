import { ApiUtils } from '../utils/apiUtils';
import type { MultilingualText } from '../utils/multilingual';

// 样式接口定义
export interface Style {
  id: string;
  title: MultilingualText;
  prompt: MultilingualText;
  createdAt: string;
  updatedAt: string;
}

// 样式统计信息
export interface StyleStats {
  id: string;
  title: MultilingualText;
  prompt: MultilingualText;
  imageCount: number;
  onlineImageCount: number;
  avgHotness: number;
  createdAt: string;
  updatedAt: string;
}

// 分页响应接口
export interface PaginatedStylesResponse {
  success: boolean;
  message: string;
  data: Style[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// API响应接口
export interface StyleResponse {
  success: boolean;
  message: string;
  data: Style | Style[] | StyleStats;
}

// 查询参数接口
export interface StylesQueryParams {
  currentPage?: number;
  pageSize?: number;
  sortBy?: string | string[];
  sortOrder?: 'ASC' | 'DESC' | string[];
  keyword?: string;
}

class StylesService {
  /**
   * 获取所有样式
   */
  async getAll(params: StylesQueryParams = {}): Promise<PaginatedStylesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.currentPage) searchParams.append('currentPage', params.currentPage.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) {
      if (Array.isArray(params.sortBy)) {
        params.sortBy.forEach(field => searchParams.append('sortBy', field));
      } else {
        searchParams.append('sortBy', params.sortBy);
      }
    }
    if (params.sortOrder) {
      if (Array.isArray(params.sortOrder)) {
        params.sortOrder.forEach(order => searchParams.append('sortOrder', order));
      } else {
        searchParams.append('sortOrder', params.sortOrder);
      }
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/api/styles?${queryString}` : '/api/styles';
    
    return await ApiUtils.get<PaginatedStylesResponse>(url);
  }

  /**
   * 根据ID获取样式
   */
  async getById(id: string): Promise<Style> {
    const response = await ApiUtils.get<StyleResponse>(`/api/styles/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get style');
    }
    return response.data as Style;
  }

  /**
   * 搜索样式
   */
  async search(keyword: string, params: Omit<StylesQueryParams, 'keyword'> = {}): Promise<PaginatedStylesResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('keyword', keyword);
    
    if (params.currentPage) searchParams.append('currentPage', params.currentPage.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) {
      if (Array.isArray(params.sortBy)) {
        params.sortBy.forEach(field => searchParams.append('sortBy', field));
      } else {
        searchParams.append('sortBy', params.sortBy);
      }
    }
    if (params.sortOrder) {
      if (Array.isArray(params.sortOrder)) {
        params.sortOrder.forEach(order => searchParams.append('sortOrder', order));
      } else {
        searchParams.append('sortOrder', params.sortOrder);
      }
    }

    return await ApiUtils.get<PaginatedStylesResponse>(`/api/styles/search?${searchParams.toString()}`);
  }

  /**
   * 获取热门样式
   */
  async getPopular(limit: number = 10): Promise<StyleStats[]> {
    const response = await ApiUtils.get<StyleResponse>(`/api/styles/popular?limit=${limit}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get popular styles');
    }
    return response.data as StyleStats[];
  }

  /**
   * 获取样式使用统计
   */
  async getStats(id: string): Promise<StyleStats> {
    const response = await ApiUtils.get<StyleResponse>(`/api/styles/${id}/stats`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get style stats');
    }
    return response.data as StyleStats;
  }

  /**
   * 获取样式的图片列表
   */
  async getStyleImages(id: string, params: {
    currentPage?: number;
    pageSize?: number;
    isOnline?: boolean;
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    
    if (params.currentPage) searchParams.append('currentPage', params.currentPage.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.isOnline !== undefined) searchParams.append('isOnline', params.isOnline.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `/api/styles/${id}/images?${queryString}` : `/api/styles/${id}/images`;
    
    return await ApiUtils.get(url);
  }

  /**
   * 创建样式（管理员功能）
   */
  async create(styleData: Omit<Style, 'id' | 'createdAt' | 'updatedAt'>): Promise<Style> {
    const response = await ApiUtils.post<StyleResponse>('/api/styles', styleData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create style');
    }
    return response.data as Style;
  }

  /**
   * 更新样式（管理员功能）
   */
  async update(id: string, styleData: Partial<Omit<Style, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Style> {
    const response = await ApiUtils.put<StyleResponse>(`/api/styles/${id}`, styleData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update style');
    }
    return response.data as Style;
  }

  /**
   * 删除样式（管理员功能）
   */
  async delete(id: string): Promise<void> {
    const response = await ApiUtils.delete<StyleResponse>(`/api/styles/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete style');
    }
  }

  /**
   * 批量创建样式（管理员功能）
   */
  async createBatch(styles: Omit<Style, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{
    success: boolean;
    message: string;
    insertedCount: number;
    insertedIds: string[];
  }> {
    const response = await ApiUtils.post<{
      success: boolean;
      message: string;
      data: {
        success: boolean;
        message: string;
        insertedCount: number;
        insertedIds: string[];
      };
    }>('/api/styles/batch', { styles });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to batch create styles');
    }
    return response.data;
  }

  /**
   * 获取样式总数
   */
  async getCount(filters: Record<string, any> = {}): Promise<number> {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/api/styles/count?${queryString}` : '/api/styles/count';
    
    const response = await ApiUtils.get<{
      success: boolean;
      message: string;
      data: { count: number };
    }>(url);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get styles count');
    }
    return response.data.count;
  }
}

export default new StylesService();