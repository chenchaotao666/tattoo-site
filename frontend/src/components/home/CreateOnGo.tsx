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
    <div className="relative w-[1099px] h-[1057px]">
      {/* Main Title */}
      <h2 className="absolute left-[308px] top-[-8px] text-center text-[#ECECEC] text-[56px] font-inter font-bold capitalize break-words">
        {data.title}
      </h2>
      
      {/* Description */}
      <h3 className="absolute w-[888px] left-[106px] top-20 text-center text-[#A5A5A5] text-lg font-inter font-medium break-words">
        {data.description}
      </h3>
      
      {/* App Store Button */}
      <div className="absolute w-[212px] h-[60px] left-[330px] top-[164px] px-4 py-2 rounded-lg border border-[#5D5D5D] flex flex-col justify-start items-center gap-2.5">
        <div className="flex justify-start items-center gap-3">
          <div className="w-9 h-9 relative overflow-hidden">
            <img className="w-9 h-9 absolute" src="/imgs/home-create-on-go/apple.png" alt="Apple logo" />
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="self-stretch text-[#ECECEC] text-xs font-inter font-normal break-words">{data.appStore.text1}</div>
            <div className="self-stretch text-[#ECECEC] text-xl font-inter font-bold break-words">{data.appStore.text2}</div>
          </div>
        </div>
      </div>
      
      {/* Google Play Button */}
      <div className="absolute w-[212px] h-[60px] left-[558px] top-[164px] px-4 py-2 rounded-lg border border-[#5D5D5D] flex flex-col justify-start items-start gap-2.5">
        <div className="flex justify-start items-center gap-3">
          <div className="w-9 h-9 relative overflow-hidden">
            <img className="w-9 h-9 absolute" src="/imgs/home-create-on-go/google.png" alt="Google Play logo" />
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="self-stretch text-[#ECECEC] text-xs font-inter font-normal break-words">{data.googlePlay.text1}</div>
            <div className="text-[#ECECEC] text-xl font-inter font-bold break-words">{data.googlePlay.text2}</div>
          </div>
        </div>
      </div>
      
      {/* Phone Images */}
      <img className="absolute w-[260px] h-[563px] left-5 top-[304px] rounded-[32px] outline outline-4 outline-[#393B42]" src={data.phoneImages[0]} alt="Mobile app preview 1" />
      <img className="absolute w-[260px] h-[563px] left-[420px] top-[304px] rounded-[32px] outline outline-4 outline-[#393B42]" src={data.phoneImages[1]} alt="Mobile app preview 2" />
      <img className="absolute w-[260px] h-[563px] left-[820px] top-[304px] rounded-[32px] outline outline-4 outline-[#393B42]" src={data.phoneImages[2]} alt="Mobile app preview 3" />
      
      {/* Feature Cards */}
      {data.features.map((feature, index) => {
        const leftClasses = ['left-0', 'left-[392px]', 'left-[800px]'];
        return (
          <div key={index} className={`absolute w-[299px] ${leftClasses[index]} top-[907px] flex flex-col justify-start items-center gap-5`}>
            <div className="w-[46px] h-[46px] p-2.5 bg-[#26262D] rounded-[30px] flex justify-start items-center gap-2.5">
              <div className="w-7 h-7 relative overflow-hidden">
                <img className="w-7 h-7 absolute" src={feature.icon} alt={`${feature.title} icon`} />
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-center gap-3">
              <h3 className="self-stretch text-center text-[#ECECEC] text-xl font-inter font-bold break-words">{feature.title}</h3>
              <div className="self-stretch text-center text-[#A5A5A5] text-base font-inter font-normal leading-6 break-words">{feature.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CreateOnGo;