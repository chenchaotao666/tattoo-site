import React, { useRef, useEffect, useState } from 'react';
import { TattooSettings } from '@/utils/tattoo';

type TransformMode = 'simple' | '3d';

interface TattooTransformFrameProps {
  visible: boolean;
  settings: TattooSettings;
  onSettingsChange: (settings: Partial<TattooSettings>) => void;
  canvasWidth: number;
  canvasHeight: number;
  originalTattooSize?: { width: number; height: number } | null;
  mode?: TransformMode; // 新增：指定模式
  containerRef?: React.RefObject<HTMLDivElement | null>; // 3D模式使用，简化模式可选
}

// 统一的变换框组件
const TattooTransformFrame: React.FC<TattooTransformFrameProps> = ({
  visible,
  settings,
  onSettingsChange,
  canvasWidth,
  canvasHeight,
  originalTattooSize,
  mode = 'simple', // 默认简化模式
  containerRef
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingX, setIsResizingX] = useState(false);
  const [isResizingY, setIsResizingY] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialSettings, setInitialSettings] = useState({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  });
  const canvasRectRef = useRef<DOMRect | null>(null);

  // 根据模式计算坐标系统参数
  const getCoordinateParams = () => {
    if (mode === '3d') {
      return {
        sensitivity: 0.5,
        yAxisInverted: true,
        centerXMultiplier: 2,
        centerYMultiplier: 2
      };
    } else {
      return {
        sensitivity: 1,
        yAxisInverted: false,
        centerXMultiplier: 1,
        centerYMultiplier: 1
      };
    }
  };

  // 全局鼠标事件处理
  useEffect(() => {
    const coordinateParams = getCoordinateParams();

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing && !isResizingX && !isResizingY && !isRotating) return;
      if (!canvasRectRef.current) return;

      e.preventDefault();

      const currentX = e.clientX - canvasRectRef.current.left;
      const currentY = e.clientY - canvasRectRef.current.top;

      if (isDragging) {
        let deltaX = (currentX - dragStart.x) / canvasWidth * coordinateParams.sensitivity;
        let deltaY = (currentY - dragStart.y) / canvasHeight * coordinateParams.sensitivity;

        if (coordinateParams.yAxisInverted) {
          deltaY = -deltaY; // Y轴反转（3D模式）
        }

        onSettingsChange({
          offsetX: initialSettings.offsetX + deltaX,
          offsetY: initialSettings.offsetY + deltaY,
        });
      } else if (isResizing) {
        // 等比例缩放
        const centerX = canvasWidth / 2 + initialSettings.offsetX * canvasWidth * coordinateParams.centerXMultiplier;
        const centerY = canvasHeight / 2 + (coordinateParams.yAxisInverted ? -initialSettings.offsetY : initialSettings.offsetY) * canvasHeight * coordinateParams.centerYMultiplier;
        const distance = Math.sqrt(Math.pow(currentX - centerX, 2) + Math.pow(currentY - centerY, 2));
        const initialDistance = Math.sqrt(Math.pow(dragStart.x - centerX, 2) + Math.pow(dragStart.y - centerY, 2));

        if (initialDistance > 0) {
          const scaleMultiplier = distance / initialDistance;
          onSettingsChange({
            scale: Math.max(0.1, Math.min(3, initialSettings.scale * scaleMultiplier)),
          });
        }
      } else if (isResizingX) {
        // X轴缩放，支持所有模式
        const centerX = canvasWidth / 2 + initialSettings.offsetX * canvasWidth * coordinateParams.centerXMultiplier;
        const deltaX = Math.abs(currentX - centerX);
        const initialDeltaX = Math.abs(dragStart.x - centerX);
        if (initialDeltaX > 0) {
          const scaleXMultiplier = deltaX / initialDeltaX;
          onSettingsChange({
            scaleX: Math.max(0.1, Math.min(3, initialSettings.scaleX * scaleXMultiplier)),
          });
        }
      } else if (isResizingY) {
        // Y轴缩放，支持所有模式
        const centerY = canvasHeight / 2 + (coordinateParams.yAxisInverted ? -initialSettings.offsetY : initialSettings.offsetY) * canvasHeight * coordinateParams.centerYMultiplier;
        const deltaY = Math.abs(currentY - centerY);
        const initialDeltaY = Math.abs(dragStart.y - centerY);
        if (initialDeltaY > 0) {
          const scaleYMultiplier = deltaY / initialDeltaY;
          onSettingsChange({
            scaleY: Math.max(0.1, Math.min(3, initialSettings.scaleY * scaleYMultiplier)),
          });
        }
      } else if (isRotating) {
        const centerX = canvasWidth / 2 + initialSettings.offsetX * canvasWidth * coordinateParams.centerXMultiplier;
        const centerY = canvasHeight / 2 + (coordinateParams.yAxisInverted ? -initialSettings.offsetY : initialSettings.offsetY) * canvasHeight * coordinateParams.centerYMultiplier;
        const angle = Math.atan2(currentY - centerY, currentX - centerX) * 180 / Math.PI;
        const initialAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX) * 180 / Math.PI;
        const deltaAngle = angle - initialAngle;
        onSettingsChange({
          rotation: (initialSettings.rotation + deltaAngle + 360) % 360,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsResizingX(false);
      setIsResizingY(false);
      setIsRotating(false);
      canvasRectRef.current = null;
    };

    if (isDragging || isResizing || isResizingX || isResizingY || isRotating) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, isResizing, isResizingX, isResizingY, isRotating, dragStart, initialSettings, onSettingsChange, canvasWidth, canvasHeight, mode]);

  if (!visible) return null;

  // 根据模式计算框架位置和大小
  const calculateFrameSize = () => {
    let frameWidth, frameHeight;

    if (originalTattooSize) {
      const originalWidth = originalTattooSize.width;
      const originalHeight = originalTattooSize.height;
      const baseSize = Math.min(500, Math.max(originalWidth, originalHeight)); // 3D和简化模式使用相同的baseSize计算
      const aspectRatio = originalWidth / originalHeight;

      if (mode === '3d') {
        // 3D模式：现在也支持独立的scaleX和scaleY
        let baseWidth, baseHeight;
        if (aspectRatio >= 1) {
          baseWidth = baseSize;
          baseHeight = baseSize / aspectRatio;
        } else {
          baseWidth = baseSize * aspectRatio;
          baseHeight = baseSize;
        }
        frameWidth = baseWidth * settings.scale * settings.scaleX;
        frameHeight = baseHeight * settings.scale * settings.scaleY;
      } else {
        // 简化模式：支持独立的scaleX和scaleY
        const baseTattooWidth = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio;
        const baseTattooHeight = aspectRatio >= 1 ? baseSize / aspectRatio : baseSize;
        frameWidth = baseTattooWidth * settings.scale * settings.scaleX;
        frameHeight = baseTattooHeight * settings.scale * settings.scaleY;
      }
    } else {
      // 没有纹身尺寸信息时的默认大小 - 3D和简化模式使用相同的默认值
      const defaultSize = 200 * settings.scale;
      // 3D模式现在也支持独立的scaleX和scaleY
      frameWidth = defaultSize * settings.scaleX;
      frameHeight = defaultSize * settings.scaleY;
    }

    return { frameWidth, frameHeight };
  };

  const { frameWidth, frameHeight } = calculateFrameSize();
  const coordinateParams = getCoordinateParams();

  // 计算框架中心位置
  const centerX = canvasWidth / 2 + settings.offsetX * canvasWidth * coordinateParams.centerXMultiplier;
  const centerY = canvasHeight / 2 + (coordinateParams.yAxisInverted ? -settings.offsetY : settings.offsetY) * canvasHeight * coordinateParams.centerYMultiplier;
  const frameX = centerX - frameWidth / 2;
  const frameY = centerY - frameHeight / 2;

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize' | 'resize-x' | 'resize-y' | 'rotate') => {
    e.stopPropagation();
    e.preventDefault();

    let rect: DOMRect;

    if (mode === '3d' && containerRef?.current) {
      // 3D模式：直接使用传入的容器引用
      rect = containerRef.current.getBoundingClientRect();
    } else {
      // 简化模式：查找canvas元素
      const target = e.currentTarget as HTMLElement;
      const canvasElement = target.closest('.canvas-container')?.querySelector('canvas');
      if (!canvasElement) return;
      rect = canvasElement.getBoundingClientRect();
    }

    canvasRectRef.current = rect;

    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setInitialSettings({
      offsetX: settings.offsetX,
      offsetY: settings.offsetY,
      scale: settings.scale,
      scaleX: settings.scaleX,
      scaleY: settings.scaleY,
      rotation: settings.rotation,
    });

    if (type === 'drag') setIsDragging(true);
    else if (type === 'resize') setIsResizing(true);
    else if (type === 'resize-x') setIsResizingX(true);
    else if (type === 'resize-y') setIsResizingY(true);
    else if (type === 'rotate') setIsRotating(true);
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: canvasWidth,
        height: canvasHeight,
      }}
    >
      {/* Main frame */}
      <div
        className="absolute border-2 border-blue-500 pointer-events-auto cursor-move"
        style={{
          left: frameX,
          top: frameY,
          width: frameWidth,
          height: frameHeight,
          transform: `rotate(${settings.rotation}deg)`,
          transformOrigin: 'center',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        {/* Corner resize handles */}
        <div
          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nw-resize pointer-events-auto"
          style={{ left: -6, top: -6 }}
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
        />
        <div
          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-ne-resize pointer-events-auto"
          style={{ right: -6, top: -6 }}
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
        />
        <div
          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-sw-resize pointer-events-auto"
          style={{ left: -6, bottom: -6 }}
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
        />
        <div
          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-se-resize pointer-events-auto"
          style={{ right: -6, bottom: -6 }}
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
        />

        {/* Edge resize handles - 支持所有模式 */}
        <>
          <div
            className="absolute w-4 h-3 bg-green-400 border border-white cursor-n-resize pointer-events-auto"
            style={{ left: '50%', top: -6, transform: 'translateX(-50%)' }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-y')}
          />
          <div
            className="absolute w-4 h-3 bg-green-400 border border-white cursor-s-resize pointer-events-auto"
            style={{ left: '50%', bottom: -6, transform: 'translateX(-50%)' }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-y')}
          />
          <div
            className="absolute w-3 h-4 bg-green-400 border border-white cursor-w-resize pointer-events-auto"
            style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-x')}
          />
          <div
            className="absolute w-3 h-4 bg-green-400 border border-white cursor-e-resize pointer-events-auto"
            style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-x')}
          />
        </>

        {/* Rotation handle */}
        <div
          className="absolute w-4 h-4 bg-green-500 border border-white rounded-full cursor-grab pointer-events-auto"
          style={{ left: '50%', top: -20, transform: 'translateX(-50%)' }}
          onMouseDown={(e) => handleMouseDown(e, 'rotate')}
        />
      </div>

      {/* 拖动状态指示器 */}
      {(isDragging || isResizing || isResizingX || isResizingY || isRotating) && (
        <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded z-10">
          {isDragging && '正在移动...'}
          {isResizing && '正在等比缩放...'}
          {isResizingX && '正在调整宽度...'}
          {isResizingY && '正在调整高度...'}
          {isRotating && '正在旋转...'}
        </div>
      )}
    </div>
  );
};

export default TattooTransformFrame;