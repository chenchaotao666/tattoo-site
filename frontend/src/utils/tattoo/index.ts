/**
 * 纹身预览系统统一导出文件
 * 提供完整的纹身预览功能API
 */

// 主引擎
export { TattooEngine } from './TattooEngine';
export type { TattooEngineConfig, TattooSettings, LoadedAssets } from './TattooEngine';

// MediaPipe 人体分割
export { MediaPipeSegmentation } from './MediaPipeSegmentation';
export type { SegmentationResult, MediaPipeConfig } from './MediaPipeSegmentation';

// Three.js 3D场景
export { ThreeScene } from './ThreeScene';
export type { SceneConfig, CameraSettings, LightSettings } from './ThreeScene';

// 着色器系统
export { TattooShader } from './TattooShader';
export type { ShaderUniforms } from './TattooShader';

// 图像处理
export { ImageProcessor } from './ImageProcessor';
export type { ImageMetadata, ImageProcessingOptions, DepthMapOptions } from './ImageProcessor';

// 擦除和交互工具
export { EraserTool, GestureController } from './EraserTool';
export type { EraserSettings, TouchGesture, InteractionHandlers } from './EraserTool';

/**
 * 便捷的工厂函数，快速创建纹身预览引擎
 * 
 * @param container - DOM容器元素
 * @param options - 配置选项
 * @returns Promise<TattooEngine> - 已初始化的纹身引擎
 * 
 * @example
 * ```typescript
 * import { createTattooEngine } from '@/utils/tattoo';
 * 
 * const container = document.getElementById('tattoo-preview');
 * const engine = await createTattooEngine(container, {
 *   width: 800,
 *   height: 600,
 *   enableEraser: true,
 *   enableGestures: true
 * });
 * 
 * // 加载图像
 * await engine.loadBaseImage('/path/to/human.jpg');
 * await engine.loadTattooImage('/path/to/tattoo.png');
 * 
 * // 调整设置
 * engine.updateSettings({
 *   scale: 1.5,
 *   rotation: 45,
 *   opacity: 0.8
 * });
 * ```
 */
export async function createTattooEngine(
  container: HTMLElement,
  options: {
    width?: number;
    height?: number;
    enableEraser?: boolean;
    enableGestures?: boolean;
  } = {}
): Promise<import('./TattooEngine').TattooEngine> {
  const config = {
    container,
    width: options.width || 800,
    height: options.height || 600,
    enableEraser: options.enableEraser ?? false,
    enableGestures: options.enableGestures ?? true,
  };

  const { TattooEngine: TattooEngineClass } = await import('./TattooEngine');
  const engine = new TattooEngineClass(config);
  await engine.initialize();
  
  return engine;
}

/**
 * 版本信息
 */
export const VERSION = '1.0.0';

/**
 * 支持的图像格式
 */
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
] as const;

/**
 * 默认配置常量
 */
export const DEFAULT_SETTINGS = {
  opacity: 0.8,
  scale: 0.1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  contrast: 1.3,
  blackAndWhite: false,
  multiplyEffect: true
} as const;

export const DEFAULT_ERASER_SETTINGS = {
  size: 20,
  hardness: 0.8,
  opacity: 1.0,
  flow: 1.0
} as const;

/**
 * 错误类型定义
 */
export class TattooEngineError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TattooEngineError';
  }
}

export class MediaPipeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaPipeError';
  }
}

export class ShaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShaderError';
  }
}

/**
 * 工具函数
 */

/**
 * 检查浏览器是否支持WebGL
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

/**
 * 检查浏览器是否支持MediaPipe
 */
export function isMediaPipeSupported(): boolean {
  return typeof window !== 'undefined' && 
         typeof ImageBitmap !== 'undefined' && 
         typeof createImageBitmap !== 'undefined';
}

/**
 * 验证图像文件类型
 */
export function isValidImageType(file: File | string): boolean {
  if (typeof file === 'string') {
    // URL validation - basic check
    return /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(file);
  }
  
  return SUPPORTED_IMAGE_FORMATS.includes(file.type as any);
}

/**
 * 获取图像文件的数据URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 下载图像数据
 */
export function downloadImage(dataURL: string, filename: string = 'tattoo-preview.png'): void {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 系统兼容性检查
 */
export function checkSystemCompatibility(): {
  webgl: boolean;
  mediapipe: boolean;
  canvas: boolean;
  file: boolean;
  overall: boolean;
} {
  const webgl = isWebGLSupported();
  const mediapipe = isMediaPipeSupported();
  const canvas = typeof HTMLCanvasElement !== 'undefined';
  const file = typeof File !== 'undefined' && typeof FileReader !== 'undefined';
  
  return {
    webgl,
    mediapipe,
    canvas,
    file,
    overall: webgl && mediapipe && canvas && file
  };
}