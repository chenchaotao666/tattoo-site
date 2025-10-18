import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseImage } from '../../services/imageService';
import { getLocalizedText } from '../../utils/textUtils';
import { useLanguage, useAsyncTranslation } from '../../contexts/LanguageContext';
import { navigateWithLanguage } from '../../utils/navigationUtils';
import MoreMenu from '../generate/MoreMenu';
import BaseButton from '../ui/BaseButton';

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

const CreationDetail: React.FC<CreationDetailProps> = ({ image, fullImages, onClose, onNext, onPrevious, onImageSelect, onImagesDeleted }) => {
  const { language } = useLanguage();
  const { t } = useAsyncTranslation('creations');
  const navigate = useNavigate();
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

  // 处理重新生成
  const handleRecreateClick = () => {
    // 从图片数据中提取生成参数
    const prompt = typeof image.prompt === 'string' 
      ? image.prompt 
      : getLocalizedText(image.prompt, language) || '';
    
    // 获取当前批次的图片数量作为输出数量
    const batchOutputs = batchImages.length > 1 ? batchImages.length : 1;
    
    // 构建生成数据，参照 GenerateTextarea 的 handleGenerateClick
    const generateData = {
      prompt: prompt.trim(),
      outputs: batchOutputs, // 使用当前批次的图片数量
      color: image.isColor ? 'colorful' : 'blackwhite',
      style: image.styleId ? {
        id: image.styleId,
        name: image.styleTitle || { en: '', zh: '' },
        description: { en: '', zh: '' },
        slug: image.styleId,
        imageUrl: undefined
      } : null,
      enhance: true, // 默认开启增强
      visibility: image.isPublic ? 'public' : 'private'
    };
    
    // 导航到create页面，通过state传递数据
    navigateWithLanguage(navigate, '/create', { state: generateData });
  };

  return (
    <div className="relative flex items-center">
      {/* 主对话框 */}
      <div className="w-[1098px] h-[620px] bg-[#030414] rounded-2xl border border-[#393B42] relative flex">
      {/* 主图片 */}
      <img 
        className="w-[618px] h-[618px] rounded-l-2xl object-cover"
        src={image.tattooUrl || 'https://placehold.co/618x618'} 
        alt={t('detail.creation')}
      />
      
      {/* 右侧内容区域 */}
      <div className="flex-1 p-6 relative">
        {/* 右上角关闭按钮 */}
        <div 
          className={`absolute top-4 right-6 w-10 h-10 cursor-pointer z-10 rounded-md flex items-center justify-center transition-colors duration-200 ${
            isCloseHovered ? 'bg-white/10' : 'bg-transparent'
          }`}
          onClick={onClose}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`text-white transition-opacity duration-200 ${
              isCloseHovered ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <path 
              d="M18 6L6 18M6 6L18 18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 详细信息面板 */}
        <div className="w-[440px] relative bg-[#19191F] rounded-lg p-3 mt-10">
          {/* Image Generator 标题和图片缩略图行 - 只有批次图片才显示 */}
          {batchImages.length > 1 && (
            <>
              {/* Image Generator 标题 */}
              <div className="text-[#A5A5A5] text-sm font-normal font-inter mb-[17px]">
                {t('detail.imageGenerator')}
              </div>

              {/* 图片缩略图行 */}
            <div className="flex gap-3 mb-6">
              {batchImages.map((batchImg) => (
                <div key={batchImg.id} className="relative">
                  <img 
                    className="w-20 h-20 rounded-lg object-cover cursor-pointer"
                    src={batchImg.tattooUrl || 'https://placehold.co/80x80'} 
                    alt={t('detail.batchImage')}
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
                {t('detail.prompt')}
              </div>
              <div 
                className={`flex items-center gap-1 cursor-pointer p-1 rounded transition-colors duration-200 ${
                  isCopyHovered ? 'bg-white/10' : 'bg-transparent'
                }`}
                onClick={handleCopyPrompt}
                onMouseEnter={() => setIsCopyHovered(true)}
                onMouseLeave={() => setIsCopyHovered(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 transition-colors duration-200"
                >
                  <path
                    d="M7.7085 2.08325H16.4585C16.8453 2.08325 17.2162 2.2369 17.4897 2.51039C17.7632 2.78388 17.9168 3.15481 17.9168 3.54159V12.2916C17.9168 12.6784 17.7632 13.0493 17.4897 13.3228C17.2162 13.5963 16.8453 13.7499 16.4585 13.7499H7.7085C7.32172 13.7499 6.95079 13.5963 6.6773 13.3228C6.40381 13.0493 6.25016 12.6784 6.25016 12.2916V3.54159C6.25016 3.15481 6.40381 2.78388 6.6773 2.51039C6.95079 2.2369 7.32172 2.08325 7.7085 2.08325ZM7.7085 3.33325C7.65324 3.33325 7.60025 3.3552 7.56118 3.39427C7.52211 3.43334 7.50016 3.48633 7.50016 3.54159V12.2916C7.50016 12.3189 7.50555 12.346 7.51602 12.3713C7.52649 12.3966 7.54184 12.4196 7.56118 12.4389C7.58053 12.4582 7.60349 12.4736 7.62877 12.4841C7.65405 12.4945 7.68114 12.4999 7.7085 12.4999H16.4585C16.5137 12.4999 16.5667 12.478 16.6058 12.4389C16.6449 12.3998 16.6668 12.3468 16.6668 12.2916V3.54159C16.6668 3.48633 16.6449 3.43334 16.6058 3.39427C16.5667 3.3552 16.5137 3.33325 16.4585 3.33325H7.7085ZM12.5002 14.9999C12.5002 14.8342 12.566 14.6752 12.6832 14.558C12.8004 14.4408 12.9594 14.3749 13.1252 14.3749C13.2909 14.3749 13.4499 14.4408 13.5671 14.558C13.6843 14.6752 13.7502 14.8342 13.7502 14.9999V16.4583C13.7502 16.845 13.5965 17.216 13.323 17.4894C13.0495 17.7629 12.6786 17.9166 12.2918 17.9166H3.54183C3.15506 17.9166 2.78412 17.7629 2.51063 17.4894C2.23714 17.216 2.0835 16.845 2.0835 16.4583V7.70825C2.0835 7.32148 2.23714 6.95055 2.51063 6.67705C2.78412 6.40356 3.15506 6.24992 3.54183 6.24992H5.00016C5.16592 6.24992 5.32489 6.31577 5.4421 6.43298C5.55931 6.55019 5.62516 6.70916 5.62516 6.87492C5.62516 7.04068 5.55931 7.19965 5.4421 7.31686C5.32489 7.43407 5.16592 7.49992 5.00016 7.49992H3.54183C3.48658 7.49992 3.43359 7.52187 3.39452 7.56094C3.35545 7.60001 3.3335 7.653 3.3335 7.70825V16.4583C3.3335 16.5135 3.35545 16.5665 3.39452 16.6056C3.43359 16.6446 3.48658 16.6666 3.54183 16.6666H12.2918C12.3471 16.6666 12.4001 16.6446 12.4391 16.6056C12.4782 16.5665 12.5002 16.5135 12.5002 16.4583V14.9999Z"
                    fill={isCopyHovered ? '#ECECEC' : '#A5A5A5'}
                  />
                </svg>
                <div className={`text-sm font-normal font-inter transition-colors duration-200 ${
                  isCopyHovered ? 'text-[#ECECEC]' : 'text-[#A5A5A5]'
                }`}>
                  {t('detail.copy')}
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
                {t('detail.style')}
              </div>
              <div className="text-[#ECECEC] text-sm font-normal font-inter">
                {image.styleTitle ? getLocalizedText(image.styleTitle, language) : t('detail.noStyle')}
              </div>
            </div>
            
            {/* Color 行 */}
            <div className="flex justify-between items-center">
              <div className="text-[#A5A5A5] text-sm font-normal font-inter">
                {t('detail.color')}
              </div>
              <div className="text-[#ECECEC] text-sm font-normal font-inter">
                {image.isColor ? t('detail.colorful') : t('detail.blackAndWhite')}
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
            <BaseButton
              variant="primary"
              width="w-[198px]"
              height="h-12"
              fontSize="text-lg"
              onClick={handleRecreateClick}
            >
              {t('detail.recreate')}
            </BaseButton>
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