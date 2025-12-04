import React from 'react';
import BaseButton from '../ui/BaseButton';
import ImageCarousel, { CarouselImageConfig } from './ImageCarousel';

export interface TattooIntroductionSection {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export interface TattooIntroductionImages {
  mainImage?: string;
  images?: string[];
  prompt?: string;
  socialIcons?: string[];
  shareImage?: string;
  twoImageMode?: boolean;
}

export interface TattooIntroductionData {
  sections: TattooIntroductionSection[];
  images: TattooIntroductionImages[];
}

interface TattooIntroductionProps {
  data: TattooIntroductionData;
}

const TattooIntroduction: React.FC<TattooIntroductionProps> = ({ data }) => {
  // Section 2 轮播配置 - 恢复原来的精确布局
  const section2CarouselConfig: CarouselImageConfig[] = [
    {
      // Image 1 - Top right
      position: {
        width: '154.48px',
        height: '154.48px',
        left: '500.52px',
        top: '111.17px',
        borderRadius: '19.07px',
      }
    },
    {
      // Image 2 - Left with background
      position: {
        width: '154.48px',
        height: '154.48px',
        left: '15px',
        top: '111.17px',
        borderRadius: '19.07px',
      }
    },
    {
      // Image 3 - Mid right with background
      position: {
        width: '198.62px',
        height: '198.62px',
        left: '379.14px',
        top: '89.10px',
        borderRadius: '19.07px',
      }
    },
    {
      // Image 4 - Mid left with shadow
      position: {
        width: '198.62px',
        height: '198.62px',
        left: '92.24px',
        top: '89.10px',
        borderRadius: '19.07px',
      }
    },
    {
      // Image 5 - Center largest
      position: {
        width: '265.93px',
        height: '265.93px',
        left: '202.74px',
        top: '56.16px',
        borderRadius: '19.07px',
      }
    }
  ];

  return (
    <div className="w-full bg-[#030414] py-16 lg:py-20">
      {/* 桌面端布局 - 保持原有设计 */}
      <div className="hidden lg:block">
        <div className="max-w-[1170px] mx-auto px-4 flex justify-center">
          <div style={{ width: '1170px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '160px', display: 'inline-flex' }}>

          {/* Row 1: Left Text + Right Image */}
          <div style={{ width: '1170px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Section 1 Text: Turn Your Creative into Stunning Tattoo Art */}
            <div style={{ width: '420px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '40px', display: 'flex' }}>
              <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px', display: 'flex' }}>
                <h2 style={{ alignSelf: 'stretch', color: '#ECECEC', fontSize: '36px', fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word' }}>
                  {data.sections[0]?.title}
                </h2>
                <div style={{ alignSelf: 'stretch', color: '#A5A5A5', fontSize: '18px', fontFamily: 'Inter', fontWeight: '500', lineHeight: '26px', wordWrap: 'break-word' }}>
                  {data.sections[0]?.description}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <BaseButton
                  variant="primary"
                  height="h-[60px]"
                  fontSize="text-xl"
                  className="min-w-[200px]"
                  onClick={data.sections[0]?.onButtonClick}
                >
                  {data.sections[0]?.buttonText}
                </BaseButton>
              </div>
            </div>

            {/* Section 1 Image */}
            <div style={{ minWidth: '670px', width: 'fit-content', height: '376px', position: 'relative', display: 'inline-block' }}>
              <div style={{ minWidth: '670px', width: '100%', height: '376px', left: '0px', top: '0px', position: 'absolute' }}></div>

              {/* 文字内容区域 - 用于计算实际宽度 */}
              <div style={{
                minWidth: '670px',
                width: 'fit-content',
                height: '70px',
                left: '0px',
                top: '33px',
                position: 'absolute',
                borderRadius: '16px',
                border: '1px solid #ECECEC',
                paddingLeft: '53px',
                paddingRight: '20px',
                boxSizing: 'border-box'
              }}>
                <img style={{ width: '24px', height: '24px', left: '20px', top: '21px', position: 'absolute' }} src="/imgs/generate-introduction/star-2.png" alt="Star icon" />
                <div style={{
                  paddingTop: '19px',
                  color: '#ECECEC',
                  fontSize: '20px',
                  fontFamily: 'Inter',
                  fontWeight: '400',
                  whiteSpace: 'nowrap'
                }}>
                  {data.images[0]?.prompt || "The patterns of mechanical metal structures"}
                </div>
              </div>

              <img style={{ width: '210px', height: '210px', left: '0px', top: '133px', position: 'absolute', borderRadius: '16px' }} src={data.images[0]?.images?.[0] || data.images[0]?.mainImage || "https://placehold.co/210x210"} alt="Tattoo design 1" />
              <img style={{ width: '210px', height: '210px', left: '460px', top: '133px', position: 'absolute', borderRadius: '16px' }} src={data.images[0]?.images?.[2] || data.images[0]?.mainImage || "https://placehold.co/210x210"} alt="Tattoo design 3" />
              <img style={{ width: '210px', height: '210px', left: '230px', top: '133px', position: 'absolute', borderRadius: '16px' }} src={data.images[0]?.images?.[1] || data.images[0]?.mainImage || "https://placehold.co/210x210"} alt="Tattoo design 2" />
            </div>
          </div>

          {/* Row 2: Left Images + Right Text */}
          <div style={{ width: '1170px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Section 2: Smooth Continuous Carousel */}
            <ImageCarousel
              images={data.images[1]?.images || []}
              imageConfigs={section2CarouselConfig}
              containerStyle={{ width: '670px', height: '376px' }}
              autoPlay={true}
              interval={4000}
              pauseOnHover={true}
            />

            {/* Section 2 Text: Endless Tattoo Styles */}
            <div style={{ width: '420px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '40px', display: 'flex' }}>
              <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px', display: 'flex' }}>
                <h2 style={{ alignSelf: 'stretch', color: '#ECECEC', fontSize: '36px', fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word' }}>
                  {data.sections[1]?.title}
                </h2>
                <div style={{ alignSelf: 'stretch', color: '#A5A5A5', fontSize: '18px', fontFamily: 'Inter', fontWeight: '500', lineHeight: '26px', wordWrap: 'break-word' }}>
                  {data.sections[1]?.description}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <BaseButton
                  variant="primary"
                  height="h-[60px]"
                  fontSize="text-xl"
                  className="min-w-[200px]"
                  onClick={data.sections[1]?.onButtonClick}
                >
                  {data.sections[1]?.buttonText}
                </BaseButton>
              </div>
            </div>
          </div>

          {/* Row 3: Left Text + Right Images */}
          <div style={{ width: '1170px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Section 3 Text: Made to Share */}
            <div style={{ width: '420px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '40px', display: 'flex' }}>
              <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px', display: 'flex' }}>
                <h2 style={{ alignSelf: 'stretch', color: '#ECECEC', fontSize: '36px', fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word' }}>
                  {data.sections[2]?.title}
                </h2>
                <div style={{ alignSelf: 'stretch', color: '#A5A5A5', fontSize: '18px', fontFamily: 'Inter', fontWeight: '500', lineHeight: '26px', wordWrap: 'break-word' }}>
                  {data.sections[2]?.description}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <BaseButton
                  variant="primary"
                  height="h-[60px]"
                  fontSize="text-xl"
                  className="min-w-[200px]"
                  onClick={data.sections[2]?.onButtonClick}
                >
                  {data.sections[2]?.buttonText}
                </BaseButton>
              </div>
            </div>

            {/* Section 3: Conditional layout based on twoImageMode */}
            <div style={{ width: '670px', height: '376px', position: 'relative' }}>
              {data.images[2]?.twoImageMode ? (
                /* Two image mode - simple side by side layout */
                <div style={{ width: '670px', height: '376px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                  <img style={{ width: '325px', height: '325px', borderRadius: '16px' }} src={data.images[2]?.images?.[0] || "https://placehold.co/325x325"} alt="Tattoo design 1" />
                  <img style={{ width: '325px', height: '325px', borderRadius: '16px' }} src={data.images[2]?.images?.[1] || "https://placehold.co/325x325"} alt="Tattoo design 2" />
                </div>
              ) : (
                /* Original three image mode with social sharing */
                <>
                  <div style={{ width: '670px', height: '376px', left: '0px', top: '0px', position: 'absolute' }}></div>
                  <div style={{ width: '414px', height: '70px', left: '195px', top: '25px', position: 'absolute', background: '#26262D', borderRadius: '16px' }}>
                  </div>
                  <div style={{ left: '235px', top: '40px', position: 'absolute', justifyContent: 'flex-start', alignItems: 'center', gap: '33.33px', display: 'inline-flex' }}>
                    <div style={{ width: '40px', height: '40px', position: 'relative', overflow: 'hidden' }}>
                      <img style={{ width: '33.33px', height: '33.13px', left: '3.33px', top: '3.33px', position: 'absolute' }} src="/imgs/generate-introduction/link-1.png" alt="Social link 1" />
                    </div>
                    <div style={{ width: '40px', height: '40px', position: 'relative', overflow: 'hidden' }}>
                      <img style={{ width: '33.33px', height: '33.33px', left: '3.33px', top: '3.33px', position: 'absolute' }} src="/imgs/generate-introduction/link-2.png" alt="Social link 2" />
                    </div>
                    <div style={{ width: '40px', height: '40px', position: 'relative', overflow: 'hidden' }}>
                      <img style={{ width: '29.35px', height: '30px', left: '5.33px', top: '5px', position: 'absolute' }} src="/imgs/generate-introduction/link-3.png" alt="Social link 3" />
                    </div>
                    <div style={{ width: '40px', height: '40px', position: 'relative', overflow: 'hidden' }}>
                      <img style={{ width: '33.33px', height: '32.56px', left: '3.33px', top: '3.33px', position: 'absolute' }} src="/imgs/generate-introduction/link-4.png" alt="Social link 4" />
                    </div>
                    <div style={{ width: '40px', height: '40px', position: 'relative', overflow: 'hidden' }}>
                      <img style={{ width: '33.33px', height: '23.33px', left: '3.33px', top: '8.33px', position: 'absolute' }} src="/imgs/generate-introduction/link-5.png" alt="Social link 5" />
                    </div>
                  </div>
                  <img style={{ width: '210px', height: '210px', left: '0px', top: '133px', position: 'absolute', borderRadius: '16px' }} src={data.images[2]?.images?.[0] || "https://placehold.co/210x210"} alt="Tattoo design 1" />
                  <img style={{ width: '210px', height: '210px', left: '460px', top: '133px', position: 'absolute', borderRadius: '16px' }} src={data.images[2]?.images?.[2] || "https://placehold.co/210x210"} alt="Tattoo design 3" />
                  <img style={{ width: '210px', height: '210px', left: '230px', top: '133px', position: 'absolute', borderRadius: '16px' }} src={data.images[2]?.images?.[1] || "https://placehold.co/210x210"} alt="Tattoo design 2" />
                  <img style={{ width: '102.28px', height: '110.53px', left: '80.52px', top: '4.69px', position: 'absolute', transform: 'rotate(15deg)', transformOrigin: 'top left', opacity: '0.50' }} src="/imgs/generate-introduction/hand-drawn-arrow.svg" alt="Hand drawn arrow" />
                </>
              )}
            </div>
          </div>

        </div>
      </div>
      </div>

      {/* 移动端布局 - 分开显示文本和图片 */}
      <div className="lg:hidden max-w-[1170px] mx-auto px-4">
        <div className="w-full flex flex-col gap-12">

          {/* Section 1 - 先Text后Images */}
          <div className="flex flex-col gap-8">
            {/* Section 1 Text */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold text-[#ECECEC]">
                  {data.sections[0]?.title}
                </h2>
                <div className="text-base text-[#A5A5A5] leading-6">
                  {data.sections[0]?.description}
                </div>
              </div>
              <div>
                <BaseButton
                  variant="primary"
                  height="h-[50px]"
                  fontSize="text-lg"
                  className="w-full"
                  onClick={data.sections[0]?.onButtonClick}
                >
                  {data.sections[0]?.buttonText}
                </BaseButton>
              </div>
            </div>

            {/* Section 1 Images */}
            <div className="flex flex-col gap-4">
              <div className="border border-[#ECECEC] rounded-lg p-3 flex items-center gap-3">
                <img className="w-6 h-6" src="/imgs/generate-introduction/star-2.png" alt="Star icon" />
                <div className="text-white text-sm">
                  {data.images[0]?.prompt || "The patterns of mechanical metal structures"}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 h-40">
                <img className="w-full h-full object-cover rounded-lg" src={data.images[0]?.images?.[0] || data.images[0]?.mainImage || "https://placehold.co/210x210"} alt="Tattoo design 1" />
                <img className="w-full h-full object-cover rounded-lg" src={data.images[0]?.images?.[1] || data.images[0]?.mainImage || "https://placehold.co/210x210"} alt="Tattoo design 2" />
                <img className="w-full h-full object-cover rounded-lg" src={data.images[0]?.images?.[2] || data.images[0]?.mainImage || "https://placehold.co/210x210"} alt="Tattoo design 3" />
              </div>
            </div>
          </div>

          {/* Section 2 - 先Images后Text */}
          <div className="flex flex-col gap-8">
            {/* Section 2 Images */}
            <div className="h-[300px] flex justify-center items-center">
              {data.images[1]?.images && data.images[1].images.length >= 5 ? (
                <div className="relative w-[400px] h-[300px]">
                  <ImageCarousel
                    images={data.images[1].images}
                    imageConfigs={section2CarouselConfig.map((config) => {
                      // 400px容器的居中配置
                      const desktopWidth = 670;
                      const mobileWidth = 400;
                      const scaledDesktopWidth = desktopWidth * 0.6; // 使用0.6缩放
                      const centerOffset = (mobileWidth - scaledDesktopWidth) / 2;

                      return {
                        ...config,
                        position: {
                          ...config.position,
                          width: String(Math.round(parseFloat(config.position.width) * 0.6)) + 'px',
                          height: String(Math.round(parseFloat(config.position.height) * 0.6)) + 'px',
                          left: String(Math.round(parseFloat(config.position.left) * 0.6 + centerOffset)) + 'px',
                          top: String(Math.round(parseFloat(config.position.top) * 0.6 + 30)) + 'px',
                          borderRadius: '10px',
                        }
                      };
                    })}
                    containerStyle={{ width: '400px', height: '300px' }}
                    autoPlay={true}
                    interval={4000}
                    pauseOnHover={true}
                  />
                </div>
              ) : (
                /* 如果图片数量不足，显示静态布局 */
                <div className="flex flex-col gap-4 h-full">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <img className="w-full h-full object-cover rounded-lg" src={data.images[1]?.images?.[0] || "https://placehold.co/210x210"} alt="Tattoo style 1" />
                    <img className="w-full h-full object-cover rounded-lg" src={data.images[1]?.images?.[1] || "https://placehold.co/210x210"} alt="Tattoo style 2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <img className="w-full h-full object-cover rounded-lg" src={data.images[1]?.images?.[2] || "https://placehold.co/210x210"} alt="Tattoo style 3" />
                    <img className="w-full h-full object-cover rounded-lg" src={data.images[1]?.images?.[3] || "https://placehold.co/210x210"} alt="Tattoo style 4" />
                    <img className="w-full h-full object-cover rounded-lg" src={data.images[1]?.images?.[4] || "https://placehold.co/210x210"} alt="Tattoo style 5" />
                  </div>
                </div>
              )}
            </div>

            {/* Section 2 Text */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold text-[#ECECEC]">
                  {data.sections[1]?.title}
                </h2>
                <div className="text-base text-[#A5A5A5] leading-6">
                  {data.sections[1]?.description}
                </div>
              </div>
              <div>
                <BaseButton
                  variant="primary"
                  height="h-[50px]"
                  fontSize="text-lg"
                  className="w-full"
                  onClick={data.sections[1]?.onButtonClick}
                >
                  {data.sections[1]?.buttonText}
                </BaseButton>
              </div>
            </div>
          </div>

          {/* Section 3 - 先Text后Images */}
          <div className="flex flex-col gap-8">
            {/* Section 3 Text */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold text-[#ECECEC]">
                  {data.sections[2]?.title}
                </h2>
                <div className="text-base text-[#A5A5A5] leading-6">
                  {data.sections[2]?.description}
                </div>
              </div>
              <div>
                <BaseButton
                  variant="primary"
                  height="h-[50px]"
                  fontSize="text-lg"
                  className="w-full"
                  onClick={data.sections[2]?.onButtonClick}
                >
                  {data.sections[2]?.buttonText}
                </BaseButton>
              </div>
            </div>

            {/* Section 3 Images */}
            <div className="h-[300px]">
              {data.images[2]?.twoImageMode ? (
                <div className="grid grid-cols-2 gap-2 h-full">
                  <img className="w-full h-full object-cover rounded-lg" src={data.images[2]?.images?.[0] || "https://placehold.co/325x325"} alt="Tattoo design 1" />
                  <img className="w-full h-full object-cover rounded-lg" src={data.images[2]?.images?.[1] || "https://placehold.co/325x325"} alt="Tattoo design 2" />
                </div>
              ) : (
                <div className="flex flex-col gap-4 h-full">
                  {/* 社交分享图标 - 移动端版本 */}
                  <div className="flex justify-center items-center gap-4 bg-[#26262D] rounded-lg p-3 h-16">
                    <img className="w-6 h-6" src="/imgs/generate-introduction/link-1.png" alt="Social link 1" />
                    <img className="w-6 h-6" src="/imgs/generate-introduction/link-2.png" alt="Social link 2" />
                    <img className="w-6 h-6" src="/imgs/generate-introduction/link-3.png" alt="Social link 3" />
                    <img className="w-6 h-6" src="/imgs/generate-introduction/link-4.png" alt="Social link 4" />
                    <img className="w-6 h-6" src="/imgs/generate-introduction/link-5.png" alt="Social link 5" />
                  </div>

                  {/* 3张纹身图片 */}
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <img className="w-full h-full object-cover rounded-lg" src={data.images[2]?.images?.[0] || "https://placehold.co/210x210"} alt="Tattoo design 1" />
                    <img className="w-full h-full object-cover rounded-lg" src={data.images[2]?.images?.[1] || "https://placehold.co/210x210"} alt="Tattoo design 2" />
                    <img className="w-full h-full object-cover rounded-lg" src={data.images[2]?.images?.[2] || "https://placehold.co/210x210"} alt="Tattoo design 3" />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TattooIntroduction;