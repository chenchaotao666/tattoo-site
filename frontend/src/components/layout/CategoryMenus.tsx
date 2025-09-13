import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Category } from '../../services/categoriesService';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { generateLanguagePath } from '../common/LanguageRouter';
import { getLocalizedText } from '../../utils/textUtils';
import { handleCategoryClick } from '../../utils/categoryUtils';

interface CategoryMenusProps {
  isVisible: boolean;
  popularMenus: {
    title: string;
    categories: Category[];
  };
  NewMenus: Category[];
  onClose: () => void;
}

const CategoryMenus: React.FC<CategoryMenusProps> = ({ 
  isVisible, 
  popularMenus,
  NewMenus,
  onClose 
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const createLocalizedLink = (path: string) => {
    return generateLanguagePath(language, path);
  };

  if (!isVisible) return null;

  // 检查NewMenus是否为空
  const hasNewMenus = NewMenus && NewMenus.length > 0;
  
  // 将popularMenus.categories分成列
  const popularCategories = popularMenus.categories;
  let categoryGroups = [];

  if (hasNewMenus) {
    // 如果有NewMenus，popularMenus分成2列，NewMenus分成2列
    const popularCol1 = popularCategories.slice(0, Math.ceil(popularCategories.length / 2));
    const popularCol2 = popularCategories.slice(Math.ceil(popularCategories.length / 2));
    const newCol1 = NewMenus.slice(0, Math.ceil(NewMenus.length / 2));
    const newCol2 = NewMenus.slice(Math.ceil(NewMenus.length / 2));
    
    categoryGroups = [
      {
        title: popularMenus.title,
        items: popularCol1
      },
      {
        title: "", // 隐藏的标题，显示popularMenus的第二列
        items: popularCol2
      },
      {
        title: "2025 New Tattoos",
        items: newCol1
      },
      {
        title: "", // 隐藏的标题，显示NewMenus的第二列
        items: newCol2
      }
    ];
  } else {
    // 如果没有NewMenus，popularMenus分成4列
    const itemsPerColumn = Math.ceil(popularCategories.length / 4);
    const popularCol1 = popularCategories.slice(0, itemsPerColumn);
    const popularCol2 = popularCategories.slice(itemsPerColumn, itemsPerColumn * 2);
    const popularCol3 = popularCategories.slice(itemsPerColumn * 2, itemsPerColumn * 3);
    const popularCol4 = popularCategories.slice(itemsPerColumn * 3);
    
    categoryGroups = [
      {
        title: popularMenus.title,
        items: popularCol1
      },
      {
        title: "", // 隐藏的标题，显示popularMenus的第二列
        items: popularCol2
      },
      {
        title: "", // 隐藏的标题，显示popularMenus的第三列
        items: popularCol3
      },
      {
        title: "", // 隐藏的标题，显示popularMenus的第四列
        items: popularCol4
      }
    ];
  }

  return (
    <div 
      className="absolute top-full mt-2 left-0 rounded-2xl z-50 overflow-hidden"
      style={{
        width: '868px', // 始终保持4列的宽度
        height: '328px',
        background: '#19191F',
        boxShadow: '0px 2px 4px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* 分类列 */}
      {categoryGroups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="absolute flex flex-col gap-2"
          style={{
            width: '187px',
            left: `${24 + groupIndex * 211}px`,
            top: '24px'
          }}
        >
          {/* 标题 */}
          <div className="flex items-center gap-2 py-1" style={{ width: '177px' }}>
            <div 
              className={`flex-1 text-sm font-bold ${group.title ? 'text-[#ECECEC]' : 'opacity-0'}`}
              style={{ fontFamily: 'Inter' }}
            >
              {group.title || "Hidden"}
            </div>
          </div>

          {/* 分类项 */}
          {group.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex items-center" style={{ width: '177px' }}>
              <button
                onClick={() => {
                  handleCategoryClick(item, navigate);
                  onClose();
                }}
                className="flex-1 text-left text-sm font-normal text-[#A5A5A5] hover:text-[#98FF59] transition-colors duration-200 py-1"
                style={{ fontFamily: 'Inter' }}
              >
                {getLocalizedText(item.name)}
              </button>
            </div>
          ))}
        </div>
      ))}

      {/* 分隔线 */}
      <div
        className="absolute"
        style={{
          width: '820px', // 始终保持4列的宽度
          height: '0px',
          left: '24px',
          top: '263px',
          outline: '1px #393B42 solid',
          outlineOffset: '-0.5px'
        }}
      />

      {/* 底部文字 */}
      <div
        className="absolute text-sm font-normal text-[#A5A5A5]"
        style={{
          left: '24px',
          top: '287px',
          fontFamily: 'Inter'
        }}
      >
        Over 10,000 Tattoo Inspirations, Unlock Your Unique Imprint!
      </div>

      {/* View all 链接 */}
      <Link
        to={createLocalizedLink("/categories")}
        onClick={onClose}
        className="absolute flex items-center gap-2 hover:opacity-80 transition-opacity"
        style={{
          left: '771px', // 始终保持右侧位置
          top: '287px'
        }}
      >
        <div className="text-sm font-normal text-[#98FF59]" style={{ fontFamily: 'Inter' }}>
          View all
        </div>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5"
          style={{ transform: 'translateY(2px)' }}
        >
          <path 
            d="M13.9239 7.9006C13.9996 7.70918 14.0194 7.49854 13.9808 7.29533C13.9421 7.09212 13.8468 6.90548 13.7069 6.75902L9.70661 2.56973C9.61436 2.4697 9.50401 2.38992 9.382 2.33503C9.25999 2.28014 9.12876 2.25125 8.99597 2.25004C8.86318 2.24883 8.73149 2.27533 8.60859 2.32799C8.48569 2.38065 8.37403 2.45842 8.28013 2.55675C8.18623 2.65509 8.11197 2.77202 8.06169 2.90074C8.0114 3.02945 7.9861 3.16736 7.98725 3.30642C7.98841 3.44548 8.016 3.58291 8.06841 3.71069C8.12082 3.83847 8.19701 3.95404 8.29252 4.05065L10.5867 6.4532H1.00006C0.73483 6.4532 0.48046 6.56354 0.292912 6.75996C0.105364 6.95637 0 7.22276 0 7.50052C0 7.77829 0.105364 8.04468 0.292912 8.24109C0.48046 8.4375 0.73483 8.54784 1.00006 8.54784H10.5867L8.29352 10.9494C8.19801 11.046 8.12182 11.1615 8.06941 11.2893C8.017 11.4171 7.98941 11.5545 7.98825 11.6936C7.9871 11.8326 8.0124 11.9706 8.06269 12.0993C8.11297 12.228 8.18723 12.3449 8.28113 12.4432C8.37503 12.5416 8.48669 12.6194 8.60959 12.672C8.73249 12.7247 8.86418 12.7512 8.99697 12.75C9.12976 12.7488 9.26099 12.7199 9.383 12.665C9.50501 12.6101 9.61536 12.5303 9.70761 12.4303L13.7079 8.24098C13.8005 8.14348 13.8739 8.02781 13.9239 7.9006Z" 
            fill="#98FF59"
          />
        </svg>
      </Link>
    </div>
  );
};

export default CategoryMenus;