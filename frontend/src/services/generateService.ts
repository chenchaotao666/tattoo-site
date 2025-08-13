import { ApiUtils, ApiError } from '../utils/apiUtils';
import { HomeImage } from './imageService';

// ==================== 类型定义 ====================
// 接口类型定义
export type AspectRatio = '21:9' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | '16:21';

export interface GenerateTextToImageRequest {
  prompt: string;
  ratio: AspectRatio;
  isPublic: boolean;
  style?: string;
  userId?: string;
  difficulty?: string;
}

export interface GenerateImageToImageRequest {
  imageFile: File;
  ratio?: AspectRatio;
  isPublic: boolean;
  userId?: string;
}

export interface GenerateResponse {
  status: 'success' | 'fail';
  data: {
    taskId: string;
  };
  message?: string;
}

export interface TaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  message?: string;
  errorCode?: string;
  errorMessage?: string;
  result?: HomeImage;
  image?: HomeImage; // 兼容字段
}

export interface StyleSuggestion {
  id: string;
  name: string;
  content: string;
  category: string;
}

export interface UserTask {
  taskId: string;
  status: string;
  progress: number;
  type: string;
  prompt?: string;
  createdAt: string;
  estimatedTime?: number;
  completedAt?: string;
  originalFileName?: string;
  result?: HomeImage;
}

export interface UserTasksResponse {
  tasks: UserTask[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
  stats: {
    total: number;
    processing: number;
    completed: number;
    failed: number;
    text2image: number;
    image2image: number;
  };
}

// ==================== 主要服务类 ====================
class GenerateService {

  /**
   * 文本生成图片
   */
  async generateTextToImage(data: GenerateTextToImageRequest): Promise<GenerateResponse> {
    try {
      const requestBody: any = {
        prompt: data.prompt,
        ratio: data.ratio,
        isPublic: data.isPublic,
        style: data.style
      };
      
      // 如果提供了userId，则添加到请求中
      if (data.userId) {
        requestBody.userId = data.userId;
      }
      
      // 如果提供了difficulty，则添加到请求中
      if (data.difficulty) {
        requestBody.difficulty = data.difficulty;
      }
      
      const responseData = await ApiUtils.post<{ taskId: string }>('/api/images/text2imggenerate', requestBody, true);
      
      return {
        status: 'success',
        data: responseData,
        message: 'Generation started successfully'
      };
    } catch (error) {
      console.error('Generate text to image error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2007', '文本生成图片失败');
    }
  }

  /**
   * 图片转图片生成
   */
  async generateImageToImage(data: GenerateImageToImageRequest): Promise<GenerateResponse> {
    try {
      const formData = new FormData();
      formData.append('file', data.imageFile);
      if (data.ratio) formData.append('ratio', data.ratio);
      formData.append('isPublic', data.isPublic.toString());
      
      // 如果提供了userId，则添加到请求中
      if (data.userId) {
        formData.append('userId', data.userId);
      }

      const responseData = await ApiUtils.uploadFile<{ taskId: string }>('/api/images/img2imggenerate', formData, true);
      
      return {
        status: 'success',
        data: responseData,
        message: 'Generation started successfully'
      };
    } catch (error) {
      console.error('Generate image to image error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2008', '图片转换失败');
    }
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string, type: 'text2image' | 'image2image' | 'image2coloring' = 'text2image'): Promise<TaskStatus> {
    const { TaskService } = await import('./taskService');
    return TaskService.getTaskStatus(taskId, type);
  }

  /**
   * 获取示例图片
   */
  async getExampleImages(category: 'text' | 'image', pageSize: number = 3): Promise<HomeImage[]> {
    try {
      // 根据类别确定搜索类型
      const searchType = category === 'text' ? 'text2image' : 'image2image';
      
      // 使用图片服务获取示例图片
      const { ImageService } = await import('./imageService');
      const result = await ImageService.searchImages({
        type: searchType,
        isPublic: true,
        isOnline: true,
        currentPage: 1,
        pageSize: pageSize
      });
      
      return result.images;
    } catch (error) {
      console.error('Failed to get example images:', error);
      return [];
    }
  }

  /**
   * 获取用户生成的图片
   * @param _userId 用户ID（保留用于向后兼容性，实际不使用，getUserOwnImages从token中获取当前用户）
   */
  async getUserGeneratedImages(_userId: string): Promise<HomeImage[]> {
    try {
      const { ImageService } = await import('./imageService');
      // 注意：userId参数现在不被使用，getUserOwnImages会从认证token中自动获取当前用户ID
      const result = await ImageService.getUserOwnImages();
      
      return result.images;
    } catch (error) {
      console.error('Failed to get user generated images:', error);
      return [];
    }
  }

  /**
   * 检查用户是否可以生成图片（积分检查）
   */
  async canUserGenerate(): Promise<{ canGenerate: boolean; reason?: string }> {
    try {
      const { UserService } = await import('./userService');
      
      // 先检查是否已登录
      if (!UserService.isLoggedIn()) {
        return { canGenerate: false, reason: '请先登录' };
      }
      
      const user = await UserService.getCurrentUser();
      
      if (!user) {
        return { canGenerate: false, reason: '请先登录' };
      }

      // 检查积分（文本生成和图片转换都需要20积分）
      if (user.credits < 20) {
        return { canGenerate: false, reason: '积分不足，需要20积分' };
      }

      return { canGenerate: true };
    } catch (error) {
      return { canGenerate: false, reason: '检查用户状态失败' };
    }
  }

}

// 导出单例实例
export const generateService = new GenerateService();
export default generateService; 