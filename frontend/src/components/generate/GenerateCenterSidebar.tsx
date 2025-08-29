import React, { useState } from 'react';
import { HomeImage } from '../../services/imageService';
import GenerateExample from './GenerateExample';
import GenerateProgress from './GenerateProgress';
import { getImageContainerSize } from '../../utils/imageUtils';
import { useAsyncTranslation, useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';
import MoreMenu from './MoreMenu';
import { colors } from '../../styles/colors';

// 图标导入
const generateFailIcon = '/images/generate-fail.svg';

interface GenerateCenterSidebarProps {
  mode: 'text' | 'image';
  error: string | null;
  currentSelectedImage: string | null;
  isGenerating: boolean;
  generationProgress: number;
  generatedImages: HomeImage[];
  hasGenerationHistory: boolean;
  isInitialDataLoaded: boolean;
  dynamicImageDimensions: { [key: string]: { width: number; height: number } };
  setDynamicImageDimensions: React.Dispatch<React.SetStateAction<{ [key: string]: { width: number; height: number } }>>;
  showMoreMenu: boolean;
  onDownload: (format: 'png' | 'pdf', imageIds?: string[]) => void;
  onMoreMenuToggle: () => void;
  onDelete: (imageIds?: string[]) => void;
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
  showMoreMenu,
  onDownload,
  onMoreMenuToggle,
  onDelete,
  onImageSelect
}) => {
  const { t } = useAsyncTranslation('generate');
  const { language } = useLanguage();
  
  const config = {
    text: {
      title: 'AI Tattoo Generator',
      description: 'Create unique tattoo designs effortlessly with AI. Customize styles, explore endless options, and instantly preview your ideas.'
    }
  };

  // 根据模式选择对应的示例图片和加载状态
  const currentExampleImages = [
    {
      url: "/images/text-examples/cross-and-rose-on-arm.png",
      prompt: {
        zh: "手臂上的十字架和玫瑰纹身",
        en: "Tattoos of a cross and a rose on the arm"
      }
    },
    {
      url: "/images/text-examples/rose-on-back.png", 
      prompt: {
        zh: "背部玫瑰和骷髅纹身",
        en: "A tattoo of a rose and a skull on the back"
      }
    },
    {
      url: "/images/text-examples/english-on-wrist.png",
      prompt: {
        zh: "手腕上的英文纹身",
        en: "There is an English tattoo on the wrist"
      }
    }
  ];

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-10 flex flex-col pt-4 lg:pb-36 relative bg-[#030414]">
      {/* 图片内容区域 - 移动端固定高度，桌面端flex-1 */}
      <div className="h-[390px] lg:flex-1 lg:h-auto flex flex-col justify-center">
        {/* 移动端为历史图片预留右侧空间 */}
        <div className="w-full">
          {error ? (
            // 生成失败状态 - 独立显示，居中，不在图片框中
            <div className="flex flex-col items-center text-center pt-8 pb-16">
              <div className="w-20 h-20 mb-6">
                <img src={generateFailIcon} alt="Generation failed" className="w-full h-full" />
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
                            <div 
                              className="bg-[#F2F3F5] rounded-2xl relative flex items-center justify-center transition-all duration-300"
                              style={{ width: '600px', height: '600px' }}
                            >
                              <img
                                src={selectedImage?.tattooUrl}
                                alt="Generated tattoo"
                                className="w-full h-full object-contain rounded-2xl"
                              />
                            </div>
                          );
                        }
                        
                        // 如果是批次图片（多张），显示2x2网格
                        return (
                          <div className="grid grid-cols-2 gap-4" style={{ width: '734px', height: '734px' }}>
                            {batchImages.slice(0, 4).map((image, index) => (
                              <div key={image?.id || index} className="relative" style={{ width: '360px', height: '360px', borderRadius: '16px' }}>
                                <img 
                                  src={image?.tattooUrl || ''}
                                  alt={`Generated tattoo ${index + 1}`}
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
                        );
                      })()
                    ) : null}
                  </>
                );
              })()}
              
              {/* Download and More Options - 只在有选中图片且不在生成过程中时显示 */}
              {currentSelectedImage && !isGenerating && (() => {
                // 判断是否为批次图片
                const selectedImage = generatedImages.find(img => img.id === currentSelectedImage);
                const batchId = selectedImage?.batchId;
                const batchImages = batchId 
                  ? generatedImages.filter(img => img.batchId === batchId)
                  : [selectedImage].filter(Boolean);
                const isBatch = batchImages.length > 1;
                
                console.log('Download buttons logic:', {
                  currentSelectedImage,
                  selectedImage: selectedImage?.id,
                  batchId,
                  batchImagesLength: batchImages.length,
                  isBatch
                });
                
                return (
                  <div className="flex flex-row gap-3 mt-6 px-4 sm:px-0 items-center justify-center">
                    {isBatch ? (
                      // 批次图片 - Download All + More Options
                      <div className="relative flex items-center more-menu-container" style={{ width: '209px', height: '48px' }}>
                        {/* Download All Button */}
                        <button 
                          onClick={() => onDownload('png', batchImages.map(img => img?.id).filter((id): id is string => Boolean(id)))}
                          className="absolute left-0 top-0 bg-[#19191F] hover:bg-[#2D2D35] rounded-lg transition-all duration-200 flex items-center justify-start gap-[6px]"
                          style={{ height: '48px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px' }}
                        >
                          <img src="/images/generate/download.png" alt="Download" className="w-6 h-6" />
                          <span className="text-[#ECECEC] text-sm font-normal leading-[18px]">Download All</span>
                        </button>
                        
                        {/* More Options Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('More menu toggle clicked (batch)');
                            onMoreMenuToggle();
                          }}
                          className="absolute right-0 top-0 bg-[#19191F] hover:bg-[#2D2D35] rounded-lg transition-all duration-200 flex items-center justify-center"
                          style={{ width: '48px', height: '48px' }}
                        >
                          <div className="w-6 h-6 relative overflow-hidden">
                            <div 
                              className="w-1 h-1 absolute rounded-full" 
                              style={{ 
                                left: '10px', 
                                top: '10px',
                                backgroundColor: showMoreMenu ? colors.special.highlight : '#ECECEC'
                              }} 
                            />
                            <div 
                              className="w-1 h-1 absolute rounded-full" 
                              style={{ 
                                left: '18px', 
                                top: '10px',
                                backgroundColor: showMoreMenu ? colors.special.highlight : '#ECECEC'
                              }} 
                            />
                            <div 
                              className="w-1 h-1 absolute rounded-full" 
                              style={{ 
                                left: '2px', 
                                top: '10px',
                                backgroundColor: showMoreMenu ? colors.special.highlight : '#ECECEC'
                              }} 
                            />
                          </div>
                        </button>
                        
                        {/* 下拉菜单 */}
                        {showMoreMenu && (
                          <MoreMenu
                            onReportClick={onMoreMenuToggle}
                            onDeleteClick={() => {
                              onMoreMenuToggle();
                              onDelete(batchImages.map(img => img?.id).filter((id): id is string => Boolean(id)));
                            }}
                            isBatch={true}
                          />
                        )}
                      </div>
                    ) : (
                      // 单张图片 - Download + More Options
                      <div className="flex items-center gap-3">
                        {/* Download Button */}
                        <button 
                          onClick={() => onDownload('png')}
                          className="bg-[#19191F] hover:bg-[#2D2D35] rounded-lg transition-all duration-200 flex items-center justify-start gap-[6px]"
                          style={{ height: '48px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px' }}
                        >
                          <img src="/images/generate/download.png" alt="Download" className="w-6 h-6" />
                          <span className="text-[#ECECEC] text-sm font-normal leading-[18px]">Download</span>
                        </button>
                        
                        {/* More Options Button */}
                        <div className="relative more-menu-container">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('More menu toggle clicked (single), showMoreMenu:', showMoreMenu);
                              onMoreMenuToggle();
                            }}
                            className="bg-[#19191F] hover:bg-[#2D2D35] rounded-lg transition-all duration-200 flex items-center justify-center"
                            style={{ width: '48px', height: '48px' }}
                          >
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div 
                                className="w-1 h-1 absolute rounded-full" 
                                style={{ 
                                  left: '10px', 
                                  top: '10px',
                                  backgroundColor: showMoreMenu ? colors.special.highlight : '#ECECEC'
                                }} 
                              />
                              <div 
                                className="w-1 h-1 absolute rounded-full" 
                                style={{ 
                                  left: '18px', 
                                  top: '10px',
                                  backgroundColor: showMoreMenu ? colors.special.highlight : '#ECECEC'
                                }} 
                              />
                              <div 
                                className="w-1 h-1 absolute rounded-full" 
                                style={{ 
                                  left: '2px', 
                                  top: '10px',
                                  backgroundColor: showMoreMenu ? colors.special.highlight : '#ECECEC'
                                }} 
                              />
                            </div>
                          </button>
                          
                          {/* 下拉菜单 */}
                          {showMoreMenu && (
                            <MoreMenu
                              onReportClick={onMoreMenuToggle}
                              onDeleteClick={() => {
                                onMoreMenuToggle();
                                onDelete();
                              }}
                              isBatch={false}
                              currentSelectedImage={currentSelectedImage}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          ) : (
            // 根据当前模式判断是否显示Example
            // 只有在初始数据加载完成后才决定是否显示 example 图片
            // Text to Image 模式：用户没有 text to image 历史时显示 example
            isInitialDataLoaded && mode === 'text' && !hasGenerationHistory && (
              <GenerateExample 
                type="text"
                title={config[mode].title}
                description={config[mode].description}
                images={currentExampleImages.map(example => ({
                  url: example.url,
                  prompt: getLocalizedText(example.prompt, language)
                }))}
              />
            )
          )}
        </div>
      </div>
      
      {/* 移动端横向历史图片 - 浮动在外层容器下方 */}
      {(() => {
        const currentImages = generatedImages;
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
                  >
                    <img
                      src={image.tattooUrl}
                      alt={getLocalizedText(image.description, language) || `Generated ${index + 1}`}
                      className="w-full h-full rounded-md object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default GenerateCenterSidebar;