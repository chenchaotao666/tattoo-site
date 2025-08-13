import { ApiUtils } from '../utils/apiUtils';
import { SearchResult, ImageService } from './imageService';
import { UrlUtils } from '../utils/urlUtils';
import { LocalizedText } from '../utils/textUtils';
import type { MultilingualText } from '../utils/multilingual';

// 标签统计接口
export interface TagCount {
  tagId: string;
  displayName: LocalizedText | string;
  description: string;
  count: number;
}

// 分类接口 - 匹配后端数据库结构
export interface Category {
  id: string;                                 // 数据库主键
  name: MultilingualText;                     // JSON 多语言显示名称
  description: MultilingualText;              // JSON 多语言描述
  slug: string;                               // URL友好的slug
  imageId?: string;                           // 封面图片ID
  hotness: number;                            // 热度值 0-1000
  seoTitle: MultilingualText;                 // JSON 多语言SEO标题
  seoDesc: MultilingualText;                  // JSON 多语言SEO描述
  createdAt: string;
  updatedAt: string;
  
  // 统计信息（可能从API返回）
  imageCount?: number;                        // 图片数量
  onlineImageCount?: number;                  // 上线图片数量
  
  tagCounts?: TagCount[];                     // 标签统计数组（可选）
  thumbnailUrl?: string;                      // 缩略图URL（可选）
}

// 分类服务类
export class CategoriesService {
  /**
   * 处理分类对象，确保图片URL是绝对路径
   */
  private static processCategoryUrls(category: Category): Category {
    return UrlUtils.processObjectUrls(category, ['thumbnailUrl']);
  }

  // 获取所有分类
  static async getCategories(): Promise<Category[]> {
    try {
      const data = await ApiUtils.get<Category[]>('/api/categories');
      const rawCategories = data || [];
      
      // 处理分类缩略图URL，确保都是绝对路径
      const categories = rawCategories.map(category => this.processCategoryUrls(category));
      
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // 返回空数组作为降级处理
      return [];
    }
  }

  // 根据分类名称获取分类详情
  static async getCategoryByName(categoryName: string): Promise<Category | null> {
    try {
      const categories = await this.getCategories();
      // 查找匹配的分类（支持name字段）
      const category = categories.find(cat => 
        cat.name && cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      return category || null;
    } catch (error) {
      console.error(`Failed to get category by name ${categoryName}:`, error);
      return null;
    }
  }

  // 根据分类ID获取分类详情
  static async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const categories = await this.getCategories();
      const category = categories.find(cat => cat.categoryId === categoryId);
      return category || null;
    } catch (error) {
      console.error(`Failed to get category by id ${categoryId}:`, error);
      return null;
    }
  }

  // 通过分类名称获取图片列表
  static async getImagesByCategoryId(
    categoryId: string, 
    params: { currentPage?: number; pageSize?: number; query?: string } = {}
  ): Promise<SearchResult> {
    try {
      return await ImageService.getImagesByCategoryId(categoryId, params);
    } catch (error) {
      console.error(`Failed to get images by categoryId ${categoryId}:`, error);
      return {
        images: [],
        totalCount: 0,
        hasMore: false,
        currentPage: 1,
        pageSize: 20
      };
    }
  }

  // ========================================
  // 新的API方法 - 匹配后端路由
  // ========================================

  /**
   * 根据slug获取分类
   */
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await ApiUtils.get<{
        success: boolean;
        message: string;
        data: Category;
      }>(`/api/categories/slug/${slug}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get category by slug');
      }
      
      return this.processCategoryUrls(response.data);
    } catch (error) {
      console.error(`Failed to get category by slug ${slug}:`, error);
      return null;
    }
  }

  /**
   * 获取热门分类
   */
  static async getHotCategories(limit: number = 10): Promise<Category[]> {
    try {
      const response = await ApiUtils.get<{
        success: boolean;
        message: string;
        data: Category[];
      }>(`/api/categories/hot?limit=${limit}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get hot categories');
      }
      
      return response.data.map(category => this.processCategoryUrls(category));
    } catch (error) {
      console.error('Failed to fetch hot categories:', error);
      return [];
    }
  }

  /**
   * 获取分类及其统计信息
   */
  static async getCategoriesWithStats(params: {
    currentPage?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<{
    data: Category[];
    pagination: {
      currentPage: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.currentPage) searchParams.append('currentPage', params.currentPage.toString());
      if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const queryString = searchParams.toString();
      const url = queryString ? `/api/categories/with-stats?${queryString}` : '/api/categories/with-stats';
      
      const response = await ApiUtils.get<{
        success: boolean;
        message: string;
        data: Category[];
        pagination: {
          currentPage: number;
          pageSize: number;
          total: number;
          totalPages: number;
        };
      }>(url);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get categories with stats');
      }
      
      return {
        data: response.data.map(category => this.processCategoryUrls(category)),
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Failed to fetch categories with stats:', error);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  /**
   * 获取分类树结构
   */
  static async getCategoryTree(): Promise<Category[]> {
    try {
      const response = await ApiUtils.get<{
        success: boolean;
        message: string;
        data: Category[];
      }>('/api/categories/tree');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get category tree');
      }
      
      return response.data.map(category => this.processCategoryUrls(category));
    } catch (error) {
      console.error('Failed to fetch category tree:', error);
      return [];
    }
  }

  /**
   * 获取分类SEO信息
   */
  static async getCategorySEO(slug: string): Promise<{
    id: string;
    name: MultilingualText;
    description: MultilingualText;
    seoTitle: MultilingualText;
    seoDesc: MultilingualText;
    slug: string;
    imageId?: string;
  } | null> {
    try {
      const response = await ApiUtils.get<{
        success: boolean;
        message: string;
        data: {
          id: string;
          name: MultilingualText;
          description: MultilingualText;
          seoTitle: MultilingualText;
          seoDesc: MultilingualText;
          slug: string;
          imageId?: string;
        };
      }>(`/api/categories/slug/${slug}/seo`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get category SEO info');
      }
      
      return response.data;
    } catch (error) {
      console.error(`Failed to get SEO info for category ${slug}:`, error);
      return null;
    }
  }

  /**
   * 更新分类热度（管理员功能）
   */
  static async updateCategoryHotness(categoryId: string, hotnessChange: number): Promise<Category | null> {
    try {
      const response = await ApiUtils.post<{
        success: boolean;
        message: string;
        data: Category;
      }>(`/api/categories/${categoryId}/hotness`, { hotnessChange });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update category hotness');
      }
      
      return this.processCategoryUrls(response.data);
    } catch (error) {
      console.error('Failed to update category hotness:', error);
      return null;
    }
  }

  /**
   * 搜索分类（支持多语言）
   */
  static async searchCategories(keyword: string, params: {
    currentPage?: number;
    pageSize?: number;
  } = {}): Promise<{
    data: Category[];
    pagination: {
      currentPage: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('keyword', keyword);
      
      if (params.currentPage) searchParams.append('currentPage', params.currentPage.toString());
      if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());

      const response = await ApiUtils.get<{
        success: boolean;
        message: string;
        data: Category[];
        pagination: {
          currentPage: number;
          pageSize: number;
          total: number;
          totalPages: number;
        };
      }>(`/api/categories/search?${searchParams.toString()}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to search categories');
      }
      
      return {
        data: response.data.map(category => this.processCategoryUrls(category)),
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Failed to search categories:', error);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  /**
   * 获取分类总数
   */
  static async getCategoriesCount(filters: Record<string, any> = {}): Promise<number> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const queryString = searchParams.toString();
      const url = queryString ? `/api/categories/count?${queryString}` : '/api/categories/count';
      
      const response = await ApiUtils.get<{
        success: boolean;
        message: string;
        data: { count: number };
      }>(url);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get categories count');
      }
      
      return response.data.count;
    } catch (error) {
      console.error('Failed to get categories count:', error);
      return 0;
    }
  }
}

// 导出默认实例
export const categoriesService = new CategoriesService();
