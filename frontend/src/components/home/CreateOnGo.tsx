import React from 'react';

export interface CreateOnGoData {
  title: string;
  description: string;
  appStore: {
    text1: string;
    text2: string;
  };
  googlePlay: {
    text1: string;
    text2: string;
  };
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  phoneImages: string[];
}

interface CreateOnGoProps {
  data: CreateOnGoData;
}

const CreateOnGo: React.FC<CreateOnGoProps> = ({ data }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-16">
      {/* Main Title */}
      <h2 className="text-center text-[#ECECEC] text-3xl md:text-5xl lg:text-[56px] font-inter font-bold capitalize mb-4 md:mb-6">
        {data.title}
      </h2>

      {/* Description */}
      <h3 className="max-w-4xl mx-auto text-center text-[#A5A5A5] text-base md:text-lg font-inter font-medium mb-8 md:mb-12 px-4">
        {data.description}
      </h3>

      {/* App Store Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 mb-12 md:mb-16">
        {/* App Store Button */}
        <div className="w-full max-w-[212px] h-[60px] px-4 py-2 rounded-lg border border-[#5D5D5D] flex flex-col justify-center items-center">
          <div className="flex justify-start items-center gap-3">
            <div className="w-9 h-9 relative overflow-hidden flex-shrink-0">
              <img className="w-9 h-9 absolute" src="/imgs/home-create-on-go/apple.png" alt="Apple logo" />
            </div>
            <div className="flex flex-col justify-start items-start">
              <div className="text-[#ECECEC] text-xs font-inter font-normal break-words">{data.appStore.text1}</div>
              <div className="text-[#ECECEC] text-xl font-inter font-bold break-words">{data.appStore.text2}</div>
            </div>
          </div>
        </div>

        {/* Google Play Button */}
        <div className="w-full max-w-[212px] h-[60px] px-4 py-2 rounded-lg border border-[#5D5D5D] flex flex-col justify-center items-center">
          <div className="flex justify-start items-center gap-3">
            <div className="w-9 h-9 relative overflow-hidden flex-shrink-0">
              <img className="w-9 h-9 absolute" src="/imgs/home-create-on-go/google.png" alt="Google Play logo" />
            </div>
            <div className="flex flex-col justify-start items-start">
              <div className="text-[#ECECEC] text-xs font-inter font-normal break-words">{data.googlePlay.text1}</div>
              <div className="text-[#ECECEC] text-xl font-inter font-bold break-words">{data.googlePlay.text2}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Images */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 lg:gap-12 mb-12 md:mb-16 overflow-x-auto">
        {data.phoneImages.map((image, index) => (
          <img
            key={index}
            className="w-[260px] h-[563px] rounded-[32px] outline outline-4 outline-[#393B42] object-cover flex-shrink-0"
            src={image}
            alt={`Mobile app preview ${index + 1}`}
          />
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
        {data.features.map((feature, index) => (
          <div key={index} className="flex flex-col justify-start items-center gap-5 text-center">
            <div className="w-[46px] h-[46px] p-2.5 bg-[#26262D] rounded-[30px] flex justify-center items-center flex-shrink-0">
              <div className="w-7 h-7 relative overflow-hidden">
                <img className="w-7 h-7 absolute" src={feature.icon} alt={`${feature.title} icon`} />
              </div>
            </div>
            <div className="flex flex-col justify-start items-center gap-3 max-w-[280px]">
              <h3 className="text-center text-[#ECECEC] text-lg md:text-xl font-inter font-bold break-words">{feature.title}</h3>
              <div className="text-center text-[#A5A5A5] text-sm md:text-base font-inter font-normal leading-6 break-words">{feature.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateOnGo;