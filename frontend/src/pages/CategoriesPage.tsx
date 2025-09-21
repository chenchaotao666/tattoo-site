import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Breadcrumb from '../components/common/Breadcrumb';
import { Category } from '../services/categoriesService';
import CategoryGrid from '../components/categories/CategoryGrid';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { useCategories } from '../contexts/CategoriesContext';
import SEOHead from '../components/common/SEOHead';
import { handleCategoryClick } from '../utils/categoryUtils';
import GenerateTextarea from '../components/common/GenerateTextarea';
const noResultIcon = '/images/no-data.svg';

const CategoriesPage: React.FC = () => {
  const { t } = useAsyncTranslation('categories');
  const { t: tCommon } = useAsyncTranslation('common');
  const navigate = useNavigate();

  // 状态管理
  const { categories, loading: isLoadingCategories } = useCategories();

  // 用于判断是否是初始加载状态
  const [hasInitialLoad, setHasInitialLoad] = React.useState(false);

  // 监听加载完成状态
  React.useEffect(() => {
    if (!isLoadingCategories && !hasInitialLoad) {
      setHasInitialLoad(true);
    }
  }, [isLoadingCategories, hasInitialLoad]);


  // 包装器函数，调用共享的handleCategoryClick
  const onCategoryClick = (category: Category) => {
    handleCategoryClick(category, navigate);
  };

  // 主分类列表页面
  return (
    <Layout>
      <SEOHead
        title={tCommon('seo.categories.title')}
        description={tCommon('seo.categories.description')}
        keywords={tCommon('seo.categories.keywords')}
        ogTitle={tCommon('seo.categories.title')}
        ogDescription={tCommon('seo.categories.description')}
        canonicalUrl={`${window.location.origin}/categories`}
        noIndex={true}
      />
      <div className="w-full bg-[#030414]">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: t('breadcrumb.home'), path: '/' },
            { label: t('breadcrumb.categories'), current: true }
          ]}
        />

        {/* Page Title */}
        <div className="container mx-auto text-center mb-4 lg:mb-12">
          <h1 className="text-center text-white text-3xl lg:text-[42px] font-bold capitalize mb-4 md:mb-[24px] leading-relaxed lg:leading-[1]">
            {isLoadingCategories ? <div>&nbsp;</div> : t('title', `${categories.length} categories to explore`, { count: categories.length })}
          </h1>
        </div>

        {/* Category Grid */}
        <div className="container mx-auto px-4 min-h-[800px] pb-20">
          <CategoryGrid
            categories={categories}
            isLoading={isLoadingCategories}
            emptyState={
              // 只有在初始加载完成且确实没有数据时才显示空状态
              categories.length === 0 && !isLoadingCategories && hasInitialLoad
                ? {
                  icon: noResultIcon,
                  title: t('emptyState.noCategories.title'),
                  description: t('emptyState.noCategories.description')
                }
                : undefined
            }
            onCategoryClick={onCategoryClick}
          />
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

export default CategoriesPage; 