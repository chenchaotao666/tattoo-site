/**
 * 图片工具函数
 */

import { LocalizedText } from './textUtils';
import { BaseImage } from '../services/imageService';

/**
 * 右侧边栏图片的尺寸
 */
export const SIDEBAR_IMAGE_DIMENSIONS = {
  // 最大尺寸
  MAX_WIDTH: 110,
  MAX_HEIGHT: 110,
  // 最小尺寸
  MIN_WIDTH: 90,
  MIN_HEIGHT: 90
} as const;

/**
 * 根据图片URL获取图片的实际尺寸
 * @param imageUrl 图片URL
 * @returns Promise<{width: number, height: number}> 图片尺寸
 */
export const getImageDimensionsFromUrl = (imageUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 处理跨域问题
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      });
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
};

/**
 * 计算图片在指定最大尺寸内的缩放尺寸（保持宽高比）
 * @param originalWidth 原始宽度
 * @param originalHeight 原始高度
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @returns {width: number, height: number} 缩放后的尺寸
 */
export const calculateScaledDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  // 计算缩放比例，确保图片不超出最大尺寸限制
  const scaleByWidth = maxWidth / originalWidth;
  const scaleByHeight = maxHeight / originalHeight;
  const scale = Math.min(scaleByWidth, scaleByHeight, 1); // 不放大，只缩小

  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale)
  };
};

// ===== 图片大小计算相关函数 =====

/**
 * 图片尺寸缓存类型
 */
export type ImageDimensionsCache = { [key: string]: { width: number; height: number } };

/**
 * 图片尺寸更新函数类型
 */
export type SetImageDimensionsFunction = (updater: (prev: ImageDimensionsCache) => ImageDimensionsCache) => void;

/**
 * 通用的图片大小计算函数
 * @param imageId 图片ID（用作缓存键）
 * @param imageUrl 图片URL（用于获取尺寸）
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param minWidth 最小宽度（可选）
 * @param minHeight 最小高度（可选）
 * @param dimensionsCache 图片尺寸缓存
 * @param setDimensionsCache 更新图片尺寸缓存的函数
 * @returns 计算后的图片尺寸样式
 */
export const getImageSize = (
  imageId: string,
  imageUrl: string,
  maxWidth: number,
  maxHeight: number,
  minWidth?: number,
  minHeight?: number,
  dimensionsCache?: ImageDimensionsCache,
  setDimensionsCache?: SetImageDimensionsFunction
) => {
  // 创建缓存键，包含所有尺寸参数，确保不同尺寸约束下的图片有独立的缓存
  const cacheKey = `${imageId}_${maxWidth}_${maxHeight}_${minWidth || 0}_${minHeight || 0}`;
  
  // 如果已经获取到了处理后的图片尺寸，直接使用
  if (imageId && dimensionsCache && dimensionsCache[cacheKey]) {
    const { width, height } = dimensionsCache[cacheKey];
    return {
      width: `${width}px`,
      height: `${height}px`
    };
  }
  
  // 如果还没有获取到图片尺寸，异步获取
  // 检查是否已经失败过，避免重复尝试失败的图片
  if (imageId && imageUrl && dimensionsCache && setDimensionsCache && 
      !dimensionsCache[cacheKey] && 
      !dimensionsCache[`loading_${cacheKey}`] && 
      !dimensionsCache[`failed_${cacheKey}`]) {
    
    setDimensionsCache(prev => ({
      ...prev,
      [`loading_${cacheKey}`]: { width: 0, height: 0 }
    }));

    getImageDimensionsFromUrl(imageUrl)
      .then((originalDimensions) => {
        // 应用尺寸约束，计算最终显示尺寸
        const scaledDimensions = calculateScaledDimensions(
          originalDimensions.width, 
          originalDimensions.height, 
          maxWidth, 
          maxHeight
        );
        
        // 应用最小尺寸约束
        const finalDimensions = {
          width: minWidth ? Math.max(minWidth, scaledDimensions.width) : scaledDimensions.width,
          height: minHeight ? Math.max(minHeight, scaledDimensions.height) : scaledDimensions.height
        };
        
        setDimensionsCache(prev => {
          const newState = { ...prev };
          delete newState[`loading_${cacheKey}`];
          // 存储处理后的尺寸，而不是原始尺寸
          newState[cacheKey] = finalDimensions;
          return newState;
        });
      })
      .catch((error) => {
        console.error('Failed to get image dimensions:', error);
        setDimensionsCache(prev => {
          const newState = { ...prev };
          delete newState[`loading_${cacheKey}`];
          // 设置失败标记，防止重复尝试
          newState[`failed_${cacheKey}`] = { width: 0, height: 0 };
          return newState;
        });
      });
  }

  // 默认情况下使用最大尺寸
  return {
    width: `${maxWidth}px`,
    height: `${maxHeight}px`
  };
};

/**
 * 计算图片容器的大小（右侧边栏）
 * @param image 图片对象
 * @param dimensionsCache 图片尺寸缓存
 * @param setDimensionsCache 更新图片尺寸缓存的函数
 * @param customDimensions 自定义尺寸参数（可选）
 * @returns 计算后的容器尺寸
 */
export const getImageContainerSize = (
  image: any,
  dimensionsCache?: ImageDimensionsCache,
  setDimensionsCache?: SetImageDimensionsFunction,
  customDimensions?: {
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
  }
) => {
  // 使用自定义尺寸或默认尺寸
  const maxWidth = customDimensions?.maxWidth ?? SIDEBAR_IMAGE_DIMENSIONS.MAX_WIDTH;
  const maxHeight = customDimensions?.maxHeight ?? SIDEBAR_IMAGE_DIMENSIONS.MAX_HEIGHT;
  const minWidth = customDimensions?.minWidth ?? SIDEBAR_IMAGE_DIMENSIONS.MIN_WIDTH;
  const minHeight = customDimensions?.minHeight ?? SIDEBAR_IMAGE_DIMENSIONS.MIN_HEIGHT;

  // 如果图片有dimensions属性，使用它（优先级最高）
  if (image.dimensions && image.dimensions.width && image.dimensions.height) {
    const { width, height } = image.dimensions;
    const scaledDimensions = calculateScaledDimensions(width, height, maxWidth, maxHeight);
    return { 
      width: `${Math.max(minWidth, scaledDimensions.width)}px`, 
      height: `${Math.max(minHeight, scaledDimensions.height)}px`
    };
  }
  
  // 使用通用函数计算尺寸（会处理异步获取逻辑）
  if (image.id && image.defaultUrl) {
    return getImageSize(
      image.id, 
      image.defaultUrl, 
      maxWidth, 
      maxHeight, 
      minWidth, 
      minHeight, 
      dimensionsCache, 
      setDimensionsCache
    );
  }
  
  // 默认情况下使用正方形
  return { 
    width: `${maxWidth}px`, 
    height: `${maxHeight}px` 
  };
};

// 动态映射存储
let imageIdToNameMap: Record<string, string> = {};
let imageNameToIdMap: Record<string, string> = {};

/**
 * 将title转换为SEO友好的URL路径
 */
export const convertTitleToPath = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为短划线
    .replace(/-+/g, '-') // 多个短划线合并为一个
    .replace(/^-+|-+$/g, '') // 移除开头和结尾的短划线
    .trim();
};

/**
 * 从图片数据中提取英文标题作为SEO路径
 */
export const getEnglishTitleFromImage = (title: LocalizedText | string): string => {
  if (typeof title === 'string') {
    return convertTitleToPath(title);
  }
  
  // 如果是LocalizedText对象，优先使用英文
  const englishTitle = title.en || title.zh || '';
  return convertTitleToPath(englishTitle);
};

/**
 * 更新图片映射表（从API数据动态生成）
 */
export const updateImageMappings = (images: Array<{id: string, title: LocalizedText | string}>) => {
  images.forEach(image => {
    const seoName = getEnglishTitleFromImage(image.title);
    imageIdToNameMap[image.id] = seoName;
    imageNameToIdMap[seoName] = image.id;
  });
};

/**
 * 根据图片ID获取SEO友好的名称
 */
export const getImageNameById = (imageId: string): string => {
  return imageIdToNameMap[imageId] || imageId;
};

/**
 * 根据SEO友好的名称获取图片ID
 */
export const getImageIdByName = (imageName: string): string => {
  return imageNameToIdMap[imageName] || imageName;
};

/**
 * 检查给定的字符串是否是图片名称（而不是ID）
 */
export const isImageName = (value: string): boolean => {
  return value in imageNameToIdMap;
};

/**
 * 过滤批次图片：每个批次只显示第一张图片
 * @param allImages 所有图片数组
 * @returns 过滤后的图片数组
 */
export const getDisplayImages = (allImages: BaseImage[]): BaseImage[] => {
  const displayImages: BaseImage[] = [];
  const seenBatches = new Set<string>();

  for (const image of allImages) {
    if (image.batchId) {
      // 如果有批次ID，检查是否已经添加过这个批次的图片
      if (!seenBatches.has(image.batchId)) {
        displayImages.push(image);
        seenBatches.add(image.batchId);
      }
    } else {
      // 如果没有批次ID，直接添加
      displayImages.push(image);
    }
  }

  return displayImages;
};
