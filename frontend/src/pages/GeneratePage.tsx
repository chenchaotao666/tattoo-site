import React, { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import useGeneratePage from '../hooks/useGeneratePage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getLocalizedText } from '../utils/textUtils';
import CloseButton from '../components/ui/CloseButton';
import HowToCreate from '../components/common/HowToCreate';
import GenerateFAQ, { FAQData } from '../components/common/GenerateFAQ';
import TryNow from '../components/common/TryNow';
import TattooIntroduction, { TattooIntroductionData } from '../components/common/TattooIntroduction';
import PricingSection from '../components/price/PricingSection';
import GenerateRightSidebar from '../components/generate/GenerateRightSidebar';
import GenerateLeftSidebar from '../components/generate/GenerateLeftSidebar';
import GenerateCenterSidebar from '../components/generate/GenerateCenterSidebar';
import LoginModal from '../components/auth/LoginModal';

import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation, useLanguage } from '../contexts/LanguageContext';

const GeneratePage: React.FC = () => {
  // 获取语言和翻译函数
  const { language } = useLanguage();
  const { t } = useAsyncTranslation('generate');


  // 获取用户认证状态和刷新函数
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  
  // 获取Toast函数
  const { showErrorToast, showSuccessToast } = useToast();
  
  // 状态：存储动态获取的图片尺寸（用于Text to Image和Image to Image模式）
  const [dynamicImageDimensions, setDynamicImageDimensions] = React.useState<{ [key: string]: { width: number; height: number } }>({});

  // 控制更多选项菜单的显示
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  
  // 存储已通过MoreMenu删除的图片ID，用于过滤显示
  const [deletedImageIds, setDeletedImageIds] = React.useState<string[]>([]);

  // 控制定价弹窗的显示
  const [showPricingModal, setShowPricingModal] = React.useState(false);

  // 控制登录弹窗的显示
  const [showLoginModal, setShowLoginModal] = React.useState(false);

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
    ideaSuggestions,
    styles,
    showStyleSelector,
    currentSelectedImage,
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
    setCurrentSelectedImage,
    generateImages,
    downloadImage,
    clearError,
    refreshIdeaSuggestions,
    checkUserCredits,
    loadGeneratedImages,
  } = useGeneratePage(refreshUser, setShowPricingModal, showSuccessToast);

  // 过滤掉已删除的图片
  const filteredGeneratedImages = React.useMemo(() => {
    return generatedImages.filter(img => !deletedImageIds.includes(img.id));
  }, [generatedImages, deletedImageIds]);
  
  // 当AuthContext完成初始化时，根据用户状态初始化相关数据
  useEffect(() => {
    // 只有在认证状态加载完成后才执行逻辑
    if (!isLoading) {
      if (user) {
        checkUserCredits(user);
        loadGeneratedImages(user);
      } else {
        // 确认用户未登录时，清理状态
        checkUserCredits(null);
        loadGeneratedImages(null);
      }
    }
  }, [user, isLoading, checkUserCredits, loadGeneratedImages]);

  // 监听error变化，显示Toast提示
  useEffect(() => {
    if (error) {
      showErrorToast(error);
      // 可选：清除错误状态，避免重复显示
      clearError();
    }
  }, [error, showErrorToast, clearError]);

  // FAQ data for GenerateFAQ component - Text to Image mode
  const textFAQData: FAQData[] = [
    {
      question: t('faq.questions.howToStart.question'),
      answer: t('faq.questions.howToStart.answer')
    },
    {
      question: t('faq.questions.styles.question'),
      answer: t('faq.questions.styles.answer')
    },
    {
      question: t('faq.questions.arPreview.question'),
      answer: t('faq.questions.arPreview.answer')
    },
    {
      question: t('faq.questions.customize.question'),
      answer: t('faq.questions.customize.answer')
    },
    {
      question: t('faq.questions.commercial.question'),
      answer: t('faq.questions.commercial.answer')
    },
    {
      question: t('faq.questions.mobileApp.question'),
      answer: t('faq.questions.mobileApp.answer')
    },
    {
      question: t('faq.questions.experience.question'),
      answer: t('faq.questions.experience.answer')
    },
    {
      question: t('faq.questions.speed.question'),
      answer: t('faq.questions.speed.answer')
    }
  ];

  // TattooIntroduction data
  const tattooIntroductionData: TattooIntroductionData = {
    sections: [
      {
        title: t('tattooIntroduction.section1.title', 'Turn Your Creative into Stunning Tattoo Art'),
        description: t('tattooIntroduction.section1.description', 'Ever wished your tattoo vision could leap from imagination to skin-ready artwork in moments? With the AI Tattoo Generator, simply type your idea or upload an image, and watch it transform into a detailed, professional design in seconds.'),
        buttonText: t('tattooIntroduction.section1.buttonText', 'Try Now'),
        onButtonClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      {
        title: t('tattooIntroduction.section2.title', 'Endless Tattoo Styles, One Powerful Tool'),
        description: t('tattooIntroduction.section2.description', 'From fine-line minimalism to bold traditional, from hyper-realistic shading to soft watercolor effects—this AI Tattoo Generator has you covered.'),
        buttonText: t('tattooIntroduction.section2.buttonText', 'Try Now'),
        onButtonClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      {
        title: t('tattooIntroduction.section3.title', 'Made to Share, Ready for the Real World'),
        description: t('tattooIntroduction.section3.description', 'Your tattoo design shouldn\'t just look great on screen—it should fit your life. Download high-resolution images, post them to your social channels, or send them directly to your tattoo artist.'),
        buttonText: t('tattooIntroduction.section3.buttonText', 'Try Now'),
        onButtonClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    ],
    images: [
      {
        images: [
          "/imgs/generate-introduction/row-1-1.png",
          "/imgs/generate-introduction/row-1-2.png", 
          "/imgs/generate-introduction/row-1-3.png"
        ],
        prompt: t('tattooIntroduction.examples.example1')
      },
      {
        images: [
          "/imgs/generate-introduction/row-2-1.png",
          "/imgs/generate-introduction/row-2-2.png",
          "/imgs/generate-introduction/row-2-3.png",
          "/imgs/generate-introduction/row-2-4.png",
          "/imgs/generate-introduction/row-2-5.png"
        ]
      },
      {
        images: [
          "/imgs/generate-introduction/row-3-1.png",
          "/imgs/generate-introduction/row-3-2.png",
          "/imgs/generate-introduction/row-3-3.png"
        ],
        prompt: t('tattooIntroduction.examples.example1')
      }
    ]
  };

  // HowToCreate data for tattoo generation
  const tattooHowToCreateData = {
    title: t('howToCreate.title'),
    steps: [
      {
        step: t('howToCreate.step1.step'),
        title: t('howToCreate.step1.title'),
        description: t('howToCreate.step1.description')
      },
      {
        step: t('howToCreate.step2.step'),
        title: t('howToCreate.step2.title'),
        description: t('howToCreate.step2.description')
      },
      {
        step: t('howToCreate.step3.step'),
        title: t('howToCreate.step3.title'),
        description: t('howToCreate.step3.description')
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
    const currentImages = filteredGeneratedImages;
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


  // 跟踪图片数组长度变化，用于检测新生成的图片
  const prevLength = React.useRef<number>(0);

  // 标签切换时的图片选择逻辑：为每个tab记住其选中状态，同时处理新生成的图片
  useEffect(() => {
    const currentImages = filteredGeneratedImages;
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
  }, [selectedTab, filteredGeneratedImages]);

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
      setShowLoginModal(true);
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

    // 4. 执行生成逻辑
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

  const handleRefreshIdeaSuggestions = () => {
    refreshIdeaSuggestions();
  };

  // MoreMenu删除成功后的回调，直接更新本地状态
  const handleImagesDeleted = React.useCallback((deletedIds: string[]) => {
    // 将删除的图片ID添加到过滤列表中
    setDeletedImageIds(prev => [...prev, ...deletedIds]);
  }, []);

  const handleVisibilityToggle = () => {
    // Check if user is not premium (free or expired membership)
    const isNotPremium = !user?.level || user?.level === 'free';
    
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
        canonicalUrl={`${window.location.origin}/create`}
      />

      <div className="flex flex-col bg-[#030414] relative">
        {/* 桌面端布局 */}
        <div className="hidden lg:flex lg:flex-row bg-[#030414] relative">
        {/* Left Sidebar - 桌面端显示 */}
        <div className="w-[600px] bg-[#19191F] h-[calc(100vh-70px)] relative rounded-r-2xl overflow-hidden">
          <GenerateLeftSidebar
            prompt={prompt}
            selectedColor={selectedColor}
            selectedQuantity={selectedQuantity}
            selectedStyle={selectedStyle}
            inputError={inputError}
            publicVisibility={publicVisibility}
            isGenerating={isGenerating}
            error={error}
            ideaSuggestions={ideaSuggestions}
            styles={styles}
            showStyleSelector={showStyleSelector}
            user={user}
            setShowPricingModal={setShowPricingModal}
            promptInputRef={promptInputRef}
            handlePromptChange={handlePromptChange}
            handleClearPrompt={handleClearPrompt}
            handleStyleSuggestionClick={handleStyleSuggestionClick}
            handleRefreshIdeaSuggestions={handleRefreshIdeaSuggestions}
            handleVisibilityToggle={handleVisibilityToggle}
            handleGenerate={handleGenerate}
            setSelectedColor={setSelectedColor}
            setSelectedQuantity={setSelectedQuantity}
            setSelectedStyle={setSelectedStyle}
            setInputError={setInputError}
            setShowStyleSelector={setShowStyleSelector}
          />
        </div>

        {/* 桌面端中间内容区域 */}
        <div className="flex-1 h-[calc(100vh-70px)]">
          <GenerateCenterSidebar
            mode="text"
            error={error}
            currentSelectedImage={currentSelectedImage}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            generatedImages={filteredGeneratedImages}
            hasGenerationHistory={hasGenerationHistory}
            isInitialDataLoaded={isInitialDataLoaded}
            dynamicImageDimensions={dynamicImageDimensions}
            setDynamicImageDimensions={setDynamicImageDimensions}
            onDownload={handleDownload}
            onImagesDeleted={handleImagesDeleted}
            onImageSelect={handleImageSelectWithTabMemory}
          />
        </div>

        {/* Right Sidebar - Generated Images - 桌面端显示 */}
        <div className="h-[calc(100vh-70px)]">
          <GenerateRightSidebar
            images={filteredGeneratedImages}
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

        {/* 手机端布局 */}
        <div className="lg:hidden bg-[#030414] min-h-screen">
          <div className="max-w-lg mx-auto px-4 py-6">
            {/* 手机端左侧栏内容 - 输入控制区 */}
            <div className="bg-[#19191F] rounded-2xl p-4 mb-6">
              <GenerateLeftSidebar
                prompt={prompt}
                selectedColor={selectedColor}
                selectedQuantity={selectedQuantity}
                selectedStyle={selectedStyle}
                inputError={inputError}
                publicVisibility={publicVisibility}
                isGenerating={isGenerating}
                error={error}
                ideaSuggestions={ideaSuggestions}
                styles={styles}
                showStyleSelector={showStyleSelector}
                user={user}
                setShowPricingModal={setShowPricingModal}
                promptInputRef={promptInputRef}
                handlePromptChange={handlePromptChange}
                handleClearPrompt={handleClearPrompt}
                handleStyleSuggestionClick={handleStyleSuggestionClick}
                handleRefreshIdeaSuggestions={handleRefreshIdeaSuggestions}
                handleVisibilityToggle={handleVisibilityToggle}
                handleGenerate={handleGenerate}
                setSelectedColor={setSelectedColor}
                setSelectedQuantity={setSelectedQuantity}
                setSelectedStyle={setSelectedStyle}
                setInputError={setInputError}
                setShowStyleSelector={setShowStyleSelector}
              />
            </div>

            {/* 手机端中间内容区域 - 主要显示区（包含历史图片） */}
            <div className="mb-6 bg-[#030414] rounded-2xl overflow-hidden">
              <GenerateCenterSidebar
                mode="text"
                error={error}
                currentSelectedImage={currentSelectedImage}
                isGenerating={isGenerating}
                generationProgress={generationProgress}
                generatedImages={filteredGeneratedImages}
                hasGenerationHistory={hasGenerationHistory}
                isInitialDataLoaded={isInitialDataLoaded}
                dynamicImageDimensions={dynamicImageDimensions}
                setDynamicImageDimensions={setDynamicImageDimensions}
                onDownload={handleDownload}
                onImagesDeleted={handleImagesDeleted}
                onImageSelect={handleImageSelectWithTabMemory}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TextToColoringPage and WhyChoose components - Full width below main layout */}
      <div className="w-full bg-[#030414]">
          {/* TattooIntroduction component */}
          <div className="px-4 sm:px-6 lg:px-8">
            <TattooIntroduction data={tattooIntroductionData} />
          </div>

          {/* HowToCreate component */}
          <div className="flex justify-center py-10 lg:py-20 bg-[#030414] px-4 sm:px-6 lg:px-8">
            <HowToCreate
              title={tattooHowToCreateData.title}
              steps={tattooHowToCreateData.steps}
            />
          </div>

          {/* GenerateFAQ component */}
          <div className="py-10 lg:py-20 bg-[#030414] px-4 sm:px-6 lg:px-8">
            <GenerateFAQ faqData={textFAQData} title={t('faq.title')}/>
          </div>

          {/* TryNow component */}
          <div className="px-4 sm:px-6 lg:px-8">
            <TryNow
              title={t('cta.title')}
              description={t('cta.description')}
              buttonText={t('cta.buttonText')}
              onButtonClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>
        </div>
    </Layout>

    {/* Full Screen Pricing Interface - Outside Layout */}
    {showPricingModal && (
      <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out" style={{ overscrollBehavior: 'contain' }}>
        {/* Close Button */}
        <div className="relative">
          <CloseButton onClick={() => setShowPricingModal(false)} />
        </div>

        {/* Full Screen Pricing Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <PricingSection
            showTitle={true}
            showFAQ={true}
            showCTA={true}
            titleH1={false}
          />
        </div>
      </div>
    )}

    {/* Login Modal */}
    <LoginModal
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      onSuccess={() => {
        setShowLoginModal(false);
        // 登录成功后继续执行生成操作
        handleGenerate();
      }}
    />
    </>
  );
};

export default GeneratePage;