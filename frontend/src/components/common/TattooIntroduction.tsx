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
                  width="w-[170px]"
                  height="h-[60px]"
                  fontSize="text-xl"
                  onClick={data.sections[0]?.onButtonClick}
                >
                  {data.sections[0]?.buttonText}
                </BaseButton>
              </div>
            </div>

            {/* Section 1 Image */}
            <div style={{ width: '670px', height: '376px', position: 'relative' }}>
              <div style={{ width: '670px', height: '376px', left: '0px', top: '0px', position: 'absolute' }}></div>
              <div style={{ width: '670px', height: '70px', left: '0px', top: '33px', position: 'absolute', borderRadius: '16px', border: '1px solid #ECECEC' }}></div>
              <img style={{ width: '24px', height: '24px', left: '20px', top: '54px', position: 'absolute' }} src="/imgs/generate-introduction/star-2.png" alt="Star icon" />
              <div style={{ left: '53px', top: '52px', position: 'absolute', color: '#ECECEC', fontSize: '20px', fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word' }}>
                {data.images[0]?.prompt || "The patterns of mechanical metal structures"}
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
                  width="w-[170px]"
                  height="h-[60px]"
                  fontSize="text-xl"
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
                  width="w-[170px]"
                  height="h-[60px]"
                  fontSize="text-xl"
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
  );
};

export default TattooIntroduction;