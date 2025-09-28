import React from 'react';
import { IdeaSuggestion } from '../../services/generateService';
import { useAsyncTranslation, useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';
import { Style } from '../../hooks/useGeneratePage';
import Tooltip from '../ui/Tooltip';
import StyleSelector from './StyleSelector';
import { colors } from '../../styles/colors';
import { UrlUtils } from '../../utils/urlUtils';

// 图标路径定义
const refreshIcon = '/images/generate/refresh-ideas.png';
const crownIcon = '/images/generate/crown.svg';
const tipIcon = '/images/generate/tip.svg';
const textCountIcon = '/images/generate/text-count.svg';


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
  ideaSuggestions: IdeaSuggestion[];
  styles: Style[];
  showStyleSelector: boolean;

  // User state for premium features
  user: any;
  setShowPricingModal: (show: boolean) => void;

  // Refs
  promptInputRef: React.RefObject<HTMLTextAreaElement | null>;

  // Event handlers
  handlePromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleClearPrompt: () => void;
  handleStyleSuggestionClick: (styleContent: string) => void;
  handleRefreshIdeaSuggestions: () => void;
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
  ideaSuggestions,
  styles,
  showStyleSelector,
  user,
  setShowPricingModal,
  promptInputRef,
  handlePromptChange,
  handleClearPrompt,
  handleStyleSuggestionClick,
  handleRefreshIdeaSuggestions,
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

  // Handle 4 images quantity selection (premium feature)
  const handleQuantity4Selection = () => {
    // Check if user is not premium (free or expired membership)
    const isNotPremium = !user?.level || user?.level === 'free';

    if (isNotPremium) {
      // Show pricing modal for free users
      setShowPricingModal(true);
      return;
    }

    // Premium users can select 4 images
    setSelectedQuantity(4);
  };

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
              {ideaSuggestions.map((idea) => (
                <span
                  key={idea.id}
                  className="cursor-pointer hover:text-lime-300 transition-colors text-[#818181] text-xs"
                  onClick={() => handleStyleSuggestionClick(idea.content)}
                >
                  {idea.name}
                </span>
              ))}
            </div>
            <span className="cursor-pointer hover:brightness-125 transition-all shrink-0 mt-0.5" onClick={handleRefreshIdeaSuggestions}>
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
                    src={UrlUtils.ensureAbsoluteUrl(selectedStyle.imageUrl) || "https://placehold.co/46x46"} 
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
                onClick={handleQuantity4Selection}
              >
                <div className="flex items-center gap-1">
                  <span>4</span>
                  {/* Premium Crown Icon */}
                  <Tooltip
                    content="Premium Feature"
                    side="top"
                    align="center"
                  >
                    <span className="cursor-help inline-block">
                      <img src={crownIcon} alt="Premium" className="w-[18px] h-[18px]" />
                    </span>
                  </Tooltip>
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
              ? 'bg-[#26262D] text-[#5D5D5D] cursor-not-allowed'
              : 'bg-[#98FF59] hover:bg-[#B3FF7A] text-black'
            }`}
        >
          {isGenerating ? (
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 -mt-[2px]">
              <path d="M8 6.10352e-05C12.4183 6.10352e-05 16 3.58178 16 8.00006C16 12.4183 12.4183 16.0001 8 16.0001C3.58172 16.0001 0 12.4183 0 8.00006C0 3.58178 3.58172 6.10352e-05 8 6.10352e-05ZM8.46191 3.11041C8.29112 2.69977 7.70888 2.69977 7.53809 3.11041L6.53027 5.53326C6.45827 5.70638 6.29529 5.82492 6.1084 5.8399L3.49219 6.04987C3.04886 6.08541 2.86926 6.63846 3.20703 6.9278L5.2002 8.6358C5.34257 8.75778 5.40483 8.94953 5.36133 9.1319L4.75195 11.6846C4.64877 12.1172 5.1195 12.4592 5.49902 12.2276L7.73926 10.8594C7.89927 10.7617 8.10073 10.7617 8.26074 10.8594L10.501 12.2276C10.8805 12.4592 11.3512 12.1172 11.248 11.6846L10.6387 9.1319C10.5952 8.94953 10.6574 8.75778 10.7998 8.6358L12.793 6.9278C13.1307 6.63846 12.9511 6.08541 12.5078 6.04987L9.8916 5.8399C9.70471 5.82492 9.54173 5.70638 9.46973 5.53326L8.46191 3.11041Z" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 -mt-[2px]">
              <path d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM8.46191 3.11035C8.29112 2.69971 7.70888 2.69971 7.53809 3.11035L6.53027 5.5332C6.45827 5.70632 6.29529 5.82486 6.1084 5.83984L3.49219 6.0498C3.04886 6.08535 2.86926 6.6384 3.20703 6.92773L5.2002 8.63574C5.34257 8.75772 5.40483 8.94947 5.36133 9.13184L4.75195 11.6846C4.64877 12.1171 5.1195 12.4592 5.49902 12.2275L7.73926 10.8594C7.89927 10.7616 8.10073 10.7616 8.26074 10.8594L10.501 12.2275C10.8805 12.4592 11.3512 12.1171 11.248 11.6846L10.6387 9.13184C10.5952 8.94947 10.6574 8.75772 10.7998 8.63574L12.793 6.92773C13.1307 6.6384 12.9511 6.08535 12.5078 6.0498L9.8916 5.83984C9.70471 5.82486 9.54173 5.70632 9.46973 5.5332L8.46191 3.11035Z" fill="currentColor"/>
            </svg>
          )}
          <span className="font-bold text-lg -ml-2">{1 * selectedQuantity}</span>
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