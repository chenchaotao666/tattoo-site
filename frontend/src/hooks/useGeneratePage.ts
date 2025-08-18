import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import GenerateServiceInstance, { StyleSuggestion, AspectRatio } from '../services/generateService';

import { HomeImage } from '../services/imageService';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';

// Style接口定义 - 与stylesService保持一致
export interface Style {
  id: string;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  slug: string;
  iconUrl?: string;
  // 从API来的字段
  title?: { en: string; zh: string };
  prompt?: { en: string; zh: string };
  imageUrl?: string;
}

export interface UseGeneratePageState {
  // 基础状态
  prompt: string;
  selectedRatio: AspectRatio;
  selectedColor: boolean; // true for colorful, false for black & white
  selectedQuantity: number; // 1 or 4 images to generate
  selectedStyle: Style | null; // 选中的风格
  publicVisibility: boolean; // Public Visibility
  
  // 数据状态
  generatedImages: HomeImage[]; // 生成的图片
  exampleImages: HomeImage[]; // 示例图片
  styleSuggestions: StyleSuggestion[];
  styles: Style[]; // 风格列表
  
  // UI状态
  showStyleSelector: boolean; // 是否显示风格选择器
  
  // 加载状态
  isGenerating: boolean;
  isLoadingExamples: boolean; // 加载状态（包括示例和生成历史）
  isLoadingStyles: boolean;
  isInitialDataLoaded: boolean; // 初始数据（生成历史）是否已加载完成
  
  // 错误状态
  error: string | null;
  
  // 任务状态
  currentTaskId: string | null;
  generationProgress: number;

  // 积分状态
  userCredits: number;
  canGenerate: boolean;

  // 用户生成历史状态
  hasGenerationHistory: boolean; // 用户是否有生成历史
}

export interface UseGeneratePageActions {
  // 基础操作
  setPrompt: (prompt: string) => void;
  setSelectedRatio: (ratio: AspectRatio) => void;
  setSelectedColor: (isColor: boolean) => void;
  setSelectedQuantity: (quantity: number) => void;
  setSelectedStyle: (style: Style | null) => void;
  setPublicVisibility: (visible: boolean) => void;
  setShowStyleSelector: (show: boolean) => void;
  
  // API 操作
  generateImages: () => Promise<void>;
  loadExampleImages: () => Promise<void>;
  loadStyleSuggestions: () => Promise<void>;
  loadStyles: () => Promise<void>;
  recreateExample: (exampleId: string) => Promise<void>;
  downloadImage: (imageId: string, format: 'png' | 'pdf') => Promise<void>;
  
  // 工具操作
  clearError: () => void;
  resetForm: () => void;
  refreshExamples: () => void;
  refreshStyleSuggestions: () => void;
  loadGeneratedImages: (user?: any) => Promise<void>;
  deleteImage: (imageId: string) => Promise<boolean>;
  
  // 积分相关操作
  checkUserCredits: (user?: any) => void;
  handleInsufficientCredits: () => void;
}

export const useGeneratePage = (refreshUser?: () => Promise<void>): UseGeneratePageState & UseGeneratePageActions => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  
  // 缓存引用
  const exampleCache = useRef<{
    allImages: HomeImage[];
    isLoaded: boolean;
    isLoading: boolean;
  }>({
    allImages: [],
    isLoaded: false,
    isLoading: false
  });

  // 添加初始化标记，防止重复加载
  const examplesInitialized = useRef(false);
  
  // 从URL参数获取初始值
  const getInitialPrompt = () => searchParams.get('prompt') || '';
  const getInitialRatio = (): AspectRatio => {
    const ratio = searchParams.get('ratio');
    const validRatios: AspectRatio[] = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16', '16:21'];
    return validRatios.includes(ratio as AspectRatio) ? (ratio as AspectRatio) : '1:1';
  };
  const getInitialIsPublic = (): boolean => {
    const isPublic = searchParams.get('isPublic');
    return isPublic === 'true';
  };

  
  // 预设的50种常用图片生成建议
  const STYLE_SUGGESTIONS = {
    zh: [
      // 动物类
      { id: 'cute-cat', name: '可爱小猫', content: '一只可爱的小猫咪，有着大大的眼睛和蓬松的毛发', category: 'animals' },
      { id: 'friendly-dog', name: '友好小狗', content: '一只友善的小狗，摇着尾巴，表情开心', category: 'animals' },
      { id: 'colorful-butterfly', name: '彩色蝴蝶', content: '一只美丽的彩色蝴蝶，翅膀上有精美的花纹', category: 'animals' },
      { id: 'wise-owl', name: '智慧猫头鹰', content: '一只聪明的猫头鹰，戴着小眼镜，坐在树枝上', category: 'animals' },
      { id: 'happy-elephant', name: '快乐大象', content: '一只快乐的大象，长长的鼻子，温和的眼神', category: 'animals' },
      { id: 'graceful-swan', name: '优雅天鹅', content: '一只优雅的白天鹅，在清澈的湖水中游泳', category: 'animals' },
      { id: 'playful-dolphin', name: '顽皮海豚', content: '一只顽皮的海豚，正在海水中跳跃嬉戏', category: 'animals' },
      { id: 'majestic-lion', name: '威严狮子', content: '一只威严的狮子，有着浓密的鬃毛和王者气息', category: 'animals' },
      { id: 'cute-panda', name: '可爱熊猫', content: '一只可爱的大熊猫，黑白分明，正在吃竹子', category: 'animals' },
      { id: 'colorful-parrot', name: '彩色鹦鹉', content: '一只色彩斑斓的鹦鹉，有着明亮的羽毛', category: 'animals' },

      // 自然风景类
      { id: 'beautiful-flower', name: '美丽花朵', content: '一朵美丽的花，花瓣层层叠叠，色彩鲜艳', category: 'nature' },
      { id: 'tall-tree', name: '高大树木', content: '一棵高大的树木，枝叶茂盛，根系发达', category: 'nature' },
      { id: 'peaceful-mountain', name: '宁静山峰', content: '宁静的山峰，云雾缭绕，景色壮观', category: 'nature' },
      { id: 'flowing-river', name: '流淌小河', content: '一条清澈的小河，水流潺潺，两岸绿树成荫', category: 'nature' },
      { id: 'bright-sun', name: '明亮太阳', content: '明亮的太阳，散发着温暖的光芒', category: 'nature' },
      { id: 'crescent-moon', name: '弯弯月亮', content: '弯弯的月亮，在夜空中闪闪发光', category: 'nature' },
      { id: 'twinkling-stars', name: '闪烁星星', content: '满天的星星，在夜空中闪闪发光', category: 'nature' },
      { id: 'fluffy-clouds', name: '蓬松云朵', content: '蓬松的白云，在蓝天中飘荡', category: 'nature' },
      { id: 'colorful-rainbow', name: '彩色彩虹', content: '美丽的彩虹，横跨天空，色彩斑斓', category: 'nature' },
      { id: 'ocean-waves', name: '海洋波浪', content: '汹涌的海浪，拍打着海岸，溅起雪白的浪花', category: 'nature' },

      // 卡通人物类
      { id: 'happy-princess', name: '快乐公主', content: '一位快乐的公主，穿着华丽的裙子，戴着王冠', category: 'characters' },
      { id: 'brave-knight', name: '勇敢骑士', content: '一位勇敢的骑士，穿着闪亮的盔甲，手持长剑', category: 'characters' },
      { id: 'magical-fairy', name: '魔法仙女', content: '一位魔法仙女，有着透明的翅膀和魔法棒', category: 'characters' },
      { id: 'funny-clown', name: '有趣小丑', content: '一个有趣的小丑，红鼻子，彩色的衣服，表情搞笑', category: 'characters' },
      { id: 'superhero', name: '超级英雄', content: '一位超级英雄，穿着酷炫的服装，准备拯救世界', category: 'characters' },
      { id: 'cute-robot', name: '可爱机器人', content: '一个可爱的机器人，有着圆圆的身体和友善的表情', category: 'characters' },
      { id: 'friendly-alien', name: '友好外星人', content: '一个友好的外星人，有着大眼睛和绿色的皮肤', category: 'characters' },
      { id: 'wise-wizard', name: '智慧巫师', content: '一位智慧的巫师，长胡子，穿着星星图案的长袍', category: 'characters' },
      { id: 'dancing-ballerina', name: '舞蹈芭蕾', content: '一位优雅的芭蕾舞者，穿着蓬蓬裙，正在跳舞', category: 'characters' },
      { id: 'smiling-chef', name: '微笑厨师', content: '一位微笑的厨师，戴着高高的厨师帽，围着围裙', category: 'characters' },

      // 交通工具类
      { id: 'fast-car', name: '快速汽车', content: '一辆快速的汽车，流线型车身，准备出发', category: 'vehicles' },
      { id: 'big-truck', name: '大卡车', content: '一辆大卡车，车厢宽敞，轮子很大', category: 'vehicles' },
      { id: 'flying-airplane', name: '飞行飞机', content: '一架飞行的飞机，在蓝天白云中翱翔', category: 'vehicles' },
      { id: 'sailing-boat', name: '航行帆船', content: '一艘航行的帆船，白色的帆布鼓满了风', category: 'vehicles' },
      { id: 'speedy-train', name: '快速火车', content: '一列快速的火车，在铁轨上疾驰而过', category: 'vehicles' },
      { id: 'colorful-bicycle', name: '彩色自行车', content: '一辆彩色的自行车，有着明亮的颜色和铃铛', category: 'vehicles' },
      { id: 'fire-truck', name: '消防车', content: '一辆红色的消防车，装满了救火设备', category: 'vehicles' },
      { id: 'school-bus', name: '校车', content: '一辆黄色的校车，载着孩子们去上学', category: 'vehicles' },
      { id: 'police-car', name: '警车', content: '一辆警车，有着闪烁的警灯和警报器', category: 'vehicles' },
      { id: 'ambulance', name: '救护车', content: '一辆救护车，白色车身，红十字标记', category: 'vehicles' },

      // 食物类
      { id: 'delicious-cake', name: '美味蛋糕', content: '一个美味的蛋糕，多层设计，上面有奶油和装饰', category: 'food' },
      { id: 'fresh-fruit', name: '新鲜水果', content: '新鲜的水果，苹果、香蕉、橙子等，色彩丰富', category: 'food' },
      { id: 'tasty-pizza', name: '美味披萨', content: '一个美味的披萨，上面有丰富的配菜和芝士', category: 'food' },
      { id: 'sweet-ice-cream', name: '甜美冰淇淋', content: '甜美的冰淇淋，多种口味，装在蛋筒里', category: 'food' },
      { id: 'colorful-candy', name: '彩色糖果', content: '彩色的糖果，各种形状和颜色，看起来很甜', category: 'food' },
      { id: 'healthy-vegetables', name: '健康蔬菜', content: '健康的蔬菜，胡萝卜、花椰菜、青菜等', category: 'food' },
      { id: 'warm-bread', name: '温暖面包', content: '温暖的面包，刚出炉，散发着香气', category: 'food' },
      { id: 'refreshing-drink', name: '清爽饮料', content: '清爽的饮料，装在杯子里，有吸管', category: 'food' },
      { id: 'chocolate-cookies', name: '巧克力饼干', content: '美味的巧克力饼干，酥脆可口', category: 'food' },
      { id: 'birthday-cupcake', name: '生日纸杯蛋糕', content: '生日纸杯蛋糕，上面有蜡烛和彩色装饰', category: 'food' }
    ],
    en: [
      // Animals
      { id: 'cute-cat', name: 'Cute Cat', content: 'A cute little kitten with big eyes and fluffy fur', category: 'animals' },
      { id: 'friendly-dog', name: 'Friendly Dog', content: 'A friendly little dog wagging its tail with a happy expression', category: 'animals' },
      { id: 'colorful-butterfly', name: 'Colorful Butterfly', content: 'A beautiful colorful butterfly with intricate patterns on its wings', category: 'animals' },
      { id: 'wise-owl', name: 'Wise Owl', content: 'A smart owl wearing little glasses, sitting on a tree branch', category: 'animals' },
      { id: 'happy-elephant', name: 'Happy Elephant', content: 'A happy elephant with a long trunk and gentle eyes', category: 'animals' },
      { id: 'graceful-swan', name: 'Graceful Swan', content: 'An elegant white swan swimming in clear lake water', category: 'animals' },
      { id: 'playful-dolphin', name: 'Playful Dolphin', content: 'A playful dolphin jumping and playing in the ocean water', category: 'animals' },
      { id: 'majestic-lion', name: 'Majestic Lion', content: 'A majestic lion with a thick mane and royal presence', category: 'animals' },
      { id: 'cute-panda', name: 'Cute Panda', content: 'A cute giant panda with distinct black and white markings, eating bamboo', category: 'animals' },
      { id: 'colorful-parrot', name: 'Colorful Parrot', content: 'A colorful parrot with bright and vibrant feathers', category: 'animals' },

      // Nature
      { id: 'beautiful-flower', name: 'Beautiful Flower', content: 'A beautiful flower with layered petals in bright colors', category: 'nature' },
      { id: 'tall-tree', name: 'Tall Tree', content: 'A tall tree with lush foliage and strong roots', category: 'nature' },
      { id: 'peaceful-mountain', name: 'Peaceful Mountain', content: 'Peaceful mountain peaks surrounded by mist with spectacular scenery', category: 'nature' },
      { id: 'flowing-river', name: 'Flowing River', content: 'A clear flowing river with gentle currents and green trees on both sides', category: 'nature' },
      { id: 'bright-sun', name: 'Bright Sun', content: 'A bright sun radiating warm light', category: 'nature' },
      { id: 'crescent-moon', name: 'Crescent Moon', content: 'A crescent moon shining brightly in the night sky', category: 'nature' },
      { id: 'twinkling-stars', name: 'Twinkling Stars', content: 'Countless stars twinkling in the night sky', category: 'nature' },
      { id: 'fluffy-clouds', name: 'Fluffy Clouds', content: 'Fluffy white clouds floating in the blue sky', category: 'nature' },
      { id: 'colorful-rainbow', name: 'Colorful Rainbow', content: 'A beautiful rainbow stretching across the sky with vibrant colors', category: 'nature' },
      { id: 'ocean-waves', name: 'Ocean Waves', content: 'Powerful ocean waves crashing against the shore with white foam', category: 'nature' },

      // Characters
      { id: 'happy-princess', name: 'Happy Princess', content: 'A happy princess wearing a gorgeous dress and a crown', category: 'characters' },
      { id: 'brave-knight', name: 'Brave Knight', content: 'A brave knight in shining armor holding a sword', category: 'characters' },
      { id: 'magical-fairy', name: 'Magical Fairy', content: 'A magical fairy with transparent wings and a magic wand', category: 'characters' },
      { id: 'funny-clown', name: 'Funny Clown', content: 'A funny clown with a red nose and colorful clothes with a comical expression', category: 'characters' },
      { id: 'superhero', name: 'Superhero', content: 'A superhero in a cool costume ready to save the world', category: 'characters' },
      { id: 'cute-robot', name: 'Cute Robot', content: 'A cute robot with a round body and friendly expression', category: 'characters' },
      { id: 'friendly-alien', name: 'Friendly Alien', content: 'A friendly alien with big eyes and green skin', category: 'characters' },
      { id: 'wise-wizard', name: 'Wise Wizard', content: 'A wise wizard with a long beard wearing a star-patterned robe', category: 'characters' },
      { id: 'dancing-ballerina', name: 'Dancing Ballerina', content: 'An elegant ballerina in a tutu dress performing a dance', category: 'characters' },
      { id: 'smiling-chef', name: 'Smiling Chef', content: 'A smiling chef wearing a tall chef hat and apron', category: 'characters' },

      // Vehicles
      { id: 'fast-car', name: 'Fast Car', content: 'A fast car with streamlined body ready to go', category: 'vehicles' },
      { id: 'big-truck', name: 'Big Truck', content: 'A big truck with spacious cargo area and large wheels', category: 'vehicles' },
      { id: 'flying-airplane', name: 'Flying Airplane', content: 'An airplane flying through blue skies and white clouds', category: 'vehicles' },
      { id: 'sailing-boat', name: 'Sailing Boat', content: 'A sailing boat with white sails filled with wind', category: 'vehicles' },
      { id: 'speedy-train', name: 'Speedy Train', content: 'A fast train speeding along the railway tracks', category: 'vehicles' },
      { id: 'colorful-bicycle', name: 'Colorful Bicycle', content: 'A colorful bicycle with bright colors and a bell', category: 'vehicles' },
      { id: 'fire-truck', name: 'Fire Truck', content: 'A red fire truck equipped with firefighting equipment', category: 'vehicles' },
      { id: 'school-bus', name: 'School Bus', content: 'A yellow school bus carrying children to school', category: 'vehicles' },
      { id: 'police-car', name: 'Police Car', content: 'A police car with flashing lights and sirens', category: 'vehicles' },
      { id: 'ambulance', name: 'Ambulance', content: 'An ambulance with white body and red cross markings', category: 'vehicles' },

      // Food
      { id: 'delicious-cake', name: 'Delicious Cake', content: 'A delicious multi-layered cake with cream and decorations', category: 'food' },
      { id: 'fresh-fruit', name: 'Fresh Fruit', content: 'Fresh fruits like apples, bananas, oranges with rich colors', category: 'food' },
      { id: 'tasty-pizza', name: 'Tasty Pizza', content: 'A delicious pizza with rich toppings and cheese', category: 'food' },
      { id: 'sweet-ice-cream', name: 'Sweet Ice Cream', content: 'Sweet ice cream in various flavors served in a cone', category: 'food' },
      { id: 'colorful-candy', name: 'Colorful Candy', content: 'Colorful candies in various shapes and colors that look sweet', category: 'food' },
      { id: 'healthy-vegetables', name: 'Healthy Vegetables', content: 'Healthy vegetables like carrots, broccoli, and greens', category: 'food' },
      { id: 'warm-bread', name: 'Warm Bread', content: 'Warm bread fresh from the oven with a delicious aroma', category: 'food' },
      { id: 'refreshing-drink', name: 'Refreshing Drink', content: 'A refreshing drink served in a cup with a straw', category: 'food' },
      { id: 'chocolate-cookies', name: 'Chocolate Cookies', content: 'Delicious chocolate cookies that are crispy and tasty', category: 'food' },
      { id: 'birthday-cupcake', name: 'Birthday Cupcake', content: 'Birthday cupcakes with candles and colorful decorations', category: 'food' }
    ]
  };

  // 从数组中随机选择指定数量的元素
  const getRandomSuggestions = (suggestions: { zh: StyleSuggestion[], en: StyleSuggestion[], ja?: StyleSuggestion[] }, count: number = 6, language: 'zh' | 'en' | 'ja' = 'zh'): StyleSuggestion[] => {
    const languageSuggestions = suggestions[language] || suggestions['en'] || [];
    const shuffled = [...languageSuggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // 初始状态
  const initialState: UseGeneratePageState = {
    // 基础状态
    prompt: getInitialPrompt(),
    selectedRatio: getInitialRatio(),
    selectedColor: true, // Default to colorful
    selectedQuantity: 1, // Default to 1 image
    selectedStyle: null, // Default to no style
    publicVisibility: searchParams.get('isPublic') ? getInitialIsPublic() : true,
    
    // 数据状态
    generatedImages: [],
    exampleImages: [],
    styleSuggestions: [],
    styles: [], // 风格列表
    
    // UI状态
    showStyleSelector: false, // 默认不显示风格选择器
    
    // 加载状态
    isGenerating: false,
    isLoadingExamples: true, // 设为true，避免显示空状态
    isLoadingStyles: false,
    isInitialDataLoaded: false,
    
    // 错误状态
    error: null,
    
    // 任务状态
    currentTaskId: null,
    generationProgress: 0,

    // 积分状态
    userCredits: 0,
    canGenerate: true,

    // 用户生成历史状态
    hasGenerationHistory: false, // 用户是否有生成历史
  };

  // 状态定义
  const [state, setState] = useState<UseGeneratePageState>(initialState);

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<UseGeneratePageState> | ((prev: UseGeneratePageState) => Partial<UseGeneratePageState>)) => {
    if (typeof updates === 'function') {
      setState(prev => ({ ...prev, ...updates(prev) }));
    } else {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // 基础操作
  const setPrompt = useCallback((prompt: string) => {
    updateState({ prompt });
  }, [updateState]);


  const setSelectedRatio = useCallback((selectedRatio: AspectRatio) => {
    updateState({ selectedRatio });
  }, [updateState]);


  const setSelectedColor = useCallback((selectedColor: boolean) => {
    updateState({ selectedColor });
  }, [updateState]);

  const setSelectedQuantity = useCallback((selectedQuantity: number) => {
    updateState(prevState => {
      const newState: Partial<UseGeneratePageState> = { selectedQuantity };
      // 当数量改变时，重新检查是否有足够积分
      if (prevState.userCredits !== null) {
        newState.canGenerate = prevState.userCredits >= (20 * selectedQuantity);
      }
      return newState;
    });
  }, [updateState]);

  const setSelectedStyle = useCallback((selectedStyle: Style | null) => {
    updateState({ selectedStyle });
  }, [updateState]);

  const setPublicVisibility = useCallback((publicVisibility: boolean) => {
    updateState({ publicVisibility });
  }, [updateState]);

  const setShowStyleSelector = useCallback((showStyleSelector: boolean) => {
    updateState({ showStyleSelector });
  }, [updateState]);

  // 检查用户积分 - 优化：使用传入的用户数据而不是重新请求
  const checkUserCredits = useCallback((user: any = null) => {
    try {
      if (!user) {
        updateState({ 
          userCredits: 0, 
          canGenerate: false
        });
        return;
      }
      
      const canGenerate = user.credits >= (20 * state.selectedQuantity); // 根据生成数量计算所需积分
      updateState({ 
        userCredits: user.credits, 
        canGenerate
      });
    } catch (error) {
      console.error('Failed to check user credits:', error);
      updateState({ 
        userCredits: 0, 
        canGenerate: false
      });
    }
  }, [updateState]);

  // 处理积分不足
  const handleInsufficientCredits = useCallback(() => {
    // 跳转到充值页面
    window.location.href = '/price';
  }, []);

  // 从所有图片中随机选择（移动端1张，桌面端3张）
  const getRandomImages = useCallback((allImages: HomeImage[]): HomeImage[] => {
    const shuffled = [...allImages].sort(() => 0.5 - Math.random());
    const isMobile = window.innerWidth < 640;
    const count = isMobile ? 2 : 3;
    return shuffled.slice(0, count);
  }, []);

  // 加载示例图片
  const loadExamplesIfNeeded = useCallback(async (hasHistory: boolean) => {
    if (!examplesInitialized.current) {
      examplesInitialized.current = true;
      
      // 如果用户已有生成历史图片，跳过示例加载
      if (hasHistory) {
        setState(prev => ({ 
          ...prev, 
          exampleImages: [],
          isLoadingExamples: false 
        }));
        return;
      }
      
      // 如果缓存中有图片，从缓存中随机选择
      if (exampleCache.current.isLoaded && exampleCache.current.allImages.length > 0) {
        const randomImages = getRandomImages(exampleCache.current.allImages);
        setState(prev => ({ 
          ...prev, 
          exampleImages: randomImages,
          isLoadingExamples: false 
        }));
        return;
      }
      
      // 如果没有缓存且未在加载，开始加载示例
      if (!exampleCache.current.isLoading) {
        try {
          exampleCache.current.isLoading = true;
          setState(prev => ({ ...prev, isLoadingExamples: true, error: null }));
          
          const examples = await GenerateServiceInstance.getExampleImages('text', 6);
          
          // 更新缓存
          exampleCache.current = {
            allImages: examples,
            isLoaded: true,
            isLoading: false
          };
          
          setState(prev => ({ 
            ...prev, 
            exampleImages: examples, 
            isLoadingExamples: false 
          }));
        } catch (error) {
          exampleCache.current.isLoading = false;
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Failed to load examples',
            isLoadingExamples: false,
          }));
        }
      }
    }
  }, [getRandomImages]);

  // 加载生成历史 - 优化：使用传入的用户数据而不是重新请求
  const loadGeneratedImages = useCallback(async (user: any = null) => {
    try {
      if (!user) {
        // 如果用户未登录，清空生成历史，但不影响示例图片的加载状态
        updateState({ 
          generatedImages: [], 
          isInitialDataLoaded: true,  // 即使没有用户也标记为加载完成
          hasGenerationHistory: false
        });
        
        // 用户未登录，加载示例图片
        loadExamplesIfNeeded(false);
        return;
      }
      
      // 获取所有生成的图片
      const images = await GenerateServiceInstance.getUserGeneratedImages(user.userId);
      
      // 检查用户是否有生成历史
      const hasGenerationHistory = images.length > 0;
      
      updateState({ 
        generatedImages: images,
        isInitialDataLoaded: true,  // 标记初始数据加载完成
        hasGenerationHistory
      });
      
      // 历史图片加载完成后，根据历史情况决定是否加载示例
      loadExamplesIfNeeded(hasGenerationHistory);
    } catch (error) {
      console.error('Failed to load generated images:', error);
      updateState({ 
        generatedImages: [], 
        isInitialDataLoaded: true,  // 即使出错也标记为加载完成
        hasGenerationHistory: false
      });
      
      // 加载出错时，加载示例图片
      loadExamplesIfNeeded(false);
    }
  }, [updateState, loadExamplesIfNeeded]);

  // 生成图片
  const generateImages = useCallback(async () => {
    if (state.isGenerating) return;
    
    // 检查积分
    if (!state.canGenerate) {
      handleInsufficientCredits();
      return;
    }
    
    try {
      updateState({ isGenerating: true, error: null, generationProgress: 0 });
      
      // 获取当前用户ID
      const { UserService } = await import('../services/userService');
      
      // 先检查是否已登录
      if (!UserService.isLoggedIn()) {
        throw new Error('请先登录');
      }
      
      const user = await UserService.getCurrentUser();
      
      if (!user) {
        throw new Error('请先登录');
      }

      // 立即开始进度推进
      currentProgress.current = 0;
      smoothProgressUpdate(20);
      
      if (!state.prompt.trim()) {
        throw new Error('Please enter a prompt');
      }
      
      // Use the new asynchronous tattoo generation API with progress
      // Debug logging for style selection
      console.log('🔍 Debug - selectedStyle:', state.selectedStyle);
      const styleValue = state.selectedStyle ? getLocalizedText(state.selectedStyle.name, 'en') : '';
      const styleNoteValue = state.selectedStyle ? getLocalizedText(state.selectedStyle.description, 'en') : '';
      console.log('🔍 Debug - style value:', styleValue);
      console.log('🔍 Debug - styleNote value:', styleNoteValue);

      const tattooResponse = await GenerateServiceInstance.generateTattooWithProgress({
        prompt: state.prompt,
        num_outputs: state.selectedQuantity,
        // Apply style settings (black&white overrides style for color settings)
        style: styleValue,
        styleNote: styleNoteValue,
        // Apply color settings
        isColor: state.selectedColor,
        isPublic: state.publicVisibility
      }, (progress) => {
        // Update progress in real-time
        console.log(`Generation progress: ${progress.percentage}% - ${progress.message}`);
        currentProgress.current = progress.percentage;
        targetProgress.current = progress.percentage;
        updateState({ generationProgress: progress.percentage });
      });
      
      // Handle completed generation
      if (tattooResponse && tattooResponse.localImages) {
        // Create HomeImage objects from all generated images
        const localImages = tattooResponse.localImages || [];
        if (localImages.length > 0) {
          const batchId = tattooResponse.batchId || tattooResponse.id;
          const newImages: HomeImage[] = localImages.map((localImage, index) => ({
            id: `${tattooResponse.id}_${index}`,
            name: { zh: `${state.prompt} (${index + 1})`, en: `${state.prompt} (${index + 1})` },
            slug: `generated-tattoo-${tattooResponse.id}-${index}`,
            tattooUrl: localImage.url,
            title: { zh: state.prompt, en: state.prompt },
            description: { zh: state.prompt, en: state.prompt },
            prompt: { zh: state.prompt, en: state.prompt },
            type: 'text2image' as const,
            styleId: '',
            isColor: state.selectedColor,
            isPublic: state.publicVisibility,
            isOnline: false,
            hotness: 0,
            userId: '',
            categoryId: '',
            ratio: '1:1' as const,
            batchId: batchId,
            createdAt: tattooResponse.created_at || new Date().toISOString(),
            updatedAt: tattooResponse.created_at || new Date().toISOString()
          }));
          
          // Immediately add all images to state
          setState(prevState => ({
            ...prevState,
            generatedImages: [...newImages, ...prevState.generatedImages],
            hasGenerationHistory: true,
            isGenerating: false,
            currentTaskId: null,
            generationProgress: 100,
          }));
          
          // Refresh user credits
          checkUserCredits();
          if (refreshUser) {
            try {
              await refreshUser();
            } catch (error) {
              console.error('Failed to refresh global user state:', error);
            }
          }
          return; // Exit early since generation is complete
        }
      }
      
      // If we get here, something went wrong
      throw new Error('Generation failed - no local images received');
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'An error occurred',
        isGenerating: false,
      });
    }
  }, [state.isGenerating, state.prompt, state.selectedQuantity, state.selectedColor, state.selectedRatio, state.publicVisibility, state.canGenerate, updateState, handleInsufficientCredits]);

  // 优化的进度管理
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const targetProgress = useRef<number>(0);
  const currentProgress = useRef<number>(0);

  const smoothProgressUpdate = useCallback((target: number) => {
    const previousTarget = targetProgress.current;
    targetProgress.current = target;
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      const current = currentProgress.current;
      const target = targetProgress.current;
      
      if (current < target) {
        // 逐步增加进度，速度根据距离和目标范围调整
        const diff = target - current;
        
        let increment;
        if (target <= 10) {
          // 0-10%: 快速启动
          increment = Math.max(1, diff * 0.02);
        } else if (target <= 45) {
          // 10-45%: 稳定推进
          increment = Math.max(0.3, diff * 0.08);
        } else if (target === 50 && previousTarget < 50) {
          // 跳转到50%: 快速
          increment = Math.max(2, diff * 0.2);
        } else if (target <= 95) {
          // 50-95%: 加快推进
          increment = Math.max(0.8, diff * 0.15);
        } else {
          // 95-100%: 最快完成
          increment = Math.max(1, diff * 0.3);
        }
        
        currentProgress.current = Math.min(current + increment, target);
        
        updateState({
          generationProgress: Math.round(currentProgress.current),
        });
      } else if (current >= target || Math.round(current) >= target) {
        // 到达目标时停止当前定时器
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      }
    }, 50); // 每50ms更新一次，更流畅
  }, [updateState]);


  // 加载风格建议
  const loadStyleSuggestions = useCallback(async () => {
    try {
      updateState({ isLoadingStyles: true, error: null });
      
      // 模拟异步加载（可选，让用户感觉更真实）
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 从50种建议中随机选择6种
      const randomSuggestions = getRandomSuggestions(STYLE_SUGGESTIONS, 6, language);
      
      updateState({ styleSuggestions: randomSuggestions });
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to load styles',
      });
    } finally {
      updateState({ isLoadingStyles: false });
    }
  }, [updateState]);

  // 加载风格列表
  const loadStyles = useCallback(async () => {
    try {
      updateState({ isLoadingStyles: true, error: null });
      
      // 调用 stylesService 获取风格列表
      const { default: stylesService } = await import('../services/stylesService');
      const apiStyles = await stylesService.getAll();
      
      // Debug logging for loaded styles
      console.log('🔍 Debug - API styles loaded:', apiStyles);
      
      // 将API数据转换为本地Style接口格式
      const styles: Style[] = apiStyles.map(apiStyle => {
        // 确保title和prompt字段正确转换
        const name = apiStyle.title || { en: '', zh: '' };
        const description = apiStyle.prompt || { en: '', zh: '' };
        
        return {
          id: apiStyle.id,
          name: name,
          description: description,
          slug: apiStyle.id, // 使用id作为slug
          iconUrl: apiStyle.imageUrl || undefined,
          // 保留原始字段用于调试
          title: apiStyle.title,
          prompt: apiStyle.prompt,
          imageUrl: apiStyle.imageUrl
        };
      });
      
      console.log('🔍 Debug - Converted styles:', styles);
      
      updateState({ 
        styles: styles,
      });
    } catch (error) {
      console.error('Load styles error:', error);
      updateState({ error: error instanceof Error ? error.message : 'Failed to load styles' });
    } finally {
      updateState({ isLoadingStyles: false });
    }
  }, [updateState]);

  // 重新创建示例
  const recreateExample = useCallback(async (exampleId: string) => {
    try {
      // 从示例图片中查找
      let exampleImage = state.exampleImages.find(img => img.id === exampleId);
      
      // 如果当前显示的示例中没有，从缓存中查找
      if (!exampleImage && exampleCache.current.allImages.length > 0) {
        exampleImage = exampleCache.current.allImages.find(img => img.id === exampleId);
      }
      
      if (!exampleImage) {
        throw new Error('Example image not found');
      }
      
      // Text to Image: 回填示例图片的信息到界面
      const promptToUse = getLocalizedText(exampleImage.prompt, language) || 
                         getLocalizedText(exampleImage.title, language) || 
                         getLocalizedText(exampleImage.description, language) || '';
      
      if (!promptToUse.trim()) {
        throw new Error('No prompt information available for this example');
      }
      
      // 回填 prompt、ratio、isPublic 到界面，不调用生成方法
      const validRatios: AspectRatio[] = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16', '16:21'];
      const ratio = validRatios.includes(exampleImage.ratio as AspectRatio) ? (exampleImage.ratio as AspectRatio) : '1:1';
      updateState({ 
        prompt: promptToUse,
        selectedRatio: ratio,
        publicVisibility: exampleImage.isPublic || false,
        error: null
      });
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to load example data',
      });
    }
  }, [updateState, state.exampleImages, language]);

  // 下载图片
  const downloadImage = useCallback(async (imageId: string, format: 'png' | 'pdf') => {
    try {
      updateState({ error: null }); // 清除之前的错误
      
      // 从生成的图片中查找图片信息
      const imageData = state.generatedImages.find(img => img.id === imageId);
      if (!imageData) {
        throw new Error('Image not found');
      }
      
      // 生成文件名
      const imageTitle = getLocalizedText(imageData.title, language) || 'untitled';
      const fileName = `tattoo-${imageTitle.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}-${imageId.slice(-8)}.${format}`;
      
      // 根据格式选择不同的下载方式
      if (format === 'png') {
        // PNG格式直接通过URL下载
        const { downloadImageByUrl } = await import('../utils/downloadUtils');
        await downloadImageByUrl(imageData.tattooUrl, fileName);
      } else {
        // PDF格式将图片转换为PDF
        const { downloadImageAsPdf } = await import('../utils/downloadUtils');
        await downloadImageAsPdf(imageData.tattooUrl, fileName);
      }
      
    } catch (error) {
      console.error('Download failed:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Download failed',
      });
    }
  }, [updateState, state.generatedImages, language]);

  // 清除错误
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // 重置表单
  const resetForm = useCallback(() => {
    // 清理进度定时器
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    currentProgress.current = 0;
    targetProgress.current = 0;
    
    updateState({
      prompt: '',
      generatedImages: [],
      hasGenerationHistory: false,
      error: null,
      currentTaskId: null,
      generationProgress: 0,
    });
  }, [updateState]);

  // 刷新示例（只有点击 Change 按钮时才调用）
  const refreshExamples = useCallback(() => {
    const isMobile = window.innerWidth < 640;
    
    if (exampleCache.current.allImages.length > 0) {
      let randomImages: HomeImage[];
      
      if (isMobile && state.exampleImages.length > 0) {
        // 移动端：避免显示相同的图片
        const currentImageIds = state.exampleImages.map(img => img.id);
        const availableImages = exampleCache.current.allImages.filter(img => !currentImageIds.includes(img.id));
        
        if (availableImages.length > 0) {
          // 从未显示的图片中选择
          randomImages = getRandomImages(availableImages);
        } else {
          // 如果所有图片都显示过了，重新开始
          randomImages = getRandomImages(exampleCache.current.allImages);
        }
      } else {
        // 桌面端或首次加载：正常随机选择
        randomImages = getRandomImages(exampleCache.current.allImages);
      }
      
      setState(prev => ({ 
        ...prev,
        exampleImages: randomImages
      }));
    } else {
      console.warn('Example cache is empty, cannot refresh');
    }
  }, [state.exampleImages, getRandomImages]);

  // 刷新风格建议
  const refreshStyleSuggestions = useCallback(async () => {
    // 直接重新随机选择，不需要调用 loadStyleSuggestions
    const randomSuggestions = getRandomSuggestions(STYLE_SUGGESTIONS, 6, language);
    updateState({ styleSuggestions: randomSuggestions });
  }, [updateState, language]);

  // 删除图片
  const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    try {
      const { ImageService } = await import('../services/imageService');
      const success = await ImageService.deleteImage(imageId);
      
      if (success) {
        // 从生成的图片列表中移除
        setState(prevState => {
          const newGeneratedImages = prevState.generatedImages.filter(img => img.id !== imageId);
          
          // 重新计算历史状态
          const hasGenerationHistory = newGeneratedImages.length > 0;
          
          return {
            ...prevState,
            generatedImages: newGeneratedImages,
            hasGenerationHistory
          };
        });
      }
      
      return success;
    } catch (error) {
      console.error('Delete image error:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to delete image',
      });
      return false;
    }
  }, [updateState]);

  // 初始化加载（只执行一次）
  useEffect(() => {
    loadStyleSuggestions(); // 风格建议也只需要加载一次
    loadStyles(); // 加载风格列表
  }, []); // 空依赖数组，确保只执行一次

  // 当语言切换时重新加载风格建议
  useEffect(() => {
    const randomSuggestions = getRandomSuggestions(STYLE_SUGGESTIONS, 6, language);
    updateState({ styleSuggestions: randomSuggestions });
  }, [language, updateState]);

  // 当初始数据已加载时，加载示例图片
  useEffect(() => {
    if (state.isInitialDataLoaded) {
      loadExamplesIfNeeded(state.hasGenerationHistory);
    }
  }, [state.isInitialDataLoaded, state.hasGenerationHistory, loadExamplesIfNeeded]);

  // 手动加载示例图片的函数（用于外部调用）
  const loadExampleImages = useCallback(async () => {
    // 这个函数主要用于外部手动调用，实际的自动加载在 useEffect 中处理
    console.log('Manual load example images');
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, []);

  // 返回状态和操作
  return {
    // 状态
    ...state,
    
    // 操作
    setPrompt,
    setSelectedRatio,
    setSelectedColor,
    setSelectedQuantity,
    setSelectedStyle,
    setPublicVisibility,
    setShowStyleSelector,
    generateImages,
    loadExampleImages,
    loadStyleSuggestions,
    loadStyles,
    recreateExample,
    downloadImage,
    clearError,
    resetForm,
    refreshExamples,
    refreshStyleSuggestions,
    loadGeneratedImages,
    deleteImage,
    checkUserCredits,
    handleInsufficientCredits,
  };
};

export default useGeneratePage;
