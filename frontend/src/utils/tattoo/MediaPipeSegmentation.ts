/**
 * MediaPipe 人体分割模块
 * 基于 MediaPipe 实现人体区域检测和分割
 */

declare global {
  interface Window {
    MediaPipeTasksVision?: any;
  }
}

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
  private segmenter: any = null;
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
   * 从CDN动态加载MediaPipe
   */
  private async loadMediaPipeFromCDN(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.MediaPipeTasksVision) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/vision_bundle.js';
      script.onload = () => {
        console.log('MediaPipe Tasks Vision loaded from CDN');
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load MediaPipe from CDN'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * 初始化 MediaPipe 分割器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 尝试从全局对象或CDN加载 MediaPipe 模块
      if (typeof window !== 'undefined') {
        try {
          // 检查是否已经存在全局MediaPipe对象
          let FilesetResolver, ImageSegmenter;
          
          if (window.MediaPipeTasksVision) {
            ({ FilesetResolver, ImageSegmenter } = window.MediaPipeTasksVision);
          } else {
            // 从CDN动态加载
            await this.loadMediaPipeFromCDN();
            ({ FilesetResolver, ImageSegmenter } = window.MediaPipeTasksVision);
          }
          
          // 初始化 Vision Tasks
          const visionFileset = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm'
          );

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

          // 获取标签
          this.labels = this.segmenter.getLabels();
          console.log('MediaPipe segmentation initialized successfully');
        } catch (error) {
          console.warn('MediaPipe not available, using simulation mode:', error);
          this.segmenter = null;
        }
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('MediaPipe initialization failed, using fallback simulation:', error);
      this.isInitialized = true;
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
   * 生成人体分割遮罩
   */
  async generateMask(imageUrl: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.segmenter) {
      throw new Error('MediaPipe segmenter not initialized');
    }

    try {
      const imageBitmap = await this.urlToImageBitmap(imageUrl);
      
      // 执行分割
      const result = await new Promise<string>((resolve, reject) => {
        // 创建预处理画布
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 600;
        const ctx = canvas.getContext('2d')!;
        
        // 清除画布并绘制图像
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

        // 执行分割
        this.segmenter.segment(imageBitmap, (segmentationResult: any) => {
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

            // Debug信息
            if (window.location.href.includes('?debug=true')) {
              console.log('Segmentation labels:', JSON.stringify(this.labels));
            }

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
      console.error('Error generating body mask:', error);
      throw error;
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