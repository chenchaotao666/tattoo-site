import React from 'react';
import GenerateTextarea from '../common/GenerateTextarea';
import { colors } from '../../styles/colors';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

interface HomeTopProps {
  className?: string;
  tattooCount?: number;
  onButtonClick?: () => void;
}

const HomeTop: React.FC<HomeTopProps> = ({
  tattooCount = 1000000,
}) => {
  const { t } = useAsyncTranslation('home');

  return (
    <div 
      className="w-full flex flex-col items-center gap-8 pt-16 pb-20"
      style={{
        backgroundImage: `linear-gradient(rgba(3, 4, 20, 0.3), rgba(3, 4, 20, 0.7)), url('./imgs/header/bg.png')`,
        backgroundSize: 'auto 100%',
        backgroundPosition: '-8px top',
        backgroundRepeat: 'repeat-x',
        backgroundColor: '#030414',
        minHeight: '600px', // 确保有足够高度显示背景
      }}
    >
      {/* Badge */}
      <div className="px-3 py-1.5 rounded-[20px] outline outline-1 outline-[#5D5D5D] -outline-offset-1 flex justify-center items-center gap-2.5">
        <div className="text-[#ECECEC] text-sm font-['Roboto'] font-normal">
          {t('homeTop.badge', '🔥 Over {count}+ Tattoos Designed with AI', { count: tattooCount?.toLocaleString() })}
        </div>
      </div>

      {/* Titles Container */}
      <div className="text-center flex flex-col">
        {/* AI Tattoo Generator Title */}
        <h1
          className="text-[56px] font-['Roboto'] font-bold capitalize"
          style={{
            background: colors.gradient.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {t('homeTop.title', 'AI Tattoo Generator')}
        </h1>

        {/* Title */}
        <h2 className="text-[#ECECEC] text-[56px] font-['Roboto'] font-bold capitalize leading-tight">
          {t('homeTop.subtitle', 'Create Stunning Tattoos in Seconds')}
        </h2>
      </div>

      {/* Description */}
      <h3 className="text-[#A5A5A5] text-lg font-['Roboto'] font-normal text-center max-w-4xl mb-6">
        {t('homeTop.description', 'Our AI Tattoo Generator turns your ideas into realistic designs in 10 seconds. Fast, creative, and precise.')}
      </h3>

      {/* Generator Interface */}
      <GenerateTextarea />
    </div>
  );
};

export default HomeTop;