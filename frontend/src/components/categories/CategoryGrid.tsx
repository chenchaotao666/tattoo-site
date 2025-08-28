import React from 'react';
import { Category } from '../../services/categoriesService';
import CategoryCard from '../categories/CategoryCard';

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
  maxColumns?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  isLoading = false,
  emptyState,
  onCategoryClick,
  className = '',
  maxColumns = { desktop: 4, tablet: 3, mobile: 2 }
}) => {
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
    <div className={`w-full ${className}`} data-category-grid-version="v1.0">
      {/* 网格布局 - 桌面端 */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-4 gap-6 justify-center max-w-fit mx-auto">
          {categories.map((category, index) => (
            <div key={`${category.id}-desktop-${index}`}>
              <CategoryCard
                category={category}
                onCategoryClick={handleCategoryClick}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* 网格布局 - 平板端 */}
      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-3 gap-4 justify-center max-w-fit mx-auto">
          {categories.map((category, index) => (
            <div key={`${category.id}-tablet-${index}`}>
              <CategoryCard
                category={category}
                onCategoryClick={handleCategoryClick}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* 网格布局 - 移动端 */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-3 justify-center max-w-fit mx-auto px-2">
          {categories.map((category, index) => (
            <div key={`${category.id}-mobile-${index}`}>
              <CategoryCard
                category={category}
                onCategoryClick={handleCategoryClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid; 