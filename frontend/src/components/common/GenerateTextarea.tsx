import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, useAsyncTranslation } from '../../contexts/LanguageContext';
import { STYLE_SUGGESTIONS, getRandomSuggestions } from '../../utils/ideaSuggestions';
import { getLocalizedText } from '../../utils/textUtils';
import { navigateWithLanguage } from '../../utils/navigationUtils';
import { UrlUtils } from '../../utils/urlUtils';
import { Style } from '../../hooks/useGeneratePage';
import { colors } from '../../styles/colors';
import BaseButton from '../ui/BaseButton';
import React from 'react';

// Fallback colors in case import fails
const fallbackColors = {
  gradient: {
    primary: 'linear-gradient(90deg, #59FFD0 0%, #98FF59 100%)',
    primaryGlow: 'linear-gradient(90deg, rgba(89, 255, 207, 0.40) 0%, rgba(152, 255, 89, 0.40) 100%)'
  },
  special: {
    highlight: '#98FF59'
  }
};

const safeColors = colors || fallbackColors;

interface GenerateTextareaProps {
  onGenerate?: () => void;
  className?: string;
  onStyleChange?: (style: Style | null) => void;
  showBorderGradient?: boolean;
  showDescriptionLabel?: boolean;
}

const GenerateTextarea = ({ 
  onGenerate, 
  className = "", 
  onStyleChange,
  showBorderGradient = true,
  showDescriptionLabel = true
}: GenerateTextareaProps) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1); // 1 or 4 outputs
  const [selectedColor, setSelectedColor] = useState(true); // true for colorful, false for black & white
  const [showQuantityDropdown, setShowQuantityDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [styles, setStyles] = useState<Style[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const { language } = useLanguage();
  const { t } = useAsyncTranslation('components');
  const navigate = useNavigate();
  
  const quantityDropdownRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const styleSelectorRef = useRef<HTMLDivElement>(null);

  // 自定义滚动条样式 - 始终显示
  const scrollbarStyles = `
    .style-dropdown-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .style-dropdown-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .style-dropdown-scrollbar::-webkit-scrollbar-thumb {
      background: #4E5056;
      border-radius: 3px;
      transition: background 0.2s ease;
    }
    .style-dropdown-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #6B7280;
    }
  `;

  const handleGenerateClick = () => {
    if (onGenerate) {
      onGenerate();
    } else {
      // 通过state传递数据到create页面
      const generateData = {
        prompt: inputValue.trim(),
        outputs: selectedQuantity,
        color: selectedColor ? 'colorful' : 'blackwhite',
        style: selectedStyle,
        enhance: true,
        visibility: 'private'
      };
      
      // 导航到create页面，通过state传递数据
      navigateWithLanguage(navigate, '/create', { state: generateData });
    }
  };

  const handleRandomClick = () => {
    // 使用共享的随机选择函数，支持多语言
    const randomSuggestions = getRandomSuggestions(STYLE_SUGGESTIONS, 1, language as 'zh' | 'en');
    if (randomSuggestions.length > 0) {
      setInputValue(randomSuggestions[0].content);
    }
  };

  // 加载风格列表 - 从 useGeneratePage.ts 复制
  const loadStyles = async () => {
    try {
      // 调用 stylesService 获取风格列表
      const { default: stylesService } = await import('../../services/stylesService');
      const apiStyles = await stylesService.getAll();
      
      // 将API数据转换为本地Style接口格式
      const loadedStyles: Style[] = apiStyles.map(apiStyle => {
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
      
      setStyles(loadedStyles);
    } catch (error) {
      console.error('Load styles error:', error);
    }
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quantityDropdownRef.current && !quantityDropdownRef.current.contains(event.target as Node)) {
        setShowQuantityDropdown(false);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setShowColorDropdown(false);
      }
      if (styleSelectorRef.current && !styleSelectorRef.current.contains(event.target as Node)) {
        setShowStyleSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 初始化加载风格列表
  useEffect(() => {
    loadStyles();
  }, []);

  // 管理滚动条样式
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = scrollbarStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className={`w-full max-w-[1170px] ${className}`}>
      {/* Main Input Area */}
      <div 
        className={`w-full ${!showBorderGradient ? 'h-[160px]' : 'h-[252px]'} ${!showBorderGradient ? 'rounded-lg' : 'rounded-2xl'} ${showBorderGradient ? 'p-[1px]' : ''} relative`}
        style={{
          background: showBorderGradient ? (safeColors.gradient?.primary || 'linear-gradient(90deg, #59FFD0 0%, #98FF59 100%)') : 'transparent',
          boxShadow: showBorderGradient ? '0 0 30px 8px rgba(89, 255, 207, 0.15), 0 0 60px 12px rgba(152, 255, 89, 0.1)' : 'none'
        }}
      >
        {/* Inner content area */}
        <div 
          className={`w-full h-full bg-[#19191F] ${!showBorderGradient ? 'rounded-lg border border-[#393B42]' : 'rounded-2xl'} ${!showBorderGradient ? 'p-4' : 'p-6'} relative`}
          style={!showBorderGradient ? { backdropFilter: 'blur(2px)' } : {}}
        >
          {/* Background gradient glow */}
          {showBorderGradient && (
            <div 
              className="absolute inset-0 rounded-2xl -z-10"
              style={{
                background: safeColors.gradient?.primaryGlow || 'linear-gradient(90deg, rgba(89, 255, 207, 0.40) 0%, rgba(152, 255, 89, 0.40) 100%)',
                filter: 'blur(20px)'
              }}
            ></div>
          )}
        
          {/* Description Label */}
          {showDescriptionLabel && (
            <div className="text-[#C8C8C8] text-sm font-['Inter'] font-normal leading-[18px] mb-2">
              {t('generateTextarea.descriptionPrompt')}
            </div>
          )}
          
          {/* Input Field */}
          <div className={`relative ${!showBorderGradient ? 'mb-2' : 'mb-4'}`}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`w-full ${!showBorderGradient ? 'h-16' : 'h-28'} bg-transparent text-white ${!showBorderGradient ? 'text-sm' : 'text-xl'} font-['Inter'] font-medium ${!showBorderGradient ? 'leading-[20px]' : 'leading-[30px]'} resize-none focus:outline-none placeholder-[#818181]`}
              placeholder={t('generateTextarea.placeholder')}
            />
          </div>

          {/* Options Row - Combined in one line */}
          <div className={`flex items-center justify-between ${!showBorderGradient ? 'absolute bottom-4 left-4 right-4' : ''}`}>
            {/* Options - Left side */}
            <div className="flex items-center gap-3 flex-wrap">
              <div 
                className="h-10 px-3 py-2 bg-[#26262D] rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#2A2A31] transition-colors"
                onClick={handleRandomClick}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 13.75L18.3334 15.4167L16.6667 17.0833" stroke="#A5A5A5" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.6667 2.91669L18.3334 4.58335L16.6667 6.25002" stroke="#A5A5A5" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.3333 4.58331H15.4167C12.4251 4.58331 10 7.00844 10 9.99998C10 12.9915 12.4251 15.4166 15.4167 15.4166H18.3333" stroke="#A5A5A5" strokeWidth="1.66667" strokeLinecap="round"/>
                  <path d="M1.66675 15.4166H4.58341C7.57496 15.4166 10.0001 12.9915 10.0001 9.99998C10.0001 7.00844 7.57496 4.58331 4.58341 4.58331H1.66675" stroke="#A5A5A5" strokeWidth="1.66667" strokeLinecap="round"/>
                </svg>
                <span className="text-[#A5A5A5] text-base font-['Inter'] font-normal">{t('generateTextarea.random')}</span>
              </div>
              
              {/* Quantity Selector Dropdown */}
              <div className="relative" ref={quantityDropdownRef}>
                <div 
                  className="h-10 px-3 py-2 bg-[#26262D] rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#2A2A31] transition-colors"
                  onClick={() => setShowQuantityDropdown(!showQuantityDropdown)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M2.08325 4.16665C2.08325 3.70641 2.45635 3.33331 2.91659 3.33331H17.0833C17.5435 3.33331 17.9166 3.70641 17.9166 4.16665V15.8333C17.9166 16.2936 17.5435 16.6666 17.0833 16.6666H2.91659C2.45635 16.6666 2.08325 16.2936 2.08325 15.8333V4.16665Z" stroke="#A5A5A5" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M6.04175 7.5C6.38691 7.5 6.66675 7.22017 6.66675 6.875C6.66675 6.52983 6.38691 6.25 6.04175 6.25C5.69658 6.25 5.41675 6.52983 5.41675 6.875C5.41675 7.22017 5.69658 7.5 6.04175 7.5Z" fill="#A5A5A5" stroke="#A5A5A5" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.24992 10L8.33325 11.6667L10.8333 8.75L17.9166 14.1667V15.8333C17.9166 16.2936 17.5435 16.6667 17.0833 16.6667H2.91659C2.45635 16.6667 2.08325 16.2936 2.08325 15.8333V14.1667L6.24992 10Z" stroke="#A5A5A5" strokeWidth="1.66667" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#A5A5A5] text-base font-['Inter'] font-normal">
                    {selectedQuantity} {selectedQuantity > 1 ? t('generateTextarea.outputs') : t('generateTextarea.output')}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${showQuantityDropdown ? 'rotate-180' : ''}`} fill="none" stroke="#A5A5A5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Dropdown Menu */}
                {showQuantityDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-[#26262D] rounded-lg border border-[#393B42] shadow-lg z-50 min-w-full">
                    <div 
                      className="px-3 py-2 hover:bg-[#393B42] cursor-pointer transition-colors flex items-center gap-2"
                      onClick={() => {
                        setSelectedQuantity(1);
                        setShowQuantityDropdown(false);
                      }}
                    >
                      <span className="text-[#A5A5A5] text-base">1 {t('generateTextarea.output')}</span>
                    </div>
                    <div 
                      className="px-3 py-2 hover:bg-[#393B42] cursor-pointer transition-colors flex items-center gap-2"
                      onClick={() => {
                        setSelectedQuantity(4);
                        setShowQuantityDropdown(false);
                      }}
                    >
                      <span className="text-[#A5A5A5] text-base">4 {t('generateTextarea.outputs')}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Style Selector */}
              <div className="relative" ref={styleSelectorRef}>
                <div 
                  className="h-10 px-3 py-2 bg-[#26262D] rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#2A2A31] transition-colors"
                  onClick={() => setShowStyleSelector(!showStyleSelector)}
                >
                  {/* Style Icon */}
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
                    {selectedStyle ? (
                      <img 
                        src={selectedStyle.imageUrl ? UrlUtils.ensureAbsoluteUrl(selectedStyle.imageUrl) : ''} 
                        alt="Style" 
                        className="w-5 h-5 object-cover rounded" 
                      />
                    ) : (
                      <img 
                        src="/imgs/generate-textarea/style.svg" 
                        alt="No Style" 
                        className="w-4 h-4" 
                      />
                    )}
                  </div>
                  
                  {/* Style Text */}
                  <span className="text-[#A5A5A5] text-base font-['Inter'] font-normal whitespace-nowrap">
                    {selectedStyle ? getLocalizedText(selectedStyle.name, language) : t('generateTextarea.noStyle')}
                  </span>
                  
                  {/* Arrow Icon */}
                  <svg className={`w-4 h-4 transition-transform ${showStyleSelector ? 'rotate-180' : ''}`} fill="none" stroke="#A5A5A5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Dropdown Menu */}
                {showStyleSelector && (
                  <div 
                    className="absolute top-full left-0 mt-1 bg-[#26262D] rounded-lg border border-[#393B42] shadow-lg z-50 min-w-full w-48 max-h-60 overflow-y-auto overflow-x-hidden style-dropdown-scrollbar"
                    style={{
                      scrollBehavior: 'smooth',
                      overscrollBehavior: 'contain'
                    }}
                  >
                    {/* No Style Option */}
                    <div 
                      className="px-3 py-2 hover:bg-[#393B42] cursor-pointer transition-colors flex items-center gap-2"
                      onClick={() => {
                        setSelectedStyle(null);
                        if (onStyleChange) {
                          onStyleChange(null);
                        }
                        setShowStyleSelector(false);
                      }}
                    >
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/imgs/generate-textarea/style.svg" 
                          alt="No Style" 
                          className="w-4 h-4" 
                        />
                      </div>
                      <span className="text-[#A5A5A5] text-base">{t('generateTextarea.noStyle')}</span>
                    </div>
                    
                    {/* Style Options */}
                    {styles.map((style) => (
                      <div 
                        key={style.id}
                        className="px-3 py-2 hover:bg-[#393B42] cursor-pointer transition-colors flex items-center gap-2"
                        onClick={() => {
                          setSelectedStyle(style);
                          if (onStyleChange) {
                            onStyleChange(style);
                          }
                          setShowStyleSelector(false);
                        }}
                      >
                        <div className="w-5 h-5 bg-[#393B42] rounded flex items-center justify-center flex-shrink-0">
                          {style.imageUrl ? (
                            <img 
                              src={style.imageUrl ? UrlUtils.ensureAbsoluteUrl(style.imageUrl) : ''} 
                              alt={getLocalizedText(style.name, language)} 
                              className="w-5 h-5 object-cover rounded" 
                            />
                          ) : (
                            <img 
                              src="/imgs/generate-textarea/style.svg" 
                              alt="Style" 
                              className="w-4 h-4" 
                            />
                          )}
                        </div>
                        <span className="text-[#A5A5A5] text-base whitespace-nowrap">
                          {getLocalizedText(style.name, language)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Color Selector Dropdown */}
              <div className="relative" ref={colorDropdownRef}>
                <div 
                  className="h-10 px-3 py-2 bg-[#26262D] rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#2A2A31] transition-colors"
                  onClick={() => setShowColorDropdown(!showColorDropdown)}
                >
                  <img 
                    src="/imgs/generate-textarea/color.svg" 
                    alt="Color" 
                    className="w-[18px] h-[18px]" 
                  />
                  <span className="text-[#A5A5A5] text-base font-['Inter'] font-normal whitespace-nowrap">
                    {selectedColor ? t('generateTextarea.colorful') : t('generateTextarea.blackAndWhite')}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${showColorDropdown ? 'rotate-180' : ''}`} fill="none" stroke="#A5A5A5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Dropdown Menu */}
                {showColorDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-[#26262D] rounded-lg border border-[#393B42] shadow-lg z-50 min-w-full">
                    <div 
                      className="px-3 py-2 hover:bg-[#393B42] cursor-pointer transition-colors flex items-center gap-2"
                      onClick={() => {
                        setSelectedColor(true);
                        setShowColorDropdown(false);
                      }}
                    >
                      <span className="text-[#A5A5A5] text-base">{t('generateTextarea.colorful')}</span>
                    </div>
                    <div 
                      className="px-3 py-2 hover:bg-[#393B42] cursor-pointer transition-colors flex items-center gap-2"
                      onClick={() => {
                        setSelectedColor(false);
                        setShowColorDropdown(false);
                      }}
                    >
                      <span className="text-[#A5A5A5] text-base whitespace-nowrap">{t('generateTextarea.blackAndWhite')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Options - Right side */}
            <div className="flex items-center gap-3 flex-wrap">
              <BaseButton
                variant="primary"
                width={!showBorderGradient ? 'px-6' : 'w-[120px]'}
                height="h-10"
                fontSize="text-base"
                onClick={handleGenerateClick}
              >
                {!showBorderGradient ? t('generateTextarea.create') : t('generateTextarea.generate')}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateTextarea;