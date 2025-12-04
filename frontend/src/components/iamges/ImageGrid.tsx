import React from 'react';
import ImageCard from './ImageCard';
import NoData from '../common/NoData';
import { BaseImage } from '../../services/imageService';

interface ImageGridProps {
  images: BaseImage[];
  isLoading?: boolean;
  noDataTitle?: string;
  onImageClick?: (image: BaseImage) => void;
  showPrompt?: boolean;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  isLoading = false,
  onImageClick,
  noDataTitle = 'No images found',
  showPrompt = true
}) => {
  if (isLoading) {
    return (
      <div className={`w-full`}>
        <div className="flex justify-center items-center h-[300px] sm:h-[400px]">
          {/* Loading state */}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`w-full`}>
        <NoData message={noDataTitle} />
      </div>
    );
  }

  const handleImageClick = (image: BaseImage) => {
    if (onImageClick) {
      onImageClick(image);
    }
  };

  return (
    <div className="w-full bg-[#030414]" data-image-grid-version="v1.0">
      {/* 桌面端网格布局 */}
      <div className="hidden lg:block">
        <div className="relative">
          <div className="grid grid-cols-4 gap-6 justify-center max-w-fit mx-auto">
            {images.map((image, index) => (
              <div key={`${image.id}-desktop-${index}`}>
                <ImageCard
                  image={image}
                  onClick={() => handleImageClick(image)}
                  showPrompt={showPrompt}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 手机端网格布局 - 一列 */}
      <div className="block lg:hidden">
        <div className="relative">
          <div className="grid grid-cols-1 gap-4 max-w-fit mx-auto px-4">
            {images.map((image, index) => (
              <div key={`${image.id}-mobile-${index}`}>
                <ImageCard
                  image={image}
                  onClick={() => handleImageClick(image)}
                  showPrompt={showPrompt}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGrid;