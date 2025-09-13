import React, { useState, useEffect } from 'react';

export interface ImagePosition {
  width: string;
  height: string;
  left: string;
  top: string;
  borderRadius?: string;
  boxShadow?: string;
  background?: string;
  transform?: string;
  opacity?: number;
}

export interface CarouselImageConfig {
  position: ImagePosition;
  hasBackground?: boolean;
  backgroundStyle?: React.CSSProperties;
}

export interface ImageCarouselProps {
  images: string[];
  imageConfigs: CarouselImageConfig[];
  containerStyle?: React.CSSProperties;
  autoPlay?: boolean;
  interval?: number;
  pauseOnHover?: boolean;
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  imageConfigs,
  containerStyle = {},
  autoPlay = true,
  interval = 3000,
  pauseOnHover = true,
  className = ''
}) => {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 同步移动轮播：移动+停顿循环
  useEffect(() => {
    if (autoPlay && !isHovered && images.length > 0) {
      const animationDuration = 1000; // 移动动画持续1秒
      const pauseDuration = 2000; // 停顿2秒
      const totalCycleDuration = animationDuration + pauseDuration; // 总周期3秒
      
      const frameRate = 16; // 约60fps
      const stepPerFrame = 1 / (totalCycleDuration / frameRate); // 每帧步长
      
      const intervalId = setInterval(() => {
        setCurrentOffset((prev) => {
          const newOffset = prev + stepPerFrame;
          if (newOffset >= 1) {
            setCycleCount(count => count + 1); // 完成一个周期，增加计数
            return 0; // 重置为0开始下一轮
          }
          return newOffset;
        });
      }, frameRate);
      
      return () => clearInterval(intervalId);
    }
  }, [autoPlay, isHovered, images.length, interval]);

  // 真正的同步移动：每张图片同时移动到下一个位置
  const getSimpleSyncImages = () => {
    if (!images || images.length === 0) return [];
    
    const result = [];
    const animationDuration = 1000; // 移动动画持续1秒
    const pauseDuration = 2000; // 停顿2秒
    const totalCycleDuration = animationDuration + pauseDuration; // 总周期3秒
    
    // 使用state中的cycleCount和当前offset计算时间位置
    const timeInCycle = currentOffset * totalCycleDuration;
    
    // 计算动画进度：只在动画阶段才有进度，停顿阶段保持在1
    let animationProgress = 0;
    if (timeInCycle <= animationDuration) {
      animationProgress = timeInCycle / animationDuration; // 0-1
    } else {
      animationProgress = 1; // 停顿阶段保持在目标位置
    }
    
    // 定义位置到图片的映射：从左到右的位置顺序
    // 配置数组的位置索引：[0(右), 1(左), 2(右中), 3(左中), 4(中)]
    // 实际从左到右的位置索引：[1, 3, 4, 2, 0]
    const positionOrder = [1, 3, 4, 2, 0]; // 从左到右的位置索引
    
    // 每张图片根据自己的轮换规律确定位置
    for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
      const currentImage = images[imageIndex];
      
      // 计算这张图片当前应该在哪个逻辑位置（从左到右的位置）
      // 图片i初始在位置i，每轮向右移动一个位置
      const currentLogicalPos = (imageIndex + cycleCount) % images.length;
      const nextLogicalPos = (imageIndex + cycleCount + 1) % images.length;
      
      // 根据逻辑位置找到对应的配置索引
      const currentConfigIndex = positionOrder[currentLogicalPos];
      const nextConfigIndex = positionOrder[nextLogicalPos];
      
      const currentConfig = imageConfigs[currentConfigIndex];
      const nextConfig = imageConfigs[nextConfigIndex];
      
      // 计算从当前位置到下一个位置的插值
      const fromLeft = parseFloat(currentConfig.position.left);
      const fromTop = parseFloat(currentConfig.position.top);
      const fromWidth = parseFloat(currentConfig.position.width);
      const fromHeight = parseFloat(currentConfig.position.height);
      
      const toLeft = parseFloat(nextConfig.position.left);
      const toTop = parseFloat(nextConfig.position.top);
      const toWidth = parseFloat(nextConfig.position.width);
      const toHeight = parseFloat(nextConfig.position.height);
      
      const left = fromLeft + (toLeft - fromLeft) * animationProgress;
      const top = fromTop + (toTop - fromTop) * animationProgress;
      const width = fromWidth + (toWidth - fromWidth) * animationProgress;
      const height = fromHeight + (toHeight - fromHeight) * animationProgress;
      
      result.push({
        image: currentImage,
        config: currentConfig,
        style: {
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: currentConfig.position.borderRadius,
          boxShadow: currentConfig.position.boxShadow,
          opacity: 1
        },
        zIndex: (() => {
          // 根据目标位置(下一个位置)设置层级，确保移动到中间位置的图片提前获得最高层级
          const logicalZIndex = [1, 2, 10, 4, 3]; // 对应逻辑位置0,1,2,3,4的层级
          
          // 如果正在移动，使用目标位置的层级；否则使用当前位置的层级
          if (animationProgress > 0) {
            return logicalZIndex[nextLogicalPos];
          } else {
            return logicalZIndex[currentLogicalPos];
          }
        })()
      });
    }
    
    // 移除新图片逻辑，让所有图片完整循环
    
    return result;
  };

  const simpleSyncItems = getSimpleSyncImages();

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsHovered(false);
    }
  };

  const defaultContainerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...containerStyle
  };

  return (
    <div
      style={defaultContainerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {/* 渲染图片和对应的背景 */}
      {simpleSyncItems.map((item, index) => (
        <React.Fragment key={`item-${index}`}>
          {/* 背景需要跟随图片移动 */}
          {item.config && item.config.hasBackground && item.config.backgroundStyle && (
            <div 
              style={{
                position: 'absolute',
                left: item.style.left,
                top: item.style.top,
                width: item.style.width,
                height: item.style.height,
                background: item.config.backgroundStyle.background,
                borderRadius: item.config.backgroundStyle.borderRadius,
                boxShadow: item.config.backgroundStyle.boxShadow,
                opacity: item.style.opacity || 1,
                zIndex: item.zIndex - 1
              }} 
            />
          )}
          
          {/* 图片 */}
          <img
            src={item.image}
            alt={`Simple sync image ${index + 1}`}
            style={{
              position: 'absolute',
              objectFit: 'cover',
              transition: 'none', // 手动控制动画
              zIndex: item.zIndex,
              ...item.style
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

export default ImageCarousel;