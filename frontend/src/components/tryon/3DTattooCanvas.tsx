import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  createTattooEngine,
  TattooEngine,
  TattooSettings,
} from '@/utils/tattoo';
import TattooTransformFrame from './TattooTransformFrame';

interface TattooCanvas3DProps {
  baseImage: string | null;
  tattooImage: string | null;
  settings: TattooSettings;
  onSettingsChange: (settings: Partial<TattooSettings>) => void;
  onEngineReady: (engine: TattooEngine) => void;
  originalTattooSize?: { width: number; height: number } | null;
  removeBackground?: boolean;
  onRemoveBackgroundChange?: (remove: boolean) => void;
}

// 3D纹身预览组件
const TattooCanvas3D: React.FC<TattooCanvas3DProps> = ({
  baseImage,
  tattooImage,
  settings,
  onSettingsChange,
  onEngineReady,
  originalTattooSize,
  removeBackground = false,
  onRemoveBackgroundChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TattooEngine | null>(null);
  const onSettingsChangeRef = useRef(onSettingsChange);
  const onEngineReadyRef = useRef(onEngineReady);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineInitialized, setEngineInitialized] = useState(false);
  const [engineCanvasSize, setEngineCanvasSize] = useState({ width: 600, height: 600 });
  const [show3DTransformFrame, setShow3DTransformFrame] = useState(true);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  // 更新最新的回调函数引用
  useEffect(() => {
    onSettingsChangeRef.current = onSettingsChange;
    onEngineReadyRef.current = onEngineReady;
  }, [onSettingsChange, onEngineReady]);

  // 当baseImage变化时，计算3D模式的canvas尺寸
  useEffect(() => {
    if (!baseImage) {
      setEngineCanvasSize({ width: 600, height: 600 }); // 重置为默认尺寸
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      console.log('3D mode base image loaded:', img.width, 'x', img.height);

      // 根据图片大小调整canvas大小，严格保持原始比例且控制最大尺寸
      const maxSize = 600;
      let newWidth, newHeight;

      // 计算缩放比例，确保宽度和高度都不超过600px
      const scaleForWidth = maxSize / img.width;
      const scaleForHeight = maxSize / img.height;
      const scale = Math.min(scaleForWidth, scaleForHeight, 1); // 取最小缩放比例，且不放大

      newWidth = Math.round(img.width * scale);
      newHeight = Math.round(img.height * scale);

      console.log('3D mode canvas size calculated:', { newWidth, newHeight, scale });
      setEngineCanvasSize({ width: newWidth, height: newHeight });
    };
    img.onerror = (e) => {
      console.error('Failed to load base image in 3D mode:', e, 'URL:', baseImage);
      setEngineCanvasSize({ width: 600, height: 600 }); // 出错时使用默认尺寸
    };
    img.src = baseImage;
  }, [baseImage]);

  // 初始化纹身引擎（在canvas尺寸确定后）
  useEffect(() => {
    const initEngine = async () => {
      if (!containerRef.current) return;

      // 确保已经有正确的canvas尺寸才初始化引擎
      if (!baseImage || engineCanvasSize.width === 600 && engineCanvasSize.height === 600) {
        console.log('等待图像尺寸计算完成再初始化引擎');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('使用计算出的尺寸初始化引擎:', engineCanvasSize);

        // 创建纹身引擎，使用正确计算出的尺寸
        const engine = await createTattooEngine(containerRef.current, {
          width: engineCanvasSize.width,
          height: engineCanvasSize.height,
          enableEraser: true,
          enableGestures: true // 启用手势控制支持拖动
        });

        // 设置事件处理
        engine.setEventHandlers({
          onSettingsChange: (newSettings: any) => {
            console.log('引擎设置变化:', newSettings);
            // 只在初始设置完成后才同步设置，避免无限循环
            if (initialSetupComplete) {
              onSettingsChangeRef.current(newSettings);
            }
          },
          onProcessingChange: (isProcessing: any) => {
            setIsLoading(isProcessing);
          }
        });

        engineRef.current = engine;
        setEngineInitialized(true); // 标记引擎已初始化
        onEngineReadyRef.current(engine);

        console.log('纹身引擎初始化成功');
        console.log('引擎配置:', {
          width: engineCanvasSize.width,
          height: engineCanvasSize.height,
          enableEraser: true,
          enableGestures: true
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
      setInitialSetupComplete(false); // 重置初始设置状态
    };
  }, [baseImage, engineCanvasSize]); // 依赖baseImage和engineCanvasSize，确保尺寸正确后再初始化

  // 加载人体图像 (只在引擎准备好之后)
  useEffect(() => {
    if (!engineInitialized || !baseImage) return; // 引擎未初始化或无基础图像时不加载

    const loadBaseImage = async () => {
      // 确保引擎存在且已初始化
      if (!engineRef.current || !engineRef.current.isReady()) {
        return;
      }

      try {
        setIsLoading(true);
        await engineRef.current.loadBaseImage(baseImage);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加载人体图像失败';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadBaseImage();
  }, [baseImage, engineInitialized]);

  // 加载纹身图像
  useEffect(() => {
    if (!engineInitialized) return; // 引擎未初始化时不加载

    const loadTattooImage = async () => {
      if (!engineRef.current || !engineRef.current.isReady() || !tattooImage) return;

      try {
        setIsLoading(true);

        // 直接使用引擎的loadTattooImage方法，传递removeBackground参数
        await engineRef.current.loadTattooImage(tattooImage, removeBackground);
        console.log('纹身图像加载成功');

        // 标记初始设置完成，允许后续的设置同步
        setInitialSetupComplete(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加载纹身图像失败';
        setError(errorMessage);
        console.error('纹身图像加载失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTattooImage();
  }, [tattooImage, removeBackground, engineInitialized]);

  // 更新设置
  useEffect(() => {
    if (!engineRef.current) return;

    engineRef.current.updateSettings(settings);
  }, [settings]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh] min-h-[400px] border border-red-300 rounded-lg bg-red-50">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">加载错误</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <div className="mt-4 space-x-2">
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
      <div className="canvas-container relative">
        <div
          ref={containerRef}
          className="select-none overflow-hidden"
          style={{
            touchAction: 'none',
            width: engineCanvasSize.width + 'px',
            height: engineCanvasSize.height + 'px',
            maxWidth: '600px',
            maxHeight: '600px',
            backgroundColor: 'transparent'
          }}
        />

        {/* Transform Frame for 3D Mode */}
        {tattooImage && show3DTransformFrame && !isLoading && engineInitialized && (
          <TattooTransformFrame
            mode="3d"
            visible={show3DTransformFrame}
            settings={settings}
            onSettingsChange={(newSettings) => {
              // 更新主设置状态
              onSettingsChange(newSettings);
              // 立即同步到3D引擎
              if (engineRef.current) {
                engineRef.current.updateSettings(newSettings);
              }
            }}
            canvasWidth={engineCanvasSize.width}
            canvasHeight={engineCanvasSize.height}
            originalTattooSize={originalTattooSize}
            containerRef={containerRef}
          />
        )}
      </div>

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

export default TattooCanvas3D;