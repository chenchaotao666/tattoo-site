import React from 'react';
import { useLanguage, useAsyncTranslation } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';
import { Style } from '../../hooks/useGeneratePage';
import { colors } from '../../styles/colors';
import { UrlUtils } from '../../utils/urlUtils';

interface StyleSelectorProps {
  styles: Style[];
  selectedStyle: Style | null;
  showStyleSelector: boolean;
  onStyleSelect: (style: Style | null) => void;
  onClose: () => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
  styles,
  selectedStyle,
  showStyleSelector,
  onStyleSelect,
  onClose
}) => {
  const { language } = useLanguage();
  const { t } = useAsyncTranslation('components');
  const [position, setPosition] = React.useState({ left: 0, top: 0 });

  // Calculate position based on the style selector trigger
  React.useEffect(() => {
    if (showStyleSelector) {
      const styleContainer = document.querySelector('.style-selector-container');
      if (styleContainer) {
        const rect = styleContainer.getBoundingClientRect();
        setPosition({
          left: rect.right + 8, // 8px gap to the right
          top: rect.top
        });
      }
    }
  }, [showStyleSelector]);

  if (!showStyleSelector) return null;

  return (
    <div 
      className="fixed z-[9999] animate-slideInRight overflow-hidden"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: '920px',
        height: '680px',
        background: 'linear-gradient(0deg, #19191F 0%, #19191F 100%), #131317',
        borderRadius: '16px',
        border: '1px solid #393B42',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Header */}
      <div className="absolute left-[30px] top-[30px] text-[#ECECEC] text-xl font-bold z-10">
        {t('styleSelector.selectStyle')}
      </div>

      {/* Close Button */}
      <div 
        className="absolute w-4 h-4 right-[20px] top-[20px] cursor-pointer hover:opacity-75 transition-opacity z-10"
        onClick={onClose}
      >
        <img
          className="w-4 h-4"
          src="/imgs/styles/close-x.png"
          alt={t('dialog.close')}
        />
      </div>

      {/* Scrollable Content Area */}
      <div 
        className="absolute left-0 top-[84px] w-full h-[calc(100%-84px)] overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4E5056 transparent'
        }}
      >
        <div className="relative px-[30px] py-[12px]">
          {/* Grid Layout */}
          <div className="grid grid-cols-4 gap-5">
            {/* NO Style - Always first */}
            <div 
              className={`relative w-[200px] h-[242px] cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg mb-8 ${!selectedStyle ? 'ring-2' : ''}`}
              style={{
                background: '#26262D',
                borderRadius: '12px',
                ...(!selectedStyle ? { '--tw-ring-color': colors.special.highlight } as React.CSSProperties : {})
              }}
              onClick={() => onStyleSelect(null)}
            >
              <div 
                className="w-[197px] h-[200px] absolute left-0 top-0 flex items-center justify-center"
                style={{ 
                  background: '#393B42',
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <img
                  className="w-auto h-auto max-w-[120px] max-h-[120px] object-contain"
                  src="/imgs/styles/no-style.png"
                  alt={t('styleSelector.noStyle')}
                />
              </div>
              <div className="absolute left-[70px] top-[212px] text-center text-[#ECECEC] text-sm font-medium whitespace-nowrap">
                {t('styleSelector.noStyle')}
              </div>
            </div>

            {/* All Styles */}
            {styles.map((style) => (
              <div 
                key={style.id}
                className={`relative w-[200px] h-[242px] cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg mb-8 ${selectedStyle?.id === style.id ? 'ring-2' : ''}`}
                style={{
                  background: '#26262D',
                  borderRadius: '12px',
                  ...(selectedStyle?.id === style.id ? { '--tw-ring-color': colors.special.highlight } as React.CSSProperties : {})
                }}
                onClick={() => onStyleSelect(style)}
              >
                <img
                  className="w-[200px] h-[200px] absolute left-0 top-0 object-cover"
                  style={{ borderRadius: '12px 12px 0 0' }}
                  src={style.imageUrl ? UrlUtils.ensureAbsoluteUrl(style.imageUrl) : ''}
                  alt={getLocalizedText(style.name, language)}
                />
                <div className="absolute left-[50%] transform -translate-x-1/2 top-[212px] text-center text-[#ECECEC] text-sm font-medium whitespace-nowrap">
                  {getLocalizedText(style.name, language)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleSelector;