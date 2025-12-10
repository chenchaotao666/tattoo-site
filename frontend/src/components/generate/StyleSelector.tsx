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
  const [isMobile, setIsMobile] = React.useState(false);

  // Check if mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate position based on the style selector trigger
  React.useEffect(() => {
    if (showStyleSelector) {
      const styleContainer = document.querySelector('.style-selector-container');
      if (styleContainer) {
        const rect = styleContainer.getBoundingClientRect();

        if (isMobile) {
          // Mobile: 居中显示
          setPosition({
            left: 16,
            top: Math.max(100, (window.innerHeight - 600) / 2) // 居中显示，最小距顶部100px
          });
        } else {
          // Desktop: 显示在右侧
          const viewportWidth = window.innerWidth;
          const selectorWidth = 920;

          // Calculate left position, ensuring it doesn't go off-screen
          let left = rect.right + 8;
          if (left + selectorWidth > viewportWidth) {
            left = Math.max(8, viewportWidth - selectorWidth - 8);
          }

          setPosition({
            left: left,
            top: Math.max(8, rect.top)
          });
        }
      }
    }
  }, [showStyleSelector, isMobile]);

  if (!showStyleSelector) return null;

  return (
    <>
      {/* Mobile fullscreen overlay */}
      {isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" onClick={onClose} />
      )}

      <div
        className="fixed z-[9999] animate-slideInRight overflow-hidden"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
          ...(isMobile ? {
            // Mobile styles - 使用计算位置，右边距16px，自适应宽度和高度
            right: '16px',
            background: 'linear-gradient(0deg, #19191F 0%, #19191F 100%), #131317',
            borderRadius: '16px',
            border: '1px solid #393B42',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          } : {
            // Desktop styles
            width: '920px',
            height: '680px',
            background: 'linear-gradient(0deg, #19191F 0%, #19191F 100%), #131317',
            borderRadius: '16px',
            border: '1px solid #393B42',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          })
        }}
      >
      {/* Header */}
      <div className={`absolute text-[#ECECEC] text-xl font-bold z-10 ${
        isMobile ? 'left-4 top-4' : 'left-[30px] top-[30px]'
      }`}>
        {t('styleSelector.selectStyle')}
      </div>

      {/* Close Button */}
      <div
        className={`absolute w-4 h-4 cursor-pointer hover:opacity-75 transition-opacity z-10 ${
          isMobile ? 'right-4 top-4' : 'right-[20px] top-[20px]'
        }`}
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
        className={`${
          isMobile
            ? 'pt-16 pb-4' // Mobile: 简单的上下内边距，让内容自然展示
            : 'absolute left-0 w-full overflow-y-auto overflow-x-hidden custom-scrollbar top-[84px] h-[calc(100%-84px)]'
        }`}
        style={isMobile ? {} : {
          scrollbarWidth: 'thin',
          scrollbarColor: '#4E5056 transparent'
        }}
      >
        <div className={`py-[12px] ${isMobile ? 'px-4' : 'px-[30px]'}`}>
          {/* Grid Layout */}
          <div className={`grid gap-3 ${
            isMobile
              ? 'grid-cols-3' // 移动端3列
              : 'grid-cols-4' // 桌面端4列
          }`}>
            {/* NO Style - Always first */}
            <div
              className={`relative cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg mb-8 ${!selectedStyle ? 'ring-2' : ''} ${
                isMobile ? 'w-full h-auto aspect-[200/242]' : 'w-[200px] h-[242px]'
              }`}
              style={{
                background: '#26262D',
                borderRadius: '12px',
                ...(!selectedStyle ? { '--tw-ring-color': colors.special.highlight } as React.CSSProperties : {})
              }}
              onClick={() => onStyleSelect(null)}
            >
              <div
                className={`absolute left-0 top-0 flex items-center justify-center ${
                  isMobile ? 'w-full aspect-square' : 'w-[197px] h-[200px]'
                }`}
                style={{
                  background: '#393B42',
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <img
                  className={`w-auto h-auto object-contain ${
                    isMobile ? 'max-w-[60px] max-h-[60px]' : 'max-w-[120px] max-h-[120px]'
                  }`}
                  src="/imgs/styles/no-style.png"
                  alt={t('styleSelector.noStyle')}
                />
              </div>
              <div className={`absolute text-center text-[#ECECEC] font-medium whitespace-nowrap ${
                isMobile
                  ? 'left-1/2 transform -translate-x-1/2 bottom-2 text-xs'
                  : 'left-[70px] top-[212px] text-sm'
              }`}>
                {t('styleSelector.noStyle')}
              </div>
            </div>

            {/* All Styles */}
            {styles.map((style) => (
              <div
                key={style.id}
                className={`relative cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg mb-8 ${selectedStyle?.id === style.id ? 'ring-2' : ''} ${
                  isMobile ? 'w-full h-auto aspect-[200/242]' : 'w-[200px] h-[242px]'
                }`}
                style={{
                  background: '#26262D',
                  borderRadius: '12px',
                  ...(selectedStyle?.id === style.id ? { '--tw-ring-color': colors.special.highlight } as React.CSSProperties : {})
                }}
                onClick={() => onStyleSelect(style)}
              >
                <img
                  className={`absolute left-0 top-0 object-cover ${
                    isMobile ? 'w-full aspect-square' : 'w-[200px] h-[200px]'
                  }`}
                  style={{ borderRadius: '12px 12px 0 0' }}
                  src={style.imageUrl ? UrlUtils.ensureAbsoluteUrl(style.imageUrl) : ''}
                  alt={getLocalizedText(style.name, language)}
                />
                <div className={`absolute text-center text-[#ECECEC] font-medium whitespace-nowrap ${
                  isMobile
                    ? 'left-1/2 transform -translate-x-1/2 bottom-2 text-xs'
                    : 'left-[50%] transform -translate-x-1/2 top-[212px] text-sm'
                }`}>
                  {getLocalizedText(style.name, language)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default StyleSelector;