import { ApiUtils } from '../utils/apiUtils';
import type { MultilingualText } from '../utils/multilingual';

// 标签接口定义
export interface Tag {
  id: string;
  name: MultilingualText;
  description: MultilingualText;
  createdAt: string;
  updatedAt: string;
}

// 标签统计信息
export interface TagStats {
  id: string;
  name: MultilingualText;
  description: MultilingualText;
  imageCount: number;
  onlineImageCount: number;
  createdAt: string;
  updatedAt: string;
}

// 分页响应接口
export interface PaginatedTagsResponse {
  success: boolean;
  message: string;
  data: Tag[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// API响应接口
export interface TagResponse {
  success: boolean;
  message: string;
  data: Tag | Tag[] | TagStats;
}

// 查询参数接口
export interface TagsQueryParams {
  currentPage?: number;
  pageSize?: number;
  sortBy?: string | string[];
  sortOrder?: 'ASC' | 'DESC' | string[];
  keyword?: string;
}

class TagsService {
  /**
   * 获取所有标签
   */
  async getAll(params: TagsQueryParams = {}): Promise<PaginatedTagsResponse> {
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
    const url = queryString ? `/api/tags?${queryString}` : '/api/tags';
    
    return await ApiUtils.get<PaginatedTagsResponse>(url);
  }

  /**
   * 根据ID获取标签
   */
  async getById(id: string): Promise<Tag> {
    const response = await ApiUtils.get<TagResponse>(`/api/tags/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get tag');
    }
    return response.data as Tag;
  }

  /**
   * 搜索标签
   */
  async search(keyword: string, params: Omit<TagsQueryParams, 'keyword'> = {}): Promise<PaginatedTagsResponse> {
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

    return await ApiUtils.get<PaginatedTagsResponse>(`/api/tags/search?${searchParams.toString()}`);
  }

  /**
   * 获取热门标签
   */
  async getPopular(limit: number = 20): Promise<TagStats[]> {
    const response = await ApiUtils.get<TagResponse>(`/api/tags/popular?limit=${limit}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get popular tags');
    }
    return response.data as TagStats[];
  }

  /**
   * 获取标签使用统计
   */
  async getStats(id: string): Promise<TagStats> {
    const response = await ApiUtils.get<TagResponse>(`/api/tags/${id}/stats`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get tag stats');
    }
    return response.data as TagStats;
  }

  /**
   * 获取图片的标签列表
   */
  async getImageTags(imageId: string): Promise<Tag[]> {
    const response = await ApiUtils.get<TagResponse>(`/api/images/${imageId}/tags`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get image tags');
    }
    return response.data as Tag[];
  }

  /**
   * 为图片设置标签
   */
  async setImageTags(imageId: string, tagIds: string[]): Promise<void> {
    const response = await ApiUtils.put<{
      success: boolean;
      message: string;
    }>(`/api/images/${imageId}/tags`, { tagIds });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to set image tags');
    }
  }

  /**
   * 为图片添加标签
   */
  async addImageTag(imageId: string, tagId: string): Promise<void> {
    const currentTags = await this.getImageTags(imageId);
    const currentTagIds = currentTags.map(tag => tag.id);
    
    if (!currentTagIds.includes(tagId)) {
      currentTagIds.push(tagId);
      await this.setImageTags(imageId, currentTagIds);
    }
  }

  /**
   * 从图片移除标签
   */
  async removeImageTag(imageId: string, tagId: string): Promise<void> {
    const currentTags = await this.getImageTags(imageId);
    const currentTagIds = currentTags.map(tag => tag.id).filter(id => id !== tagId);
    await this.setImageTags(imageId, currentTagIds);
  }

  /**
   * 创建标签（管理员功能）
   */
  async create(tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    const response = await ApiUtils.post<TagResponse>('/api/tags', tagData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create tag');
    }
    return response.data as Tag;
  }

  /**
   * 更新标签（管理员功能）
   */
  async update(id: string, tagData: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Tag> {
    const response = await ApiUtils.put<TagResponse>(`/api/tags/${id}`, tagData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update tag');
    }
    return response.data as Tag;
  }

  /**
   * 删除标签（管理员功能）
   */
  async delete(id: string): Promise<void> {
    const response = await ApiUtils.delete<TagResponse>(`/api/tags/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete tag');
    }
  }

  /**
   * 批量删除标签（管理员功能）
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
    }>('/api/tags/batch', undefined, { ids });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to batch delete tags');
    }
    return response.data;
  }

  /**
   * 获取标签总数
   */
  async getCount(filters: Record<string, any> = {}): Promise<number> {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/api/tags/count?${queryString}` : '/api/tags/count';
    
    const response = await ApiUtils.get<{
      success: boolean;
      message: string;
      data: { count: number };
    }>(url);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get tags count');
    }
    return response.data.count;
  }
}

export default new TagsService();