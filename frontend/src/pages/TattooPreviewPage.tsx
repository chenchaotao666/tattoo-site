import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  createTattooEngine,
  TattooEngine,
  TattooSettings,
  checkSystemCompatibility,
  isValidImageType,
  fileToDataURL,
  downloadImage,
  DEFAULT_SETTINGS,
  DEFAULT_ERASER_SETTINGS,
  ImageProcessor
} from '@/utils/tattoo';
import type { TattooEngineConfig, LoadedAssets } from '@/utils/tattoo';

// 接口定义

interface UploadedFile {
  url: string;
  file: File;
  width: number;
  height: number;
}

// 系统兼容性检查
const SystemCompatibility: React.FC = () => {
  const [compatibility, setCompatibility] = useState<any>(null);

  useEffect(() => {
    setCompatibility(checkSystemCompatibility());
  }, []);

  if (!compatibility) return null;

  if (!compatibility.overall) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-red-800 mb-2">系统兼容性警告</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {!compatibility.webgl && <li>• 不支持 WebGL</li>}
            {!compatibility.mediapipe && <li>• 不支持 MediaPipe</li>}
            {!compatibility.canvas && <li>• 不支持 Canvas</li>}
            {!compatibility.file && <li>• 不支持文件操作</li>}
          </ul>
          <p className="text-sm text-red-600 mt-2">
            部分功能可能无法正常工作，建议使用现代浏览器。
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};

// 简化版Canvas预览组件（用于调试）
const SimpleTattooCanvas: React.FC<{
  baseImage: string | null;
  tattooImage: string | null;
  settings: TattooSettings;
  onSettingsChange: (settings: Partial<TattooSettings>) => void;
  originalTattooSize?: { width: number; height: number } | null;
}> = ({ baseImage, tattooImage, settings, onSettingsChange, originalTattooSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialSettings, setInitialSettings] = useState({ offsetX: 0, offsetY: 0 });
  const [isGeneratingMask, setIsGeneratingMask] = useState(false);
  const [isProcessingTattoo, setIsProcessingTattoo] = useState(false);
  
  // 缓存图像对象，避免重复加载
  const baseImageCache = useRef<HTMLImageElement | null>(null);
  const tattooImageCache = useRef<HTMLImageElement | null>(null);
  const bodyMaskCache = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  // 缓存临时画布，避免频繁创建
  const maskCanvasCache = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasCache = useRef<HTMLCanvasElement | null>(null);
  const tempCanvas2Cache = useRef<HTMLCanvasElement | null>(null);
  
  // 计算图片在画布中的显示位置和尺寸（保持比例）
  const calculateImageBounds = useCallback((img: HTMLImageElement, canvasWidth: number, canvasHeight: number) => {
    const imageAspectRatio = img.width / img.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspectRatio > canvasAspectRatio) {
      // 图片比画布宽，以画布宽度为准
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imageAspectRatio;
      drawX = 0;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      // 图片比画布高，以画布高度为准
      drawWidth = canvasHeight * imageAspectRatio;
      drawHeight = canvasHeight;
      drawX = (canvasWidth - drawWidth) / 2;
      drawY = 0;
    }
    
    return { drawX, drawY, drawWidth, drawHeight };
  }, []);
  
  // 节流的渲染函数
  const scheduleRender = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制背景图像（如果已缓存），保持原始比例
      if (baseImageCache.current) {
        const { drawX, drawY, drawWidth, drawHeight } = calculateImageBounds(
          baseImageCache.current, 
          canvas.width, 
          canvas.height
        );
        ctx.drawImage(baseImageCache.current, drawX, drawY, drawWidth, drawHeight);
      }
      
      // 绘制纹身（如果已缓存）
      if (tattooImageCache.current) {
        console.log('绘制纹身，基础图像存在:', !!baseImageCache.current, '皮肤遮罩存在:', !!bodyMaskCache.current);
        // 如果有皮肤遮罩，应用遮罩效果
        if (bodyMaskCache.current) {
          console.log('应用皮肤遮罩，遮罩尺寸:', bodyMaskCache.current.width, 'x', bodyMaskCache.current.height);
          // 使用缓存的画布用于遮罩处理
          let maskCanvas = maskCanvasCache.current;
          if (!maskCanvas) {
            maskCanvas = document.createElement('canvas');
            maskCanvasCache.current = maskCanvas;
          }
          const maskCtx = maskCanvas.getContext('2d')!;
          
          // 调整画布尺寸（如果需要）
          if (maskCanvas.width !== canvas.width || maskCanvas.height !== canvas.height) {
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
          } else {
            // 清除之前的内容
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
          }
          
          // 先绘制皮肤遮罩作为基础，使用与人体图片相同的位置和尺寸
          maskCtx.globalCompositeOperation = 'source-over';
          
          // 计算人体图片的实际显示位置和尺寸（与渲染逻辑保持一致）
          const { drawX, drawY, drawWidth, drawHeight } = calculateImageBounds(
            baseImageCache.current!,
            canvas.width,
            canvas.height
          );
          
          // 按照人体图片的实际显示尺寸和位置绘制遮罩
          maskCtx.drawImage(bodyMaskCache.current, drawX, drawY, drawWidth, drawHeight);
          
          // 在遮罩上绘制纹身，使用 source-atop 确保只在遮罩区域绘制
          maskCtx.save();
          maskCtx.globalCompositeOperation = 'source-atop';
          
          const centerX = canvas.width / 2 + settings.offsetX * canvas.width;
          const centerY = canvas.height / 2 + settings.offsetY * canvas.height;
          
          maskCtx.translate(centerX, centerY);
          maskCtx.rotate(settings.rotation * Math.PI / 180);
          maskCtx.scale(settings.scale, settings.scale);
          maskCtx.globalAlpha = settings.opacity;

          const tattooImg = tattooImageCache.current;
          // 使用原始尺寸来计算显示大小，避免背景去除后尺寸变化的影响
          const originalWidth = originalTattooSize?.width || tattooImg.width;
          const originalHeight = originalTattooSize?.height || tattooImg.height;
          const tattooWidth = Math.min(originalWidth, 200) * 0.5;
          const tattooHeight = Math.min(originalHeight, 200) * 0.5;
          
          if (settings.blackAndWhite) {
            let tempCanvas = tempCanvasCache.current;
            if (!tempCanvas) {
              tempCanvas = document.createElement('canvas');
              tempCanvasCache.current = tempCanvas;
            }
            const tempCtx = tempCanvas.getContext('2d')!;
            
            // 调整画布尺寸（如果需要）
            if (tempCanvas.width !== tattooImg.width || tempCanvas.height !== tattooImg.height) {
              tempCanvas.width = tattooImg.width;
              tempCanvas.height = tattooImg.height;
            }
            
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(tattooImg, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
              data[i] = gray;     // R
              data[i + 1] = gray; // G
              data[i + 2] = gray; // B
            }
            
            tempCtx.putImageData(imageData, 0, 0);
            maskCtx.drawImage(tempCanvas, -tattooWidth / 2, -tattooHeight / 2, tattooWidth, tattooHeight);
          } else {
            maskCtx.drawImage(tattooImg, -tattooWidth / 2, -tattooHeight / 2, tattooWidth, tattooHeight);
          }
          
          maskCtx.restore();
          console.log('皮肤遮罩已应用');
          
          // 将处理后的结果以正确的混合模式绘制到主画布
          if (settings.multiplyEffect) {
            ctx.globalCompositeOperation = 'multiply';
          } else {
            ctx.globalCompositeOperation = 'source-over';
          }
          ctx.drawImage(maskCanvas, 0, 0);
        } else {
          console.log('没有皮肤遮罩，使用原始渲染');
          // 没有遮罩时的原始渲染逻辑
          ctx.save();
          
          const centerX = canvas.width / 2 + settings.offsetX * canvas.width;
          const centerY = canvas.height / 2 + settings.offsetY * canvas.height;
          
          ctx.translate(centerX, centerY);
          ctx.rotate(settings.rotation * Math.PI / 180);
          ctx.scale(settings.scale, settings.scale);
          ctx.globalAlpha = settings.opacity;
          
          if (settings.multiplyEffect) {
            ctx.globalCompositeOperation = 'multiply';
          } else {
            ctx.globalCompositeOperation = 'source-over';
          }

          const tattooImg = tattooImageCache.current;
          // 使用原始尺寸来计算显示大小，避免背景去除后尺寸变化的影响
          const originalWidth = originalTattooSize?.width || tattooImg.width;
          const originalHeight = originalTattooSize?.height || tattooImg.height;
          const tattooWidth = Math.min(originalWidth, 200) * 0.5;
          const tattooHeight = Math.min(originalHeight, 200) * 0.5;
          
          if (settings.blackAndWhite) {
            let tempCanvas = tempCanvas2Cache.current;
            if (!tempCanvas) {
              tempCanvas = document.createElement('canvas');
              tempCanvas2Cache.current = tempCanvas;
            }
            const tempCtx = tempCanvas.getContext('2d')!;
            
            // 调整画布尺寸（如果需要）
            if (tempCanvas.width !== tattooImg.width || tempCanvas.height !== tattooImg.height) {
              tempCanvas.width = tattooImg.width;
              tempCanvas.height = tattooImg.height;
            }
            
            tempCtx.drawImage(tattooImg, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
              data[i] = gray;     // R
              data[i + 1] = gray; // G
              data[i + 2] = gray; // B
            }
            
            tempCtx.putImageData(imageData, 0, 0);
            ctx.drawImage(tempCanvas, -tattooWidth / 2, -tattooHeight / 2, tattooWidth, tattooHeight);
          } else {
            ctx.drawImage(tattooImg, -tattooWidth / 2, -tattooHeight / 2, tattooWidth, tattooHeight);
          }
          
          ctx.restore();
        }
      }
    });
  }, [settings, calculateImageBounds]);

  // 生成皮肤遮罩的函数
  const generateBodyMask = useCallback(async () => {
    if (!baseImage) return;
    
    try {
      console.log('开始尝试生成皮肤遮罩...');
      setIsGeneratingMask(true);
      const { MediaPipeSegmentation } = await import('@/utils/tattoo');
      console.log('MediaPipeSegmentation 模块已加载');
      const segmentation = MediaPipeSegmentation.getInstance();
      console.log('MediaPipeSegmentation 实例已获取');
      
      // 初始化并生成遮罩
      console.log('开始初始化 MediaPipe...');
      await segmentation.initialize();
      console.log('MediaPipe 初始化完成，检查就绪状态...');
      if (segmentation.isReady()) {
        console.log('开始生成皮肤遮罩...');
        const maskDataUrl = await segmentation.generateMask(baseImage);
        
        // 加载遮罩图像
        const maskImg = new Image();
        maskImg.onload = () => {
          bodyMaskCache.current = maskImg;
          console.log('Body mask cached:', maskImg.width, 'x', maskImg.height);
          setIsGeneratingMask(false);
          scheduleRender();
        };
        maskImg.onerror = (e) => {
          console.warn('Failed to load body mask:', e);
          bodyMaskCache.current = null;
          setIsGeneratingMask(false);
          scheduleRender();
        };
        maskImg.src = maskDataUrl;
      } else {
        console.warn('MediaPipe segmentation not ready, skipping mask generation');
        setIsGeneratingMask(false);
        scheduleRender();
      }
    } catch (error) {
      console.warn('Failed to generate body mask:', error);
      setIsGeneratingMask(false);
      scheduleRender();
    }
  }, [baseImage, scheduleRender]);

  // 加载基础图像（仅在URL变化时加载）
  useEffect(() => {
    console.log('SimpleTattooCanvas useEffect triggered, baseImage:', baseImage);
    if (!baseImage) {
      baseImageCache.current = null;
      bodyMaskCache.current = null;
      scheduleRender();
      return;
    }
    
    if (baseImageCache.current?.src === baseImage) {
      console.log('基础图像已缓存，跳过重新加载. 当前遮罩状态:', !!bodyMaskCache.current);
      // 如果图像已缓存但遮罩不存在，尝试重新生成遮罩
      if (!bodyMaskCache.current) {
        console.log('遮罩不存在，尝试重新生成...');
        generateBodyMask();
      }
      return; // 图像和遮罩都已缓存，无需重新加载
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      baseImageCache.current = img;
      console.log('Base image cached:', img.width, 'x', img.height);
      console.log('Base image URL:', baseImage);
      
      // 生成皮肤遮罩
      generateBodyMask();
    };
    img.onerror = (e) => {
      console.error('Failed to load base image:', e, 'URL:', baseImage);
      baseImageCache.current = null;
      bodyMaskCache.current = null;
    };
    img.src = baseImage;
  }, [baseImage, generateBodyMask]);

  // 加载和处理纹身图像
  useEffect(() => {
    if (!tattooImage) {
      tattooImageCache.current = null;
      scheduleRender();
      return;
    }

    const loadTattooImage = async () => {
      try {
        setIsProcessingTattoo(true);
        let imageUrl = tattooImage;

        // 自动处理纹身图像去除背景
        console.log('处理纹身图像以去除背景...');
        const { ImageProcessor } = await import('@/utils/tattoo');
        const processor = new ImageProcessor();
        try {
          imageUrl = await processor.smartRemoveBackground(tattooImage);
          console.log('纹身背景去除成功');
        } catch (error) {
          console.warn('纹身背景去除失败，使用原图:', error);
          imageUrl = tattooImage;
        }

        // 如果图像已缓存且URL相同，无需重新加载
        if (tattooImageCache.current?.src === imageUrl) {
          setIsProcessingTattoo(false);
          return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          tattooImageCache.current = img;
          console.log('Tattoo image cached:', img.width, 'x', img.height);
          setIsProcessingTattoo(false);
          scheduleRender();
        };
        img.onerror = (e) => {
          console.error('Failed to load tattoo image:', e);
          tattooImageCache.current = null;
          setIsProcessingTattoo(false);
        };
        img.src = imageUrl;
      } catch (error) {
        console.error('Error processing tattoo image:', error);
        setIsProcessingTattoo(false);
      }
    };

    loadTattooImage();
  }, [tattooImage]);

  // 设置变化时重新渲染
  useEffect(() => {
    scheduleRender();
  }, [scheduleRender]);

  // 清理动画帧
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 移除节流逻辑，拖动需要实时响应

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!tattooImage) return;
    e.preventDefault();
    setIsDragging(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    // 记录拖动开始时的初始设置
    setInitialSettings({
      offsetX: settings.offsetX,
      offsetY: settings.offsetY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // 计算从拖动开始到现在的总距离
    const totalDeltaX = (currentX - dragStart.x) / rect.width;
    const totalDeltaY = (currentY - dragStart.y) / rect.height;
    
    // 基于初始设置和总拖动距离计算新位置
    onSettingsChange({
      offsetX: initialSettings.offsetX + totalDeltaX,
      offsetY: initialSettings.offsetY + totalDeltaY,
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      e.preventDefault();
      setIsDragging(false);
    }
  };

  // 触摸支持
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!tattooImage || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = canvasRef.current!.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    // 记录拖动开始时的初始设置
    setInitialSettings({
      offsetX: settings.offsetX,
      offsetY: settings.offsetY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    // 计算从拖动开始到现在的总距离
    const totalDeltaX = (currentX - dragStart.x) / rect.width;
    const totalDeltaY = (currentY - dragStart.y) / rect.height;
    
    // 基于初始设置和总拖动距离计算新位置
    onSettingsChange({
      offsetX: initialSettings.offsetX + totalDeltaX,
      offsetY: initialSettings.offsetY + totalDeltaY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      e.preventDefault();
      setIsDragging(false);
    }
  };

  // 节流逻辑已移除，无需清理定时器

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        className={`border border-gray-300 rounded-lg select-none ${isDragging ? 'cursor-grabbing' : (tattooImage ? 'cursor-grab' : 'cursor-default')}`}
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
      
      <div className="absolute top-2 right-2 space-y-1">
        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          简化预览模式
        </div>
        {bodyMaskCache.current && (
          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            ✓ 皮肤检测已启用
          </div>
        )}
      </div>
      
      {isDragging && (
        <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          拖动中...
        </div>
      )}
      
      {isGeneratingMask && (
        <div className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center gap-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
          正在生成皮肤遮罩...
        </div>
      )}
      
      {isProcessingTattoo && (
        <div className="absolute bottom-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          正在处理纹身...
        </div>
      )}
    </div>
  );
};

// 高级3D纹身预览组件
const Advanced3DTattooCanvas: React.FC<{
  baseImage: string | null;
  tattooImage: string | null;
  settings: TattooSettings;
  onSettingsChange: (settings: Partial<TattooSettings>) => void;
  onEngineReady: (engine: TattooEngine) => void;
}> = ({ baseImage, tattooImage, settings, onSettingsChange, onEngineReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TattooEngine | null>(null);
  const onSettingsChangeRef = useRef(onSettingsChange);
  const onEngineReadyRef = useRef(onEngineReady);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useSimpleMode, setUseSimpleMode] = useState(false); // 默认使用3D模式
  const [engineInitialized, setEngineInitialized] = useState(false);

  // 更新最新的回调函数引用
  useEffect(() => {
    onSettingsChangeRef.current = onSettingsChange;
    onEngineReadyRef.current = onEngineReady;
  }, [onSettingsChange, onEngineReady]);

  // 初始化纹身引擎
  useEffect(() => {
    if (useSimpleMode) return; // 简化模式不需要初始化引擎

    const initEngine = async () => {
      if (!containerRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // 创建纹身引擎
        const engine = await createTattooEngine(containerRef.current, {
          width: 800,
          height: 800,
          enableEraser: true,
          enableGestures: true // 启用手势控制支持拖动
        });

        // 设置事件处理
        engine.setEventHandlers({
          onSettingsChange: (newSettings) => {
            // 防止循环调用：只有当设置来自用户交互时才同步到主组件
            // 引擎内部的设置更新不应该回传到主组件
            console.log('引擎设置变化:', newSettings);
          },
          onProcessingChange: (isProcessing) => {
            setIsLoading(isProcessing);
          }
        });

        engineRef.current = engine;
        setEngineInitialized(true); // 标记引擎已初始化
        onEngineReadyRef.current(engine);
        
        console.log('纹身引擎初始化成功');
        console.log('引擎配置:', {
          width: 800,
          height: 800,
          enableEraser: true,
          enableGestures: false
        });
        console.log('引擎状态:', {
          isReady: engine.isReady(),
          isProcessing: engine.isProcessingData(),
          assets: engine.getAssets()
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '初始化失败';
        setError(errorMessage);
        console.error('纹身引擎初始化失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initEngine();

    // 清理函数
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
      setEngineInitialized(false); // 重置引擎状态
    };
  }, [useSimpleMode]); // 移除函数依赖以避免无限循环

  // 加载人体图像 (只在引擎准备好之后)
  useEffect(() => {
    if (useSimpleMode || !engineInitialized || !baseImage) return; // 简化模式或引擎未初始化或无基础图像时不加载

    const loadBaseImage = async () => {
      console.log('准备加载人体图像:', { 
        engineExists: !!engineRef.current,
        engineReady: engineRef.current?.isReady(),
        engineInitialized,
        baseImage: !!baseImage 
      });
      
      // 确保引擎存在且已初始化
      if (!engineRef.current || !engineRef.current.isReady()) {
        console.warn('无法加载图像:', { 
          engineExists: !!engineRef.current,
          engineReady: engineRef.current?.isReady(),
          engineInitialized,
          baseImage: !!baseImage 
        });
        return;
      }

      try {
        setIsLoading(true);
        console.log('开始加载人体图像到引擎...');
        await engineRef.current.loadBaseImage(baseImage);
        console.log('人体图像加载成功');
        console.log('引擎资源状态:', engineRef.current.getAssets());
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加载人体图像失败';
        setError(errorMessage);
        console.error('人体图像加载失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBaseImage();
  }, [useSimpleMode, baseImage, engineInitialized]);

  // 加载纹身图像
  useEffect(() => {
    if (useSimpleMode || !engineInitialized) return; // 简化模式或引擎未初始化时不加载

    const loadTattooImage = async () => {
      if (!engineRef.current || !engineRef.current.isReady() || !tattooImage) return;

      try {
        setIsLoading(true);
        await engineRef.current.loadTattooImage(tattooImage);
        console.log('纹身图像加载成功');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加载纹身图像失败';
        setError(errorMessage);
        console.error('纹身图像加载失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTattooImage();
  }, [useSimpleMode, tattooImage, engineInitialized]);

  // 更新设置
  useEffect(() => {
    if (useSimpleMode || !engineRef.current) return;

    engineRef.current.updateSettings(settings);
  }, [useSimpleMode, settings]);

  // 如果使用简化模式，显示简化的Canvas组件
  if (useSimpleMode) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-4">
          <Button
            onClick={() => setUseSimpleMode(false)}
            variant="outline"
            size="sm"
          >
            🚀 启用高级3D模式
          </Button>
          <span className="text-sm text-gray-600">当前使用简化预览模式，包含皮肤检测功能</span>
        </div>
        <SimpleTattooCanvas
          baseImage={baseImage}
          tattooImage={tattooImage}
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[800px] border border-red-300 rounded-lg bg-red-50">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">加载错误</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <div className="mt-4 space-x-2">
            <Button 
              onClick={() => {
                setError(null);
                setUseSimpleMode(true);
              }}
              variant="outline"
            >
              回到简化模式
            </Button>
            <Button 
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              variant="outline"
            >
              重新加载
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-4 flex items-center gap-4">
        <Button
          onClick={() => setUseSimpleMode(true)}
          variant="outline"
          size="sm"
        >
          ← 回到简化模式
        </Button>
        <span className="text-sm text-gray-600">高级3D模式</span>
      </div>
      
      <div 
        ref={containerRef}
        className="w-full h-[800px] border border-gray-300 rounded-lg overflow-hidden bg-gray-100"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-700">处理中...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 高级擦除工具组件
const AdvancedEraserTool: React.FC<{
  visible: boolean;
  onClose: () => void;
  engine: TattooEngine | null;
}> = ({ visible, onClose, engine }) => {
  const [eraserSettings, setEraserSettings] = useState(DEFAULT_ERASER_SETTINGS);
  const [isEraserEnabled, setIsEraserEnabled] = useState(false);

  useEffect(() => {
    if (!engine) return;

    if (visible && isEraserEnabled) {
      engine.enableEraser();
      engine.updateEraserSettings(eraserSettings);
    } else {
      engine.disableEraser();
    }
  }, [visible, isEraserEnabled, eraserSettings, engine]);

  const handleApplyErase = () => {
    if (engine) {
      engine.applyEraseMask();
      setIsEraserEnabled(false);
    }
  };

  const updateEraserSetting = (key: keyof typeof eraserSettings, value: number) => {
    const newSettings = { ...eraserSettings, [key]: value };
    setEraserSettings(newSettings);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-80 max-h-96 overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>擦除工具</CardTitle>
            <Button onClick={onClose} size="sm" variant="outline">
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">启用擦除</label>
            <Switch
              checked={isEraserEnabled}
              onCheckedChange={setIsEraserEnabled}
            />
          </div>

          {isEraserEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  笔刷大小: {eraserSettings.size}px
                </label>
                <Slider
                  value={[eraserSettings.size]}
                  onValueChange={(value) => updateEraserSetting('size', value[0])}
                  min={5}
                  max={100}
                  step={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  硬度: {Math.round(eraserSettings.hardness * 100)}%
                </label>
                <Slider
                  value={[eraserSettings.hardness]}
                  onValueChange={(value) => updateEraserSetting('hardness', value[0])}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  透明度: {Math.round(eraserSettings.opacity * 100)}%
                </label>
                <Slider
                  value={[eraserSettings.opacity]}
                  onValueChange={(value) => updateEraserSetting('opacity', value[0])}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  流量: {Math.round(eraserSettings.flow * 100)}%
                </label>
                <Slider
                  value={[eraserSettings.flow]}
                  onValueChange={(value) => updateEraserSetting('flow', value[0])}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
              </div>

              <Button onClick={handleApplyErase} className="w-full">
                应用擦除效果
              </Button>
            </>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p>• 启用擦除后，在预览区域拖拽鼠标进行擦除</p>
            <p>• 支持触摸设备的手指操作</p>
            <p>• 点击"应用擦除效果"保存更改</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 主要组件
const TattooPreviewPage: React.FC = () => {
  const [baseImage, setBaseImage] = useState<UploadedFile | null>(null);
  const [tattooImage, setTattooImage] = useState<UploadedFile | null>(null);
  const [originalTattooSize, setOriginalTattooSize] = useState<{ width: number; height: number } | null>(null);
  const [showEraser, setShowEraser] = useState(false);
  const [engine, setEngine] = useState<TattooEngine | null>(null);
  
  const baseImageInputRef = useRef<HTMLInputElement>(null);
  const tattooImageInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState<TattooSettings>(DEFAULT_SETTINGS);

  const handleImageUpload = async (file: File, type: 'base' | 'tattoo') => {
    if (!isValidImageType(file)) {
      alert('请上传有效的图片文件 (JPEG, PNG, WebP)');
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = () => {
        const uploadedFile: UploadedFile = {
          url,
          file,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        
        if (type === 'base') {
          setBaseImage(uploadedFile);
        } else {
          setTattooImage(uploadedFile);
          // 保存原始纹身图片尺寸
          setOriginalTattooSize({ width: img.naturalWidth, height: img.naturalHeight });
        }
      };
      
      img.onerror = () => {
        alert('图片加载失败，请重试');
      };
      
      img.src = url;
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败，请重试');
    }
  };

  const updateSettings = useCallback((newSettings: Partial<TattooSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const exportImage = () => {
    if (!engine) {
      alert('纹身引擎未初始化');
      return;
    }

    try {
      const dataURL = engine.exportImage();
      downloadImage(dataURL, `tattoo-preview-${Date.now()}.png`);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  const resetAllSettings = () => {
    if (engine) {
      engine.resetSettings();
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const handleEngineReady = useCallback((tattooEngine: TattooEngine) => {
    setEngine(tattooEngine);
    // 同步引擎的实际设置到页面，确保UI显示的值与引擎一致
    const engineSettings = tattooEngine.getSettings();
    setSettings(engineSettings);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <style>{`
        /* 修复当前页面按钮颜色 */
        .tattoo-page .bg-primary { background-color: #3b82f6; }
        .tattoo-page .text-primary-foreground { color: #ffffff; }
        .tattoo-page .hover\\:bg-primary\\/90:hover { background-color: rgba(59, 130, 246, 0.9); }
        .tattoo-page .border-input { border-color: #e2e8f0; }
        .tattoo-page .bg-background { background-color: #ffffff; }
        .tattoo-page .text-accent-foreground { color: #1e293b; }
        .tattoo-page .hover\\:bg-accent:hover { background-color: #f1f5f9; }
        .tattoo-page .hover\\:text-accent-foreground:hover { color: #1e293b; }
        .tattoo-page .bg-destructive { background-color: #ef4444; }
        .tattoo-page .text-destructive-foreground { color: #ffffff; }
        .tattoo-page .hover\\:bg-destructive\\/90:hover { background-color: rgba(239, 68, 68, 0.9); }
        .tattoo-page .bg-secondary { background-color: #f1f5f9; }
        .tattoo-page .text-secondary-foreground { color: #1e293b; }
        .tattoo-page .hover\\:bg-secondary\\/80:hover { background-color: rgba(241, 245, 249, 0.8); }
      `}</style>
      <div className="tattoo-page">
      {/* 顶部工具栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">纹身预览器</h1>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowEraser(true)} 
              variant="outline" 
              size="sm"
              disabled={!engine}
            >
              🗡️ 擦除工具
            </Button>
            <Button 
              onClick={resetAllSettings} 
              variant="outline" 
              size="sm"
              disabled={!engine}
            >
              🔄 重置
            </Button>
            <Button 
              onClick={exportImage} 
              variant="default" 
              size="sm"
              disabled={!engine || !baseImage}
            >
              📥 导出
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 系统兼容性检查 */}
        <div className="lg:col-span-4">
          <SystemCompatibility />
        </div>

        {/* 控制面板 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>控制面板</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 图片上传 */}
            <div>
              <h3 className="font-semibold mb-3">图片上传</h3>
              <div className="space-y-3">
                <div>
                  <Button
                    onClick={() => baseImageInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    📤 上传人体图片
                  </Button>
                  <input
                    ref={baseImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'base');
                    }}
                  />
                </div>
                
                <div>
                  <Button
                    onClick={() => tattooImageInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    🎨 上传纹身图片
                  </Button>
                  <input
                    ref={tattooImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'tattoo');
                    }}
                  />
                </div>
              </div>
              
            </div>

            {/* 纹身调节 */}
            {tattooImage && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    透明度: {Math.round(settings.opacity * 100)}%
                  </label>
                  <Slider
                    value={[settings.opacity]}
                    onValueChange={(value) => updateSettings({ opacity: value[0] })}
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    大小: {settings.scale.toFixed(1)}x
                  </label>
                  <Slider
                    value={[settings.scale]}
                    onValueChange={(value) => updateSettings({ scale: value[0] })}
                    min={0.1}
                    max={3}
                    step={0.1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    旋转: {settings.rotation}°
                  </label>
                  <Slider
                    value={[settings.rotation]}
                    onValueChange={(value) => updateSettings({ rotation: value[0] })}
                    min={0}
                    max={360}
                    step={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    对比度: {settings.contrast.toFixed(1)}
                  </label>
                  <Slider
                    value={[settings.contrast]}
                    onValueChange={(value) => updateSettings({ contrast: value[0] })}
                    min={0.5}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">黑白效果</label>
                  <Switch
                    checked={settings.blackAndWhite}
                    onCheckedChange={(checked) => updateSettings({ blackAndWhite: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">混合效果</label>
                  <Switch
                    checked={settings.multiplyEffect}
                    onCheckedChange={(checked) => updateSettings({ multiplyEffect: checked })}
                  />
                </div>

                {/* 位置调节按钮 */}
                <div>
                  <label className="block text-sm font-medium mb-2">位置调节</label>
                  <div className="grid grid-cols-3 gap-1">
                    <div></div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSettings({ offsetY: settings.offsetY + 0.05 })}
                    >
                      ↑
                    </Button>
                    <div></div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSettings({ offsetX: settings.offsetX - 0.05 })}
                    >
                      ←
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSettings({ offsetX: 0, offsetY: 0 })}
                    >
                      重置
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSettings({ offsetX: settings.offsetX + 0.05 })}
                    >
                      →
                    </Button>
                    
                    <div></div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSettings({ offsetY: settings.offsetY - 0.05 })}
                    >
                      ↓
                    </Button>
                    <div></div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 预览区域 */}
        <div className="lg:col-span-3 relative">
          <Card>
            <CardContent className="p-4">
              <div className="w-full flex justify-center">
                {baseImage || tattooImage ? (
                  <Advanced3DTattooCanvas
                    baseImage={baseImage?.url || null}
                    tattooImage={tattooImage?.url || null}
                    settings={settings}
                    onSettingsChange={updateSettings}
                    onEngineReady={handleEngineReady}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[800px] border border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📤</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        高级纹身预览系统
                      </h3>
                      <p className="text-gray-500">
                        上传人体图片和纹身图片开始3D预览
                      </p>
                      <div className="mt-4 text-sm text-gray-400">
                        <p>• MediaPipe 人体分割技术</p>
                        <p>• WebGL 3D 渲染引擎</p>
                        <p>• 真实深度贴合效果</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* 功能说明 */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-2">高级功能特性:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• MediaPipe 人体分割 - 精确识别皮肤区域</li>
                <li>• Three.js WebGL 渲染 - 高性能3D效果</li>
                <li>• 高级着色器 - 纹理深度和透视效果</li>
                <li>• 智能深度图生成 - Sobel边缘检测</li>
                <li>• 多点手势控制 - 支持缩放、旋转、拖拽</li>
                <li>• 高级擦除工具 - 软笔刷效果和压感</li>
                <li>• 实时参数调整 - 透明度、对比度、混合模式</li>
                <li>• 高质量图像导出 - 支持多种格式</li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-800 mb-1">操作说明:</h5>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 拖拽鼠标或手指移动纹身位置</li>
                  <li>• 双指捉拿缩放，旋转手势调整角度</li>
                  <li>• 纹身仅显示在皮肤区域，不显示在衣物上</li>
                  <li>• 支持实时深度映射和3D贴合效果</li>
                  <li>• 简化模式也支持MediaPipe皮肤检测功能</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 高级擦除工具 */}
      <AdvancedEraserTool
        visible={showEraser}
        onClose={() => setShowEraser(false)}
        engine={engine}
      />
      </div>
    </div>
  );
};

export default TattooPreviewPage;