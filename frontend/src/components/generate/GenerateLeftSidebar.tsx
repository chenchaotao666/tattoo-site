import React from 'react';
import { StyleSuggestion } from '../../services/generateService';
import { useAsyncTranslation, useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';
import { Style } from '../../hooks/useGeneratePage';
import Tooltip from '../ui/Tooltip';
import StyleSelector from './StyleSelector';
import { colors } from '../../styles/colors';

// 图标路径定义
const refreshIcon = '/images/generate/refresh-ideas.png';
const crownIcon = '/images/generate/crown.svg';
const tipIcon = '/images/tip.svg';
const subtractColorIcon = '/images/generate/subtract-color.svg';
const subtractIcon = '/images/generate/generate-star.png';
const textCountIcon = '/images/text-count.svg';


interface GenerateLeftSidebarProps {
  // Form state
  prompt: string;
  selectedColor: boolean;
  selectedQuantity: number;
  selectedStyle: Style | null;
  inputError: string;
  publicVisibility: boolean;
  isGenerating: boolean;
  error: string | null;
  styleSuggestions: StyleSuggestion[];
  styles: Style[];
  showStyleSelector: boolean;
  
  // Refs
  promptInputRef: React.RefObject<HTMLTextAreaElement | null>;
  
  // Event handlers
  handlePromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleClearPrompt: () => void;
  handleStyleSuggestionClick: (styleContent: string) => void;
  handleRefreshStyleSuggestions: () => void;
  handleVisibilityToggle: () => void;
  handleGenerate: () => void;
  setSelectedColor: (isColor: boolean) => void;
  setSelectedQuantity: (quantity: number) => void;
  setSelectedStyle: (style: Style | null) => void;
  setInputError: (error: string) => void;
  setShowStyleSelector: (show: boolean) => void;
}

const GenerateLeftSidebar: React.FC<GenerateLeftSidebarProps> = ({
  prompt,
  selectedColor,
  selectedQuantity,
  selectedStyle,
  inputError,
  publicVisibility,
  isGenerating,
  error,
  styleSuggestions,
  styles,
  showStyleSelector,
  promptInputRef,
  handlePromptChange,
  handleClearPrompt,
  handleStyleSuggestionClick,
  handleRefreshStyleSuggestions,
  handleVisibilityToggle,
  handleGenerate,
  setSelectedColor,
  setSelectedQuantity,
  setSelectedStyle,
  setInputError,
  setShowStyleSelector
}) => {
  const { t } = useAsyncTranslation('generate');
  const { language } = useLanguage();

  // Click outside to close style selector
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStyleSelector) {
        const target = event.target as Element;
        if (!target.closest('.style-selector-container')) {
          setShowStyleSelector(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStyleSelector, setShowStyleSelector]);

  return (
    <div className="relative h-full flex flex-col rounded-r-2xl">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Text to Image Section */}
        <div className="block">
        {/* Prompt Section */}
        <div className="lg:mx-5 lg:mt-7">
          <div className="text-sm font-bold text-[#ECECEC] mb-2">{t('prompt.title')}</div>
          <div className="relative">
            <textarea
              ref={promptInputRef}
              className={`w-full h-[120px] sm:h-[150px] lg:h-[200px] bg-[#26262D] rounded-lg border border-[#393B42] p-3 pr-10 text-sm resize-none focus:outline-none text-[#818181] placeholder-[#818181] ${
                inputError ? 'outline outline-1 outline-red-500' : ''
              }`}
              placeholder={t('prompt.placeholder')}
              value={prompt}
              onChange={(e) => {
                handlePromptChange(e);
                if (inputError) setInputError('');
              }}
              maxLength={1000}
            ></textarea>

            {/* Clear button - 只在有内容时显示 */}
            {prompt && (
              <button
                onClick={handleClearPrompt}
                className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center bg-[#818181] hover:bg-[#6B6B6B] rounded-full transition-colors"
                title={t('prompt.clear')}
              >
                <img src="/images/close-x.svg" alt="Clear" className="w-3 h-3" />
              </button>
            )}

            <div className="absolute bottom-2 right-3 text-xs sm:text-sm text-[#818181] flex mb-2 sm:mb-3 items-center gap-1">
              {prompt.length}/1000
              <img src={textCountIcon} alt="Text count" className="w-3 h-3" />
            </div>
          </div>
          
          {/* Error message - show below the prompt input */}
          {inputError && (
            <div className="mt-2 text-red-500 text-sm px-1">
              {inputError}
            </div>
          )}
        </div>

        {/* Ideas Section */}
        <div className="lg:mx-5 mt-5">
          <div className="flex justify-between items-start gap-2">
            <div className="text-[#818181] text-xs flex flex-wrap items-center gap-2 flex-1">
              <span className="shrink-0 text-[#818181]">{t('prompt.ideas')}：</span>
              {styleSuggestions.map((style) => (
                <span
                  key={style.id}
                  className="cursor-pointer hover:text-lime-300 transition-colors text-[#818181] text-xs"
                  onClick={() => handleStyleSuggestionClick(style.content)}
                >
                  {style.name}
                </span>
              ))}
            </div>
            <span className="cursor-pointer hover:brightness-125 transition-all shrink-0 mt-0.5" onClick={handleRefreshStyleSuggestions}>
              <img src={refreshIcon} alt="Refresh" className="w-4 h-4" style={{filter: 'brightness(0) saturate(100%) invert(46%) sepia(0%) saturate(0%) hue-rotate(130deg) brightness(105%) contrast(85%)'}} />
            </span>
          </div>
        </div>

        {/* Style Selector */}
        <div className="lg:mx-5 mt-6 lg:mt-10 relative style-selector-container">
          <div className="text-sm font-bold text-[#ECECEC] mb-2">Style</div>
          <div 
            className="bg-[#26262D] rounded-lg border border-[#393B42] p-3 relative cursor-pointer transition-colors"
            style={{ height: '70px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.special.highlight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#393B42';
            }}
            onClick={() => setShowStyleSelector(!showStyleSelector)}
          >
            <div className="flex items-center gap-3 h-full">
              {/* Style Icon */}
              <div className="w-[46px] h-[46px] bg-[#393B42] rounded-lg flex items-center justify-center flex-shrink-0 relative">
                {selectedStyle ? (
                  <img 
                    src={selectedStyle.imageUrl || "https://placehold.co/46x46"} 
                    alt="Style" 
                    className="w-[46px] h-[46px] object-cover rounded-lg" 
                  />
                ) : (
                  /* No Style Icon */
                  <img 
                    src="/images/styles/no-style-small.svg" 
                    alt="No Style" 
                    className="w-[26px] h-[26px]" 
                  />
                )}
              </div>
              
              {/* Style Text */}
              <div className="flex-1">
                <div className="text-[#ECECEC] text-sm font-medium">
                  {selectedStyle ? getLocalizedText(selectedStyle.name, language) : 'NO Style'}
                </div>
              </div>
              
              {/* Arrow Icon */}
              <div className="w-4 h-4 flex-shrink-0">
                <div className="w-1 h-2 outline outline-[1.33px] outline-[#C8C8C8]" style={{clipPath: 'polygon(0 0, 100% 50%, 0 100%)'}}></div>
              </div>
            </div>
          </div>

          {/* StyleSelector Component */}
          <StyleSelector
            styles={styles}
            selectedStyle={selectedStyle}
            showStyleSelector={showStyleSelector}
            onStyleSelect={(style) => {
              setSelectedStyle(style);
              setShowStyleSelector(false);
            }}
            onClose={() => setShowStyleSelector(false)}
          />
        </div>

        {/* Color Selector */}
        <div className="lg:mx-5 mt-6 lg:mt-10">
          <div className="text-sm font-bold text-[#ECECEC] mb-2">Color</div>
          <div className="bg-[#26262D] rounded-lg p-1 relative" style={{height: '48px'}}>
            {/* 滑动指示器 */}
            <div
              className={`absolute rounded-lg transition-all duration-200 bg-[#393B42] ${
                selectedColor ? 'w-[calc(50%-4px)] h-[calc(100%-8px)] left-[4px] top-[4px]' :
                'w-[calc(50%-4px)] h-[calc(100%-8px)] left-[calc(50%+2px)] top-[4px]'
              }`}
            ></div>
            
            {/* 颜色选项 */}
            <div className="grid grid-cols-2 gap-0 relative z-10 h-full">
              <button
                className={`h-full flex items-center justify-center text-sm transition-all duration-200 ${
                  selectedColor ? 'text-lime-300 font-bold' : 'text-[#C8C8C8] hover:text-white font-medium'
                }`}
                onClick={() => setSelectedColor(true)}
              >
                Colorful
              </button>
              <button
                className={`h-full flex items-center justify-center text-sm transition-all duration-200 ${
                  !selectedColor ? 'text-lime-300 font-bold' : 'text-[#C8C8C8] hover:text-white font-medium'
                }`}
                onClick={() => setSelectedColor(false)}
              >
                Black & White
              </button>
            </div>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="lg:mx-5 mt-6 lg:mt-10">
          <div className="text-sm font-bold text-[#ECECEC] mb-2">Quantity</div>
          <div className="bg-[#26262D] rounded-lg p-1 relative" style={{height: '48px'}}>
            {/* 滑动指示器 */}
            <div
              className={`absolute rounded-lg transition-all duration-200 bg-[#393B42] ${
                selectedQuantity === 1 ? 'w-[calc(50%-4px)] h-[calc(100%-8px)] left-[4px] top-[4px]' :
                'w-[calc(50%-4px)] h-[calc(100%-8px)] left-[calc(50%+2px)] top-[4px]'
              }`}
            ></div>
            
            {/* 数量选项 */}
            <div className="grid grid-cols-2 gap-0 relative z-10 h-full">
              <button
                className={`h-full flex items-center justify-center text-sm transition-all duration-200 ${
                  selectedQuantity === 1 ? 'text-lime-300 font-bold' : 'text-[#C8C8C8] hover:text-white font-medium'
                }`}
                onClick={() => setSelectedQuantity(1)}
              >
                1
              </button>
              <button
                className={`h-full flex items-center justify-center text-sm transition-all duration-200 ${
                  selectedQuantity === 4 ? 'text-lime-300 font-bold' : 'text-[#C8C8C8] hover:text-white font-medium'
                }`}
                onClick={() => setSelectedQuantity(4)}
              >
                <div className="flex items-center gap-1">
                  <span>4</span>
                  {/* Premium Crown Icon */}
                  <img src={crownIcon} alt="Premium" className="w-[18px] h-[18px]" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Public Visibility - Common for both tabs */}
        <div className="mx-5 mt-5 lg:mt-8 flex items-center justify-between">
          <div className="text-[14px] font-bold text-[#ECECEC] flex items-center">
            {t('settings.visibility')}
            <Tooltip 
              content={t('settings.visibilityTip')}
              side="top"
              align="start"
              className="ml-1"
            >
              <span className="w-[18px] h-[18px] cursor-help inline-block">
                <img src={tipIcon} alt="Info" className="w-[18px] h-[18px] filter brightness-0 invert" />
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center">
            <Tooltip
              content="Premium Feature"
              side="top"
              align="center"
              className="mr-2"
            >
              <span className="w-[18px] h-[18px] cursor-help inline-block">
                <img src={crownIcon} alt="Premium" className="w-[18px] h-[18px]" />
              </span>
            </Tooltip>
            <button
              className={`w-[30px] h-4 rounded-lg relative ${
                publicVisibility ? 'bg-lime-300' : 'bg-[#393B42]'
              } cursor-pointer`}
              onClick={() => handleVisibilityToggle()}
            >
              <div
                className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 ${
                  publicVisibility ? 'right-[1px]' : 'left-[1px]'
                }`}
              ></div>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Desktop Generate Button - Fixed at bottom of sidebar */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#19191F] p-5">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full h-12 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            isGenerating
              ? 'bg-[#F2F3F5] text-[#A4A4A4] cursor-not-allowed'
              : 'text-black hover:bg-[#8AE84F]'
            } ${!isGenerating ? '' : 'opacity-50'}`}
            style={!isGenerating && !inputError ? { backgroundColor: colors.special.highlight } : {}}
        >
          <img
            src={isGenerating
              ? subtractIcon
              : subtractColorIcon
            }
            alt="Subtract"
            className="w-5 h-5 mr-1"
          />
          <span className="font-bold text-lg">{20 * selectedQuantity}</span>
          <span className="font-bold text-lg">
            {isGenerating ? t('generating.title') : 
             error ? t('actions.regenerate') :
             t('actions.generate')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default GenerateLeftSidebar;