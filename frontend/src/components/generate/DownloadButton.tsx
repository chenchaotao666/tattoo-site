import React from 'react';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

interface DownloadButtonProps {
  text?: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  text,
  onClick,
  className = '',
  style = {}
}) => {
  const { t } = useAsyncTranslation('components');

  const finalText = text || t('downloadButton.download');
  const defaultStyle = {
    height: '48px',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    ...style
  };

  return (
    <button
      onClick={onClick}
      className={`bg-[#19191F] hover:bg-[#2D2D35] rounded-lg transition-all duration-200 flex items-center justify-start gap-[6px] ${className}`}
      style={defaultStyle}
    >
      <img src="/imgs/generate/download.svg" alt={t('downloadButton.download')} className="w-6 h-6" />
      <span className="text-[#ECECEC] text-sm font-normal leading-[18px]">{finalText}</span>
    </button>
  );
};

export default DownloadButton;