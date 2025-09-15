/**
 * MediaPipe 人体分割模块
 * 基于 MediaPipe 实现人体区域检测和分割
 */

import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision';

interface MediaPipeConfig {
  modelPath: string;
  delegate: 'GPU' | 'CPU';
  runningMode: 'IMAGE' | 'VIDEO';
}

interface SegmentationResult {
  maskDataUrl: string;
  confidence: number;
  categoryMask: any;
}

class MediaPipeSegmentation {
  private static instance: MediaPipeSegmentation | null = null;
  private segmenter: ImageSegmenter | null = null;
  private labels: string[] = [];
  private isInitialized: boolean = false;

  private config: MediaPipeConfig = {
    modelPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite',
    delegate: 'GPU',
    runningMode: 'IMAGE'
  };

  static getInstance(): MediaPipeSegmentation {
    if (!MediaPipeSegmentation.instance) {
      MediaPipeSegmentation.instance = new MediaPipeSegmentation();
    }
    return MediaPipeSegmentation.instance;
  }

  /**
   * 初始化 MediaPipe 分割器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('开始初始化 MediaPipe...');
      
      // 初始化 Vision Tasks
      console.log('正在创建 Vision 文件集...');
      const visionFileset = await FilesetResolver.forVisionTasks(
        '/wasm'
      );
      console.log('Vision 文件集创建成功:', visionFileset);

      console.log('开始创建分割器...');
      console.log('模型路径:', this.config.modelPath);
      console.log('代理类型:', this.config.delegate);
      console.log('运行模式:', this.config.runningMode);
      
      // 创建分割器
      this.segmenter = await ImageSegmenter.createFromOptions(visionFileset, {
        baseOptions: {
          modelAssetPath: this.config.modelPath,
          delegate: this.config.delegate
        },
        runningMode: this.config.runningMode,
        outputCategoryMask: true,
        outputConfidenceMasks: false
      });

      console.log('分割器创建成功，获取标签...');
      // 获取标签
      this.labels = this.segmenter.getLabels();
      console.log('MediaPipe segmentation initialized successfully');
      console.log('可用标签:', this.labels);
      
      this.isInitialized = true;
      console.log('MediaPipe 初始化完成');
    } catch (error) {
      console.error('MediaPipe 初始化失败:', error);
      this.segmenter = null;
      this.isInitialized = true;
      console.warn('将使用备用皮肤检测方案');
    }
  }

  /**
   * 将图片URL转换为ImageBitmap
   */
  private async urlToImageBitmap(imageUrl: string): Promise<ImageBitmap> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return await createImageBitmap(blob);
    } catch (error) {
      console.error('Error converting image URL to ImageBitmap:', error);
      throw error;
    }
  }

  /**
   * 生成简化的皮肤遮罩（备用方案）
   */
  private async generateFallbackMask(imageUrl: string): Promise<string> {
    console.log('使用备用皮肤遮罩生成方案');
    
    try {
      const imageBitmap = await this.urlToImageBitmap(imageUrl);
      
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext('2d')!;
      
      // 绘制原图像，保持比例居中
      const imageAspectRatio = imageBitmap.width / imageBitmap.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imageAspectRatio > canvasAspectRatio) {
        // 图片比画布宽，以画布宽度为准
        drawWidth = canvas.width;
        drawHeight = canvas.width / imageAspectRatio;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      } else {
        // 图片比画布高，以画布高度为准
        drawWidth = canvas.height * imageAspectRatio;
        drawHeight = canvas.height;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      }
      
      ctx.drawImage(imageBitmap, drawX, drawY, drawWidth, drawHeight);
      
      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 简单的肤色检测算法（基于HSV色彩空间）
      let skinPixelCount = 0;
      let totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 转换到HSV并检测肤色
        const isSkinColor = this.detectSkinColor(r, g, b);
        
        if (isSkinColor) {
          skinPixelCount++;
          // 皮肤区域设为白色
          data[i] = 255;     // R
          data[i + 1] = 255; // G
          data[i + 2] = 255; // B
          data[i + 3] = 255; // A
        } else {
          // 非皮肤区域设为透明
          data[i] = 0;       // R
          data[i + 1] = 0;   // G
          data[i + 2] = 0;   // B
          data[i + 3] = 0;   // A
        }
      }
      
      console.log(`皮肤检测完成: ${skinPixelCount}/${totalPixels} 像素被识别为皮肤 (${((skinPixelCount/totalPixels)*100).toFixed(1)}%)`);
      
      if (skinPixelCount === 0) {
        console.warn('没有检测到皮肤像素，可能检测算法过于严格');
      }
      
      // 创建遮罩画布
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d')!;
      
      // 将处理后的数据放到遮罩画布
      const processedImageData = new ImageData(data, canvas.width, canvas.height);
      maskCtx.putImageData(processedImageData, 0, 0);
      
      return maskCanvas.toDataURL();
    } catch (error) {
      console.error('备用遮罩生成失败:', error);
      throw error;
    }
  }

  /**
   * 简单肤色检测
   */
  private detectSkinColor(r: number, g: number, b: number): boolean {
    // 更宽松的肤色检测算法
    // 基于RGB阈值的肤色检测（放宽条件）
    const isValidRange = r > 60 && g > 30 && b > 15 && 
                        r > b && r > g * 0.8;
    
    // 额外的HSV检查
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    if (max === 0) return false;
    
    let h = 0;
    if (diff > 0) {
      if (max === r) {
        h = (60 * ((g - b) / diff) + 360) % 360;
      } else if (max === g) {
        h = (60 * ((b - r) / diff) + 120) % 360;
      } else if (max === b) {
        h = (60 * ((r - g) / diff) + 240) % 360;
      }
    }
    
    const s = max === 0 ? 0 : diff / max;
    const v = max / 255;
    
    // 肤色通常在这些HSV范围内（放宽范围）
    const skinHue = (h >= 0 && h <= 60) || (h >= 300 && h <= 360);
    const skinSat = s >= 0.1 && s <= 0.8;
    const skinVal = v >= 0.2 && v <= 1.0;
    
    // 更简单的检测：如果RGB检测通过，就认为是皮肤
    return isValidRange || (skinHue && skinSat && skinVal);
  }

  /**
   * 生成人体分割遮罩
   */
  async generateMask(imageUrl: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // 如果 MediaPipe 不可用，使用备用方案
    if (!this.segmenter) {
      console.log('MediaPipe 不可用，使用备用皮肤检测方案');
      return this.generateFallbackMask(imageUrl);
    }

    try {
      const imageBitmap = await this.urlToImageBitmap(imageUrl);
      
      // 执行分割
      const result = await new Promise<string>((resolve, reject) => {
        // 创建预处理画布
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d')!;
        
        // 清除画布并绘制图像，保持比例居中
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const imageAspectRatio = imageBitmap.width / imageBitmap.height;
        const canvasAspectRatio = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imageAspectRatio > canvasAspectRatio) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imageAspectRatio;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imageAspectRatio;
          drawHeight = canvas.height;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(imageBitmap, drawX, drawY, drawWidth, drawHeight);

        // 执行分割
        this.segmenter!.segment(imageBitmap, (segmentationResult: any) => {
          try {
            const maskCanvas = document.createElement('canvas');
            const maskCtx = maskCanvas.getContext('2d')!;
            const { width, height } = segmentationResult.categoryMask;
            
            // 设置遮罩画布尺寸
            maskCanvas.width = width;
            maskCanvas.height = height;

            // 获取图像数据
            const imageData = maskCtx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            // 获取分类结果
            const categoryMask = segmentationResult.categoryMask.getAsUint8Array();

            // Debug信息 - 临时输出所有标签和一些像素分类
            console.log('Segmentation labels:', JSON.stringify(this.labels));
            console.log('First 100 pixels categories:', categoryMask.slice(0, 100).map((idx: number) => this.labels[idx]));

            // 处理每个像素
            for (let i = 0; i < categoryMask.length; i++) {
              const category = this.labels[categoryMask[i]];
              const pixelIndex = i * 4;

              // 检查是否为人体皮肤区域
              if (['body-skin', 'face-skin'].includes(category)) {
                // 设置为白色（皮肤区域）
                data[pixelIndex] = 255;     // R
                data[pixelIndex + 1] = 255; // G
                data[pixelIndex + 2] = 255; // B
                data[pixelIndex + 3] = 255; // A
              } else {
                // 设置为透明（非皮肤区域）
                data[pixelIndex] = 0;       // R
                data[pixelIndex + 1] = 0;   // G
                data[pixelIndex + 2] = 0;   // B
                data[pixelIndex + 3] = 0;   // A
              }
            }

            // 创建新的图像数据
            const processedImageData = new ImageData(
              new Uint8ClampedArray(data.buffer), 
              width, 
              height
            );
            
            // 将处理后的数据放回画布
            maskCtx.putImageData(processedImageData, 0, 0);
            
            // 返回 data URL
            const maskDataUrl = maskCanvas.toDataURL();
            resolve(maskDataUrl);
          } catch (error) {
            reject(error);
          }
        });
      });

      return result;
    } catch (error) {
      console.error('Error generating body mask with MediaPipe, trying fallback:', error);
      // MediaPipe 失败时使用备用方案
      return this.generateFallbackMask(imageUrl);
    }
  }

  /**
   * 检查是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized && this.segmenter !== null;
  }

  /**
   * 获取支持的标签列表
   */
  getLabels(): string[] {
    return this.labels.slice();
  }

  /**
   * 销毁分割器实例
   */
  dispose(): void {
    if (this.segmenter) {
      this.segmenter.close();
      this.segmenter = null;
    }
    this.isInitialized = false;
    this.labels = [];
  }
}

export { MediaPipeSegmentation };
export type { SegmentationResult, MediaPipeConfig };