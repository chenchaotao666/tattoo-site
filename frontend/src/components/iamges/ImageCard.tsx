import React from 'react';

interface ImageCardProps {
  imageUrl?: string;
  description?: string;
  tags?: string[];
  onClick?: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  imageUrl = 'https://placehold.co/278x278',
  description = '',
  tags = [],
  onClick
}) => {
  return (
    <div 
      className={`w-[278px] bg-[#19191F] rounded-2xl cursor-pointer flex flex-col`}
      onClick={onClick}
    >
      {/* Image */}
      <img 
        className="w-[278px] h-[278px] rounded-2xl object-cover"
        src={imageUrl}
        alt={description}
      />
      
      {/* Content */}
      <div className="px-4 py-5 flex-1">
        {/* Description */}
        <div className="text-[#ECECEC] text-sm font-normal leading-5 break-words mb-4">
          {description}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map((tag, index) => (
            <div 
              key={index}
              className="px-2 py-1 rounded-xl border border-[#4E5056] flex justify-center items-center"
            >
              <div className="text-[#ECECEC] text-xs font-normal leading-4">
                {tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;