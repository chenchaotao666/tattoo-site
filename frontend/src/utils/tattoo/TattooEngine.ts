/**
 * 纹身预览引擎核心模块
 * 整合所有功能模块，提供统一的API接口
 */

import { MediaPipeSegmentation } from './MediaPipeSegmentation';
import { ThreeScene, type SceneConfig } from './ThreeScene';
import { TattooShader, type ShaderUniforms } from './TattooShader';
import { ImageProcessor, type ImageMetadata } from './ImageProcessor';
import { EraserTool, GestureController, type EraserSettings, type InteractionHandlers } from './EraserTool';

interface TattooEngineConfig {
  container: HTMLElement;
  width: number;
  height: number;
  enableEraser?: boolean;
  enableGestures?: boolean;
}

interface TattooSettings {
  opacity: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  contrast: number;
  blackAndWhite: boolean;
  multiplyEffect: boolean;
}

interface LoadedAssets {
  baseImage?: string;
  tattooImage?: string;
  bodyMask?: string;
  depthMap?: string;
  eraseMap?: string;
}

class TattooEngine {
  // 核心模块
  private segmentation: MediaPipeSegmentation;
  private scene: ThreeScene;
  private shader: TattooShader;
  private imageProcessor: ImageProcessor;
  private eraserTool: EraserTool | null = null;
  private gestureController: GestureController | null = null;

  // 配置和状态
  private config: TattooEngineConfig;
  private settings: TattooSettings;
  private assets: LoadedAssets = {};
  private isInitialized: boolean = false;
  private isProcessing: boolean = false;

  // 事件回调
  private onSettingsChange?: (settings: TattooSettings) => void;
  private onProcessingChange?: (isProcessing: boolean) => void;

  constructor(config: TattooEngineConfig) {
    this.config = config;
    
    // 初始化默认设置
    this.settings = {
      opacity: 0.8,
      scale: 1.0,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      contrast: 1.3,
      blackAndWhite: false,
      multiplyEffect: true
    };

    // 初始化模块
    this.segmentation = MediaPipeSegmentation.getInstance();
    this.imageProcessor = new ImageProcessor();
    this.shader = new TattooShader();
    
    // 初始化3D场景
    const sceneConfig: SceneConfig = {
      width: config.width,
      height: config.height,
      backgroundColor: 0xf8f9fa,
      antialias: true,
      alpha: true
    };
    this.scene = new ThreeScene(sceneConfig);
  }

  /**
   * 初始化引擎
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.setProcessing(true);

      // 初始化MediaPipe
      await this.segmentation.initialize();

      // 挂载3D场景到容器
      this.scene.mount(this.config.container);

      // 设置手势控制
      if (this.config.enableGestures) {
        this.setupGestureControls();
      }

      this.isInitialized = true;
      console.log('Tattoo engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize tattoo engine:', error);
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }

  /**
   * 设置手势控制
   */
  private setupGestureControls(): void {
    const canvas = this.scene.getCanvas();
    
    const handlers: InteractionHandlers = {
      onDragStart: () => {
        console.log('Drag started');
      },
      onDragMove: (delta) => {
        const normalizedDelta = {
          x: delta.x / this.config.width,
          y: -delta.y / this.config.height
        };
        
        this.updateSettings({
          offsetX: this.settings.offsetX + normalizedDelta.x * 0.5,
          offsetY: this.settings.offsetY + normalizedDelta.y * 0.5
        });
      },
      onScaleChange: (scaleRatio) => {
        const newScale = Math.max(0.1, this.settings.scale * scaleRatio);
        this.updateSettings({ scale: newScale });
      },
      onRotationChange: (angleDelta) => {
        const newRotation = this.settings.rotation + angleDelta * 180 / Math.PI;
        this.updateSettings({ rotation: newRotation });
      }
    };

    this.gestureController = new GestureController(canvas, handlers);
  }

  /**
   * 加载人体图像
   */
  async loadBaseImage(imageUrl: string): Promise<void> {
    try {
      this.setProcessing(true);
      
      // 获取图像元数据
      const metadata = await this.imageProcessor.getImageMetadata(imageUrl);
      console.log('Base image metadata:', metadata);

      // 生成人体分割遮罩
      const bodyMask = await this.segmentation.generateBodyMask(imageUrl);
      
      // 生成深度图
      const imageBitmap = await this.imageProcessor.urlToImageBitmap(imageUrl);
      const depthMap = this.imageProcessor.generateAdvancedDepthMap(imageBitmap);

      // 保存资源
      this.assets.baseImage = imageUrl;
      this.assets.bodyMask = bodyMask;
      this.assets.depthMap = depthMap;

      // 创建3D平面
      this.scene.createBasePlane(metadata.aspectRatio);

      // 更新着色器
      await this.updateShaderMaterial();

      console.log('Base image loaded successfully');
    } catch (error) {
      console.error('Failed to load base image:', error);
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }

  /**
   * 加载纹身图像
   */
  async loadTattooImage(imageUrl: string): Promise<void> {
    try {
      this.setProcessing(true);

      // 获取图像元数据
      const metadata = await this.imageProcessor.getImageMetadata(imageUrl);
      console.log('Tattoo image metadata:', metadata);

      // 保存资源
      this.assets.tattooImage = imageUrl;

      // 更新着色器
      await this.updateShaderMaterial();

      console.log('Tattoo image loaded successfully');
    } catch (error) {
      console.error('Failed to load tattoo image:', error);
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }

  /**
   * 更新着色器材质
   */
  private async updateShaderMaterial(): Promise<void> {
    if (!this.assets.baseImage || !this.assets.tattooImage) return;

    try {
      // 加载所有纹理
      const textures = await this.shader.loadTextures({
        baseTexture: this.assets.baseImage,
        depthMap: this.assets.depthMap,
        overlayTexture: this.assets.tattooImage,
        segmentationMap: this.assets.bodyMask,
        eraseMap: this.assets.eraseMap
      });

      // 创建uniforms
      const uniforms: Partial<ShaderUniforms> = {
        baseTexture: textures.baseTexture || null,
        depthMap: textures.depthMap || null,
        overlayTexture: textures.overlayTexture || null,
        segmentationMap: textures.segmentationMap || null,
        eraseMap: textures.eraseMap || null,
        
        overlayScale: this.settings.scale,
        overlayRotation: this.settings.rotation,
        overlayOffset: [this.settings.offsetX, this.settings.offsetY],
        overlayOpacity: this.settings.opacity,
        overlayContrast: this.settings.contrast,
        overlayBlackAndWhite: this.settings.blackAndWhite,
        applyMultiplyEffect: this.settings.multiplyEffect,
        
        depthStrength: 0.3,
        perspectiveK: 1.4,
        depthMapResolution: [512, 512],
        hintOutsideSegment: 0.0,
        includeBase: true,
        showEraseEffect: !!this.assets.eraseMap
      };

      // 创建着色器材质
      const material = this.shader.createShaderMaterial(uniforms);
      
      // 设置到场景
      this.scene.setShaderMaterial(material);
    } catch (error) {
      console.error('Failed to update shader material:', error);
      throw error;
    }
  }

  /**
   * 更新纹身设置
   */
  updateSettings(newSettings: Partial<TattooSettings>): void {
    // 更新内部设置
    this.settings = { ...this.settings, ...newSettings };

    // 更新着色器uniforms
    const shaderUniforms: Partial<ShaderUniforms> = {};
    
    if (newSettings.opacity !== undefined) shaderUniforms.overlayOpacity = newSettings.opacity;
    if (newSettings.scale !== undefined) shaderUniforms.overlayScale = newSettings.scale;
    if (newSettings.rotation !== undefined) shaderUniforms.overlayRotation = newSettings.rotation;
    if (newSettings.offsetX !== undefined || newSettings.offsetY !== undefined) {
      shaderUniforms.overlayOffset = [this.settings.offsetX, this.settings.offsetY];
    }
    if (newSettings.contrast !== undefined) shaderUniforms.overlayContrast = newSettings.contrast;
    if (newSettings.blackAndWhite !== undefined) shaderUniforms.overlayBlackAndWhite = newSettings.blackAndWhite;
    if (newSettings.multiplyEffect !== undefined) shaderUniforms.applyMultiplyEffect = newSettings.multiplyEffect;

    this.shader.updateUniforms(shaderUniforms);

    // 触发回调
    if (this.onSettingsChange) {
      this.onSettingsChange({ ...this.settings });
    }
  }

  /**
   * 启用擦除工具
   */
  enableEraser(): void {
    if (!this.config.enableEraser) return;

    const canvas = this.scene.getCanvas();
    this.eraserTool = new EraserTool(canvas);
  }

  /**
   * 禁用擦除工具
   */
  disableEraser(): void {
    if (this.eraserTool) {
      this.eraserTool.dispose();
      this.eraserTool = null;
    }
  }

  /**
   * 更新擦除器设置
   */
  updateEraserSettings(settings: Partial<EraserSettings>): void {
    if (this.eraserTool) {
      this.eraserTool.updateSettings(settings);
    }
  }

  /**
   * 应用擦除遮罩
   */
  applyEraseMask(): void {
    if (this.eraserTool) {
      const eraseMask = this.eraserTool.getEraseMask();
      this.assets.eraseMap = eraseMask;
      
      // 更新着色器
      this.updateShaderMaterial();
    }
  }

  /**
   * 导出最终图像
   */
  exportImage(): string {
    return this.scene.exportAsImage();
  }

  /**
   * 重置所有设置
   */
  resetSettings(): void {
    this.updateSettings({
      opacity: 0.8,
      scale: 1.0,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      contrast: 1.3,
      blackAndWhite: false,
      multiplyEffect: true
    });
  }

  /**
   * 调整画布尺寸
   */
  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.scene.updateSize(width, height);
  }

  /**
   * 设置处理状态
   */
  private setProcessing(isProcessing: boolean): void {
    this.isProcessing = isProcessing;
    if (this.onProcessingChange) {
      this.onProcessingChange(isProcessing);
    }
  }

  /**
   * 设置事件回调
   */
  setEventHandlers(handlers: {
    onSettingsChange?: (settings: TattooSettings) => void;
    onProcessingChange?: (isProcessing: boolean) => void;
  }): void {
    this.onSettingsChange = handlers.onSettingsChange;
    this.onProcessingChange = handlers.onProcessingChange;
  }

  /**
   * 获取当前设置
   */
  getSettings(): TattooSettings {
    return { ...this.settings };
  }

  /**
   * 获取加载的资源
   */
  getAssets(): LoadedAssets {
    return { ...this.assets };
  }

  /**
   * 检查是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * 检查是否正在处理
   */
  isProcessingData(): boolean {
    return this.isProcessing;
  }

  /**
   * 销毁引擎
   */
  dispose(): void {
    // 销毁各个模块
    if (this.eraserTool) {
      this.eraserTool.dispose();
      this.eraserTool = null;
    }

    if (this.gestureController) {
      this.gestureController.dispose();
      this.gestureController = null;
    }

    this.scene.dispose();
    this.shader.dispose();
    this.imageProcessor.dispose();
    
    // 清理状态
    this.assets = {};
    this.isInitialized = false;
    this.isProcessing = false;

    console.log('Tattoo engine disposed');
  }
}

export { TattooEngine };
export type { TattooEngineConfig, TattooSettings, LoadedAssets };