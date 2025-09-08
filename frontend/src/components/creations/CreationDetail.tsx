import React, { useState } from 'react';
import { BaseImage } from '../../services/imageService';
import { getLocalizedText } from '../../utils/textUtils';
import { useLanguage } from '../../contexts/LanguageContext';
import MoreMenu from '../generate/MoreMenu';

interface CreationDetailProps {
  image: BaseImage;
  allImages: BaseImage[]; // 已过滤的显示图片列表
  fullImages: BaseImage[]; // 用户生成的全量图片数据，用于获取同批次图片
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onImageSelect?: (image: BaseImage) => void; // 选择批次中的图片
  onImagesDeleted?: (deletedIds: string[]) => void; // 删除图片的回调
}

const CreationDetail: React.FC<CreationDetailProps> = ({ image, allImages, fullImages, onClose, onNext, onPrevious, onImageSelect, onImagesDeleted }) => {
  const { language } = useLanguage();
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isUpArrowHovered, setIsUpArrowHovered] = useState(false);
  const [isDownArrowHovered, setIsDownArrowHovered] = useState(false);
  const [isCopyHovered, setIsCopyHovered] = useState(false);

  // 获取当前选中图片的批次
  const selectedImage = image;
  const batchId = selectedImage?.batchId;
  
  // 如果有批次ID，从全量图片中获取同批次的所有图片
  const batchImages = batchId 
    ? fullImages.filter(img => img.batchId === batchId)
    : [selectedImage].filter(Boolean);

  // 复制prompt到剪贴板
  const handleCopyPrompt = async () => {
    try {
      const promptText = typeof image.prompt === 'string' 
        ? image.prompt 
        : (image.prompt?.en || image.prompt?.zh || '');
      
      if (promptText) {
        await navigator.clipboard.writeText(promptText);
        // 可以添加成功提示
      }
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      // 可以添加失败提示
    }
  };

  // 处理图片删除成功
  const handleImagesDeleted = (deletedIds: string[]) => {
    // 如果当前显示的图片被删除了，关闭详情页面
    if (deletedIds.includes(image.id)) {
      onClose?.();
    }
    
    // 通知父组件更新图片列表
    onImagesDeleted?.(deletedIds);
  };

  return (
    <div className="relative flex items-center">
      {/* 主对话框 */}
      <div className="w-[1098px] h-[620px] bg-[#030414] rounded-2xl border border-[#393B42] relative flex">
      {/* 主图片 */}
      <img 
        className="w-[618px] h-[618px] rounded-l-2xl object-cover"
        src={image.tattooUrl || 'https://placehold.co/618x618'} 
        alt="Creation"
      />
      
      {/* 右侧内容区域 */}
      <div className="flex-1 p-6 relative">
        {/* 右上角关闭按钮 */}
        <div 
          className={`absolute top-4 right-4 w-6 h-6 cursor-pointer z-10 rounded-md flex items-center justify-center transition-colors duration-200 ${
            isCloseHovered ? 'bg-white/10' : 'bg-transparent'
          }`}
          onClick={onClose}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
        >
          <img 
            src="/images/creations/close-x.svg" 
            alt="Close"
            className={`w-4 h-4 transition-opacity duration-200 ${
              isCloseHovered ? 'opacity-100' : 'opacity-70'
            }`}
          />
        </div>

        {/* 详细信息面板 */}
        <div className="w-[440px] relative bg-[#19191F] rounded-lg p-3 mt-8">
          {/* Image Generator 标题和图片缩略图行 - 只有批次图片才显示 */}
          {batchImages.length > 1 && (
            <>
              {/* Image Generator 标题 */}
              <div className="text-[#A5A5A5] text-sm font-normal font-inter mb-[17px]">
                Image Generator
              </div>

              {/* 图片缩略图行 */}
            <div className="flex gap-3 mb-6">
              {batchImages.map((batchImg) => (
                <div key={batchImg.id} className="relative">
                  <img 
                    className="w-20 h-20 rounded-lg object-cover cursor-pointer"
                    src={batchImg.tattooUrl || 'https://placehold.co/80x80'} 
                    alt={`Batch image`}
                    onClick={() => onImageSelect?.(batchImg)}
                  />
                  {/* 选中状态的边框 - 只显示在当前选中的图片上 */}
                  {batchImg.id === selectedImage.id && (
                    <div className="absolute -top-[3px] -left-[3px] w-[86px] h-[86px] rounded-lg border border-[#98FF59] pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
            </>
          )}

          {/* Prompt 部分 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-[#A5A5A5] text-sm font-normal font-inter">
                Prompt
              </div>
              <div 
                className={`flex items-center gap-1 cursor-pointer p-1 rounded transition-colors duration-200 ${
                  isCopyHovered ? 'bg-white/10' : 'bg-transparent'
                }`}
                onClick={handleCopyPrompt}
                onMouseEnter={() => setIsCopyHovered(true)}
                onMouseLeave={() => setIsCopyHovered(false)}
              >
                <div
                  className={`w-5 h-5 transition-colors duration-200`}
                  style={{
                    backgroundColor: isCopyHovered ? '#ECECEC' : '#A5A5A5',
                    maskImage: 'url("/images/creations/copy.svg")',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    maskSize: 'contain',
                  }}
                />
                <div className={`text-sm font-normal font-inter transition-colors duration-200 ${
                  isCopyHovered ? 'text-[#ECECEC]' : 'text-[#A5A5A5]'
                }`}>
                  Copy
                </div>
              </div>
            </div>
            <div className="w-[416px] text-[#ECECEC] text-sm font-normal font-inter leading-5">
              {image.prompt ? (typeof image.prompt === 'string' ? image.prompt : image.prompt.en || image.prompt.zh) : 'he Scorpio ghost horror tattoo style features a terrifying and disturbing demonic creature\'s skull, with a twisted face adorned with sharp fangs and a five-pointed star symbol, surrounded by blank space, presenting a simple and unadorned look'}
            </div>
          </div>

          {/* Style 和 Color 信息 */}
          <div>
            {/* Style 行 */}
            <div className="flex justify-between items-center mb-3">
              <div className="text-[#A5A5A5] text-sm font-normal font-inter">
                Style
              </div>
              <div className="text-[#ECECEC] text-sm font-normal font-inter">
                {image.styleTitle ? getLocalizedText(image.styleTitle, language) : 'NO Style'}
              </div>
            </div>
            
            {/* Color 行 */}
            <div className="flex justify-between items-center">
              <div className="text-[#A5A5A5] text-sm font-normal font-inter">
                Color
              </div>
              <div className="text-[#ECECEC] text-sm font-normal font-inter">
                {image.isColor ? 'Color' : 'Black & White'}
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作区域 */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex justify-between items-center">
            {/* 左侧按钮组：MoreMenu */}
            <MoreMenu
              images={fullImages}
              currentSelectedImage={image.id}
              onImagesDeleted={handleImagesDeleted}
            />

            {/* 右侧：Recreate 按钮 */}
            <div className="w-[198px] h-12 relative rounded-lg cursor-pointer">
              <div className="w-[198px] h-12 absolute left-0 top-0 bg-[#98FF59] rounded-lg" />
              <div className="absolute left-[60px] top-[15px] text-black text-lg font-bold font-inter leading-[18px]">
                Recreate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      
    {/* 右侧导航箭头 - 对话框外部 */}
      <div className="absolute -right-[72px] top-1/2 -translate-y-1/2 flex flex-col gap-3">
        {/* 上箭头 - 上一张图片 */}
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 ${
            isUpArrowHovered ? 'bg-[#2A2A35]' : 'bg-[#19191F]'
          }`}
          onClick={onPrevious}
          onMouseEnter={() => setIsUpArrowHovered(true)}
          onMouseLeave={() => setIsUpArrowHovered(false)}
        >
          <div 
            className="w-6 h-6 bg-[#ECECEC]"
            style={{ 
              maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M18 15l-6-6-6 6\'/%3E%3C/svg%3E")',
              maskRepeat: 'no-repeat',
              maskPosition: 'center'
            }}
          />
        </div>

        {/* 下箭头 - 下一张图片 */}
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 ${
            isDownArrowHovered ? 'bg-[#2A2A35]' : 'bg-[#19191F]'
          }`}
          onClick={onNext}
          onMouseEnter={() => setIsDownArrowHovered(true)}
          onMouseLeave={() => setIsDownArrowHovered(false)}
        >
          <div 
            className="w-6 h-6 bg-[#ECECEC]"
            style={{ 
              maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
              maskRepeat: 'no-repeat',
              maskPosition: 'center'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CreationDetail;