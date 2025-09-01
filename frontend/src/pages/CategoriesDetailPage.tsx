import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import Breadcrumb from '../components/common/Breadcrumb';
import { CategoriesService, Category, TagCount } from '../services/categoriesService';
import { useCategories } from '../contexts/CategoriesContext';
import { BaseImage } from '../services/imageService';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { getCategoryIdByName, getCategoryNameById, isCategoryName, convertDisplayNameToPath, addCategoryToMappings } from '../utils/categoryUtils';
import { getImageNameById, updateImageMappings } from '../utils/imageUtils';
import { navigateWithLanguage } from '../utils/navigationUtils';
import SEOHead from '../components/common/SEOHead';
import ImageGrid from '../components/iamges/ImageGrid';


const CategoriesDetailPage: React.FC = () => {
  const { t } = useAsyncTranslation('categories');
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { categories: allCategories, loading: categoriesLoading } = useCategories();
  
  // 从导航状态中获取分类数据
  const categoryFromState = location.state?.category as Category | undefined;

  const [category, setCategory] = useState<Category | null>(null);
  const [, setActualCategoryId] = useState<string | null>(null); // 保存实际的categoryId
  const [categoryImages, setCategoryImages] = useState<BaseImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<BaseImage[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [isImagesLoading, setIsImagesLoading] = useState(true);
  const loadingRef = useRef<string>(''); // 用于跟踪当前正在加载的key

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!categoryId) return;
      
      // 防止重复加载
      const currentKey = `${categoryId}-${language}`;
      if (loadingRef.current === currentKey) {
        return;
      }

      // 优先使用从导航状态传递的数据
      if (categoryFromState && categoryFromState.id) {
        setCategory(categoryFromState);
        setActualCategoryId(categoryFromState.id);
        setIsCategoryLoading(false);
        
        // 仍然需要加载图片数据
        try {
          setIsImagesLoading(true);
          const result = await CategoriesService.getImagesByCategoryId(categoryFromState.id);
          setCategoryImages(result.images);
          setFilteredImages(result.images);
          updateImageMappings(result.images);
          
          setIsImagesLoading(false);
        } catch (error) {
          console.error('Error loading images from state:', error);
          setIsImagesLoading(false);
        }

        loadingRef.current = currentKey;
        return;
      }
      
      // 等待分类数据加载完成
      if (categoriesLoading) {
        return;
      }
      
      if (allCategories.length === 0) {
        setIsCategoryLoading(false);
        setIsImagesLoading(false);
        return;
      }

      try {
        setIsCategoryLoading(true);

        // 🔧 重新设计：假设URL参数都是SEO友好名称，直接通过名称匹配查找分类
        const categoryName = categoryId.toLowerCase();
        
        let actualCategoryId: string;
        let foundCategory: any = null;

        // 首先尝试从映射表获取（如果映射表已填充）
        if (isCategoryName(categoryId)) {
          actualCategoryId = getCategoryIdByName(categoryId);
          foundCategory = allCategories.find(cat => cat.id === actualCategoryId);
        } else {
          // 直接在全量数据中搜索匹配的分类
          foundCategory = allCategories.find(cat => {
            const displayName = typeof cat.name === 'string'
              ? cat.name
              : (cat.name.en || cat.name.zh || '');

            // 生成SEO友好名称并进行匹配
            const seoName = convertDisplayNameToPath(displayName);
            const matches = seoName === categoryName;
            
            return matches;
          });

          if (foundCategory) {
            actualCategoryId = foundCategory.categoryId;
            // 添加到映射表以确保后续使用正常
            addCategoryToMappings(foundCategory);
          }
        }
        
        // 最后的降级处理：如果仍然没找到，检查是否传入的就是categoryId（兼容旧链接）
        if (!foundCategory && categoryId.length > 10) {
          foundCategory = allCategories.find(cat => cat.id === categoryId);
          if (foundCategory) {
            actualCategoryId = categoryId;
            // 也添加到映射表
            addCategoryToMappings(foundCategory);
          }
        }

        if (foundCategory) {
          setCategory(foundCategory);
          setActualCategoryId(foundCategory.categoryId); // 保存实际的categoryId
          setIsCategoryLoading(false); // 分类信息加载完成，立即显示

          // 异步加载分类图片，不阻塞分类信息显示（使用实际的categoryId）
          setIsImagesLoading(true);
          const result = await CategoriesService.getImagesByCategoryId(foundCategory.categoryId);

          setCategoryImages(result.images);
          setFilteredImages(result.images);

          // 更新图片映射表
          updateImageMappings(result.images);

          // 生成子分类列表（从分类的tagCounts获取标签信息）
          if (foundCategory && foundCategory.tagCounts && foundCategory.tagCounts.length > 0) {
            // 设置标签计数映射和标签ID映射
            const countMap = new Map<string, number>();
            const mappingMap = new Map<string, string>();
            foundCategory.tagCounts.forEach((tagCount: TagCount) => {
              const tagName = typeof tagCount.displayName === 'string' 
                ? tagCount.displayName 
                : getLocalizedText(tagCount.displayName, language);
              countMap.set(tagName, tagCount.count);
              mappingMap.set(tagName, tagCount.tagId); // 建立显示名称到tagId的映射
            });
          }

          setIsImagesLoading(false);
        } else {
          // 没有找到分类，标记加载完成以显示错误页面
          setIsCategoryLoading(false);
          setIsImagesLoading(false);
        }

        loadingRef.current = currentKey;
      } catch (error) {
        console.error('Failed to load category data:', error);
        setIsCategoryLoading(false);
        setIsImagesLoading(false);
      } finally {
        loadingRef.current = ''; // 清空加载标记
      }
    };

    loadCategoryData();
  }, [categoryId, language, categoriesLoading, allCategories]); // 包含categories相关依赖

  const handleBackToCategories = () => {
    navigateWithLanguage(navigate, '/categories');
  };

  // 获取基础面包屑（即使分类还在加载也可以显示）
  const getBreadcrumbPathEarly = () => {
    return [
      { label: t('breadcrumb.home'), path: '/' },
      { label: t('breadcrumb.categories'), path: '/categories' },
      { label: category ? getLocalizedText(category.name, language) : '', current: true }
    ];
  };

  // 如果分类加载失败且没有找到分类
  if (!isCategoryLoading && !category) {
    return (
      <Layout>
        <div className="w-full bg-black pb-16 md:pb-[120px]">
          {/* Breadcrumb - 即使出错也显示 */}
          <Breadcrumb
            items={[
              { label: t('breadcrumb.home'), path: '/' },
              { label: t('breadcrumb.categories'), path: '/categories' },
              { label: t('detail.notFound.title'), current: true }
            ]}
          />

          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-[#161616] mb-2">{t('detail.notFound.title')}</h3>
                <p className="text-[#6B7280] text-sm max-w-md mb-6">
                  {t('detail.notFound.description')}
                </p>
                <Button onClick={handleBackToCategories} variant="gradient">
                  {t('detail.notFound.backButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={category ? `${categoryImages.length} ${getLocalizedText(category.seoTitle || category.name, language)}` : 'Category - Free Coloring Pages'}
        description={category ? getLocalizedText(category.seoDesc || `Download free printable ${getLocalizedText(category.name, language).toLowerCase()} coloring pages. High-quality PDF and PNG formats available instantly.`, language) : 'Browse free printable coloring pages by category.'}
        keywords={category ? `${getLocalizedText(category.name, language).toLowerCase()} coloring pages, free printable coloring pages, ${getLocalizedText(category.name, language).toLowerCase()} coloring sheets` : 'coloring pages, printable coloring pages'}
        ogTitle={category ? `${categoryImages.length} ${getLocalizedText(category.seoTitle || category.name, language)}` : 'Category - Free Coloring Pages'}
        ogDescription={category ? getLocalizedText(category.seoDesc || `Download free printable ${getLocalizedText(category.name, language).toLowerCase()} coloring pages. High-quality PDF and PNG formats available instantly.`, language) : 'Browse free printable coloring pages by category.'}
        noIndex={true}
      />
      <div className="w-full bg-black pb-4 md:pb-20 relative">
        {/* Breadcrumb - 始终显示 */}
        <div className="pb-4">
          <Breadcrumb items={getBreadcrumbPathEarly()} />
        </div>

        {/* Category Header */}
        {category && (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-white text-center mb-4">
              {getLocalizedText(category.name, language)}
            </h1>
            <p className="text-gray-300 text-center mb-8">
              {getLocalizedText(category.description || category.name, language)}
            </p>
          </div>
        )}

        {/* Images Grid */}
        <div className="container mx-auto px-4">
          <ImageGrid
            images={filteredImages.map(image => ({
              id: image.id,
              imageUrl: image.tattooUrl,
              description: typeof image.description === 'string' 
                ? image.description 
                : getLocalizedText(image.description, language) || getImageNameById(image.id) || 'Tattoo design',
              tags: image.tags?.map(tag => 
                typeof tag.name === 'string' ? tag.name : getLocalizedText(tag.name, language)
              ) || []
            }))}
            isLoading={isImagesLoading}
            noDataTitle={t('detail.noImages.title') || 'No images found'}
            onImageClick={(image) => {
              if (!category) return;
              
              const imagePath = getImageNameById(image.id);
              const categoryPath = getCategoryNameById(category.id);
              
              const targetPath = `/categories/${categoryPath}/${imagePath}`;
              navigateWithLanguage(navigate, targetPath, {
                state: { 
                  image: image,
                  category: category
                }
              });
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesDetailPage; 