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