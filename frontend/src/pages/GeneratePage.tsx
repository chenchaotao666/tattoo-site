import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import useGeneratePage from '../hooks/useGeneratePage';
import { useAuth } from '../contexts/AuthContext';
import { getLocalizedText } from '../utils/textUtils';
import DeleteImageConfirmDialog from '../components/ui/DeleteImageConfirmDialog';
import Tooltip from '../components/ui/Tooltip';
import HowToCreate from '../components/common/HowToCreate';
import GenerateFAQ, { FAQData } from '../components/common/GenerateFAQ';
import TryNow from '../components/common/TryNow';
import TattooIntroduction, { TattooIntroductionData } from '../components/common/TattooIntroduction';
import PricingSection from '../components/price/PricingSection';
import GenerateRightSidebar from '../components/generate/GenerateRightSidebar';
import GenerateLeftSidebar from '../components/generate/GenerateLeftSidebar';
import GenerateCenterSidebar from '../components/generate/GenerateCenterSidebar';

import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation, useLanguage } from '../contexts/LanguageContext';

// 移动端还需要的图标
const tipIcon = '/images/generate/tip.svg';
const crownIcon = '/images/generate/crown.svg';
const subtractColorIcon = '/images/generate/subtract-color.svg';
const subtractIcon = '/images/generate/generate-star.png';


const GeneratePage: React.FC = () => {
  // 获取翻译函数
  const { t } = useAsyncTranslation('generate');
  const { language } = useLanguage();
  
  // 获取导航函数
  const navigate = useNavigate();
  
  // 获取用户认证状态和刷新函数
  const { user, isAuthenticated, refreshUser } = useAuth();
  
  // 状态：存储动态获取的图片尺寸（用于Text to Image和Image to Image模式）
  const [dynamicImageDimensions, setDynamicImageDimensions] = React.useState<{ [key: string]: { width: number; height: number } }>({});

  // 控制更多选项菜单的显示
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  // 控制删除确认对话框的显示
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  
  // 存储要删除的图片ID数组
  const [imagesToDelete, setImagesToDelete] = React.useState<string[]>([]);

  // 控制定价弹窗的显示
  const [showPricingModal, setShowPricingModal] = React.useState(false);

  // 处理弹窗显示时的滚动
  React.useEffect(() => {
    if (showPricingModal) {
      // 记录原始滚动位置
      const scrollY = window.scrollY;
      
      // 禁用外层滚动
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // 恢复外层滚动
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      
      // 恢复滚动位置
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    
    // 清理函数，确保组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
    };
  }, [showPricingModal]);

  // 移动端内容滚动容器的引用
  const mobileContentRef = React.useRef<HTMLDivElement>(null);
  // Prompt输入框的引用
  const promptInputRef = React.useRef<HTMLTextAreaElement>(null);
  // 输入验证错误状态
  const [inputError, setInputError] = React.useState<string>('');
  
  // 临时状态变量以保持向后兼容性
  const selectedTab = 'text'; // 固定为text模式

  // 使用我们创建的 Hook 来管理状态和 API 调用
  const {
    // 状态
    prompt,
    selectedColor,
    selectedQuantity,
    selectedStyle,
    publicVisibility,
    generatedImages,
    styleSuggestions,
    styles,
    showStyleSelector,
    isGenerating,
    isInitialDataLoaded,    // 初始数据是否已加载完成
    error,
    generationProgress,

    // 用户生成历史状态
    hasGenerationHistory,

    // 操作
    setPrompt,
    setSelectedColor,
    setSelectedQuantity,
    setSelectedStyle,
    setPublicVisibility,
    setShowStyleSelector,
    generateImages,
    downloadImage,
    clearError,
    refreshStyleSuggestions,
    deleteImagesBatch,
    checkUserCredits,
    loadGeneratedImages,
  } = useGeneratePage(refreshUser);
  
  // 当AuthContext完成初始化且有用户数据时，初始化用户相关数据
  useEffect(() => {
    if (user) {
      checkUserCredits(user);
      loadGeneratedImages(user);
    } else {
      // 用户为空时，清理状态
      checkUserCredits(null);
      loadGeneratedImages(null);
    }
  }, [user, checkUserCredits, loadGeneratedImages]);


  // FAQ data for GenerateFAQ component - Text to Image mode
  const textFAQData: FAQData[] = [
    {
      question: "How do I start designing my tattoo with the AI Tattoo Generator?",
      answer: "Simply type your tattoo idea or upload an image, select your preferred style, and click \"Generate\" to see your custom tattoo design in seconds."
    },
    {
      question: "Can I choose different tattoo styles in the AI tool?",
      answer: "Yes, our AI tattoo generator offers multiple styles including traditional, realistic, minimalist, geometric, and many more to match your vision."
    },
    {
      question: "How accurate is the AR tattoo preview on my skin?",
      answer: "Our AR preview technology provides a highly realistic representation of how your tattoo will look on your skin, helping you make confident decisions."
    },
    {
      question: "Can I customize my tattoo after generating it?",
      answer: "Absolutely! You can modify colors, adjust sizes, change positioning, and fine-tune details to create your perfect tattoo design."
    },
    {
      question: "Can I use the tattoo design commercially after generating it?",
      answer: "Yes, all designs you generate are yours to use as you wish, including for commercial purposes, with full ownership rights."
    },
    {
      question: "Is there a mobile app for the AI Tattoo Generator?",
      answer: "Currently, our AI tattoo generator is web-based and fully optimized for mobile browsers, providing the same great experience across all devices."
    },
    {
      question: "Do I need design experience to use the AI tattoo generator?",
      answer: "Not at all! Our tool is designed for everyone, from complete beginners to experienced designers. Simply describe your idea and let AI do the work."
    },
    {
      question: "How long does it take to create a tattoo design?",
      answer: "Our AI generates stunning tattoo designs in just seconds. You'll see your custom design almost instantly after clicking the generate button."
    }
  ];

  // TattooIntroduction data
  const tattooIntroductionData: TattooIntroductionData = {
    sections: [
      {
        title: "Turn Your Creative into Stunning Tattoo Art",
        description: "Ever wished your tattoo vision could leap from imagination to skin-ready artwork in moments? With the AI Tattoo Generator, simply type your idea or upload an image, and watch it transform into a detailed, professional design in seconds. No long waits, no endless revisions, just instant creativity at your fingertips.",
        buttonText: "Try Now",
        onButtonClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      {
        title: "Endless Tattoo Styles, One Powerful Tool",
        description: "From fine-line minimalism to bold traditional, from hyper-realistic shading to soft watercolor effects—this AI Tattoo Generator has you covered. Experiment with Japanese dragon sleeves, tiny ankle symbols, or geometric forearm pieces. Explore, mix, and match styles until you find the design that speaks to you.",
        buttonText: "Try Now",
        onButtonClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      {
        title: "Made to Share, Ready for the Real World",
        description: "Your tattoo design shouldn't just look great on screen—it should fit your life. Download high-resolution images, post them to your social channels, or send them directly to your tattoo artist. Built-in smart cropping and preview features let you see exactly how it will look on your body before you commit.",
        buttonText: "Try Now",
        onButtonClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    ],
    images: [
      {
        images: [
          "/images/generate-introduction/row-1-1.png",
          "/images/generate-introduction/row-1-2.png", 
          "/images/generate-introduction/row-1-3.png"
        ],
        prompt: "The patterns of mechanical metal structures"
      },
      {
        images: [
          "/images/generate-introduction/row-2-1.png",
          "/images/generate-introduction/row-2-2.png",
          "/images/generate-introduction/row-2-3.png",
          "/images/generate-introduction/row-2-4.png",
          "/images/generate-introduction/row-2-5.png"
        ]
      },
      {
        images: [
          "/images/generate-introduction/row-3-1.png",
          "/images/generate-introduction/row-3-2.png",
          "/images/generate-introduction/row-3-3.png"
        ],
        prompt: "The patterns of mechanical metal structures"
      }
    ]
  };

  // HowToCreate data for tattoo generation
  const tattooHowToCreateData = {
    title: "How To Create Tattoo",
    steps: [
      {
        step: "Step 1",
        title: "Input Idea",
        description: "Type your concept or upload an image—our AI tattoo design tool starts working instantly."
      },
      {
        step: "Step 2", 
        title: "Select Style & Color",
        description: "Pick your favorite tattoo style and color, then fine-tune with tattoo customization tools."
      },
      {
        step: "Step 3",
        title: "Generate & Save", 
        description: "Click \"Generate\" to create your design, then save the image or edit it until it's perfect."
      }
    ]
  };

  // 移除了图片上传和标签页相关的逻辑，现在只支持文本生成

  // 点击外部关闭更多选项菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu) {
        const target = event.target as Element;
        if (!target.closest('.more-menu-container')) {
          setShowMoreMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  // 回填图片属性的辅助函数
  const fillImageAttributes = (imageId: string) => {
    const currentImages = generatedImages;
    const selectedImageData = currentImages.find(img => img.id === imageId);
    
    // 检查是否有URL参数，如果有则不要覆盖
    const searchParams = new URLSearchParams(window.location.search);
    const hasPromptParam = searchParams.has('prompt');
    const hasIsPublicParam = searchParams.has('isPublic');
    const hasStyleParam = searchParams.has('styleId');
    const hasColorParam = searchParams.has('isColor');
    const hasQuantityParam = searchParams.has('quantity');
    
    if (selectedImageData) {
      // 回填 prompt（仅对 text to image 有效，且没有URL参数时才回填）
      if (selectedTab === 'text' && !hasPromptParam) {
        const promptValue = getLocalizedText(selectedImageData.prompt, language);
        setPrompt(promptValue);
      }
      
      // 回填 isPublic（没有URL参数时才回填）
      if (!hasIsPublicParam) {
        setPublicVisibility(selectedImageData.isPublic);
      }

      // 回填 style（没有URL参数时才回填）
      if (!hasStyleParam) {
        const styleObj = styles.find(style => style.id === selectedImageData.styleId);
        if (styleObj) {
          setSelectedStyle(styleObj);
        } else {
          // 如果找不到对应的样式，设置为 NO Style
          setSelectedStyle(null);
        }
      }

      // 回填 color（没有URL参数时才回填）
      if (!hasColorParam) {
        setSelectedColor(selectedImageData.isColor);
      }

      // 回填 quantity（通过 batchId 判断同批次图片数量，没有URL参数时才回填）
      if (!hasQuantityParam && selectedImageData.batchId) {
        // 查找同一个 batchId 下的所有图片数量
        const batchImages = currentImages.filter(img => img.batchId === selectedImageData.batchId);
        const inferredQuantity = batchImages.length;
        
        // 只设置支持的数量值（1 或 4）
        if (inferredQuantity === 1 || inferredQuantity === 4) {
          setSelectedQuantity(inferredQuantity);
        }
      }
    }
  };

  // 简化为单一的选中图片状态
  const [currentSelectedImage, setCurrentSelectedImage] = React.useState<string | null>(null);

  // 跟踪图片数组长度变化，用于检测新生成的图片
  const prevLength = React.useRef<number>(0);

  // 标签切换时的图片选择逻辑：为每个tab记住其选中状态，同时处理新生成的图片
  useEffect(() => {
    const currentImages = generatedImages;
    // currentSelectedImage is now defined above
    const currentLength = currentImages.length;
    const previousLength = prevLength.current;
    const hasNewImage = currentLength > previousLength;
    
    // 更新长度记录
    prevLength.current = currentLength;
    
    if (currentImages.length > 0) {
      const latestImage = currentImages[0];
      let targetImageId: string | null = null;
      let shouldUpdate = false;
      
      // 决定选择哪个图片
      if (!currentSelectedImage) {
        // 如果当前tab没有记忆的选中图片，选择最新的
        targetImageId = latestImage.id;
        shouldUpdate = true;
      } else {
        // 检查记忆的图片是否还存在
        const memoryImageExists = currentImages.some(img => img.id === currentSelectedImage);
        if (!memoryImageExists) {
          // 如果记忆的图片不存在了，选择最新的
          targetImageId = latestImage.id;
          shouldUpdate = true;
        } else if (hasNewImage && currentSelectedImage !== latestImage.id) {
          // 只有在有新图片生成时，且当前选中的不是最新的，才选择最新的
          targetImageId = latestImage.id;
          shouldUpdate = true;
        } else {
          // 保持当前记忆的选择，不做改变
          targetImageId = currentSelectedImage;
          // 保持当前记忆的选择，不需要更新
          shouldUpdate = false;
        }
      }
      
      // 更新状态（只在需要时）
      if (shouldUpdate && targetImageId) {
        setCurrentSelectedImage(targetImageId);
      }
    }
  }, [selectedTab, generatedImages]);

  // 当用户选择图片时，更新选中状态
  const handleImageSelectWithTabMemory = (imageId: string) => {
    setCurrentSelectedImage(imageId);
    handleImageSelect(imageId);
  };

  // Set public visibility to true by default when component mounts
  useEffect(() => {
    setPublicVisibility(true);
  }, []);

  // 事件处理函数
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleClearPrompt = () => {
    setPrompt('');
  };

  const handleImageSelect = (imageId: string) => {
    // 如果有错误，先清除错误状态
    if (error) {
      clearError();
    }
    
    // 回填图片属性到表单
    fillImageAttributes(imageId);
  };

  const handleGenerate = async () => {
    // 1. 检查用户是否已登录
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // 2. 检查输入是否有效
    if (!(typeof prompt === 'string' ? prompt.trim() : '')) {
      // 如果prompt为空，聚焦到输入框并显示错误
      setInputError(t('prompt.required') || 'Please enter a prompt to generate coloring pages');
      setTimeout(() => {
        promptInputRef.current?.focus();
      }, 100);
      return;
    }


    // 清除错误状态
    setInputError('');

    // 3. 检查用户是否有足够积分（根据生成数量计算所需积分）
    const requiredCredits = 20 * selectedQuantity;
    if (user && user.credits < requiredCredits) {
      navigate('/price');
      return;
    }

    // 4. 执行生成逻辑
    // 清除之前的错误状态
    if (error) {
      clearError();
    }
    await generateImages();
  };

  const handleDownload = async (format: 'png' | 'pdf', imageIds?: string[]) => {
    if (imageIds && imageIds.length > 0) {
      // 批次下载多张图片
      for (const imageId of imageIds) {
        try {
          await downloadImage(imageId, format);
          // 添加短暂延迟，避免同时下载太多文件
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to download image ${imageId}:`, error);
        }
      }
    } else if (currentSelectedImage) {
      // 单张图片下载
      await downloadImage(currentSelectedImage, format);
    }
  };


  const handleStyleSuggestionClick = (styleContent: string) => {
    setPrompt(styleContent);
    // 清除输入错误状态
    if (inputError) setInputError('');
  };

  const handleRefreshStyleSuggestions = () => {
    refreshStyleSuggestions();
  };

  const handleMoreMenuToggle = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleDelete = (imageIds?: string[]) => {
    if (imageIds && imageIds.length > 0) {
      // 批次删除
      setImagesToDelete(imageIds);
      setShowMoreMenu(false);
      setShowDeleteConfirm(true);
    } else if (currentSelectedImage) {
      // 单张删除
      setImagesToDelete([currentSelectedImage]);
      setShowMoreMenu(false);
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (imagesToDelete.length > 0) {
      try {
        // 使用批量删除优化版本
        const { successIds, failedIds } = await deleteImagesBatch(imagesToDelete);
        
        // 清空删除列表
        setImagesToDelete([]);
        
        // 可选：显示删除结果
        if (failedIds.length > 0) {
          console.warn(`${failedIds.length} images failed to delete:`, failedIds);
        }
        if (successIds.length > 0) {
          console.log(`Successfully deleted ${successIds.length} images`);
        }
      } catch (error) {
        console.error('Delete images error:', error);
      }
    }
  };;

  const handleVisibilityToggle = () => {
    // Check if user is not premium (free or expired membership)
    const isNotPremium = !user?.membershipLevel || user?.membershipLevel === 'free';
    
    if (isNotPremium) {
      // Show pricing modal for free users
      setShowPricingModal(true);
      return;
    }

    // Premium users can toggle visibility for text mode
    setPublicVisibility(!publicVisibility);
  };

  return (
    <>
    <Layout>
      <SEOHead
        title={t('seo.generate.title')}
        description={t('seo.generate.description')}
        keywords={t('seo.generate.keywords')}
        ogTitle={t('seo.generate.title')}
        ogDescription={t('seo.generate.description')}
        noIndex={true}
      />

      <div className="flex flex-col bg-[#030414] relative">
        <div className="flex flex-col lg:flex-row h-[1200px] bg-[#030414] relative">
        {/* Left Sidebar - 移动端隐藏，桌面端显示 */}
        <div className="hidden lg:block w-[600px] bg-[#19191F] h-[1200px] relative rounded-r-2xl overflow-hidden">
          <GenerateLeftSidebar
            prompt={prompt}
            selectedColor={selectedColor}
            selectedQuantity={selectedQuantity}
            selectedStyle={selectedStyle}
            inputError={inputError}
            publicVisibility={publicVisibility}
            isGenerating={isGenerating}
            error={error}
            styleSuggestions={styleSuggestions}
            styles={styles}
            showStyleSelector={showStyleSelector}
            promptInputRef={promptInputRef}
            handlePromptChange={handlePromptChange}
            handleClearPrompt={handleClearPrompt}
            handleStyleSuggestionClick={handleStyleSuggestionClick}
            handleRefreshStyleSuggestions={handleRefreshStyleSuggestions}
            handleVisibilityToggle={handleVisibilityToggle}
            handleGenerate={handleGenerate}
            setSelectedColor={setSelectedColor}
            setSelectedQuantity={setSelectedQuantity}
            setSelectedStyle={setSelectedStyle}
            setInputError={setInputError}
            setShowStyleSelector={setShowStyleSelector}
          />
        </div>

        {/* 移动端主要内容区域 */}
        <div className="flex flex-col lg:hidden h-[1200px] bg-white">          
          {/* 移动端标签选择器 */}
          <div className="bg-white px-4 pb-4 border-b border-gray-200 flex-shrink-0">
            <div className="bg-[#F2F3F5] h-12 rounded-lg flex items-center relative max-w-md mx-auto">
              <div className="w-full h-10 rounded-lg bg-white mx-1"></div>
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <span className="text-[#FF5C07] font-bold text-sm">
                  {t('tabs.textToImage')}
                </span>
              </div>
            </div>
          </div>

          {/* 移动端内容 - 可滚动区域 */}
          <div ref={mobileContentRef} className="flex-1 overflow-y-auto pb-48">
            <GenerateCenterSidebar
              mode="text"
              error={error}
              currentSelectedImage={currentSelectedImage}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              generatedImages={generatedImages}
              hasGenerationHistory={hasGenerationHistory}
              isInitialDataLoaded={isInitialDataLoaded}
              dynamicImageDimensions={dynamicImageDimensions}
              setDynamicImageDimensions={setDynamicImageDimensions}
              showMoreMenu={showMoreMenu}
              onDownload={handleDownload}
              onMoreMenuToggle={handleMoreMenuToggle}
              onDelete={handleDelete}
              onImageSelect={handleImageSelectWithTabMemory}
            />
            
            {/* 移动端控制面板 */}
            <div className="bg-[#19191F] p-4">
              <GenerateLeftSidebar
                prompt={prompt}
                selectedColor={selectedColor}
                selectedQuantity={selectedQuantity}
                selectedStyle={selectedStyle}
                inputError={inputError}
                publicVisibility={publicVisibility}
                isGenerating={isGenerating}
                error={error}
                styleSuggestions={styleSuggestions}
                styles={styles}
                showStyleSelector={showStyleSelector}
                promptInputRef={promptInputRef}
                handlePromptChange={handlePromptChange}
                handleClearPrompt={handleClearPrompt}
                handleStyleSuggestionClick={handleStyleSuggestionClick}
                handleRefreshStyleSuggestions={handleRefreshStyleSuggestions}
                handleVisibilityToggle={handleVisibilityToggle}
                handleGenerate={handleGenerate}
                setSelectedColor={setSelectedColor}
                setSelectedQuantity={setSelectedQuantity}
                setSelectedStyle={setSelectedStyle}
                setInputError={setInputError}
                setShowStyleSelector={setShowStyleSelector}
              />
              
              {/* Public Visibility - Mobile */}
              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm font-bold text-[#161616] flex items-center">
                  {t('settings.visibility')}
                  <Tooltip 
                    content={t('settings.visibilityTip')}
                    side="top"
                    align="start"
                    className="ml-1"
                  >
                    <span className="w-4 h-4 cursor-help inline-block">
                      <img src={tipIcon} alt="Info" className="w-4 h-4" />
                    </span>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                  <Tooltip
                    content="Premium Feature"
                    side="top"
                    align="center"
                    className="mr-2"
                  >
                    <span className="w-4 h-4 cursor-help inline-block">
                      <img src={crownIcon} alt="Premium" className="w-4 h-4" />
                    </span>
                  </Tooltip>
                  <button
                    className={`w-[30px] h-4 rounded-lg relative ${
                      publicVisibility ? 'bg-lime-300' : 'bg-gray-300'
                    } cursor-pointer`}
                    onClick={() => handleVisibilityToggle()}
                  >
                    <div
                      className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 ${
                        publicVisibility ? 'right-[1px]' : 'left-[1px]'
                      }`}
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 移动端生成按钮 - 固定在底部 */}
          <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#19191F] p-4 z-50">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full h-12 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isGenerating
                  ? 'bg-[#F2F3F5] text-[#A4A4A4] cursor-not-allowed'
                  : 'bg-[#FF5C07] text-white hover:bg-[#FF7A47]'
                }`}
            >
              <img
                src={isGenerating
                  ? subtractIcon
                  : subtractColorIcon
                }
                alt="Subtract"
                className="w-5 h-5 mr-1"
              />
              <span className="font-bold text-lg">{20 * selectedQuantity}</span>
              <span className="font-bold text-lg">
                {isGenerating ? t('generating.title') : 
                 error ? t('actions.regenerate') :
                 t('actions.generate')}
              </span>
            </button>
          </div>
        </div>

        {/* 桌面端中间内容区域 */}
        <div className="hidden lg:flex lg:flex-1 lg:h-[1200px]">
          <GenerateCenterSidebar
            mode="text"
            error={error}
            currentSelectedImage={currentSelectedImage}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            generatedImages={generatedImages}
            hasGenerationHistory={hasGenerationHistory}
            isInitialDataLoaded={isInitialDataLoaded}
            dynamicImageDimensions={dynamicImageDimensions}
            setDynamicImageDimensions={setDynamicImageDimensions}
            showMoreMenu={showMoreMenu}
            onDownload={handleDownload}
            onMoreMenuToggle={handleMoreMenuToggle}
            onDelete={handleDelete}
            onImageSelect={handleImageSelectWithTabMemory}
          />
        </div>

        {/* Right Sidebar - Generated Images - 桌面端显示 */}
        <div className="hidden lg:block">
          <GenerateRightSidebar
            images={generatedImages}
            selectedImageId={currentSelectedImage}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            isInitialDataLoaded={isInitialDataLoaded}
            error={error}
            dynamicImageDimensions={dynamicImageDimensions}
            setDynamicImageDimensions={setDynamicImageDimensions}
            onImageSelect={handleImageSelectWithTabMemory}
          />
        </div>

        </div>
      </div>

      {/* TextToColoringPage and WhyChoose components - Full width below main layout */}
      <div className="w-full bg-[#030414]">
          {/* TattooIntroduction component */}
          <TattooIntroduction data={tattooIntroductionData} />

          {/* HowToCreate component */}
          <div className="flex justify-center py-12 bg-[#030414]">
            <HowToCreate 
              title={tattooHowToCreateData.title}
              steps={tattooHowToCreateData.steps}
            />
          </div>

          {/* GenerateFAQ component */}
          <div className="pt-8 lg:pt-12 bg-[#030414]">
            <GenerateFAQ faqData={textFAQData} />
          </div>

          {/* TryNow component */}
          <TryNow
            title={t('tryNow.text.title')}
            description={t('tryNow.text.description')}
            buttonText={t('tryNow.text.buttonText')}
            onButtonClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        </div>

      {/* 删除确认对话框 */}
      <DeleteImageConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
      />
    </Layout>

    {/* Full Screen Pricing Interface - Outside Layout */}
    {showPricingModal && (
      <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out" style={{ overscrollBehavior: 'contain' }}>
        {/* Close Button */}
        <button
          onClick={() => setShowPricingModal(false)}
          className="fixed top-4 right-4 w-12 h-12 text-[#6B7280] hover:text-[#161616] transition-all duration-200 z-[10000] bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl border border-gray-200"
        >
          <svg className="w-6 h-6" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
          </svg>
        </button>
        
        {/* Full Screen Pricing Section */}
        <PricingSection 
          showTitle={true}
          showFAQ={true}
          showCTA={true}
        />
      </div>
    )}
    </>
  );
};

export default GeneratePage;