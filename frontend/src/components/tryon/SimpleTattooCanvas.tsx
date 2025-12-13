import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TattooSettings } from '@/utils/tattoo';
import TattooTransformFrame from './TattooTransformFrame';

interface SimpleTattooCanvasProps {
  baseImage: string | null;
  tattooImage: string | null;
  settings: TattooSettings;
  onSettingsChange: (settings: Partial<TattooSettings>) => void;
  originalTattooSize?: { width: number; height: number } | null;
  removeBackground?: boolean;
  onRemoveBackgroundChange?: (remove: boolean) => void;
}

// 简化版Canvas预览组件（用于调试）
const SimpleTattooCanvas: React.FC<SimpleTattooCanvasProps> = ({
  baseImage,
  tattooImage,
  settings,
  onSettingsChange,
  originalTattooSize,
  removeBackground = false,
  onRemoveBackgroundChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialSettings, setInitialSettings] = useState({ offsetX: 0, offsetY: 0 });
  const [isGeneratingMask, setIsGeneratingMask] = useState(false);
  const [isProcessingTattoo, setIsProcessingTattoo] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });
  const [showTransformFrame, setShowTransformFrame] = useState(true); // 默认启用变换框

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

      // 启用高质量图像渲染
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

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

          // 启用高质量图像渲染
          maskCtx.imageSmoothingEnabled = true;
          maskCtx.imageSmoothingQuality = 'high';

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
          maskCtx.scale(settings.scale * settings.scaleX, settings.scale * settings.scaleY);
          maskCtx.globalAlpha = settings.opacity;

          const tattooImg = tattooImageCache.current;
          // 始终使用原始纹身尺寸来计算大小，避免去背景后尺寸变化
          const originalWidth = originalTattooSize?.width || tattooImg.naturalWidth || tattooImg.width;
          const originalHeight = originalTattooSize?.height || tattooImg.naturalHeight || tattooImg.height;
          // 使用基础尺寸，让用户通过scale参数控制大小
          const baseSize = Math.min(500, Math.max(originalWidth, originalHeight));
          const aspectRatio = originalWidth / originalHeight;
          const tattooWidth = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio;
          const tattooHeight = aspectRatio >= 1 ? baseSize / aspectRatio : baseSize;

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
              // 应用对比度调整
              const contrast = settings.contrast;
              const adjustedGray = Math.max(0, Math.min(255, (gray - 128) * contrast + 128));
              data[i] = adjustedGray;     // R
              data[i + 1] = adjustedGray; // G
              data[i + 2] = adjustedGray; // B
            }

            tempCtx.putImageData(imageData, 0, 0);
            maskCtx.drawImage(tempCanvas, -tattooWidth / 2, -tattooHeight / 2, tattooWidth, tattooHeight);
          } else {
            // 对于彩色图像，使用CSS滤镜应用对比度
            const originalFilter = maskCtx.filter;
            maskCtx.filter = `contrast(${settings.contrast})`;
            maskCtx.drawImage(tattooImg, -tattooWidth / 2, -tattooHeight / 2, tattooWidth, tattooHeight);
            maskCtx.filter = originalFilter;
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
          ctx.scale(settings.scale * settings.scaleX, settings.scale * settings.scaleY);
          ctx.globalAlpha = settings.opacity;

          if (settings.multiplyEffect) {
            ctx.globalCompositeOperation = 'multiply';
          } else {
            ctx.globalCompositeOperation = 'source-over';
          }

          const tattooImg = tattooImageCache.current;
          // 始终使用原始纹身尺寸来计算大小，避免去背景后尺寸变化
          const originalWidth = originalTattooSize?.width || tattooImg.naturalWidth || tattooImg.width;
          const originalHeight = originalTattooSize?.height || tattooImg.naturalHeight || tattooImg.height;
          // 使用基础尺寸，让用户通过scale参数控制大小
          const baseSize = Math.min(500, Math.max(originalWidth, originalHeight));
          const aspectRatio = originalWidth / originalHeight;
          const tattooWidth = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio;
          const tattooHeight = aspectRatio >= 1 ? baseSize / aspectRatio : baseSize;

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

            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(tattooImg, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
              const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
              // 应用对比度调整
              const contrast = settings.contrast;
              const adjustedGray = Math.max(0, Math.min(255, (gray - 128) * contrast + 128));
              data[i] = adjustedGray;     // R
              data[i + 1] = adjustedGray; // G
              data[i + 2] = adjustedGray; // B
            }

            tempCtx.putImageData(imageData, 0, 0);
            ctx.drawImage(tempCanvas, -tattooWidth / 2, -tattooHeight / 2, tattooWidth, tattooHeight);
          } else {
            // 对于彩色图像，使用CSS滤镜应用对比度
            const originalFilter = ctx.filter;
            ctx.filter = `contrast(${settings.contrast})`;
            ctx.drawImage(tattooImg, -tattooWidth / 2, -tattooHeight / 2, tattooWidth, tattooHeight);
            ctx.filter = originalFilter;
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

      // 根据图片大小调整canvas大小，严格保持原始比例且控制最大尺寸
      const maxSize = 600;
      let newWidth, newHeight;

      // 计算缩放比例，确保宽度和高度都不超过600px
      const scaleForWidth = maxSize / img.width;
      const scaleForHeight = maxSize / img.height;
      const scale = Math.min(scaleForWidth, scaleForHeight, 1); // 取最小缩放比例，且不放大

      newWidth = Math.round(img.width * scale);
      newHeight = Math.round(img.height * scale);

      setCanvasSize({ width: newWidth, height: newHeight });

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

        // 根据用户设置决定是否去除背景
        if (removeBackground) {
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
        } else {
          console.log('保持纹身原图，不去除背景');
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
  }, [tattooImage, removeBackground]);

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

  return (
    <div className="relative">
      <div className="canvas-container relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className={`select-none ${isDragging ? 'cursor-grabbing' : (tattooImage ? 'cursor-grab' : 'cursor-default')}`}
          style={{
            touchAction: 'none',
            maxWidth: '600px',
            maxHeight: '600px',
            width: canvasSize.width + 'px',
            height: canvasSize.height + 'px'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />

        {/* Transform Frame */}
        {tattooImage && showTransformFrame && (
          <TattooTransformFrame
            mode="simple"
            key="simple-transform-frame"
            visible={showTransformFrame}
            settings={settings}
            onSettingsChange={onSettingsChange}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            originalTattooSize={originalTattooSize}
          />
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

export default SimpleTattooCanvas;