import React from 'react';
import { useAsyncTranslation } from '../../contexts/LanguageContext';
import { colors } from '../../styles/colors';

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

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryNow?: () => void;
  username?: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onTryNow,
  username
}) => {
  const { t } = useAsyncTranslation('components');

  const handleTryNow = () => {
    onClose();
    if (onTryNow) {
      onTryNow();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-start justify-center p-4 pt-80"
        onClick={onClose}
      >
        <div
          className="relative w-[360px] h-[338px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Credits 图标 - 位于面板上方，一半在内一半在外 */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-16 z-10">
            <img
              src="/imgs/credits-big.svg"
              alt="Credits"
              className="w-32 h-32"
              style={{
                filter: 'hue-rotate(60deg) saturate(0.9) brightness(1.05)',
              }}
            />
          </div>

          {/* 主背景 */}
          <div className="absolute inset-0 rounded-2xl border border-[#393B42] bg-[#19191F]" />

          {/* 背景渐变发光效果 */}
          <div
            className="absolute inset-0 rounded-2xl -z-10"
            style={{
              background: safeColors.gradient?.primaryGlow || 'linear-gradient(90deg, rgba(89, 255, 207, 0.40) 0%, rgba(152, 255, 89, 0.40) 100%)',
              filter: 'blur(8px)'
            }}
          />

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-4 h-4 text-[#C8C8C8] hover:text-[#ECECEC] transition-colors"
          >
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* 标题 */}
          <div className="absolute left-[133px] top-[58px] text-[#E6E6E6] text-xl font-medium">
            {t('welcome.getCredit', 'Get credit')}
          </div>

          {/* 积分数字 */}
          <div
            className="absolute left-[123px] top-[90px] text-[56px] font-bold leading-none"
            style={{
              background: safeColors.gradient?.primary || 'linear-gradient(90deg, #59FFD0 0%, #98FF59 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            +2
          </div>

          {/* 描述文字 */}
          <div className="absolute left-[30px] top-[170px] w-[300px] text-center text-[#C8C8C8] text-sm font-normal leading-5">
            {t('welcome.description', 'New users receive 2 credits upon their first login, so go ahead and try out our AI tools.')}<br/>
            <span
              className="font-medium mt-2 inline-block"
              style={{
                background: safeColors.gradient?.primary || 'linear-gradient(90deg, #59FFD0 0%, #98FF59 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {t('welcome.creditUsage', '1 credit = 1 AI tattoo image')}
            </span>
          </div>

          {/* 按钮 */}
          <div
            className="absolute left-[30px] top-[270px] w-[300px] h-12 rounded-lg cursor-pointer transition-all duration-200 hover:opacity-80"
            style={{
              background: safeColors.gradient?.primary || 'linear-gradient(90deg, #59FFD0 0%, #98FF59 100%)'
            }}
            onClick={handleTryNow}
          >
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-lg font-bold">
              {t('welcome.tryNow', 'Try Now')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeModal;