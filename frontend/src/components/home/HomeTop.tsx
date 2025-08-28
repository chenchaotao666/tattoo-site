import React from 'react';
import GenerateTextarea from '../common/GenerateTextarea';

interface HomeTopProps {
  className?: string;
  tattooCount?: number;
  onButtonClick?: () => void;
}

const HomeTop: React.FC<HomeTopProps> = ({
  tattooCount = 1000000,
}) => {
  return (
    <div className={`w-full flex flex-col items-center gap-8 bg-black py-16 px-4`}>
      {/* Badge */}
      <div className="px-3 py-1.5 rounded-[20px] outline outline-1 outline-[#5D5D5D] -outline-offset-1 flex justify-center items-center gap-2.5">
        <div className="text-[#ECECEC] text-sm font-['Roboto'] font-normal">
          🔥 Over {tattooCount?.toLocaleString()}+ Tattoos Designed with AI
        </div>
      </div>

      {/* Titles Container */}
      <div className="text-center flex flex-col">
        {/* AI Tattoo Generator Title */}
        <div 
          className="text-[56px] font-['Roboto'] font-bold capitalize"
          style={{
            background: 'linear-gradient(90deg, #59FFD0 0%, #98FF59 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          AI Tattoo Generator
        </div>

        {/* Title */}
        <div className="text-[#ECECEC] text-[56px] font-['Roboto'] font-bold capitalize leading-tight">
          Create Stunning Tattoos in Seconds
        </div>
      </div>

      {/* Description */}
      <div className="text-[#A5A5A5] text-lg font-['Roboto'] font-normal text-center max-w-4xl mb-6">
        Our AI Tattoo Generator turns your ideas into realistic designs in 10 seconds. Fast, creative, and precise.
      </div>

      {/* Generator Interface */}
      <GenerateTextarea />
    </div>
  );
};

export default HomeTop;