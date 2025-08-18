import React from 'react';
import { HomeImage } from '../../services/imageService';
import { getLocalizedText } from '../../utils/textUtils';
import { getImageContainerSize } from '../../utils/imageUtils';
import { useAsyncTranslation, useLanguage } from '../../contexts/LanguageContext';
import GenerateProgress from './GenerateProgress';

interface GenerateRightSidebarProps {
  images: HomeImage[];
  selectedImageId: string | null;
  isGenerating: boolean;
  generationProgress: number;
  isInitialDataLoaded: boolean;
  error: string | null;
  dynamicImageDimensions: { [key: string]: { width: number; height: number } };
  setDynamicImageDimensions: React.Dispatch<React.SetStateAction<{ [key: string]: { width: number; height: number } }>>;
  onImageSelect: (imageId: string) => void;
}

const GenerateRightSidebar: React.FC<GenerateRightSidebarProps> = ({
  images,
  selectedImageId,
  isGenerating,
  generationProgress,
  isInitialDataLoaded,
  error,
  dynamicImageDimensions,
  setDynamicImageDimensions,
  onImageSelect
}) => {
  const { t } = useAsyncTranslation('generate');
  const { language } = useLanguage();

  // 过滤批次图片：每个批次只显示第一张图片
  const getDisplayImages = (allImages: HomeImage[]): HomeImage[] => {
    const displayImages: HomeImage[] = [];
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

  // 获取要显示的图片列表
  const displayImages = getDisplayImages(images);

  // 检查选中的图片是否在显示列表中，如果不在，找到对应批次的第一张图片
  const getDisplaySelectedId = (selectedId: string | null): string | null => {
    if (!selectedId) return null;
    
    // 如果选中的图片直接在显示列表中，直接返回
    if (displayImages.some(img => img.id === selectedId)) {
      return selectedId;
    }
    
    // 如果选中的图片不在显示列表中，找到它所属批次的第一张图片
    const selectedImage = images.find(img => img.id === selectedId);
    if (selectedImage?.batchId) {
      const batchFirstImage = displayImages.find(img => img.batchId === selectedImage.batchId);
      return batchFirstImage?.id || null;
    }
    
    return selectedId;
  };

  const displaySelectedId = getDisplaySelectedId(selectedImageId);

  return (
    <div className="w-[140px] pt-5 pb-16 px-2 overflow-y-auto overflow-x-hidden h-full flex flex-col items-center max-w-[140px] bg-[#030414] relative">
      {/* 左侧渐变边框 */}
      <div 
        className="absolute left-0 top-0" 
        style={{
          width: '1px', 
          height: '100%', 
          background: 'linear-gradient(180deg, rgba(51, 51, 51, 0.10) 0%, #333333 20%, #333333 80%, rgba(51, 51, 51, 0.10) 100%)'
        }}
      ></div>
      {/* 生成中的 loading 圆圈 - 无背景 */}
      {isGenerating && (
        <div className="mb-4 flex items-center justify-center">
          <GenerateProgress
            progress={generationProgress}
            size="small"
            showPercentage={false}
          />
        </div>
      )}

      {/* 生成的图片历史 */}
      {displayImages.length > 0 ? (
        displayImages.map((image, index) => {
          // 使用图片的 id 进行选中状态判断，但如果有错误则不选中任何图片
          const isSelected = !error && displaySelectedId === image.id;
          const isLastImage = index === displayImages.length - 1;
          
          return (
            <div
              key={image.id}
              className={`${isLastImage ? 'mb-12' : 'mb-4'} rounded-lg cursor-pointer relative transition-all border-2 ${
                isSelected ? 'border-[#98FF59] shadow-lg' : 'border-transparent hover:border-gray-200'
              }`}
              style={getImageContainerSize(image, dynamicImageDimensions, setDynamicImageDimensions)}
              onClick={() => onImageSelect(image.id)}
            >
              <img
                src={image.tattooUrl}
                alt={getLocalizedText(image.description, language) || `Generated ${index + 1}`}
                className="w-full h-full rounded-lg object-cover"
              />
            </div>
          );
        })
      ) : !isGenerating && isInitialDataLoaded ? (
        // 空状态 - 只有在初始数据加载完成且确实没有历史图片时才显示
        <div className="text-center text-white-500 text-xs mt-8">
          {t('states.noTextToImageYet')}
        </div>
      ) : null}
    </div>
  );
};

export default GenerateRightSidebar;