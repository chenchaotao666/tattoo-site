import React from 'react';
import { BaseImage } from '../../services/imageService';
import DownloadButton from './DownloadButton';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

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
  const { t } = useAsyncTranslation('components');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 桌面端固定尺寸 */}
        <div className="hidden md:block" style={{ width: '800px', height: '876px' }}>
          <img
            src={imageUrl}
            alt={t('imageEnlargement.enlargedImage')}
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

          {/* 桌面端关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-10 h-10 bg-black bg-opacity-60 rounded-full flex items-center justify-center text-white hover:bg-opacity-80 transition-all shadow-lg z-10"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
            </svg>
          </button>
        </div>

        {/* 移动端响应式布局 */}
        <div className="md:hidden flex flex-col items-center max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] relative">
          <div className="relative">
            <img
              src={imageUrl}
              alt={t('imageEnlargement.enlargedImage')}
              className="w-full h-auto max-h-[calc(100vh-8rem)] object-contain rounded-lg"
            />

            {/* 移动端关闭按钮 - 位于图片右上角 */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-10 h-10 bg-black bg-opacity-60 rounded-full flex items-center justify-center text-white hover:bg-opacity-80 transition-all shadow-lg z-10"
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
              </svg>
            </button>
          </div>

          <div className="mt-4 flex justify-center">
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
        </div>
      </div>
    </div>
  );
};

export default ImageEnlargement;