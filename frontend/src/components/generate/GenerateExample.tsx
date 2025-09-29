import React, { useState } from 'react';
import { colors } from '../../styles/colors';

interface ImageSlide {
  url: string;
  colorUrl?: string;
  coloringUrl?: string;
  prompt: string;
}

interface GenerateExampleProps {
  className?: string;
  title?: string;
  description?: string;
  type?: 'text' | 'image';
  images?: ImageSlide[];
}

const GenerateExample: React.FC<GenerateExampleProps> = ({ 
  title,
  description,
  type,
  images
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = images?.[currentImageIndex];
  const hasImages = images && images.length > 0;

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handlePrevClick = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, (images?.length ?? 1) - 1)));
  };

  const handleNextClick = () => {
    setCurrentImageIndex((prev) => (prev < (images?.length ?? 1) - 1 ? prev + 1 : 0));
  };

  return (
    <div className={`w-full bg-[#030414]`}>
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center gap-8 max-w-[1400px] mx-auto relative">
          
          {/* Top - Text content */}
          <div className="w-full text-center">
            <h1 className="text-[32px] font-bold text-[#ECECEC] capitalize leading-tight mb-6">
              {title}
            </h1>
            <h3 className="text-[14px] text-[#A5A5A5] leading-relaxed max-w-[600px] mx-auto">
              {description}
            </h3>
          </div>

          {/* Left arrow - outside image (only show when images are loaded) */}
          {hasImages && (
            <button
              onClick={handlePrevClick}
              className="flex-shrink-0 w-12 h-12 bg-[#26262D] rounded-full flex items-center justify-center hover:bg-[#3A3A42] transition-all duration-200 z-10 absolute left-20 top-1/2 transform -translate-y-1/2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 6L9 12L15 18" stroke="#FFFAFA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Right arrow - outside image (only show when images are loaded) */}
          {hasImages && (
            <button
              onClick={handleNextClick}
              className="flex-shrink-0 w-12 h-12 bg-[#26262D] rounded-full flex items-center justify-center hover:bg-[#3A3A42] transition-all duration-200 z-10 absolute right-20 top-1/2 transform -translate-y-1/2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="#FFFAFA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Bottom - Image carousel */}
          <div className="w-full flex flex-col items-center gap-6">
            
            {/* Main carousel area */}
            <div className="flex items-center justify-center">

              {hasImages ? (
                /* Image container with decorative elements */
                <div className="relative">
                
                <>
                  {/* Text mode - Single image */}
                  {currentImage && (
                    <img 
                      src={currentImage.url}
                      alt={`Coloring page: ${currentImage.prompt}`}
                      className="block rounded-2xl"
                      style={{
                        height: '560px',
                        width: 'auto',
                        minWidth: '400px',
                        objectFit: 'cover'
                      }}
                    />
                  )}

                  {/* Left logo - AI icon (一半在图片上，一半在外面) */}
                  <img 
                    src="/imgs/text-examples/AI.svg"
                    alt="AI"
                    className="absolute z-10"
                    style={{
                      width: '130px',
                      height: '130px',
                      left: '-45px', // 一半在外面 (110px / 2 = 55px)
                      top: '265px', // 垂直居中位置 (360px / 2 - 55px = 125px)
                      transform: 'rotate(-10deg)',
                      transformOrigin: 'center'
                    }}
                  />

                  {/* Right logo - Text icon (一半在图片上，一半在外面) */}
                  <img 
                    src="/imgs/text-examples/T.svg"
                    alt="Text"
                    className="absolute z-10"
                    style={{
                      width: '90px',
                      height: '90px',
                      right: '-35px', // 一半在外面 (100px / 2 = 50px)
                      top: '130px', // 垂直居中位置 (360px / 2 - 50px = 130px)
                      transform: 'rotate(13deg)',
                      transformOrigin: 'center'
                    }}
                  />
                </>

                {/* Prompt text background - only show for text mode */}
                {type === 'text' && currentImage && (
                  <div 
                    className="absolute"
                    style={{
                      width: '80%',
                      minHeight: '48px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bottom: '40px',
                      background: 'rgba(0, 0, 0, 0.20)',
                      borderRadius: '8px',
                      border: `1px solid ${colors.special.highlight}`,
                      backdropFilter: 'blur(5px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 16px'
                    }}
                  >
                    <img 
                      src="/imgs/text-examples/star-2.png"
                      alt="Star"
                      style={{
                        width: '16px',
                        height: '16px',
                        marginRight: '8px',
                        flexShrink: 0
                      }}
                    />
                    {/* Prompt text */}
                    <div 
                      style={{
                        color: colors.special.highlight,
                        fontSize: '16px',
                        fontFamily: 'Inter',
                        fontWeight: '500',
                        lineHeight: '24px',
                        textAlign: 'center',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {currentImage.prompt}
                    </div>
                  </div>
                )}

                </div>
              ) : (
                /* Loading state - show placeholder with loading indicator */
                <div className="relative">
                  <div 
                    className="rounded-2xl flex flex-col items-center justify-center"
                    style={{
                      height: type === 'text' ? '592px' : '432px',
                      width: type === 'text' ? '400px' : '800px',
                      minWidth: type === 'text' ? '400px' : '800px'
                    }}
                  >
                  </div>
                </div>
              )}

            </div>

            {/* Navigation dots - 在图片外部下方 (only show when images are loaded) */}
            {hasImages && (
              <div className="flex items-center gap-1.5">
                {images?.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? '' 
                        : 'bg-[#DADADA]'
                    } hover:bg-opacity-50`}
                    style={{
                      backgroundColor: index === currentImageIndex 
                        ? colors.special.highlight
                        : '#DADADA'
                    }}
                    onMouseEnter={(e) => {
                      if (index !== currentImageIndex) {
                        e.currentTarget.style.backgroundColor = colors.special.highlight;
                        e.currentTarget.style.opacity = '0.5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== currentImageIndex) {
                        e.currentTarget.style.backgroundColor = '#DADADA';
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateExample;