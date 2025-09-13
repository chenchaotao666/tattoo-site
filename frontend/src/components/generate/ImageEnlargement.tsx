import React from 'react';
import { BaseImage } from '../../services/imageService';
import DownloadButton from './DownloadButton';

interface ImageEnlargementProps {
  isOpen: boolean;
  imageUrl: string;
  generatedImages: BaseImage[];
  onClose: () => void;
  onDownload: (format: 'png' | 'pdf', imageIds?: string[]) => void;
}

const ImageEnlargement: React.FC<ImageEnlargementProps> = ({
  isOpen,
  imageUrl,
  generatedImages,
  onClose,
  onDownload
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '800px', height: '876px' }}
      >
        <img 
          src={imageUrl}
          alt="Enlarged tattoo"
          style={{ 
            width: '800px', 
            height: '800px', 
            left: '0px', 
            top: '0px', 
            position: 'absolute',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
        <div style={{
          left: '335px',
          top: '828px',
          position: 'absolute'
        }}>
          <DownloadButton
            onClick={() => {
              // 找到当前图片的ID并调用下载
              const currentImage = generatedImages.find(img => img.tattooUrl === imageUrl);
              if (currentImage) {
                onDownload('png', [currentImage.id]);
              }
            }}
          />
        </div>
        
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute -top-8 -right-8 w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ImageEnlargement;