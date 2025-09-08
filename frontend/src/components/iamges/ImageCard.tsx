import React from 'react';
import { BaseImage } from '../../services/imageService';
import { getLocalizedText } from '../../utils/textUtils';
import { useLanguage } from '../../contexts/LanguageContext';

interface ImageCardProps {
  image: BaseImage;
  onClick?: () => void;
  showPrompt?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onClick,
  showPrompt = true
}) => {
  const { language } = useLanguage();
  const imageUrl = image.tattooUrl || 'https://placehold.co/278x278';
  const prompt = getLocalizedText(image.prompt, language);
  const tags = image.tags || [];
  return (
    <div 
      className={`w-[278px] bg-[#19191F] rounded-2xl cursor-pointer flex flex-col`}
      onClick={onClick}
    >
      {/* Image */}
      <img 
        className="w-[278px] h-[278px] rounded-2xl object-cover"
        src={imageUrl}
        alt={prompt}
      />
      
      {/* Content */}
      {showPrompt && (
        <div className="px-4 py-5 flex-1">
          {/* prompt */}
          <div className="text-[#ECECEC] text-sm font-normal leading-5 break-words mb-4">
            {prompt}
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map((tag, index) => (
              <div 
                key={tag.id || index}
                className="px-2 py-1 rounded-xl border border-[#4E5056] flex justify-center items-center"
              >
                <div className="text-[#ECECEC] text-xs font-normal leading-4">
                  {getLocalizedText(tag.name, language)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCard;