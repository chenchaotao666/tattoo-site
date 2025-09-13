import { ApiUtils, ApiError } from '../utils/apiUtils';
import { BaseImage } from './imageService';

// ==================== 类型定义 ====================

export interface GenerateTattooRequest {
  prompt: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  scheduler?: string;
  guidance_scale?: number;
  num_inference_steps?: number;
  styleId?: string;
  style?: string;
  styleNote?: string;
  isColor?: boolean;
  isPublic?: boolean;
  negative_prompt?: string;
  seed?: number;
  lora_scale?: number;
  refine?: string;
  high_noise_frac?: number;
  apply_watermark?: boolean;
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
  batchId?: string;
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
  result?: BaseImage;
  image?: BaseImage; // 兼容字段
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
  result?: BaseImage;
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
        lora_scale: data.lora_scale || 0.6,
        refine: data.refine || "expert_ensemble_refiner",
        high_noise_frac: data.high_noise_frac || 0.9,
        apply_watermark: data.apply_watermark || false,
        ...(data.styleId && { style: data.styleId }),
        ...(data.style && { style: data.style }),
        ...(data.styleNote && { styleNote: data.styleNote }),
        ...(data.isColor !== undefined && { isColor: data.isColor }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.negative_prompt && { negative_prompt: data.negative_prompt }),
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
    retryInterval: number = 2000
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
    // 定义在函数作用域，以便在catch块中访问
    let progressTimer: NodeJS.Timeout | null = null;
    
    try {
      let currentProgress = 0;
      const maxPollingProgress = 80; // 轮询阶段最大进度
      
      // 创建智能进度管理器 - 均匀上升，不依赖pollTattooGenerationStatus的回调
      let currentProgressValue = 0;
      
      // 根据生成图片数量调整进度速度
      const numOutputs = data.num_outputs || 1;
      let progressInterval = 100; // 默认间隔100ms
      
      if (numOutputs >= 4) {
        progressInterval = 300; // 4张图片时减慢到300ms
      } else if (numOutputs >= 2) {
        progressInterval = 200; // 2-3张图片时适中速度200ms
      }
      
      const startUniformProgress = () => {
        progressTimer = setInterval(() => {
          if (currentProgressValue < maxPollingProgress) {
            currentProgressValue = Math.min(currentProgressValue + 1, maxPollingProgress);
            if (onProgress) {
              onProgress({
                percentage: currentProgressValue,
                message: `正在生成 ${numOutputs} 张图片...`,
                status: 'processing'
              });
            }
          }
        }, progressInterval); // 根据图片数量调整间隔
      };
      
      const smartProgressHandler = (progress: { percentage: number; message: string; status: string }) => {
        // 只有当percentage达到100时才处理结果
        if (progress.percentage >= 100) {
          if (progressTimer) {
            clearInterval(progressTimer);
          }
          currentProgress = maxPollingProgress;
          if (onProgress) {
            onProgress({
              percentage: maxPollingProgress,
              message: progress.message,
              status: progress.status
            });
          }
        }
        // 其他情况不依赖pollTattooGenerationStatus的回调
      };

      // 1. 启动异步生成任务
      const startResponse = await this.generateTattooAsync(data);
      const predictionId = startResponse.id;
      
      // 启动均匀进度更新
      startUniformProgress();
      
      // 2. 轮询状态直到完成
      const statusResponse = await this.pollTattooGenerationStatus(predictionId, smartProgressHandler);
      
      // 3. 如果生成成功，完成后处理（下载保存）
      if (statusResponse.status === 'succeeded') {
        // 清理进度定时器
        if (progressTimer) {
          clearInterval(progressTimer);
        }
        
        // 确保进度达到90%
        if (currentProgress < maxPollingProgress && onProgress) {
          onProgress({
            percentage: maxPollingProgress,
            message: '正在处理生成结果...',
            status: 'processing'
          });
        }
        
        // 从90%到100%的进度模拟
        const completeSteps = 20;
        const stepProgress = (100 - maxPollingProgress) / completeSteps;
        let stepCount = 0;
        
        // 根据图片数量调整完成阶段的进度间隔
        let completeInterval = 1500; // 默认间隔300ms
        if (numOutputs >= 4) {
          completeInterval = 2000; // 4张图片时减慢到800ms
        }
        
        // 创建完成阶段的进度更新器
        const completeProgressInterval = setInterval(() => {
          if (stepCount < completeSteps && onProgress) {
            stepCount++;
            const newProgress = maxPollingProgress + (stepProgress * stepCount);
            onProgress({
              percentage: Math.min(Math.floor(newProgress), 99), // 不超过99%，等真正完成时显示100%
              message: `正在保存 ${numOutputs} 张图片...`,
              status: 'processing'
            });
          }
        }, completeInterval); // 根据图片数量调整间隔
        
        try {
          const completeResponse = await this.completeTattooGeneration(predictionId, data);
          
          // 清除进度更新器
          clearInterval(completeProgressInterval);
          
          // 显示100%完成
          if (onProgress) {
            onProgress({
              percentage: 100,
              message: '生成完成',
              status: 'succeeded'
            });
          }
          
          return completeResponse;
        } catch (error) {
          // 清除进度更新器
          clearInterval(completeProgressInterval);
          throw error;
        }
      } else {
        // 清理进度定时器
        if (progressTimer) {
          clearInterval(progressTimer);
        }
        // 生成失败，返回状态信息
        throw new ApiError('2017', `生成失败: ${statusResponse.error || '未知错误'}`);
      }
      
    } catch (error) {
      // 清理进度定时器
      if (progressTimer) {
        clearInterval(progressTimer);
      }
      console.error('Generate tattoo with progress error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2018', '纹身生成流程失败');
    }
  }

  /**
   * 获取示例图片
   */
  async getExampleImages(category: 'text' | 'image', pageSize: number = 3): Promise<BaseImage[]> {
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
  async getUserGeneratedImages(_userId: string): Promise<BaseImage[]> {
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
  async canUserGenerate(quantity: number = 1): Promise<{ canGenerate: boolean; reason?: string }> {
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

      // 检查积分（根据生成数量计算所需积分）
      const requiredCredits = 20 * quantity;
      if (user.credits < requiredCredits) {
        return { canGenerate: false, reason: `积分不足，需要${requiredCredits}积分` };
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