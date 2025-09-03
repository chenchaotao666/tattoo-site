import { ApiUtils } from '../utils/apiUtils';
import type { MultilingualText } from '../utils/textUtils';

// 创意接口定义
export interface Idea {
  id: string;
  title: MultilingualText;
  prompt: MultilingualText;
  createdAt: string;
  updatedAt: string;
}

// 分页响应接口
export interface PaginatedIdeasResponse {
  success: boolean;
  message: string;
  data: Idea[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// API响应接口
export interface IdeaResponse {
  success: boolean;
  message: string;
  data: Idea | Idea[];
}

// 查询参数接口
export interface IdeasQueryParams {
  currentPage?: number;
  pageSize?: number;
  sortBy?: string | string[];
  sortOrder?: 'ASC' | 'DESC' | string[];
  keyword?: string;
}

class IdeasService {
  /**
   * 获取所有创意
   */
  async getAll(params: IdeasQueryParams = {}): Promise<PaginatedIdeasResponse> {
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
    const url = queryString ? `/api/ideas?${queryString}` : '/api/ideas';
    
    return await ApiUtils.get<PaginatedIdeasResponse>(url);
  }

  /**
   * 根据ID获取创意
   */
  async getById(id: string): Promise<Idea> {
    const response = await ApiUtils.get<IdeaResponse>(`/api/ideas/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get idea');
    }
    return response.data as Idea;
  }

  /**
   * 搜索创意
   */
  async search(keyword: string, params: Omit<IdeasQueryParams, 'keyword'> = {}): Promise<PaginatedIdeasResponse> {
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

    return await ApiUtils.get<PaginatedIdeasResponse>(`/api/ideas/search?${searchParams.toString()}`);
  }

  /**
   * 根据分类获取创意推荐
   */
  async getByCategory(categoryId: string, params: {
    currentPage?: number;
    pageSize?: number;
    limit?: number;
  } = {}): Promise<Idea[]> {
    const searchParams = new URLSearchParams();
    
    if (params.currentPage) searchParams.append('currentPage', params.currentPage.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString 
      ? `/api/ideas/category/${categoryId}?${queryString}` 
      : `/api/ideas/category/${categoryId}`;
    
    const response = await ApiUtils.get<IdeaResponse>(url);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get ideas by category');
    }
    return response.data as Idea[];
  }

  /**
   * 获取随机创意推荐
   */
  async getRandom(limit: number = 5): Promise<Idea[]> {
    const response = await ApiUtils.get<IdeaResponse>(`/api/ideas/random?limit=${limit}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get random ideas');
    }
    return response.data as Idea[];
  }

  /**
   * 获取最新创意
   */
  async getLatest(limit: number = 10): Promise<Idea[]> {
    const params: IdeasQueryParams = {
      pageSize: limit,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    };
    
    const response = await this.getAll(params);
    return response.data;
  }

  /**
   * 创建创意（管理员功能）
   */
  async create(ideaData: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea> {
    const response = await ApiUtils.post<IdeaResponse>('/api/ideas', ideaData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create idea');
    }
    return response.data as Idea;
  }

  /**
   * 更新创意（管理员功能）
   */
  async update(id: string, ideaData: Partial<Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Idea> {
    const response = await ApiUtils.put<IdeaResponse>(`/api/ideas/${id}`, ideaData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update idea');
    }
    return response.data as Idea;
  }

  /**
   * 删除创意（管理员功能）
   */
  async delete(id: string): Promise<void> {
    const response = await ApiUtils.delete<IdeaResponse>(`/api/ideas/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete idea');
    }
  }

  /**
   * 批量删除创意（管理员功能）
   */
  async batchDelete(ids: string[]): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    const response = await ApiUtils.delete<{
      success: boolean;
      message: string;
      data: {
        success: boolean;
        message: string;
        deletedCount: number;
      };
    }>('/api/ideas/batch', undefined, { ids });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to batch delete ideas');
    }
    return response.data;
  }

  /**
   * 获取创意总数
   */
  async getCount(filters: Record<string, any> = {}): Promise<number> {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/api/ideas/count?${queryString}` : '/api/ideas/count';
    
    const response = await ApiUtils.get<{
      success: boolean;
      message: string;
      data: { count: number };
    }>(url);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get ideas count');
    }
    return response.data.count;
  }

  /**
   * 批量创建创意（管理员功能）
   */
  async createBatch(ideas: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{
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
    }>('/api/ideas/batch', { ideas });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to batch create ideas');
    }
    return response.data;
  }
}

export default new IdeasService();