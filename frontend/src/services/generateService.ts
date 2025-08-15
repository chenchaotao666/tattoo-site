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

export interface GenerateTattooRequest {
  prompt: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  scheduler?: string;
  guidance_scale?: number;
  num_inference_steps?: number;
  negative_prompt?: string;
  lora_scale?: number;
  refine?: string;
  high_noise_frac?: number;
  apply_watermark?: boolean;
  style_preset?: 'traditional' | 'realistic' | 'minimalist' | 'geometric' | 'blackAndGrey';
  seed?: number;
}

export interface TattooGenerationResponse {
  id: string;
  status: string;
  input: any;
  output?: string[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
  progress?: {
    percentage: number;
    message: string;
  };
  urls?: any;
  error?: any;
  logs?: string;
  localImages?: any[];
  databaseRecords?: any[];
}

export interface TattooGenerationStatusResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  input: any;
  output?: string[];
  error?: any;
  logs?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  progress: {
    percentage: number;
    message: string;
  };
  urls?: any;
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
   * 纹身图片生成（同步，等待完成）
   */
  async generateTattoo(data: GenerateTattooRequest): Promise<TattooGenerationResponse> {
    try {
      const requestBody = {
        prompt: data.prompt,
        width: data.width || 1024,
        height: data.height || 1024,
        num_outputs: data.num_outputs || 1,
        scheduler: data.scheduler || "K_EULER",
        guidance_scale: data.guidance_scale || 7.5,
        num_inference_steps: data.num_inference_steps || 25,
        negative_prompt: data.negative_prompt || "ugly, broken, distorted, blurry, low quality, bad anatomy",
        lora_scale: data.lora_scale || 0.6,
        refine: data.refine || "expert_ensemble_refiner",
        high_noise_frac: data.high_noise_frac || 0.9,
        apply_watermark: data.apply_watermark || false,
        ...(data.style_preset && { style_preset: data.style_preset }),
        ...(data.seed && { seed: data.seed })
      };
      
      const responseData = await ApiUtils.post<TattooGenerationResponse>('/api/images/generate-tattoo', requestBody, true);
      
      return responseData;
    } catch (error) {
      console.error('Generate tattoo error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2009', '纹身生成失败');
    }
  }

  /**
   * 纹身图片异步生成（立即返回，需要后续查询进度）
   */
  async generateTattooAsync(data: GenerateTattooRequest): Promise<TattooGenerationResponse> {
    try {
      const requestBody = {
        prompt: data.prompt,
        width: data.width || 1024,
        height: data.height || 1024,
        num_outputs: data.num_outputs || 1,
        scheduler: data.scheduler || "K_EULER",
        guidance_scale: data.guidance_scale || 7.5,
        num_inference_steps: data.num_inference_steps || 25,
        negative_prompt: data.negative_prompt || "ugly, broken, distorted, blurry, low quality, bad anatomy",
        lora_scale: data.lora_scale || 0.6,
        refine: data.refine || "expert_ensemble_refiner",
        high_noise_frac: data.high_noise_frac || 0.9,
        apply_watermark: data.apply_watermark || false,
        ...(data.style_preset && { style_preset: data.style_preset }),
        ...(data.seed && { seed: data.seed })
      };
      
      const responseData = await ApiUtils.post<TattooGenerationResponse>('/api/images/generate-tattoo/async', requestBody, true);
      
      return responseData;
    } catch (error) {
      console.error('Generate tattoo async error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2014', '异步纹身生成失败');
    }
  }

  /**
   * 批量纹身图片生成
   */
  async batchGenerateTattoo(prompts: string[], commonParams: Partial<GenerateTattooRequest> = {}): Promise<TattooGenerationResponse> {
    try {
      const requestBody = {
        prompts,
        ...commonParams
      };
      
      const responseData = await ApiUtils.post<TattooGenerationResponse>('/api/images/generate-tattoo/batch', requestBody, true);
      
      return responseData;
    } catch (error) {
      console.error('Batch generate tattoo error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2010', '批量纹身生成失败');
    }
  }

  /**
   * 获取纹身生成状态
   */
  async getTattooGenerationStatus(predictionId: string): Promise<TattooGenerationStatusResponse> {
    try {
      const responseData = await ApiUtils.get<TattooGenerationStatusResponse>(`/api/images/generate-tattoo/status/${predictionId}`, {}, true);
      
      return responseData;
    } catch (error) {
      console.error('Get tattoo generation status error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2011', '获取生成状态失败');
    }
  }

  /**
   * 完成纹身生成任务（下载保存图片）
   */
  async completeTattooGeneration(predictionId: string, originalParams: Partial<GenerateTattooRequest> = {}): Promise<TattooGenerationResponse> {
    try {
      const requestBody = {
        predictionId,
        originalParams
      };
      
      const responseData = await ApiUtils.post<TattooGenerationResponse>('/api/images/generate-tattoo/complete', requestBody, true);
      
      return responseData;
    } catch (error) {
      console.error('Complete tattoo generation error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2015', '完成纹身生成失败');
    }
  }

  /**
   * 轮询纹身生成状态直到完成
   * @param predictionId 预测任务ID
   * @param onProgress 进度回调函数
   * @param maxRetries 最大重试次数，默认60次（约5分钟）
   * @param retryInterval 重试间隔（毫秒），默认5秒
   * @returns 最终生成结果
   */
  async pollTattooGenerationStatus(
    predictionId: string, 
    onProgress?: (progress: { percentage: number; message: string; status: string }) => void,
    maxRetries: number = 60,
    retryInterval: number = 5000
  ): Promise<TattooGenerationStatusResponse> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const statusResponse = await this.getTattooGenerationStatus(predictionId);
        const { status, progress } = statusResponse;
        
        // 调用进度回调
        if (onProgress) {
          onProgress({
            percentage: progress.percentage,
            message: progress.message,
            status: status
          });
        }
        
        // 如果任务完成（成功或失败），返回结果
        if (status === 'succeeded' || status === 'failed' || status === 'canceled') {
          return statusResponse;
        }
        
        // 等待后继续轮询
        await new Promise(resolve => setTimeout(resolve, retryInterval));
        retries++;
        
      } catch (error) {
        console.error(`Poll attempt ${retries + 1} failed:`, error);
        retries++;
        
        // 如果是网络错误，等待后重试
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
      }
    }
    
    throw new ApiError('2016', '轮询超时，生成任务可能仍在进行中');
  }

  /**
   * 全流程异步生成纹身（启动 -> 轮询 -> 完成）
   * @param data 生成参数
   * @param onProgress 进度回调
   * @returns 最终生成结果
   */
  async generateTattooWithProgress(
    data: GenerateTattooRequest,
    onProgress?: (progress: { percentage: number; message: string; status: string }) => void
  ): Promise<TattooGenerationResponse> {
    try {
      // 1. 启动异步生成任务
      const startResponse = await this.generateTattooAsync(data);
      const predictionId = startResponse.id;
      
      // 2. 轮询状态直到完成
      const statusResponse = await this.pollTattooGenerationStatus(predictionId, onProgress);
      
      // 3. 如果生成成功，完成后处理（下载保存）
      if (statusResponse.status === 'succeeded') {
        const completeResponse = await this.completeTattooGeneration(predictionId, data);
        return completeResponse;
      } else {
        // 生成失败，返回状态信息
        throw new ApiError('2017', `生成失败: ${statusResponse.error || '未知错误'}`);
      }
      
    } catch (error) {
      console.error('Generate tattoo with progress error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2018', '纹身生成流程失败');
    }
  }

  /**
   * 获取模型信息
   */
  async getModelInfo(): Promise<any> {
    try {
      const responseData = await ApiUtils.get<any>('/api/images/generate-tattoo/model-info');
      return responseData.data;
    } catch (error) {
      console.error('Get model info error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2012', '获取模型信息失败');
    }
  }

  /**
   * 获取样式预设
   */
  async getStylePresets(): Promise<any> {
    try {
      const responseData = await ApiUtils.get<any>('/api/images/generate-tattoo/style-presets');
      return responseData.data;
    } catch (error) {
      console.error('Get style presets error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2013', '获取样式预设失败');
    }
  }

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