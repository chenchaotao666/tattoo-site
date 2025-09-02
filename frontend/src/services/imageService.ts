import { ApiUtils, ApiError } from '../utils/apiUtils';
import { UrlUtils } from '../utils/urlUtils';
import type { MultilingualText } from '../utils/multilingual';

export type AspectRatio = '21:9' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | '16:21';

// 更新的 Tag 接口 - 匹配后端数据库结构
export interface Tag {
  id: string;
  name: MultilingualText;
  description: MultilingualText;
  createdAt: string;
  updatedAt: string;
}

// 更新的图片接口 - 匹配后端数据库结构
export interface BaseImage {
  id: string;
  name: MultilingualText;                    // JSON 多语言字段
  slug: string;                              // URL友好的slug
  tattooUrl: string;                         // 主图片URL（原defaultUrl）
  scourceUrl?: string;                       // 来源URL
  colorUrl?: string;                         // 彩色版本URL（保持兼容）
  coloringUrl?: string;                      // 涂色版本URL（保持兼容）
  title: MultilingualText;                   // JSON 多语言标题
  description: MultilingualText;             // JSON 多语言描述
  type: 'text2image' | 'image2image';        // 图片生成类型
  styleId: string;                           // 样式ID
  isColor: boolean;                          // 是否彩色图片
  isPublic: boolean;                         // 是否公开
  isOnline: boolean;                         // 是否上线（审核状态）
  hotness: number;                           // 热度值 0-1000
  prompt: MultilingualText;                  // JSON 多语言提示词
  batchId?: string;                          // 批次ID，用于标识一次生成的多张图片
  userId: string;                            // 用户ID
  categoryId: string;                        // 分类ID
  additionalInfo?: any;                      // JSON 额外信息
  createdAt: string;
  updatedAt: string;
  
  // 关联数据（可能从JOIN查询返回）
  categoryName?: MultilingualText;
  categorySlug?: string;
  styleTitle?: MultilingualText;
  tags?: Tag[];                              // 关联的标签列表
}

// 搜索结果接口
export interface SearchResult {
  images: BaseImage[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
}

// 搜索参数接口
export interface SearchParams {
  imageId?: string;
  query?: string;
  categoryId?: string;
  tags?: string;
  ratio?: AspectRatio;
  type?: 'text2image' | 'image2image' | 'image2coloring';
  userId?: string;
  isPublic?: boolean;
  isOnline?: boolean;
  currentPage?: number;
  pageSize?: number;
  isRelated?: boolean;
  sortBy?: 'createdAt' | 'hotness' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// 用户图片查询参数接口
export interface UserImageParams {
  query?: string;
  categoryId?: string;
  tags?: string;
  ratio?: AspectRatio;
  type?: 'text2image' | 'image2image' | 'image2coloring';
  isPublic?: boolean;
  currentPage?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'hotness' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// 举报请求接口
export interface ReportImageRequest {
  content: string;
  imageId: string;
}

export class ImageService {
  /**
   * 处理图片对象，确保所有URL都是绝对路径
   */
  private static processImageUrls(image: BaseImage): BaseImage {
    return UrlUtils.processObjectUrls(image, ['tattooUrl', 'scourceUrl', 'colorUrl', 'coloringUrl']);
  }

  /**
   * 搜索图片（根据标题、描述、标签）- 核心方法
   */
  static async searchImages(params: SearchParams = {}): Promise<SearchResult> {
    const {
      imageId,
      query,
      categoryId,
      tags,
      ratio,
      type,
      userId,
      isPublic,
      isOnline,
      currentPage,
      pageSize,
      isRelated = false,
      sortBy = 'hotness',
      sortOrder = 'desc'
    } = params;

    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();
      
      if (imageId) searchParams.append('imageId', imageId);
      if (query) searchParams.append('query', query);
      if (categoryId) searchParams.append('categoryId', categoryId);
      if (tags) searchParams.append('tags', tags);
      if (ratio) searchParams.append('ratio', ratio);
      if (type) searchParams.append('type', type);
      if (userId) searchParams.append('userId', userId);
      if (isPublic !== undefined) searchParams.append('isPublic', isPublic.toString());
      if (isOnline !== undefined) searchParams.append('isOnline', isOnline.toString());
      if (isRelated) searchParams.append('isRelated', isRelated.toString());
      
      if (currentPage) searchParams.append('currentPage', currentPage.toString());
      if (pageSize) searchParams.append('pageSize', pageSize.toString());
      if (sortBy) searchParams.append('sortBy', sortBy);
      if (sortOrder) searchParams.append('sortOrder', sortOrder);

      const response = await ApiUtils.get<{
        data?: BaseImage[], 
        images?: BaseImage[], 
        total?: number,
        pagination?: {
          currentPage: number,
          pageSize: number,
          total: number,
          totalPages: number
        }
      }>(`/api/images?${searchParams.toString()}`);
      
      // 处理服务器返回的格式，支持新旧两种格式
      // 新格式: {data: [...], pagination: {...}} (有分页时)
      // 旧格式: {images: [...], total: number}
      const rawImages = response.pagination ? response.data as BaseImage[] : (response as BaseImage[]);
      const totalCount = response.pagination?.total || 0;
      
      // 处理图片URL，确保都是绝对路径
      const images = rawImages.map(image => this.processImageUrls(image));
      
      // 计算分页信息，优先使用后端返回的分页信息
      const safePageSize = response.pagination?.pageSize || pageSize || 20;
      const safeCurrentPage = response.pagination?.currentPage || currentPage || 1;
      const totalPages = response.pagination?.totalPages || Math.ceil(totalCount / safePageSize);
      const hasMore = safeCurrentPage < totalPages;
      
      return {
        images,
        totalCount,
        hasMore,
        currentPage: safeCurrentPage,
        pageSize: safePageSize
      };
    } catch (error) {
      console.error('Failed to search images:', error);
      return {
        images: [],
        totalCount: 0,
        hasMore: false,
        currentPage: 1,
        pageSize: 20
      };
    }
  }

  /**
   * 获取所有首页图片
   */
  static async getAllImages(): Promise<BaseImage[]> {
    try {
      const result = await this.searchImages({ pageSize: 100 });
      return result.images;
    } catch (error) {
      console.error('Failed to fetch all images:', error);
      return [];
    }
  }

  /**
   * 根据ID获取单张图片
   */
  static async getImageById(id: string): Promise<BaseImage | null> {
    try {
      const result = await this.searchImages({ imageId: id });
      return result.images.length > 0 ? result.images[0] : null;
    } catch (error) {
      console.error(`Failed to fetch image ${id}:`, error);
      return null;
    }
  }

  /**
   * 获取相关图片（基于分类ID）
   * @param categoryId 分类ID
   * @param currentImageId 当前图片ID，用于过滤掉自己
   * @param limit 返回图片数量限制，默认4张
   * @returns 相关图片数组
   */
  static async getRelatedImages(categoryId: string, currentImageId: string, limit: number = 4): Promise<BaseImage[]> {
    try {
      // 查询比需要的数量多一些，以防过滤掉自己后数量不够
      const result = await this.searchImages({ 
        categoryId, 
        isPublic: true, // 只返回公开的图片
        isOnline: true,
        currentPage: 1,
        pageSize: limit + 1 // 多查询1张，以防过滤后不够
      });
      
      // 过滤掉当前图片，然后取前limit张
      const filteredImages = result.images
        .filter(image => image.id !== currentImageId)
        .slice(0, limit);
      
      return filteredImages;
    } catch (error) {
      console.error(`Failed to get related images for category ${categoryId}:`, error);
      return [];
    }
  }

  /**
   * 删除图片
   * @param imageId 要删除的图片ID
   * @returns Promise<boolean> 删除是否成功
   */
  static async deleteImage(imageId: string): Promise<boolean> {
    try {
      await ApiUtils.delete<any>(`/api/images/${imageId}`, true);
      return true;
    } catch (error) {
      console.error(`Failed to delete image ${imageId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * 举报图片
   * @param data 举报数据
   * @returns Promise<boolean> 举报是否成功
   */
  static async reportImage(data: ReportImageRequest): Promise<boolean> {
    try {
      await ApiUtils.post<any>('/api/images/report', data, true);
      return true;
    } catch (error) {
      console.error('Failed to report image:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * 按分类获取图片
   * @param categoryId 分类ID
   * @param params 查询参数
   * @returns Promise<SearchResult>
   */
  static async getImagesByCategoryId(
    categoryId: string, 
    params: { currentPage?: number; pageSize?: number; query?: string } = {}
  ): Promise<SearchResult> {
    return this.searchImages({
      categoryId,
      ...params
    });
  }

  /**
   * 📦 获取用户自己创建的图片（专用接口）
   * 接口地址：GET /api/images/userImg
   * 用户获取自己创建的图片时，调用这个接口
   * @param params 查询参数
   * @returns Promise<SearchResult>
   */
  static async getUserOwnImages(params: UserImageParams = {}): Promise<SearchResult> {
    const {
      query,
      categoryId,
      tags,
      type,
      isPublic,
      currentPage,
      pageSize,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();
      
      if (query) searchParams.append('query', query);
      if (categoryId) searchParams.append('categoryId', categoryId);
      if (tags) searchParams.append('tags', tags);
      if (type) searchParams.append('type', type);
      if (isPublic !== undefined) searchParams.append('isPublic', isPublic.toString());
      if (sortBy) searchParams.append('sortBy', sortBy);
      if (sortOrder) searchParams.append('sortOrder', sortOrder);
      
      if (currentPage) searchParams.append('currentPage', currentPage.toString());
      if (pageSize) searchParams.append('pageSize', pageSize.toString());

      // 调用专用的用户图片接口，需要认证
      const response = await ApiUtils.get<{
        data?: BaseImage[], 
        images?: BaseImage[], 
        total?: number,
        pagination?: {
          currentPage: number,
          pageSize: number,
          total: number,
          totalPages: number
        }
      }>(
        `/api/images/generated?${searchParams.toString()}`, 
        undefined, 
        true // 需要认证
      );
      
      // 处理服务器返回的格式，支持新旧两种格式
      // 新格式: {data: [...], pagination: {...}} (有分页时)
      // 旧格式: {images: [...], total: number}
      const rawImages = response.data || response.images || [];
      const totalCount = response.pagination?.total || response.total || 0;
      
      // 处理图片URL，确保都是绝对路径
      const images = rawImages.map(image => this.processImageUrls(image));
      
      // 计算分页信息，优先使用后端返回的分页信息
      const safePageSize = response.pagination?.pageSize || pageSize || 20;
      const safeCurrentPage = response.pagination?.currentPage || currentPage || 1;
      const totalPages = response.pagination?.totalPages || Math.ceil(totalCount / safePageSize);
      const hasMore = safeCurrentPage < totalPages;
      
      return {
        images,
        totalCount,
        hasMore,
        currentPage: safeCurrentPage,
        pageSize: safePageSize
      };
    } catch (error) {
      console.error('Failed to fetch user own images:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      return {
        images: [],
        totalCount: 0,
        hasMore: false,
        currentPage: 1,
        pageSize: 20
      };
    }
  }

  /**
   * 获取图片总数
   * @returns Promise<number> 返回图片总数
   */
  static async getImageCount(filters: Record<string, any> = {}): Promise<number> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const queryString = searchParams.toString();
      const url = queryString ? `/api/images/count?${queryString}` : '/api/images/count';
      
      const response = await ApiUtils.get<{
        count: number;
      }>(url);
      
      return response.count;
    } catch (error) {
      console.error('Failed to fetch image count:', error);
      return 0;
    }
  }
}