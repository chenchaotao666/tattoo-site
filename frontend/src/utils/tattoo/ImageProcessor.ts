/**
 * 图像处理和深度图生成模块
 * 处理图像预处理、深度图生成和图像变换
 */

interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
}

interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

interface DepthMapOptions {
  resolution: { width: number; height: number };
  strength: number;
  blur: number;
}

class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * 将图片URL转换为ImageBitmap
   */
  async urlToImageBitmap(imageUrl: string): Promise<ImageBitmap> {
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
   * 去除图像背景（基于颜色相似度）
   */
  async removeBackground(imageUrl: string, options: {
    tolerance?: number; // 颜色容差 (0-100)
    backgroundColor?: string; // 背景色，默认白色
    featherEdge?: number; // 边缘羽化 (0-10)
  } = {}): Promise<string> {
    const {
      tolerance = 20,
      backgroundColor = '#ffffff',
      featherEdge = 2
    } = options;

    try {
      // 加载图像
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          
          // 绘制原图
          this.ctx.drawImage(img, 0, 0);
          
          // 获取图像数据
          const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
          const data = imageData.data;
          
          // 解析背景色
          const bgColor = this.hexToRgb(backgroundColor);
          
          // 遍历所有像素
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 计算与背景色的差异
            const diff = Math.sqrt(
              Math.pow(r - bgColor.r, 2) + 
              Math.pow(g - bgColor.g, 2) + 
              Math.pow(b - bgColor.b, 2)
            );
            
            // 如果颜色差异小于容差，设为透明
            if (diff < tolerance * 2.55) { // 转换为0-255范围
              data[i + 3] = 0; // 设置alpha为0（透明）
            } else if (featherEdge > 0) {
              // 边缘羽化处理
              const featherRange = tolerance * 2.55 * (1 + featherEdge / 10);
              if (diff < featherRange) {
                const alpha = Math.max(0, (diff - tolerance * 2.55) / (featherRange - tolerance * 2.55));
                data[i + 3] = Math.floor(data[i + 3] * alpha);
              }
            }
          }
          
          // 应用处理后的图像数据
          this.ctx.putImageData(imageData, 0, 0);
          
          // 返回处理后的图像URL
          resolve(this.canvas.toDataURL('image/png'));
        };
        
        img.onerror = reject;
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error removing background:', error);
      throw error;
    }
  }

  /**
   * 智能背景去除（基于边缘检测和色彩分析）
   */
  async smartRemoveBackground(imageUrl: string, options: {
    tolerance?: number;
    featherEdge?: number;
  } = {}): Promise<string> {
    const {
      tolerance = 30, // 提高容差，更容易去除背景
      featherEdge = 3  // 增加边缘羽化
    } = options;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.ctx.drawImage(img, 0, 0);
          
          const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
          const data = imageData.data;
          
          // 改进的背景色检测：分析四角和边缘
          const backgroundColor = this.detectBackgroundColor(data, img.width, img.height);
          
          console.log('检测到的背景色:', backgroundColor);
          
          // 使用改进的去背景算法，包含边缘羽化
          this.removeBackgroundWithFeather(data, backgroundColor, tolerance, featherEdge);
          
          this.ctx.putImageData(imageData, 0, 0);
          
          // 裁剪到有效内容区域以避免3D着色器缩放问题
          const croppedCanvas = this.cropToContent(this.canvas);
          resolve(croppedCanvas.toDataURL('image/png'));
        };
        
        img.onerror = reject;
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error in smart background removal:', error);
      throw error;
    }
  }

  /**
   * 辅助方法：十六进制颜色转RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }


  /**
   * 改进的背景色检测（分析边缘像素）
   */
  private detectBackgroundColor(data: Uint8ClampedArray, width: number, height: number): { r: number; g: number; b: number } {
    const edgePixels: number[][] = [];
    
    // 采样边缘像素（上边、下边、左边、右边）
    const sampleSize = Math.min(20, Math.floor(Math.min(width, height) * 0.1));
    
    // 上边缘
    for (let x = 0; x < width; x += Math.max(1, Math.floor(width / sampleSize))) {
      const index = x * 4;
      edgePixels.push([data[index], data[index + 1], data[index + 2]]);
    }
    
    // 下边缘
    for (let x = 0; x < width; x += Math.max(1, Math.floor(width / sampleSize))) {
      const index = ((height - 1) * width + x) * 4;
      edgePixels.push([data[index], data[index + 1], data[index + 2]]);
    }
    
    // 左边缘
    for (let y = 0; y < height; y += Math.max(1, Math.floor(height / sampleSize))) {
      const index = y * width * 4;
      edgePixels.push([data[index], data[index + 1], data[index + 2]]);
    }
    
    // 右边缘
    for (let y = 0; y < height; y += Math.max(1, Math.floor(height / sampleSize))) {
      const index = (y * width + width - 1) * 4;
      edgePixels.push([data[index], data[index + 1], data[index + 2]]);
    }
    
    // 计算平均颜色作为背景色
    let avgR = 0, avgG = 0, avgB = 0;
    edgePixels.forEach(([r, g, b]) => {
      avgR += r;
      avgG += g;
      avgB += b;
    });
    
    const count = edgePixels.length;
    return {
      r: Math.round(avgR / count),
      g: Math.round(avgG / count),
      b: Math.round(avgB / count)
    };
  }

  /**
   * 带边缘羽化的背景去除
   */
  private removeBackgroundWithFeather(
    data: Uint8ClampedArray, 
    bgColor: { r: number; g: number; b: number }, 
    tolerance: number, 
    featherEdge: number
  ): void {
    const toleranceThreshold = tolerance * 2.55; // 转换为0-255范围
    const featherRange = toleranceThreshold * (1 + featherEdge / 10);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // 计算与背景色的差异
      const diff = Math.sqrt(
        Math.pow(r - bgColor.r, 2) + 
        Math.pow(g - bgColor.g, 2) + 
        Math.pow(b - bgColor.b, 2)
      );
      
      if (diff < toleranceThreshold) {
        // 完全透明
        data[i + 3] = 0;
      } else if (featherEdge > 0 && diff < featherRange) {
        // 边缘羽化：渐变透明度
        const alpha = Math.max(0, (diff - toleranceThreshold) / (featherRange - toleranceThreshold));
        data[i + 3] = Math.floor(data[i + 3] * alpha);
      }
      // 否则保持原始透明度
    }
  }


  /**
   * 裁剪到有效内容区域（去除透明边缘）
   */
  private cropToContent(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let minX = canvas.width, minY = canvas.height;
    let maxX = -1, maxY = -1;
    
    // 找到有效内容的边界
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const alpha = data[index + 3];
        
        // 如果像素不完全透明，则认为是有效内容
        if (alpha > 10) { // 使用小阈值以包含半透明边缘
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    // 如果没有找到有效内容，返回原画布
    if (maxX === -1) {
      console.warn('没有找到有效内容，返回原图');
      return canvas;
    }
    
    // 添加一些边距
    const padding = 5;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width - 1, maxX + padding);
    maxY = Math.min(canvas.height - 1, maxY + padding);
    
    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
    
    console.log('裁剪信息:', {
      original: { width: canvas.width, height: canvas.height },
      crop: { x: minX, y: minY, width: cropWidth, height: cropHeight },
      reduction: ((canvas.width * canvas.height - cropWidth * cropHeight) / (canvas.width * canvas.height) * 100).toFixed(1) + '%'
    });
    
    // 创建新的画布并绘制裁剪后的内容
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext('2d')!;
    
    croppedCtx.drawImage(
      canvas,
      minX, minY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
    
    return croppedCanvas;
  }

  /**
   * 获取图像元数据
   */
  async getImageMetadata(imageUrl: string): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const metadata: ImageMetadata = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight
        };
        resolve(metadata);
      };
      
      img.onerror = () => reject(new Error('Failed to load image for metadata'));
      img.src = imageUrl;
    });
  }

  /**
   * 调整图像尺寸
   */
  resizeImage(
    image: HTMLImageElement | ImageBitmap, 
    options: ImageProcessingOptions = {}
  ): HTMLCanvasElement {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.9
    } = options;

    // 获取原始尺寸
    const originalWidth = 'naturalWidth' in image ? image.naturalWidth : image.width;
    const originalHeight = 'naturalHeight' in image ? image.naturalHeight : image.height;

    // 计算新尺寸
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (newWidth > maxWidth || newHeight > maxHeight) {
      const aspectRatio = originalWidth / originalHeight;
      
      if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = newWidth / aspectRatio;
      }
      
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
      }
    }

    // 设置画布尺寸
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;

    // 清除画布并绘制图像
    this.ctx.clearRect(0, 0, newWidth, newHeight);
    this.ctx.drawImage(image as any, 0, 0, newWidth, newHeight);

    return this.canvas;
  }

  /**
   * 生成简单深度图（基于亮度）
   */
  generateDepthMap(
    image: HTMLImageElement | ImageBitmap, 
    options: DepthMapOptions = {
      resolution: { width: 512, height: 512 },
      strength: 0.3,
      blur: 2
    }
  ): string {
    // 设置画布尺寸
    this.canvas.width = options.resolution.width;
    this.canvas.height = options.resolution.height;

    // 绘制图像
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(image as any, 0, 0, this.canvas.width, this.canvas.height);

    // 获取图像数据
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    // 转换为灰度并创建深度效果
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 计算亮度作为深度值
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      
      // 应用深度强度
      const depth = Math.pow(brightness, options.strength);
      const depthValue = Math.floor(depth * 255);

      // 设置为灰度深度图
      data[i] = depthValue;     // R
      data[i + 1] = depthValue; // G
      data[i + 2] = depthValue; // B
      data[i + 3] = 255;        // A
    }

    // 将处理后的数据放回画布
    this.ctx.putImageData(imageData, 0, 0);

    // 如果需要模糊效果
    if (options.blur > 0) {
      this.ctx.filter = `blur(${options.blur}px)`;
      this.ctx.drawImage(this.canvas, 0, 0);
      this.ctx.filter = 'none';
    }

    return this.canvas.toDataURL();
  }

  /**
   * 生成高级深度图（基于边缘检测和梯度）
   */
  generateAdvancedDepthMap(
    image: HTMLImageElement | ImageBitmap,
    options: DepthMapOptions = {
      resolution: { width: 512, height: 512 },
      strength: 0.3,
      blur: 1
    }
  ): string {
    // 设置画布尺寸
    this.canvas.width = options.resolution.width;
    this.canvas.height = options.resolution.height;

    // 绘制图像
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(image as any, 0, 0, this.canvas.width, this.canvas.height);

    // 获取图像数据
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 创建灰度数组
    const grayData = new Float32Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      grayData[i / 4] = gray;
    }

    // Sobel边缘检测
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    const gradients = new Float32Array(width * height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            const pixel = grayData[idx];
            
            gx += pixel * sobelX[kernelIdx];
            gy += pixel * sobelY[kernelIdx];
          }
        }
        
        const gradient = Math.sqrt(gx * gx + gy * gy);
        gradients[y * width + x] = gradient;
      }
    }

    // 生成深度图
    for (let i = 0; i < width * height; i++) {
      const y = Math.floor(i / width);
      const x = i % width;
      
      // 结合亮度和梯度信息
      const brightness = grayData[i];
      const gradient = gradients[i];
      
      // 创建深度值 - 亮度越高越远，梯度越大（边缘）越近
      let depth = brightness * 0.7 + (1 - gradient) * 0.3;
      depth = Math.pow(depth, options.strength);
      
      const depthValue = Math.floor(depth * 255);
      const pixelIndex = i * 4;
      
      data[pixelIndex] = depthValue;     // R
      data[pixelIndex + 1] = depthValue; // G
      data[pixelIndex + 2] = depthValue; // B
      data[pixelIndex + 3] = 255;        // A
    }

    // 将处理后的数据放回画布
    this.ctx.putImageData(imageData, 0, 0);

    // 应用模糊
    if (options.blur > 0) {
      this.ctx.filter = `blur(${options.blur}px)`;
      this.ctx.drawImage(this.canvas, 0, 0);
      this.ctx.filter = 'none';
    }

    return this.canvas.toDataURL();
  }

  /**
   * 图像色彩调整
   */
  adjustImageColors(
    image: HTMLImageElement | ImageBitmap,
    adjustments: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      hue?: number;
    }
  ): string {
    const { brightness = 1, contrast = 1, saturation = 1, hue = 0 } = adjustments;

    // 获取图像尺寸
    const width = 'naturalWidth' in image ? image.naturalWidth : image.width;
    const height = 'naturalHeight' in image ? image.naturalHeight : image.height;

    // 设置画布
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(image as any, 0, 0);

    // 应用滤镜
    const filters = [];
    if (brightness !== 1) filters.push(`brightness(${brightness})`);
    if (contrast !== 1) filters.push(`contrast(${contrast})`);
    if (saturation !== 1) filters.push(`saturate(${saturation})`);
    if (hue !== 0) filters.push(`hue-rotate(${hue}deg)`);

    if (filters.length > 0) {
      this.ctx.filter = filters.join(' ');
      this.ctx.drawImage(this.canvas, 0, 0);
      this.ctx.filter = 'none';
    }

    return this.canvas.toDataURL();
  }

  /**
   * 转换图像为灰度
   */
  convertToGrayscale(image: HTMLImageElement | ImageBitmap): string {
    // 获取图像尺寸
    const width = 'naturalWidth' in image ? image.naturalWidth : image.width;
    const height = 'naturalHeight' in image ? image.naturalHeight : image.height;

    // 设置画布
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(image as any, 0, 0);

    // 获取图像数据并转换为灰度
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // 使用标准灰度转换公式
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      
      data[i] = gray;     // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
      // Alpha通道保持不变
    }

    // 将处理后的数据放回画布
    this.ctx.putImageData(imageData, 0, 0);

    return this.canvas.toDataURL();
  }

  /**
   * 创建透明遮罩
   */
  createTransparencyMask(
    image: HTMLImageElement | ImageBitmap,
    threshold: number = 0.1
  ): string {
    // 获取图像尺寸
    const width = 'naturalWidth' in image ? image.naturalWidth : image.width;
    const height = 'naturalHeight' in image ? image.naturalHeight : image.height;

    // 设置画布
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(image as any, 0, 0);

    // 获取图像数据
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const a = data[i + 3] / 255;

      // 计算像素的不透明度
      const opacity = Math.max(r, g, b) * a;

      if (opacity < threshold) {
        // 完全透明
        data[i + 3] = 0;
      } else {
        // 保持原有透明度
        data[i + 3] = Math.floor(opacity * 255);
      }
    }

    // 将处理后的数据放回画布
    this.ctx.putImageData(imageData, 0, 0);

    return this.canvas.toDataURL();
  }

  /**
   * 导出处理后的图像
   */
  exportImage(format: 'png' | 'jpeg' | 'webp' = 'png', quality: number = 0.9): string {
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  /**
   * 销毁处理器
   */
  dispose(): void {
    // Canvas会被垃圾回收器自动清理
  }
}

export { ImageProcessor };
export type { ImageMetadata, ImageProcessingOptions, DepthMapOptions };