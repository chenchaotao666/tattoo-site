import Layout from '../components/layout/Layout';
import HomeTop from '../components/home/HomeTop';
import CategoryGrid from '../components/categories/CategoryGrid';
import { Button } from '../components/ui/Button';
import HowToCreate from '../components/common/HowToCreate';
import GenerateFAQ, { FAQData } from '../components/common/GenerateFAQ';
import TryNow from '../components/common/TryNow';
import TattooIntroduction, { TattooIntroductionData } from '../components/common/TattooIntroduction';
import CreateOnGo, { CreateOnGoData } from '../components/home/CreateOnGo';
import WhatUserSaying, { sampleWhatUserSayingData } from '../components/home/WhatUserSaying';
import PricingSection from '../components/price/PricingSection';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { ImageService } from '../services/imageService';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Category } from '../services/categoriesService';
import { useCategories } from '../contexts/CategoriesContext';
import { getCategoryNameById } from '../utils/categoryUtils';
import { navigateWithLanguage } from '../utils/navigationUtils';

const HomePage = () => {
  const { loading, t } = useAsyncTranslation('home');
  const { t: tCommon } = useAsyncTranslation('common');
  const [imageCount, setImageCount] = useState<number>(0); // 默认值
  const { categories, loading: isLoading } = useCategories(imageCount);
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    // 使用映射表获取SEO友好的名称
    const categoryPath = getCategoryNameById(category.id);
    navigateWithLanguage(navigate, `/categories/${categoryPath}`);
  };

  // FAQ 数据
  const homeFAQData: FAQData[] = [
    {
      question: "How does the AI Tattoo Generator work?",
      answer: "Type your tattoo idea or upload an image, choose a style, and the AI creates a realistic design you can preview and download instantly."
    },
    {
      question: "What tattoo design styles are available?",
      answer: "Choose from minimal line art, traditional, watercolor, geometric, hyper-realistic, and more—so your tattoo matches your vision."
    },
    {
      question: "How accurate is the AI Tattoo Generator skin preview?",
      answer: "Our AR and photo preview tools give a near-real look at placement, size, and color before you commit."
    },
    {
      question: "Can I use AI Tattoo Generator designs commercially?",
      answer: "Yes, for personal or commercial purposes. We recommend confirming technical feasibility with your tattoo artist."
    },
    {
      question: "Is there a mobile app version?",
      answer: "Yes. The AI Tattoo Generator app for iOS and Android lets you design, preview, and save tattoos anytime."
    },
    {
      question: "Can I edit or refine the AI tattoo design?",
      answer: "Absolutely—tweak style, details, and placement until it's perfect."
    }
  ];

  const createOnGoData: CreateOnGoData = {
    title: "Create On the Go",
    description: "Bring your creativity anywhere with our iOS and Android app. Design, explore, and preview tattoos whether you're at home, in the studio, or on the move.",
    appStore: {
      text1: "Download on the",
      text2: "App Store"
    },
    googlePlay: {
      text1: "GET IT ON",
      text2: "Google Play"
    },
    phoneImages: [
      "/images/home-create-on-go/ai-create.png",
      "/images/home-create-on-go/inspiration.png",
      "/images/home-create-on-go/try-on.png"
    ],
    features: [
      {
        title: "Design Instantly",
        description: "Create stunning tattoos in seconds with AI precision . Just type your idea.",
        icon: "/images/home-create-on-go/logo.svg"
      },
      {
        title: "Inspire Creativity",
        description: "Explore a curated library of AI tattoo ideas to spark fresh designs.",
        icon: "/images/home-create-on-go/tattoo.svg"
      },
      {
        title: "Preview with Confidence",
        description: "Use AR to see your tattoo on skin before committing.",
        icon: "/images/home-create-on-go/four-leaf.svg"
      }
    ]
  };

  const tattooIntroductionData: TattooIntroductionData = {
    sections: [
      {
        title: "Hyper-Realistic AI Tattoo Designs",
        description: "Create tattoos that look hand-crafted by a professional artist. Whether minimalist lines or intricate patterns, our AI Tattoo Generator ensures lifelike details in every design, so it feels ready for inking.",
        buttonText: "Try Now",
        onButtonClick: () => window.location.href = "/create"
      },
      {
        title: "Endless AI Tattoo Ideas",
        description: "Out of inspiration? Type any keyword or theme, and our AI Tattoo Generator instantly gives you fresh, unique tattoo designs. Explore new styles, discover unexpected combinations, and find the perfect concept for your next piece.",
        buttonText: "Try Now",
        onButtonClick: () => window.location.href = "/create"
      },
      {
        title: "AI Tattoo Skin Preview Tool",
        description: "Preview your tattoo on your skin with AR or photo. See placement, size, and color in seconds—making sure you're 100% confident before the real ink touches your skin.",
        buttonText: "Try Now",
        onButtonClick: () => window.location.href = "/create"
      }
    ],
    images: [
      {
        images: [
          "/images/home-introduction/row-1-1.png",
          "/images/home-introduction/row-1-2.png",
          "/images/home-introduction/row-1-3.png"
        ],
        prompt: "A terrifying tattoo, with a skull and horns combined"
      },
      {
        images: [
          "/images/home-introduction/row-2-1.png",
          "/images/home-introduction/row-2-2.png", 
          "/images/home-introduction/row-2-3.png",
          "/images/home-introduction/row-2-4.png",
          "/images/home-introduction/row-2-5.png"
        ]
      },
      {
        images: [
          "/images/home-introduction/row-3-1.png",
          "/images/home-introduction/row-3-2.png"
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
        noIndex={true}
      />
      <Layout>
        <div className="w-full min-w-0">
          <div className="bg-[#030414]">
            <HomeTop tattooCount={imageCount}/>
          </div>
          <div className="w-full bg-[#030414] pb-12 sm:pb-16 md:pb-20 lg:pb-[5rem] pt-12 sm:pt-16 md:pt-20 lg:pt-[5rem]">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-[48px] px-4 sm:px-0 max-w-[1200px] mx-auto">
                <div className="text-center text-[#E6E6E6] text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[46px] font-bold font-inter capitalize break-words">
                  Draw inspiration from tattoo designs
                </div>
                <div className="max-w-[1100px] mx-auto mt-8 text-center text-[#A5A5A5] text-sm sm:text-base md:text-lg font-inter font-normal break-words">
                  Discover what Tattooink.ai can create for you. Each design is uniquely crafted for our users based on their ideas.
                </div>
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
            <WhatUserSaying data={sampleWhatUserSayingData} />
          </div>
          <div className="bg-[#030414] flex justify-center py-16 lg:py-20">
            <HowToCreate 
              title="Your Tattoo in 3 Steps"
              steps={[
                {
                  step: "Step 1",
                  title: "Describe Your Tattoo Idea",
                  description: "Type your concept (abstract or detailed) and let AI start creating."
                },
                {
                  step: "Step 2",
                  title: "Customize Your AI Tattoo Style",
                  description: "Pick from multiple styles, tweak details, or upload a photo to preview on skin."
                },
                {
                  step: "Step 3",
                  title: "Save Your AI Tattoo Design",
                  description: "See it in lifelike detail, make final adjustments, then download your masterpiece."
                }
              ]}
            />
          </div>
          <PricingSection showTitle={true} />
          <div className="bg-[#030414] flex justify-center py-16 lg:py-20">
            <GenerateFAQ 
              faqData={homeFAQData} 
              title="Frequently Asked Questions"
            />
          </div>
          <TryNow
            title={t('cta.title')}
            description={t('cta.description')}
            buttonText={t('cta.tryNow')}
            buttonLink="/create"
          />
        </div>
      </Layout>
    </div>
  );
};

export default HomePage; 