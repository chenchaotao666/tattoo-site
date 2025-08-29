import React, { useState, useEffect } from 'react';
import { Category } from '../../services/categoriesService';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';
import { colors } from '../../styles/colors';

interface CategoryCardProps {
  category: Category;
  onCategoryClick: (category: Category) => void;
  showNameAndButton?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onCategoryClick,
  showNameAndButton = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileShowColor, setMobileShowColor] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const { language } = useLanguage();

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg断点
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = () => {
    onCategoryClick(category);
  };

  // 移动端点击切换颜色效果
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发父元素的点击事件
    setMobileShowColor(prev => !prev);
  };

  // 根据设备类型决定显示状态，只有当存在sourceUrl时才显示彩色效果
  const shouldShowColor = category.sourceUrl ? (isMobile ? mobileShowColor : isHovered) : false;

  // 图片错误处理
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // 处理displayName和display_name的多语言对象
    const nameToUse = category.name;
    const fallbackText = getLocalizedText(nameToUse, language) || 'Image';
    
    target.src = 'https://placehold.co/276x386?text=' + encodeURIComponent(fallbackText);
  };

  return (
    <div 
      className={`w-[278px] relative`}
      style={{ height: showNameAndButton ? '366px' : '278px' }}
      onClick={handleClick}
    >
      {/* 背景容器 */}
      <div 
        className="w-[278px] absolute left-0 top-0 rounded-2xl" 
        style={{ 
          backgroundColor: showNameAndButton ? colors.background.secondary : 'transparent',
          height: showNameAndButton ? '366px' : '278px'
        }}
      ></div>
      
      {/* 图片区域 */}
      <div 
        className="w-[278px] h-[278px] absolute left-0 top-0 overflow-hidden rounded-2xl cursor-pointer"
        style={{
          WebkitTapHighlightColor: 'transparent'
        }}
        {...(category.sourceUrl ? {
          onMouseEnter: () => !isMobile && setIsHovered(true),
          onMouseLeave: () => !isMobile && setIsHovered(false)
        } : {})}
      >
        {/* 黑白图片 - tattooUrl (默认显示) */}
        <img 
          className={`w-[278px] h-[278px] absolute left-0 top-0 object-cover rounded-2xl ${
            category.sourceUrl 
              ? `transition-opacity duration-500 ease-in-out ${shouldShowColor ? 'opacity-0' : 'opacity-100'}` 
              : ''
          }`}
          src={category.tattooUrl || 'https://placehold.co/278x278'}
          alt={getLocalizedText(category.name, language)}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            handleImageError(e);
            setImageLoaded(true);
          }}
        />
        
        {/* 彩色图片 - sourceUrl (悬停或点击时显示) */}
        {category.sourceUrl && (
          <img 
            className={`w-[278px] h-[278px] absolute left-0 top-0 object-cover rounded-2xl transition-opacity duration-500 ease-in-out ${
              shouldShowColor ? 'opacity-100' : 'opacity-0'
            }`}
            src={category.sourceUrl}
            alt={`${getLocalizedText(category.name, language)} colored`}
            onError={handleImageError}
          />
        )}
        
        {/* 移动端切换按钮 - 显示小图片效果 */}
        {isMobile && category.sourceUrl && (
          <div
            onClick={handleToggleClick}
            className="absolute bottom-2 right-2 max-w-12 max-h-12 rounded-lg shadow-md overflow-hidden transition-all duration-200 z-10 opacity-90 hover:opacity-100 border-2 border-white cursor-pointer"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            aria-label="切换彩色效果"
          >
            {/* 小的sourceUrl图片 */}
            <img
              src={category.sourceUrl}
              alt="Color preview"
              className="block max-w-12 max-h-12 w-auto h-auto object-contain"
              onError={handleImageError}
            />
          </div>
        )}
      </div>
      
      {/* 标题 */}
      {showNameAndButton && (
        <div className="w-[246px] absolute left-4 top-[294px] text-base font-bold leading-5 break-words" style={{ color: colors.text.secondary }}>
          {getLocalizedText(category.name, language)}
        </div>
      )}
      
      {/* 底部按钮区域 */}
      {showNameAndButton && (
        <div className="w-[278px] px-3 absolute left-0 top-[326px] flex justify-start items-center gap-2">
          <div 
            className="w-[254px] py-1.5 rounded border flex justify-center items-center gap-1 transition-colors duration-200 cursor-pointer" 
            style={{ borderColor: buttonHovered ? colors.special.highlight : colors.border.primary }}
            onMouseEnter={() => setButtonHovered(true)} 
            onMouseLeave={() => setButtonHovered(false)}
          >
            <div 
              className="text-sm font-normal leading-4 break-words transition-colors duration-200" 
              style={{ color: buttonHovered ? colors.special.highlight : colors.text.disabled }}
            >
              View all Tattoos
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCard; 