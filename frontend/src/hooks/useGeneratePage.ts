import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import GenerateServiceInstance, { StyleSuggestion } from '../services/generateService';
import { STYLE_SUGGESTIONS, getRandomSuggestions } from '../utils/ideaSuggestions';

import { BaseImage } from '../services/imageService';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';

// Style接口定义 - 与stylesService保持一致
export interface Style {
  id: string;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  slug: string;
  // 从API来的字段
  title?: { en: string; zh: string };
  prompt?: { en: string; zh: string };
  imageUrl?: string;
}

export interface UseGeneratePageState {
  // 基础状态
  prompt: string;
  selectedColor: boolean; // true for colorful, false for black & white
  selectedQuantity: number; // 1 or 4 images to generate
  selectedStyle: Style | null; // 选中的风格
  publicVisibility: boolean; // Public Visibility
  enhanceEnabled: boolean; // Enhance toggle
  
  // 数据状态
  generatedImages: BaseImage[]; // 生成的图片
  styleSuggestions: StyleSuggestion[];
  styles: Style[]; // 风格列表
  
  // UI状态
  showStyleSelector: boolean; // 是否显示风格选择器
  
  // 加载状态
  isGenerating: boolean;
  isLoadingGenerated: boolean; // 加载状态（生成历史）
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
  setSelectedColor: (isColor: boolean) => void;
  setSelectedQuantity: (quantity: number) => void;
  setSelectedStyle: (style: Style | null) => void;
  setPublicVisibility: (visible: boolean) => void;
  setEnhanceEnabled: (enabled: boolean) => void;
  setShowStyleSelector: (show: boolean) => void;
  
  // API 操作
  generateImages: () => Promise<void>;
  loadStyleSuggestions: () => Promise<void>;
  loadStyles: () => Promise<void>;
  recreateExample: (exampleId: string) => Promise<void>;
  downloadImage: (imageId: string, format: 'png' | 'pdf') => Promise<void>;
  
  // 工具操作
  clearError: () => void;
  resetForm: () => void;
  refreshStyleSuggestions: () => void;
  loadGeneratedImages: (user?: any) => Promise<void>;
  deleteImage: (imageId: string) => Promise<boolean>;
  deleteImagesBatch: (imageIds: string[]) => Promise<{successIds: string[], failedIds: string[]}>;
  
  // 积分相关操作
  checkUserCredits: (user?: any) => void;
  handleInsufficientCredits: () => void;
}

export const useGeneratePage = (refreshUser?: () => Promise<void>): UseGeneratePageState & UseGeneratePageActions => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { language } = useLanguage();
  
  // 从路由state获取传递的数据
  const generateData = location.state as {
    prompt?: string;
    outputs?: number;
    color?: string;
    style?: any;
    enhance?: boolean;
    visibility?: string;
  } | null;
  
  
  // 从URL参数或路由state获取初始值，优先使用state
  const getInitialPrompt = () => generateData?.prompt || searchParams.get('prompt') || '';

  const getInitialOutputs = (): number => {
    if (generateData?.outputs) {
      return generateData.outputs;
    }
    const outputs = searchParams.get('outputs');
    const validOutputs = [1, 4];
    const parsedOutputs = parseInt(outputs || '1', 10);
    return validOutputs.includes(parsedOutputs) ? parsedOutputs : 1;
  };
  const getInitialColor = (): boolean => {
    if (generateData?.color) {
      return generateData.color === 'colorful';
    }
    const color = searchParams.get('color');
    return color !== 'blackwhite'; // Default to colorful unless explicitly set to blackwhite
  };
  const getInitialVisibility = (): boolean => {
    if (generateData?.visibility) {
      return generateData.visibility === 'public';
    }
    const visibility = searchParams.get('visibility');
    return visibility === 'public';
  };
  const getInitialEnhance = (): boolean => {
    if (generateData?.enhance !== undefined) {
      return generateData.enhance;
    }
    const enhance = searchParams.get('enhance');
    return enhance !== 'false'; // Default to true unless explicitly set to false
  };


  // 初始状态
  const initialState: UseGeneratePageState = {
    // 基础状态
    prompt: getInitialPrompt(),
    selectedColor: getInitialColor(),
    selectedQuantity: getInitialOutputs(),
    selectedStyle: null, // Default to no style, will be set by style loading logic
    publicVisibility: getInitialVisibility(),
    enhanceEnabled: getInitialEnhance(),
    
    // 数据状态
    generatedImages: [],
    styleSuggestions: [],
    styles: [], // 风格列表
    
    // UI状态
    showStyleSelector: false, // 默认不显示风格选择器
    
    // 加载状态
    isGenerating: false,
    isLoadingGenerated: false,
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

  const setEnhanceEnabled = useCallback((enhanceEnabled: boolean) => {
    updateState({ enhanceEnabled });
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
    } catch (error) {
      console.error('Failed to load generated images:', error);
      updateState({ 
        generatedImages: [], 
        isInitialDataLoaded: true,  // 即使出错也标记为加载完成
        hasGenerationHistory: false
      });
    }
  }, [updateState]);

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
      // smoothProgressUpdate(10);
      
      if (!state.prompt.trim()) {
        throw new Error('Please enter a prompt');
      }
      
      const styleId = state.selectedStyle ? state.selectedStyle.id : '';
      const styleValue = state.selectedStyle ? getLocalizedText(state.selectedStyle.name, 'en') : '';
      const styleNoteValue = state.selectedStyle ? getLocalizedText(state.selectedStyle.description, 'en') : '';

      const tattooResponse = await GenerateServiceInstance.generateTattooWithProgress({
        prompt: state.prompt,
        num_outputs: state.selectedQuantity,
        // Apply style settings (black&white overrides style for color settings)
        styleId: styleId, 
        style: styleValue,
        styleNote: styleNoteValue,
        // Apply color settings
        isColor: state.selectedColor,
        isPublic: state.publicVisibility
      }, (progress) => {
        // Update progress in real-time
        currentProgress.current = progress.percentage;
        targetProgress.current = progress.percentage;
        updateState({ generationProgress: progress.percentage });
      });
      
      // Handle completed generation
      if (tattooResponse && tattooResponse.localImages) {
        // Create BaseImage objects from all generated images
        const localImages = tattooResponse.localImages || [];
        if (localImages.length > 0) {
          const batchId = tattooResponse.batchId || tattooResponse.id;
          const newImages: BaseImage[] = localImages.map((localImage, index) => ({
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
  }, [state.isGenerating, state.prompt, state.selectedQuantity, state.selectedColor, state.selectedStyle, state.publicVisibility, state.canGenerate, updateState, handleInsufficientCredits]);

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
          imageUrl: apiStyle.imageUrl || undefined,
          // 保留原始字段用于调试
          title: apiStyle.title,
          prompt: apiStyle.prompt
        };
      });
      
      console.log('🔍 Debug - Converted styles:', styles);
      
      // 检查state或URL中是否有style参数，如果有则设置初始选中的style
      let initialSelectedStyle: Style | null = null;
      
      // 优先检查state中的style
      if (generateData?.style) {
        initialSelectedStyle = styles.find(style => style.id === generateData.style.id) || null;
        console.log('🔍 Debug - Initial selected style from state:', initialSelectedStyle);
      } else {
        // 然后检查URL参数
        const styleId = searchParams.get('style');
        if (styleId) {
          initialSelectedStyle = styles.find(style => style.id === styleId) || null;
          console.log('🔍 Debug - Initial selected style from URL:', initialSelectedStyle);
        }
      }
      
      updateState({ 
        styles: styles,
        selectedStyle: initialSelectedStyle,
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
      // 从生成的图片中查找
      const exampleImage = state.generatedImages.find(img => img.id === exampleId);
      
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
      
      // 回填 prompt、isPublic 到界面，不调用生成方法
      updateState({ 
        prompt: promptToUse,
        publicVisibility: exampleImage.isPublic || false,
        error: null
      });
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to load example data',
      });
    }
  }, [updateState, state.generatedImages, language]);

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

  // 批量删除图片（优化版本）
  const deleteImagesBatch = useCallback(async (imageIds: string[]): Promise<{successIds: string[], failedIds: string[]}> => {
    const successIds: string[] = [];
    const failedIds: string[] = [];
    
    try {
      const { ImageService } = await import('../services/imageService');
      
      // 并行执行所有删除操作
      const deletePromises = imageIds.map(async (imageId) => {
        try {
          const success = await ImageService.deleteImage(imageId);
          return { imageId, success };
        } catch (error) {
          console.error(`Delete image ${imageId} error:`, error);
          return { imageId, success: false };
        }
      });
      
      const results = await Promise.all(deletePromises);
      
      // 分离成功和失败的图片ID
      results.forEach(({ imageId, success }) => {
        if (success) {
          successIds.push(imageId);
        } else {
          failedIds.push(imageId);
        }
      });
      
      // 只在最后一次性更新状态（如果有成功删除的图片）
      if (successIds.length > 0) {
        setState(prevState => {
          const newGeneratedImages = prevState.generatedImages.filter(
            img => !successIds.includes(img.id)
          );
          
          // 重新计算历史状态
          const hasGenerationHistory = newGeneratedImages.length > 0;
          
          return {
            ...prevState,
            generatedImages: newGeneratedImages,
            hasGenerationHistory
          };
        });
      }
      
      return { successIds, failedIds };
    } catch (error) {
      console.error('Batch delete images error:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to delete images',
      });
      return { successIds, failedIds: imageIds };
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
    setSelectedColor,
    setSelectedQuantity,
    setSelectedStyle,
    setPublicVisibility,
    setEnhanceEnabled,
    setShowStyleSelector,
    generateImages,
    loadStyleSuggestions,
    loadStyles,
    recreateExample,
    downloadImage,
    clearError,
    resetForm,
    refreshStyleSuggestions,
    loadGeneratedImages,
    deleteImage,
    deleteImagesBatch,
    checkUserCredits,
    handleInsufficientCredits,
  };
};

export default useGeneratePage;
