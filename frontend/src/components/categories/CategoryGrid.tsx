import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../../services/categoriesService';
import CategoryCard from '../categories/CategoryCard';
import { navigateWithLanguage } from '../../utils/navigationUtils';
import BaseButton from '../ui/BaseButton';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

interface CategoryGridProps {
  categories: Category[];
  isLoading?: boolean;
  emptyState?: {
    icon: string;
    title: string;
    description: string;
    actionButton?: {
      text: string;
      onClick: () => void;
    };
  };
  onCategoryClick?: (category: Category) => void;
  className?: string;
  showNameAndButton?: boolean;
  showMore?: boolean;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  isLoading = false,
  emptyState,
  onCategoryClick,
  className = '',
  showNameAndButton = true,
  showMore = false
}) => {
  const navigate = useNavigate();
  const { t } = useAsyncTranslation('home');

  const handleShowMoreClick = () => {
    navigateWithLanguage(navigate, '/categories');
  };
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-center items-center h-[300px] sm:h-[400px]">
          {/* 加载时不显示任何文本 */}
        </div>
      </div>
    );
  }

  if (categories.length === 0 && emptyState) {
    return (
      <div className={`w-full flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="text-center">
          {/* 检查icon是否是图片路径（包含.svg, .png, .jpg等）还是emoji */}
          {emptyState.icon.includes('.') ? (
            <div className="mb-6">
              <img 
                src={emptyState.icon} 
                alt={emptyState.title} 
                className="w-[305px] h-[200px] mx-auto"
              />
            </div>
          ) : (
            <div className="text-6xl mb-4">{emptyState.icon}</div>
          )}
          <p className="text-[#6B7280] text-base font-normal leading-6 mb-6">
            {emptyState.title}
          </p>
          {emptyState.actionButton && (
            <button
              onClick={emptyState.actionButton.onClick}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {emptyState.actionButton.text}
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleCategoryClick = (category: Category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <div className={`w-full bg-[#030414] ${className}`} data-category-grid-version="v1.0">
      {/* 桌面端网格布局 */}
      <div className="hidden lg:block">
        <div className="relative">
          <div className="grid grid-cols-4 gap-6 justify-center max-w-fit mx-auto">
            {categories.map((category, index) => (
              <div key={`${category.id}-desktop-${index}`}>
                <CategoryCard
                  category={category}
                  onCategoryClick={handleCategoryClick}
                  showNameAndButton={showNameAndButton}
                />
              </div>
            ))}
          </div>

          {/* U型渐变层和按钮 - 桌面端 */}
          {showMore && (
            <>
              {/* 渐变背景 */}
              <div
                className="absolute bottom-[-8px] left-0 right-0 pointer-events-none z-20"
                style={{
                  height: '200px',
                  background: 'linear-gradient(to top, rgba(3, 4, 20, 1) 0%, rgba(3, 4, 20, 0.95) 20%, rgba(3, 4, 20, 0.8) 40%, rgba(3, 4, 20, 0.5) 60%, rgba(3, 4, 20, 0.2) 80%, transparent 100%)'
                }}
              ></div>

              {/* See more 按钮 */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                <BaseButton
                  onClick={handleShowMoreClick}
                  variant="secondary"
                  width="w-auto"
                  height="h-[60px]"
                  className="backdrop-blur-sm bg-[rgba(3,4,20,0.20)] border-[#ECECEC]"
                  style={{
                    paddingLeft: '32px',
                    paddingRight: '32px',
                    paddingTop: '18px',
                    paddingBottom: '18px',
                    borderRadius: '62px',
                    outline: '1px #ECECEC solid',
                    outlineOffset: '-1px',
                    backdropFilter: 'blur(2px)',
                    color: '#ECECEC',
                    fontSize: '20px',
                    fontFamily: 'Roboto',
                    fontWeight: 500
                  }}
                >
                  {t('categoryGrid.seeMore')}
                </BaseButton>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 手机端网格布局 - 一列 */}
      <div className="block lg:hidden">
        <div className="relative">
          <div className="grid grid-cols-1 gap-4 max-w-fit mx-auto px-4">
            {categories.map((category, index) => (
              <div key={`${category.id}-mobile-${index}`}>
                <CategoryCard
                  category={category}
                  onCategoryClick={handleCategoryClick}
                  showNameAndButton={showNameAndButton}
                />
              </div>
            ))}
          </div>

          {/* 手机端 See more 按钮 */}
          {showMore && (
            <>
              {/* 渐变背景 */}
              <div
                className="absolute bottom-[-8px] left-0 right-0 pointer-events-none z-20"
                style={{
                  height: '150px',
                  background: 'linear-gradient(to top, rgba(3, 4, 20, 1) 0%, rgba(3, 4, 20, 0.95) 20%, rgba(3, 4, 20, 0.8) 40%, rgba(3, 4, 20, 0.5) 60%, rgba(3, 4, 20, 0.2) 80%, transparent 100%)'
                }}
              ></div>

              {/* See more 按钮 */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
                <BaseButton
                  onClick={handleShowMoreClick}
                  variant="secondary"
                  width="w-[235px]"
                  height="h-[60px]"
                  className="backdrop-blur-sm bg-[rgba(3,4,20,0.20)] border-[#ECECEC]"
                  style={{
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    borderRadius: '50px',
                    outline: '1px #ECECEC solid',
                    outlineOffset: '-1px',
                    backdropFilter: 'blur(2px)',
                    color: '#ECECEC',
                    fontSize: '16px',
                    fontFamily: 'Roboto',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('categoryGrid.seeMore')}
                </BaseButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid; 