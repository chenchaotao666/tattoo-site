import React, { useState } from 'react';
import { BaseImage } from '../../services/imageService';
import GenerateExample from './GenerateExample';
import GenerateProgress from './GenerateProgress';
import { getImageContainerSize, getDisplayImages } from '../../utils/imageUtils';
import { useAsyncTranslation, useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';
import MoreMenu from './MoreMenu';
import ImageEnlargement from './ImageEnlargement';
import DownloadButton from './DownloadButton';

// 图标导入
const generateFailIcon = '/imgs/generate-fail.svg';

interface GenerateCenterSidebarProps {
  mode: 'text' | 'image';
  error: string | null;
  currentSelectedImage: string | null;
  isGenerating: boolean;
  generationProgress: number;
  generatedImages: BaseImage[];
  hasGenerationHistory: boolean;
  isInitialDataLoaded: boolean;
  dynamicImageDimensions: { [key: string]: { width: number; height: number } };
  setDynamicImageDimensions: React.Dispatch<React.SetStateAction<{ [key: string]: { width: number; height: number } }>>;
  onDownload: (format: 'png' | 'pdf', imageIds?: string[]) => void;
  onImagesDeleted: (deletedIds: string[]) => void;
  onImageSelect: (imageId: string) => void;
}

const GenerateCenterSidebar: React.FC<GenerateCenterSidebarProps> = ({
  mode,
  error,
  currentSelectedImage,
  isGenerating,
  generationProgress,
  generatedImages,
  hasGenerationHistory,
  isInitialDataLoaded,
  dynamicImageDimensions,
  setDynamicImageDimensions,
  onDownload,
  onImagesDeleted,
  onImageSelect
}) => {
  const { t } = useAsyncTranslation('generate');
  const { t: componentT } = useAsyncTranslation('components');
  const { language } = useLanguage();
  
  // 图片放大弹窗状态
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>('');
  
  // 处理图片点击放大
  const handleImageClick = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };
  
  // 关闭图片放大弹窗
  const handleCloseModal = () => {
    setShowImageModal(false);
    setModalImageUrl('');
  };
  
  const config = {
    text: {
      title: componentT('generateCenter.title'),
      description: componentT('generateCenter.description')
    }
  };

  // 根据模式选择对应的示例图片和加载状态
  const currentExampleImages = [
    {
      url: "/imgs/text-examples/cross-and-rose-on-arm.png",
      prompt: t('examples.textExamples.crossAndRose')
    },
    {
      url: "/imgs/text-examples/rose-on-back.png",
      prompt: t('examples.textExamples.roseAndSkull')
    },
    {
      url: "/imgs/text-examples/english-on-wrist.png",
      prompt: t('examples.textExamples.englishWrist')
    }
  ];

  return (
    <div className="lg:flex-1 px-4 sm:px-6 lg:px-10 flex flex-col pt-4 lg:pt-24 lg:relative bg-[#030414]">
      {/* 图片内容区域 - 移动端自动高度，桌面端flex-1 */}
      <div className="min-h-[390px] lg:flex-1 lg:h-auto flex flex-col justify-center">
        {/* 移动端为历史图片预留右侧空间 */}
        <div className="w-full">
          {error ? (
            // 生成失败状态 - 独立显示，居中，不在图片框中
            <div className="flex flex-col items-center text-center pt-8 pb-16">
              <div className="w-20 h-20 mb-6">
                <img src={generateFailIcon} alt={componentT('error.generationFailed')} className="w-full h-full" />
              </div>
              <div className="text-[#6B7280] text-sm leading-relaxed max-w-md">
                {t('error.generationFailed')}<br />
                {t('error.tryAgain')}
              </div>
            </div>
          ) : currentSelectedImage || isGenerating ? (
            <div className="flex flex-col items-center">
              {(() => {
                // 根据当前标签页选择对应的图片数组
                return (
                  <>
                    {isGenerating ? (
                      <div className="flex flex-col items-center relative">
                        <GenerateProgress
                          progress={generationProgress}
                          size="large"
                          showPercentage={true}
                        />
                      </div>
                    ) : currentSelectedImage ? (
                      (() => {
                        // 获取当前选中图片的批次
                        const currentImages = generatedImages;
                        const selectedImage = currentImages.find(img => img.id === currentSelectedImage);
                        const batchId = selectedImage?.batchId;

                        // 如果有批次ID，获取同批次的所有图片
                        const batchImages = batchId
                          ? currentImages.filter(img => img.batchId === batchId)
                          : [selectedImage].filter(Boolean);

                        // 如果只有一张图片，按原来的方式显示
                        if (batchImages.length === 1) {
                          return (
                            <>
                              {/* 移动端单张图片 */}
                              <div
                                className="bg-[#F2F3F5] rounded-2xl relative flex items-center justify-center transition-all duration-300 cursor-pointer w-full max-w-sm sm:max-w-md mx-auto aspect-square lg:hidden"
                                onClick={() => selectedImage?.tattooUrl && handleImageClick(selectedImage.tattooUrl)}
                              >
                                <img
                                  src={selectedImage?.tattooUrl}
                                  alt={componentT('generateCenter.generatedTattoo')}
                                  className="w-full h-full object-contain rounded-2xl"
                                />
                              </div>

                              {/* 桌面端单张图片 */}
                              <div
                                className="hidden lg:flex lg:items-center lg:justify-center bg-[#F2F3F5] rounded-2xl relative transition-all duration-300 cursor-pointer"
                                style={{ width: '600px', height: '600px' }}
                                onClick={() => selectedImage?.tattooUrl && handleImageClick(selectedImage.tattooUrl)}
                              >
                                <img
                                  src={selectedImage?.tattooUrl}
                                  alt={componentT('generateCenter.generatedTattoo')}
                                  className="w-full h-full object-contain rounded-2xl"
                                />
                              </div>
                            </>
                          );
                        }

                        // 如果是批次图片（多张），显示2x2网格
                        return (
                          <>
                            {/* 移动端布局 */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full max-w-sm sm:max-w-md lg:hidden mx-auto">
                              {batchImages.slice(0, 4).map((image, index) => (
                                <div
                                  key={image?.id || index}
                                  className="relative cursor-pointer hover:opacity-90 transition-opacity aspect-square rounded-2xl overflow-hidden"
                                  onClick={() => image?.tattooUrl && handleImageClick(image.tattooUrl)}
                                >
                                  <img
                                    src={image?.tattooUrl || ''}
                                    alt={componentT('generateCenter.generatedTattooAlt', undefined, { index: index + 1 })}
                                    className="w-full h-full object-cover rounded-2xl"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* 桌面端布局 */}
                            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4" style={{ width: '740px', height: '740px' }}>
                              {batchImages.slice(0, 4).map((image, index) => (
                                <div
                                  key={image?.id || index}
                                  className="relative cursor-pointer hover:opacity-90 transition-opacity"
                                  style={{ width: '360px', height: '360px', borderRadius: '16px' }}
                                  onClick={() => image?.tattooUrl && handleImageClick(image.tattooUrl)}
                                >
                                  <img
                                    src={image?.tattooUrl || ''}
                                    alt={componentT('generateCenter.generatedTattooAlt', undefined, { index: index + 1 })}
                                    style={{
                                      width: '360px',
                                      height: '360px',
                                      position: 'absolute',
                                      left: '0px',
                                      top: '0px',
                                      borderRadius: '16px',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()
                    ) : null}
                  </>
                );
              })()}

              {/* Download and More Options - 只在有选中图片时显示 */}
              {currentSelectedImage && (() => {
                // 判断是否为批次图片
                const selectedImage = generatedImages.find(img => img.id === currentSelectedImage);
                const batchId = selectedImage?.batchId;
                const batchImages = batchId
                  ? generatedImages.filter(img => img.batchId === batchId)
                  : [selectedImage].filter(Boolean);
                const isBatch = batchImages.length > 1;

                return (
                  <div className="w-full mt-6 px-2 sm:px-4 lg:px-0">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center max-w-md mx-auto">
                      {isBatch ? (
                        // 批次图片 - Download All + More Options
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
                          {/* Download All Button */}
                          <DownloadButton
                            text={componentT('generateCenter.downloadAll')}
                            onClick={() => onDownload('png', batchImages.map(img => img?.id).filter((id): id is string => Boolean(id)))}
                          />

                          {/* More Options Button */}
                          <MoreMenu
                            images={generatedImages}
                            currentSelectedImage={currentSelectedImage}
                            onImagesDeleted={onImagesDeleted}
                          />
                        </div>
                      ) : (
                        // 单张图片 - Download + More Options
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
                          {/* Download Button */}
                          <DownloadButton
                            onClick={() => onDownload('png')}
                          />

                          {/* More Options Button */}
                          <MoreMenu
                            images={generatedImages}
                            currentSelectedImage={currentSelectedImage}
                            onImagesDeleted={onImagesDeleted}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>
          ) : (
            // 只有在初始数据加载完成后才决定是否显示 example 图片
            // Text to Image 模式：用户没有 text to image 历史时显示 example
            isInitialDataLoaded && mode === 'text' && !hasGenerationHistory && (
              <GenerateExample 
                type="text"
                title={config[mode].title}
                description={config[mode].description}
                images={currentExampleImages.map(example => ({
                  url: example.url,
                  prompt: example.prompt
                }))}
              />
            )
          )}
        </div>
      </div>
      
      {/* 移动端横向历史图片 - 浮动在外层容器下方 */}
      {(() => {
        // 使用与 GenerateRightSidebar 相同的逻辑：过滤批次图片，只显示每批次的第一张
        const currentImages = getDisplayImages(generatedImages);

        return currentImages.length > 0 && (
          <div className="lg:hidden mt-4 px-4 sm:px-6">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {currentImages.slice(0, 10).map((image, index) => {
                // 如果有错误则不选中任何图片
                const isSelected = !error && currentSelectedImage === image.id;

                return (
                  <div
                    key={image.id}
                    className={`rounded-lg cursor-pointer relative transition-all border-2 bg-white shadow-sm flex-shrink-0 ${
                      isSelected ? 'border-[#FF5C07] shadow-lg' : 'border-transparent hover:border-gray-200'
                    }`}
                    style={{
                      ...getImageContainerSize(image, dynamicImageDimensions, setDynamicImageDimensions, {
                        maxWidth: 80,   // 移动端横向最大宽度80px
                        maxHeight: 80,  // 移动端横向最大高度80px
                        minWidth: 60,   // 移动端横向最小宽度60px
                        minHeight: 60   // 移动端横向最小高度60px
                      })
                    }}
                    onClick={() => onImageSelect(image.id)}
                    onDoubleClick={() => handleImageClick(image.tattooUrl)}
                  >
                    <img
                      src={image.tattooUrl}
                      alt={getLocalizedText(image.description, language) || componentT('generateCenter.generatedAlt', undefined, { index: index + 1 })}
                      className="w-full h-full rounded-md object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
      
      {/* 图片放大弹窗 */}
      <ImageEnlargement
        isOpen={showImageModal}
        imageUrl={modalImageUrl}
        generatedImages={generatedImages}
        onClose={handleCloseModal}
        onDownload={onDownload}
      />
    </div>
  );
};

export default GenerateCenterSidebar;