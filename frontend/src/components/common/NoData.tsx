import React from 'react';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

interface NoDataProps {
  message?: string;
  className?: string;
}

const NoData: React.FC<NoDataProps> = ({
  message,
  className = ""
}) => {
  const { t } = useAsyncTranslation('components');

  const finalMessage = message || t('noData.message');
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      {/* SVG Image */}
      <div className="mb-6">
        <img 
          src="/imgs/no-data.svg" 
          alt={t('noData.altText')} 
          className="w-[305px] h-[200px] opacity-60"
        />
      </div>
      
      {/* Message */}
      <div className="text-white text-base font-normal leading-6 text-center">
        {finalMessage}
      </div>
    </div>
  );
};

export default NoData;