import Layout from '../components/layout/Layout';
import HomeTop from '../components/home/HomeTop';
import CategoryGrid from '../components/categories/CategoryGrid';
import HowToCreate from '../components/common/HowToCreate';
import GenerateFAQ, { FAQData } from '../components/common/GenerateFAQ';
import TryNow from '../components/common/TryNow';
import TattooIntroduction, { TattooIntroductionData } from '../components/common/TattooIntroduction';
import CreateOnGo, { CreateOnGoData } from '../components/home/CreateOnGo';
import WhatUserSaying, { sampleWhatUserSayingData, WhatUserSayingData } from '../components/home/WhatUserSaying';
import PricingSection from '../components/price/PricingSection';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { ImageService } from '../services/imageService';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Category } from '../services/categoriesService';
import { useCategories } from '../contexts/CategoriesContext';
import { getCategoryPathById } from '../utils/categoryUtils';
import { navigateWithLanguage, createLanguageAwarePath } from '../utils/navigationUtils';

const HomePage = () => {
  const { loading, t } = useAsyncTranslation('home');
  const { t: tCommon } = useAsyncTranslation('common');
  const [imageCount, setImageCount] = useState<number>(0); // 默认值
  const { categories, loading: isLoading } = useCategories(imageCount);
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    // 使用映射表获取SEO友好的名称
    const categoryPath = getCategoryPathById(category.id);
    navigateWithLanguage(navigate, `/categories/${categoryPath}`);
  };

  // FAQ 数据
  const homeFAQData: FAQData[] = [
    {
      question: t('faq.questions.howItWorks.question'),
      answer: t('faq.questions.howItWorks.answer')
    },
    {
      question: t('faq.questions.styles.question'),
      answer: t('faq.questions.styles.answer')
    },
    {
      question: t('faq.questions.preview.question'),
      answer: t('faq.questions.preview.answer')
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
      question: t('faq.questions.editing.question'),
      answer: t('faq.questions.editing.answer')
    }
  ];

  const createOnGoData: CreateOnGoData = {
    title: t('createOnGo.title'),
    description: t('createOnGo.description'),
    appStore: {
      text1: t('createOnGo.appStore.text1'),
      text2: t('createOnGo.appStore.text2')
    },
    googlePlay: {
      text1: t('createOnGo.googlePlay.text1'),
      text2: t('createOnGo.googlePlay.text2')
    },
    phoneImages: [
      "/imgs/home-create-on-go/ai-create.png",
      "/imgs/home-create-on-go/inspiration.png",
      "/imgs/home-create-on-go/try-on.png"
    ],
    features: [
      {
        title: t('createOnGo.features.feature1.title'),
        description: t('createOnGo.features.feature1.description'),
        icon: "/imgs/home-create-on-go/logo.svg"
      },
      {
        title: t('createOnGo.features.feature2.title'),
        description: t('createOnGo.features.feature2.description'),
        icon: "/imgs/home-create-on-go/tattoo.svg"
      },
      {
        title: t('createOnGo.features.feature3.title'),
        description: t('createOnGo.features.feature3.description'),
        icon: "/imgs/home-create-on-go/four-leaf.svg"
      }
    ]
  };

  const whatUserSayingData: WhatUserSayingData = {
    title: t('whatUserSaying.title'),
    subtitle: t('whatUserSaying.subtitle'),
    testimonials: sampleWhatUserSayingData.testimonials
  };

  const tattooIntroductionData: TattooIntroductionData = {
    sections: [
      {
        title: t('tattooIntroduction.section1.title'),
        description: t('tattooIntroduction.section1.description'),
        buttonText: t('tattooIntroduction.section1.buttonText'),
        onButtonClick: () => window.location.href = "/create"
      },
      {
        title: t('tattooIntroduction.section2.title'),
        description: t('tattooIntroduction.section2.description'),
        buttonText: t('tattooIntroduction.section2.buttonText'),
        onButtonClick: () => window.location.href = "/create"
      },
      {
        title: t('tattooIntroduction.section3.title'),
        description: t('tattooIntroduction.section3.description'),
        buttonText: t('tattooIntroduction.section3.buttonText'),
        onButtonClick: () => window.location.href = "/create"
      }
    ],
    images: [
      {
        images: [
          "/imgs/home-introduction/row-1-1.png",
          "/imgs/home-introduction/row-1-2.png",
          "/imgs/home-introduction/row-1-3.png"
        ],
        prompt: t('tattooIntroduction.examples.example1')
      },
      {
        images: [
          "/imgs/home-introduction/row-2-1.png",
          "/imgs/home-introduction/row-2-2.png", 
          "/imgs/home-introduction/row-2-3.png",
          "/imgs/home-introduction/row-2-4.png",
          "/imgs/home-introduction/row-2-5.png"
        ]
      },
      {
        images: [
          "/imgs/home-introduction/row-3-1.png",
          "/imgs/home-introduction/row-3-2.png"
        ],
        twoImageMode: true
      }
    ]
  };
  
  // 获取图片总数
  useEffect(() => {
    const fetchImageCount = async () => {
      try {
        const count = await ImageService.getImageCount();
        setImageCount(count);
      } catch (error) {
        console.error('Failed to fetch image count:', error);
        // 保持默认值1281
      }
    };
    
    fetchImageCount();
  }, []);
  
  // 如果翻译还在加载中，不显示任何内容
  if (loading) {
    return (
      <div className="bg-white min-w-0 overflow-hidden">
        <Layout>
          <div className="w-full min-w-0 flex items-center justify-center min-h-[400px]">
            {/* 加载时不显示任何内容 */}
          </div>
        </Layout>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-w-0 overflow-hidden">
      <SEOHead
        title={tCommon('seo.home.title')}
        description={tCommon('seo.home.description')}
        keywords={tCommon('seo.home.keywords')}
        ogTitle={tCommon('seo.home.title')}
        ogDescription={tCommon('seo.home.description')}
        canonicalUrl={`${window.location.origin}/`}
      />
      <Layout>
        <div className="w-full min-w-0">
          <div className="bg-[#030414]">
            <HomeTop tattooCount={imageCount}/>
          </div>
          <div className="w-full bg-[#030414] pb-12 sm:pb-16 md:pb-20 lg:pb-[5rem] pt-12 sm:pt-16 md:pt-20 lg:pt-[5rem]">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-[48px] px-4 sm:px-0 max-w-[1200px] mx-auto">
                <h2 className="text-center text-[#E6E6E6] text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[46px] font-bold font-inter capitalize break-words">
                  {t('categoryGrid.title')}
                </h2>
                <h3 className="max-w-[1100px] mx-auto mt-8 text-center text-[#A5A5A5] text-sm sm:text-base md:text-lg font-inter font-normal break-words">
                  {t('categoryGrid.subtitle')}
                </h3>
              </div>
              
              <CategoryGrid 
                categories={categories}
                isLoading={isLoading}
                onCategoryClick={handleCategoryClick}
                showNameAndButton={false}
                showMore={true}
              />
            </div>
          </div>
          <TattooIntroduction data={tattooIntroductionData} />
          <div className="bg-[#030414] flex justify-center py-16 lg:py-20">
            <CreateOnGo data={createOnGoData} />
          </div>
          <div className="bg-[#030414] flex justify-center py-16 lg:py-20">
            <WhatUserSaying data={whatUserSayingData} />
          </div>
          <div className="bg-[#030414] flex justify-center py-16 lg:py-20">
            <HowToCreate
              title={t('howToCreate.title')}
              steps={[
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
              ]}
            />
          </div>
          <PricingSection showTitle={true} titleH1={false}/>
          <div className="bg-[#030414] flex justify-center py-16 lg:py-20">
            <GenerateFAQ
              faqData={homeFAQData}
              title={t('faq.title')}
            />
          </div>
          <TryNow
            title={t('cta.title')}
            description={t('cta.description')}
            buttonText={t('cta.tryNow')}
            buttonLink={createLanguageAwarePath("/create")}
          />
        </div>
      </Layout>
    </div>
  );
};

export default HomePage; 