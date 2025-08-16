import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import useGeneratePage from '../hooks/useGeneratePage';
import { useAuth } from '../contexts/AuthContext';
import { getLocalizedText } from '../utils/textUtils';
import DeleteImageConfirmDialog from '../components/ui/DeleteImageConfirmDialog';
import Tooltip from '../components/ui/Tooltip';
import ColoringPageTool, { ColoringPageToolData } from '../components/common/ColoringPageTool';
import WhyChoose, { WhyChooseData } from '../components/common/WhyChoose';
import CanCreate, { CanCreateData } from '../components/common/CanCreate';
import HowToCreate, { HowToCreateData } from '../components/common/HowToCreate';
import UserSaying, { TestimonialItem } from '../components/common/UserSaying';
import GenerateFAQ, { FAQData } from '../components/common/GenerateFAQ';
import TryNow from '../components/common/TryNow';
import { ColoringPageConversionData } from '../components/common/ColoringPageConversion';
import PricingSection from '../components/common/PricingSection';
import GenerateRightSidebar from '../components/generate/GenerateRightSidebar';
import GenerateLeftSidebar from '../components/generate/GenerateLeftSidebar';
import GenerateCenterSidebar from '../components/generate/GenerateCenterSidebar';

import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation, useLanguage } from '../contexts/LanguageContext';

// 移动端还需要的图标
const tipIcon = '/images/tip.svg';
const crownIcon = '/images/generate/crown.svg';
const subtractColorIcon = '/images/generate/subtract-color.svg';
const subtractIcon = '/images/generate/generate-star.png';


const GeneratePage: React.FC = () => {
  // 获取翻译函数
  const { t } = useAsyncTranslation('generate');
  const { language } = useLanguage();

  // Sample testimonials data for text mode (moved from UserSaying.text.ts)
  const sampleTestimonials: TestimonialItem[] = [
    {
      id: '1',
      name: 'Chantal Allison',
      date: 'Nov 18, 2024',
      avatar: '/images/avatar/avatar27.png',
      content: t('sampleTestimonials.1.content'),
      image: '/images/usersaying/pirate-chickens-treasure-hunt_b7b2977b.jpg'
    },
    {
      id: '2',
      name: 'Sharon Thompson',
      date: 'Sep 14, 2024',
      avatar: '/images/avatar/avatar28.png',
      content: t('sampleTestimonials.2.content'),
      image: '/images/usersaying/frog-princes-lily-pad-throne_58752d8a.jpg'
    },
    {
      id: '3',
      name: 'Natalie Wardle',
      date: 'Jun 29, 2025',
      avatar: '/images/avatar/avatar29.png',
      content: t('sampleTestimonials.3.content'),
      image: '/images/usersaying/fruit-basket-bonanza_325d8977.jpg'
    },
    {
      id: '4',
      name: 'Hershel Wallace',
      date: 'Oct 25, 2024',
      avatar: '/images/avatar/avatar30.png',
      content: t('sampleTestimonials.4.content'),
      image: '/images/usersaying/jungle-fiesta_140bfed0.jpg'
    },
    {
      id: '5',
      name: 'Valorie Rodriguez',
      date: 'Aug 20, 2024',
      avatar: '/images/avatar/avatar31.png',
      content: t('sampleTestimonials.5.content'),
      image: '/images/usersaying/little-girls-magical-tea-party_79fc1c63.jpg'
    },
    {
      id: '6',
      name: 'Mary Murray',
      date: 'May 16, 2025',
      avatar: '/images/avatar/avatar32.png',
      content: t('sampleTestimonials.6.content'),
      image: '/images/usersaying/majestic-lion-king_61df3c4d.jpg'
    },
    {
      id: '7',
      name: 'Laura Adamson',
      date: 'Dec 02, 2024',
      avatar: '/images/avatar/avatar33.png',
      content: t('sampleTestimonials.7.content'),
      image: '/images/usersaying/mandala-bloom-symphony_de39e571.jpg'
    },
    {
      id: '8',
      name: 'Fannie Rosales',
      date: 'Jul 07, 2024',
      avatar: '/images/avatar/avatar34.png',
      content: t('sampleTestimonials.8.content'),
      image: '/images/usersaying/mushroom-village_205c1700.jpg'
    },
    {
      id: '9',
      name: 'Kerry Bauer',
      date: 'Apr 22, 2025',
      avatar: '/images/avatar/avatar35.png',
      content: t('sampleTestimonials.9.content'),
      image: '/images/usersaying/otters-family-picnic_906ccd94.jpg'
    }
  ];
  
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
  // Style 选择状态
  const [selectedStyle, setSelectedStyle] = React.useState<string>('no-style');
  
  // 临时状态变量以保持向后兼容性
  const selectedTab = 'text'; // 固定为text模式

  // 使用我们创建的 Hook 来管理状态和 API 调用
  const {
    // 状态
    prompt,
    selectedColor,
    selectedQuantity,
    publicVisibility,
    generatedImages,
    exampleImages,
    styleSuggestions,
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
    setPublicVisibility,
    generateImages,
    downloadImage,
    clearError,
    refreshStyleSuggestions,
    deleteImage,
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


  // Data for ColoringPageTool component - Text to Image mode
  const textColoringPageToolData: ColoringPageToolData = {
    title: t('textColoringPageTool.title'),
    subtitle: t('textColoringPageTool.subtitle'),
    description: t('textColoringPageTool.description'),
    images: {
      center: "/images/text2image/left-4.png",
      topLeft: "/images/text2image/left-2.png",
      topRight: "/images/text2image/left-5.png",
      bottomLeft: "/images/text2image/left-3.png",
      bottomRight: "/images/text2image/left-6.png",
      farLeft: "/images/text2image/left-1.png",
      farRight: "/images/text2image/left-7.png"
    }
  };

  // Data for ColoringPageTool component - Image to Image mode
  const imageColoringPageToolData: ColoringPageToolData = {
    title: t('imageColoringPageTool.title'),
    subtitle: t('imageColoringPageTool.subtitle'),
    description: t('imageColoringPageTool.description'),
    images: {
      center: { left: "/images/image2image/left-4-color.jpg", right: "/images/image2image/left-4-line.png" },
      topLeft: "/images/image2image/left-2.png",
      topRight: "/images/image2image/left-5.png",
      bottomLeft: "/images/image2image/left-3.png",
      bottomRight: "/images/image2image/left-6.png",
      farLeft: "/images/image2image/left-1.png",
      farRight: "/images/image2image/left-7.png"
    }
  };

  // Data for WhyChoose component - Text mode
  const textWhyChooseData: WhyChooseData = {
    title: t('textWhyChoose.title'),
    subtitle: t('textWhyChoose.subtitle'),
    features: [
      {
        id: 'creative-freedom',
        icon: '/images/textwhychoose/logo-1.png',
        title: t('textWhyChoose.features.creativeFreedom.title'),
        description: t('textWhyChoose.features.creativeFreedom.description')
      },
      {
        id: 'kid-friendly',
        icon: '/images/textwhychoose/logo-2.png',
        title: t('textWhyChoose.features.kidFriendly.title'),
        description: t('textWhyChoose.features.kidFriendly.description')
      },
      {
        id: 'educational-value',
        icon: '/images/textwhychoose/logo-3.png',
        title: t('textWhyChoose.features.educationalValue.title'),
        description: t('textWhyChoose.features.educationalValue.description')
      },
      {
        id: 'instant-hassle-free',
        icon: '/images/textwhychoose/logo-4.png',
        title: t('textWhyChoose.features.instantHassleFree.title'),
        description: t('textWhyChoose.features.instantHassleFree.description')
      },
      {
        id: 'ready-to-print',
        icon: '/images/textwhychoose/logo-5.png',
        title: t('textWhyChoose.features.readyToPrint.title'),
        description: t('textWhyChoose.features.readyToPrint.description')
      },
      {
        id: 'free-forever',
        icon: '/images/textwhychoose/logo-6.png',
        title: t('textWhyChoose.features.freeForever.title'),
        description: t('textWhyChoose.features.freeForever.description')
      }
    ]
  };

  // Complete UserSaying data for image mode
  const imageUserSayingTestimonials: TestimonialItem[] = [
    {
      id: '1',
      name: 'Megan Thompson',
      date: 'Apr 15, 2025',
      avatar: '/images/avatar/avatar18.png',
      content: t('imageUserSayingTestimonials.1.content'),
      image: '/images/imageusersaying/santas-magical-workshop_f1e6324f.jpg'
    },
    {
      id: '2',
      name: 'David Alvarez',
      date: 'Dec 5, 2024',
      avatar: '/images/avatar/avatar19.png',
      content: t('imageUserSayingTestimonials.2.content'),
      image: '/images/imageusersaying/schoolyard-adventures_33bcf68a.jpg'
    },
    {
      id: '3',
      name: 'Sasha Williams',
      date: 'May 2, 2025',
      avatar: '/images/avatar/avatar20.png',
      content: t('imageUserSayingTestimonials.3.content'),
      image: '/images/imageusersaying/sky-high-adventures_ffecf70d.jpg'
    },
    {
      id: '4',
      name: 'Jordan Foster',
      date: 'Jul 28, 2024',
      avatar: '/images/avatar/avatar21.png',
      content: t('imageUserSayingTestimonials.4.content'),
      image: '/images/imageusersaying/teddy-bear-picnic_74149362.jpg'
    },
    {
      id: '5',
      name: 'Danielle Lee',
      date: 'Mar 21, 2025',
      avatar: '/images/avatar/avatar22.png',
      content: t('imageUserSayingTestimonials.5.content'),
      image: '/images/imageusersaying/sleepy-puppy-dreams_25051a9d.jpg'
    },
    {
      id: '6',
      name: 'Liam Carter',
      date: 'Oct 19, 2024',
      avatar: '/images/avatar/avatar23.png',
      content: t('imageUserSayingTestimonials.6.content'),
      image: '/images/imageusersaying/whimsical-amusement-park_1fb03126.jpg'
    },
    {
      id: '7',
      name: 'Angela Perez',
      date: 'Feb 8, 2025',
      avatar: '/images/avatar/avatar24.png',
      content: t('imageUserSayingTestimonials.7.content'),
      image: '/images/imageusersaying/robot-cityscape_22843043.jpg'
    },
    {
      id: '8',
      name: 'Emily Rodriguez',
      date: 'Sep 14, 2024',
      avatar: '/images/avatar/avatar25.png',
      content: t('imageUserSayingTestimonials.8.content'),
      image: '/images/imageusersaying/vintage-car-parade_2f8c318c.jpg'
    },
    {
      id: '9',
      name: 'Mark Chen',
      date: 'May 18, 2025',
      avatar: '/images/avatar/avatar26.png',
      content: t('imageUserSayingTestimonials.9.content'),
      image: '/images/imageusersaying/race-day-excitement_90125dee.jpg'
    }
  ];

  // Data for WhyChoose component - Image mode
  const imageWhyChooseData: WhyChooseData = {
    title: t('imageWhyChoose.title'),
    subtitle: t('imageWhyChoose.subtitle'),
    features: [
      {
        id: 'no-design-skills',
        icon: '/images/imagewhychoose/logo-1.png',
        title: t('imageWhyChoose.features.noDesignSkills.title'),
        description: t('imageWhyChoose.features.noDesignSkills.description')
      },
      {
        id: 'print-ready-quality',
        icon: '/images/imagewhychoose/logo-2.png',
        title: t('imageWhyChoose.features.printReadyQuality.title'),
        description: t('imageWhyChoose.features.printReadyQuality.description')
      },
      {
        id: 'any-image-type',
        icon: '/images/imagewhychoose/logo-3.png',
        title: t('imageWhyChoose.features.anyImageType.title'),
        description: t('imageWhyChoose.features.anyImageType.description')
      },
      {
        id: 'totally-free',
        icon: '/images/imagewhychoose/logo-4.png',
        title: t('imageWhyChoose.features.totallyFree.title'),
        description: t('imageWhyChoose.features.totallyFree.description')
      },
      {
        id: 'kid-safe',
        icon: '/images/imagewhychoose/logo-5.png',
        title: t('imageWhyChoose.features.kidSafe.title'),
        description: t('imageWhyChoose.features.kidSafe.description')
      },
      {
        id: 'creative-freedom',
        icon: '/images/imagewhychoose/logo-6.png',
        title: t('imageWhyChoose.features.creativeFreedom.title'),
        description: t('imageWhyChoose.features.creativeFreedom.description')
      }
    ]
  };

  // Data for ColoringPageConversion component
  const coloringPageConversionData: ColoringPageConversionData = {
    title: t('coloringPageConversion.title'),
    subtitle: t('coloringPageConversion.subtitle'),
    categories: [
      {
        id: 'pet-portraits',
        title: t('coloringPageConversion.categories.petPortraits.title'),
        description: t('coloringPageConversion.categories.petPortraits.description'),
        upImage: '/images/coloringpageconversion/image-1-up.png',
        downImage: '/images/coloringpageconversion/image-1-down.png'
      },
      {
        id: 'family-photos',
        title: t('coloringPageConversion.categories.familyPhotos.title'),
        description: t('coloringPageConversion.categories.familyPhotos.description'),
        upImage: '/images/coloringpageconversion/image-2-up.png',
        downImage: '/images/coloringpageconversion/image-2-down.png'
      },
      {
        id: 'nature-landscape',
        title: t('coloringPageConversion.categories.natureLandscape.title'),
        description: t('coloringPageConversion.categories.natureLandscape.description'),
        upImage: '/images/coloringpageconversion/image-3-up.png',
        downImage: '/images/coloringpageconversion/image-3-down.png'
      },
      {
        id: 'floral-botanical',
        title: t('coloringPageConversion.categories.floralBotanical.title'),
        description: t('coloringPageConversion.categories.floralBotanical.description'),
        upImage: '/images/coloringpageconversion/image-4-up.png',
        downImage: '/images/coloringpageconversion/image-4-down.png'
      },
      {
        id: 'toys-objects',
        title: t('coloringPageConversion.categories.toysObjects.title'),
        description: t('coloringPageConversion.categories.toysObjects.description'),
        upImage: '/images/coloringpageconversion/image-5-up.png',
        downImage: '/images/coloringpageconversion/image-5-down.png'
      },
      {
        id: 'vehicle',
        title: t('coloringPageConversion.categories.vehicle.title'),
        description: t('coloringPageConversion.categories.vehicle.description'),
        upImage: '/images/coloringpageconversion/image-6-up.png',
        downImage: '/images/coloringpageconversion/image-6-down.png'
      }
    ]
  };

  // HowToCreate data for image mode
  const imageHowToCreateData: HowToCreateData = {
    title: t('imageHowToCreate.title'),
    subtitle: t('imageHowToCreate.subtitle'),
    images: {
      top: "/images/imagehowtocreate/iamge-1-up.jpg",
      bottom: "/images/imagehowtocreate/iamge-1-down.png"
    },
    steps: [
      {
        id: "step-1",
        number: t('imageHowToCreate.steps.step1.number'),
        title: t('imageHowToCreate.steps.step1.title'),
        description: t('imageHowToCreate.steps.step1.description')
      },
      {
        id: "step-2", 
        number: t('imageHowToCreate.steps.step2.number'),
        title: t('imageHowToCreate.steps.step2.title'),
        description: t('imageHowToCreate.steps.step2.description')
      },
      {
        id: "step-3",
        number: t('imageHowToCreate.steps.step3.number'), 
        title: t('imageHowToCreate.steps.step3.title'),
        description: t('imageHowToCreate.steps.step3.description')
      }
    ]
  };

  // CanCreate data for image mode
  const imageCanCreateData: CanCreateData = {
    title: t('imageCanCreate.title'),
    subtitle: t('imageCanCreate.subtitle'),
    categories: [
      {
        id: 'parents-families',
        title: t('imageCanCreate.categories.parentsFamilies.title'),
        description: t('imageCanCreate.categories.parentsFamilies.description'),
        image: '/images/whoisimageto/image-1.png'
      },
      {
        id: 'teachers-educators',
        title: t('imageCanCreate.categories.teachersEducators.title'),
        description: t('imageCanCreate.categories.teachersEducators.description'),
        image: '/images/whoisimageto/image-2.png'
      },
      {
        id: 'artists-illustrators',
        title: t('imageCanCreate.categories.artistsCreatives.title'),
        description: t('imageCanCreate.categories.artistsCreatives.description'),
        image: '/images/whoisimageto/image-3.png'
      },
      {
        id: 'kids-young-creators',
        title: t('imageCanCreate.categories.kidsCreators.title'),
        description: t('imageCanCreate.categories.kidsCreators.description'),
        image: '/images/whoisimageto/image-4.png'
      },
      {
        id: 'crafters-diy-lovers',
        title: t('imageCanCreate.categories.craftersDiy.title'),
        description: t('imageCanCreate.categories.craftersDiy.description'),
        image: '/images/whoisimageto/image-5.png'
      },
      {
        id: 'hobbyists-casual-creators',
        title: t('imageCanCreate.categories.hobbyistsCasual.title'),
        description: t('imageCanCreate.categories.hobbyistsCasual.description'),
        image: '/images/whoisimageto/image-6.png'
      }
    ]
  };

  // Data for HowToCreate component
  const howToCreateData: HowToCreateData = {
    title: t('textHowToCreate.title'),
    subtitle: t('textHowToCreate.subtitle'),
    image: "/images/texthowtocreate/image-1.png",
    steps: [
      {
        id: 'enter-idea',
        number: t('textHowToCreate.steps.describe.number'),
        title: t('textHowToCreate.steps.describe.title'),
        description: t('textHowToCreate.steps.describe.description')
      },
      {
        id: 'click-generate',
        number: t('textHowToCreate.steps.generate.number'), 
        title: t('textHowToCreate.steps.generate.title'),
        description: t('textHowToCreate.steps.generate.description')
      },
      {
        id: 'download-color',
        number: t('textHowToCreate.steps.download.number'),
        title: t('textHowToCreate.steps.download.title'),
        description: t('textHowToCreate.steps.download.description')
      }
    ]
  };

  // FAQ data for GenerateFAQ component - Text to Image mode
  const textFAQData: FAQData[] = [
    {
      question: t('textFAQ.0.question'),
      answer: t('textFAQ.0.answer')
    },
    {
      question: t('textFAQ.1.question'),
      answer: t('textFAQ.1.answer')
    },
    {
      question: t('textFAQ.2.question'),
      answer: t('textFAQ.2.answer')
    },
    {
      question: t('textFAQ.3.question'),
      answer: t('textFAQ.3.answer')
    },
    {
      question: t('textFAQ.4.question'),
      answer: t('textFAQ.4.answer')
    },
    {
      question: t('textFAQ.5.question'),
      answer: t('textFAQ.5.answer')
    },
    {
      question: t('textFAQ.6.question'),
      answer: t('textFAQ.6.answer')
    },
    {
      question: t('textFAQ.7.question'),
      answer: t('textFAQ.7.answer')
    },
    {
      question: t('textFAQ.8.question'),
      answer: t('textFAQ.8.answer')
    },
    {
      question: t('textFAQ.9.question'),
      answer: t('textFAQ.9.answer')
    }
  ];

  const textCanCreateData: CanCreateData = {
    title: t('textCanCreate.title'),
    subtitle: t('textCanCreate.subtitle'),
    categories: [
    {
      id: 'animals',
      title: t('textCanCreate.categories.animals.title'),
      description: t('textCanCreate.categories.animals.description'),
      image: '/images/cancreate/image-1.png'
    },
    {
      id: 'fantasy',
      title: t('textCanCreate.categories.fantasy.title'),
      description: t('textCanCreate.categories.fantasy.description'),
      image: '/images/cancreate/image-3.png'
    },
    {
      id: 'vehicles',
      title: t('textCanCreate.categories.vehicles.title'),
      description: t('textCanCreate.categories.vehicles.description'),
      image: '/images/cancreate/image-5.png'
    },
    {
      id: 'nature',
      title: t('textCanCreate.categories.nature.title'),
      description: t('textCanCreate.categories.nature.description'),
      image: '/images/cancreate/image-6.png'
    },
    {
      id: 'robots',
      title: t('textCanCreate.categories.robots.title'),
      description: t('textCanCreate.categories.robots.description'),
      image: '/images/cancreate/image-2.png'
    },
    {
      id: 'circus',
      title: t('textCanCreate.categories.circus.title'),
      description: t('textCanCreate.categories.circus.description'),
      image: '/images/cancreate/image-4.png'
    }
    ]
  };

  // Second categories data for second CanCreate component
  const textCanCreateData2: CanCreateData = {
    title: t('textCanCreate2.title'),
    subtitle: t('textCanCreate2.subtitle'),
    categories: [
    {
      id: 'parents-teachers-kids',
      title: t('textCanCreate2.categories.parentsTeachersKids.title'),
      description: t('textCanCreate2.categories.parentsTeachersKids.description'),
      image: '/images/cancreate/image-7.png'
    },
    {
      id: 'adult-coloring-fans',
      title: t('textCanCreate2.categories.adultColoringFans.title'),
      description: t('textCanCreate2.categories.adultColoringFans.description'),
      image: '/images/cancreate/image-8.png'
    },
    {
      id: 'creative-individuals',
      title: t('textCanCreate2.categories.creativeIndividuals.title'),
      description: t('textCanCreate2.categories.creativeIndividuals.description'),
      image: '/images/cancreate/image-9.png'
    },
    {
      id: 'homeschooling-families',
      title: t('textCanCreate2.categories.homeschoolingFamilies.title'),
      description: t('textCanCreate2.categories.homeschoolingFamilies.description'),
      image: '/images/cancreate/image-10.png'
    },
    {
      id: 'therapists-counselors',
      title: t('textCanCreate2.categories.therapistsCounselors.title'),
      description: t('textCanCreate2.categories.therapistsCounselors.description'),
      image: '/images/cancreate/image-11.png'
    },
    {
      id: 'activity-planners',
      title: t('textCanCreate2.categories.activityPlanners.title'),
      description: t('textCanCreate2.categories.activityPlanners.description'),
      image: '/images/cancreate/image-12.png'
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
        
        // 切换tab时不应该填充任何属性，保持用户的当前设置
        // fillImageAttributes 只应该在用户手动点击图片时调用
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

    // 3. 检查用户是否有足够积分
    if (user && user.credits < 20) {
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
        let successCount = 0;
        let failCount = 0;
        
        for (const imageId of imagesToDelete) {
          try {
            const success = await deleteImage(imageId);
            if (success) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (error) {
            console.error(`Delete image ${imageId} error:`, error);
            failCount++;
          }
        }
        
        if (successCount > 0) {
          console.log(`成功删除 ${successCount} 张图片！`);
          if (failCount > 0) {
            console.warn(`${failCount} 张图片删除失败`);
          }
        } else {
          console.error('删除图片失败，请稍后重试。');
        }
        
        // 清空删除列表
        setImagesToDelete([]);
      } catch (error) {
        console.error('Delete images error:', error);
      }
    }
  };




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
              exampleImages={exampleImages}
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
              <span className="font-bold text-lg">20</span>
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
            exampleImages={exampleImages}
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
          {/* ColoringPageTool component */}
          <div className="py-8 lg:pb-12 lg:pt-24">
            <ColoringPageTool data={textColoringPageToolData} />
          </div>

          {/* WhyChoose component */}
          <div className="py-8 lg:py-12 bg-white">
            <WhyChoose data={textWhyChooseData} />
          </div>

          {/* CanCreate component */}
          <div className="py-8 lg:py-12 bg-white">
            <CanCreate data={textCanCreateData} />
          </div>

          {/* HowToCreate component */}
          <div className="py-8 lg:py-12 bg-white">
            <HowToCreate data={howToCreateData} />
          </div>

          {/* Second CanCreate component */}
          <div className="py-8 lg:py-12 bg-white">
            <CanCreate data={textCanCreateData2} />
          </div>

          {/* UserSaying component */}
          <div className="pt-8 lg:pt-12 bg-white">
            <UserSaying testimonials={sampleTestimonials} />
          </div>

          {/* GenerateFAQ component */}
          <div className="pt-8 lg:pt-12 bg-white">
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
          showGradientBg={true}
          showFAQ={true}
          showCTA={true}
        />
      </div>
    )}
    </>
  );
};

export default GeneratePage;