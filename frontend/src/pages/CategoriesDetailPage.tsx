import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import Breadcrumb from '../components/common/Breadcrumb';
import { CategoriesService, Category, TagCount } from '../services/categoriesService';
import { useCategories } from '../contexts/CategoriesContext';
import { BaseImage } from '../services/imageService';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { getCategoryIdByName, getCategoryPathById, isCategoryName, convertDisplayNameToPath, addCategoryToMappings } from '../utils/categoryUtils';
import { getImageNameById, updateImageMappings } from '../utils/imageUtils';
import { navigateWithLanguage } from '../utils/navigationUtils';
import SEOHead from '../components/common/SEOHead';
import ImageGrid from '../components/iamges/ImageGrid';
import GenerateTextarea from '../components/common/GenerateTextarea';
import ExpandableContent from '../components/categories/ExpandableContent';


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
            actualCategoryId = foundCategory.id;
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
          setActualCategoryId(foundCategory.id); // 保存实际的categoryId
          setIsCategoryLoading(false); // 分类信息加载完成，立即显示

          // 异步加载分类图片，不阻塞分类信息显示（使用实际的categoryId）
          setIsImagesLoading(true);
          const result = await CategoriesService.getImagesByCategoryId(foundCategory.id);

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
        <div className="w-full bg-[#030414] pb-16 md:pb-[120px]">
          {/* Breadcrumb - 即使出错也显示 */}
          <Breadcrumb
            items={[
              { label: t('breadcrumb.home'), path: '/' },
              { label: t('breadcrumb.categories'), path: '/categories' },
              { label: t('detail.notFound.title'), current: true }
            ]}
          />

          <div className="flex flex-col items-center justify-center text-xl font-semibold text-[#fff] mb-2">allCategories.length: {allCategories.length}</div>
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
      {/* <SEOHead
        title={
          category
            ? `${categoryImages.length > 0 ? categoryImages.length : ''} ${getLocalizedText(category.name, 'en')} Tattoo Designs - Free AI Generator`
            : `${categoryId ? categoryId.replace(/-/g, ' ') : 'Category'} Tattoo Designs - Free AI Generator`
        }
        description={
          category
            ? `Browse and download free ${getLocalizedText(category.name, 'en').toLowerCase()} tattoo designs. Create custom ${getLocalizedText(category.name, 'en').toLowerCase()} tattoo artwork with our AI generator. High-quality designs for tattoo enthusiasts.`
            : `Explore ${categoryId ? categoryId.replace(/-/g, ' ') : 'various'} tattoo designs and create custom tattoo artwork with our AI generator. Free high-quality designs for tattoo enthusiasts.`
        }
        keywords={
          category
            ? `${getLocalizedText(category.name, 'en').toLowerCase()} tattoo designs, ${getLocalizedText(category.name, 'en').toLowerCase()} tattoo ideas, AI tattoo generator, custom ${getLocalizedText(category.name, 'en').toLowerCase()} tattoos, free tattoo designs`
            : `${categoryId ? categoryId.replace(/-/g, ' ') : 'tattoo'} designs, AI tattoo generator, custom tattoo designs, free tattoo ideas`
        }
        ogTitle={
          category
            ? `${categoryImages.length > 0 ? categoryImages.length : ''} ${getLocalizedText(category.name, 'en')} Tattoo Designs`
            : `${categoryId ? categoryId.replace(/-/g, ' ') : 'Category'} Tattoo Designs`
        }
        ogDescription={
          category
            ? `Browse and download free ${getLocalizedText(category.name, 'en').toLowerCase()} tattoo designs. High-quality AI-generated designs.`
            : `Explore ${categoryId ? categoryId.replace(/-/g, ' ') : 'various'} tattoo designs with our AI generator.`
        }
        canonicalUrl={`${window.location.origin}/categories/${categoryId || 'category'}`}
      /> */}
      <SEOHead
        title={'Tattoo Designs - Free AI Generator'}
        description={'Browse and download free tattoo artwork with our AI generator. High-quality designs for tattoo enthusiasts.'}
        keywords={'attoo ideas, AI tattoo generator'}
        ogTitle={'Tattoo Designs'}
        ogDescription={'Browse and download free tattoo designs. High-quality AI-generated designs.'}
        canonicalUrl={`${window.location.origin}/categories/category`}
      />
      <div className="w-full bg-[#030414] relative">
        {/* Breadcrumb - 始终显示 */}
        <div>
          <Breadcrumb items={getBreadcrumbPathEarly()} />
        </div>

        {/* Category Title */}
        <div className="container mx-auto px-4">
          <h1 className="text-center text-white text-3xl lg:text-[2.5rem] font-bold capitalize mb-4 md:mb-[24px] leading-relaxed lg:leading-[1]">
            {t('detail.pageTitle', undefined, {
              count: isImagesLoading ? '...' : categoryImages.length,
              category: getLocalizedText(category?.name, language)
            })}
          </h1>
        </div>

        {/* Category Intro Section - 立即显示，不等待分类加载 */}
        <div className="container mx-auto px-4 pb-10">
          <div className="mx-auto mb-12">
            <div className="mb-4">
              <p className="text-white text-lg font-medium text-left">
                {t('detail.categoryIntro.imageCount', 'We will show {count} {category} tattoo designs!', {
                    count: isImagesLoading ? '...' : categoryImages.length,
                    category: category ? getLocalizedText(category?.name, language).toLowerCase() : ''
                  })}
              </p>
            </div>

            <ExpandableContent
              content={
                <div className="text-center">
                  <p className="mb-4">
                    {
                      t('detail.categoryIntro.description', 'Tattoo designs are not just art, but an effective way to express personality and creativity. They enhance self-expression while fostering artistic appreciation. During the design process, clients can explore their aesthetic preferences and personal style. It\'s also a great way to commemorate special moments and help people express their identity. Tattoo art also strengthens cultural understanding and improves artistic sense. For artists, tattooing is also a great way to showcase creativity and technical skills.')
                    }
                  </p>
                  <p>
                    {
                      t('detail.categoryIntro.downloadInfo', 'All {category} tattoo designs are available for free download in high-quality formats', {
                        category: category ? getLocalizedText(category?.name, language).toLowerCase() : ''
                      })
                    }
                  </p>
                </div>
              }
              maxLines={1}
              viewMoreText={t('detail.viewMore')}
              collapseText={t('detail.collapse')}
              className="text-gray-300 text-base lg:text-lg leading-relaxed"
            />
          </div>
        </div>

        {/* Main Content Container */}
        <div className="container mx-auto px-4">
          {isCategoryLoading ? (
            /* 分类信息加载中 - 显示加载状态但保持页面结构 */
            <div className="flex justify-center items-center py-20 h-[600px]">
              <div className="text-white text-center">
              </div>
            </div>
          ) : category ? (
            /* 分类内容 - 分类信息加载完成后立即显示 */
            <>
              {/* Category Header */}
              <div className="pb-4">
                <h2 className="font-bold text-white text-center text-[42px] mb-4">
                  {getLocalizedText(category.name, language)}
                </h2>
                <h3 className="text-gray-300 text-center mb-8">
                  {getLocalizedText(category.description || category.name, language)}
                </h3>
              </div>
            </>
          ) : null}
        </div>

        {/* Images Grid */}
        <div className="container mx-auto px-4 pb-20">
          {!isCategoryLoading && category && (
            <ImageGrid
              images={filteredImages}
              isLoading={isImagesLoading}
              noDataTitle={t('detail.noImages.title') || 'No images found'}
              onImageClick={(image) => {
                if (!category) return;

                const imagePath = getImageNameById(image.id);
                const categoryPath = getCategoryPathById(category.id);

                const targetPath = `/categories/${categoryPath}/${imagePath}`;
                navigateWithLanguage(navigate, targetPath, {
                  state: {
                    image: image,
                    category: category
                  }
                });
              }}
            />
          )}
        </div>

        {/* Generate Section */}
        <div className="container mx-auto px-4 mb-20 mt-20">
          {/* Title */}
          <div className="w-full text-center mb-12">
            <h2 className="text-[#ECECEC] text-[46px] font-['Inter'] font-bold capitalize leading-none">
              Try creating your own tattoo
            </h2>
          </div>
          
          {/* Generate Textarea */}
          <div className="flex justify-center">
            <GenerateTextarea 
              showBorderGradient={false}
              showDescriptionLabel={false}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesDetailPage; 