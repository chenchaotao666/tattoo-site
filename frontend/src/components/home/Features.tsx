import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

const homeFeatureAlt = '/images/home-feature-alt.png';
const homeFeature = '/images/home-feature.png';
const coloringPrincess = '/images/long-color.png';
const coloringmMickeyMouse = '/images/long-default.png';

interface FeatureItemProps {
  title: string;
  description: string;
  images: string[];
  linkTo?: string;
  isReversed?: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ title, description, images, linkTo, isReversed = false }) => {
  const { t } = useAsyncTranslation('home');
  
  const TryNowButton = () => (
    <Link to={linkTo || '/text-coloring-page'}>
      <Button
        variant="gradient"
        className="w-[160px] sm:w-[170px] h-[50px] sm:h-[60px] px-6 sm:px-11 py-3 sm:py-[18px] rounded-lg text-lg sm:text-xl font-bold"
      >
        {t('features.tryNow')}
      </Button>
    </Link>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
      {/* 移动端布局：文字 → 图片 → 按钮 */}
      <div className="flex flex-col items-center gap-8 sm:gap-12 lg:hidden">
        {/* 移动端：文字在上方 */}
        <div className="w-full">
          <div className="flex flex-col gap-3 sm:gap-4 text-center">
            <h3 className="text-[#161616] text-xl sm:text-2xl font-bold capitalize leading-tight px-2">
              {title}
            </h3>
            <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed px-2">
              {description}
            </p>
          </div>
        </div>

        {/* 移动端：图片在中间 */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[700px] bg-[#F9FAFB] overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-5 flex items-start justify-between gap-2">
            {images.map((src, index) => (
              <img
                key={index}
                className="object-contain flex-shrink-0"
                style={{
                  maxWidth: '48%',
                  width: 'auto',
                  height: 'auto'
                }}
                src={src}
                alt={`Feature ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 移动端：按钮在下方 */}
        <div className="w-full flex justify-center">
          <TryNowButton />
        </div>
      </div>

      {/* 桌面端布局：保持原有设计 */}
      <div className={`hidden lg:flex ${isReversed ? 'flex-row-reverse' : 'flex-row'} items-center justify-center gap-20`}>
        {/* 桌面端：文字和按钮区域 */}
        <div className="flex flex-col gap-8 w-[580px]">
          <div className="flex flex-col gap-4 text-left">
            <h3 className="text-[#161616] text-3xl xl:text-4xl font-bold capitalize leading-tight">
              {title}
            </h3>
            <p className="text-[#6B7280] text-lg lg:text-xl leading-relaxed">
              {description}
            </p>
          </div>
          <div className="flex justify-start">
            <TryNowButton />
          </div>
        </div>

        {/* 桌面端：图片区域 */}
        <div className="w-[700px] flex justify-center">
          <div className="w-full max-w-[700px] bg-[#F9FAFB] overflow-hidden rounded-2xl p-5 flex items-start justify-between gap-2">
            {images.map((src, index) => (
              <img
                key={index}
                className="object-contain flex-shrink-0"
                style={{
                  maxWidth: '48%',
                  width: 'auto',
                  height: 'auto'
                }}
                src={src}
                alt={`Feature ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  const { t } = useAsyncTranslation('home');
  
  return (
    <div className="bg-white w-full">
      <div className="bg-white container mx-auto pt-4 pb-12 sm:px-6 sm:py-20 lg:py-[100px] xl:py-[120px] flex flex-col items-center gap-12 sm:gap-16 lg:gap-20">
        <div className="text-center px-4 sm:px-0">
          <h2 className="text-[#161616] text-2xl sm:text-3xl md:text-4xl lg:text-[48px] xl:text-[52px] font-bold capitalize leading-tight">
            {t('features.title')}
          </h2>
        </div>

        <div className="w-full flex flex-col gap-16 sm:gap-20 lg:gap-24 xl:gap-[120px]">
          <FeatureItem
            title={t('features.textToImage.title')}
            description={t('features.textToImage.description')}
            images={[homeFeatureAlt, homeFeature]}
            linkTo="/text-coloring-page"
          />

          <FeatureItem
            title={t('features.imageToColoring.title')}
            description={t('features.imageToColoring.description')}
            images={[coloringPrincess, coloringmMickeyMouse]}
            linkTo="/image-coloring-page"
            isReversed={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Features; 