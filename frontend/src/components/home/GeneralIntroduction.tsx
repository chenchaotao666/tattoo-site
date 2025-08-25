import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GeneralIntroductionProps {
  className?: string;
  tattooCount?: string;
  onButtonClick?: () => void;
}

const GeneralIntroduction: React.FC<GeneralIntroductionProps> = ({
  className = "",
  tattooCount = 100,
  onButtonClick
}) => {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate('/create');
    }
  };
  return (
    <div className={`w-full flex flex-col items-center gap-8 bg-black py-16 ${className}`}>
      {/* Badge */}
      <div className="px-3 py-1.5 rounded-[20px] outline outline-1 outline-[#5D5D5D] -outline-offset-1 flex justify-center items-center gap-2.5">
        <div className="text-[#ECECEC] text-sm font-['Roboto'] font-normal break-words">
          🔥 Over {tattooCount} Tattoos Designed with AI
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <span className="text-[#98FF59] text-[56px] font-['Roboto'] font-bold capitalize break-words">
          AI Tattoo Generator
        </span>
        <span className="text-[#ECECEC] text-[56px] font-['Roboto'] font-bold capitalize break-words">
          {' '}
          <br />
          Create Stunning Tattoos in Seconds
        </span>
      </div>

      {/* Description */}
      <div className="text-[#A5A5A5] text-lg font-['Roboto'] font-normal break-words">
        Our AI Tattoo Generator turns your ideas into realistic designs in 10 seconds. Fast, creative, and precise.
      </div>

      <div className="w-[630px] h-[60px] relative">
        <input 
          type="text"
          placeholder="Type your tattoo idea"
          className="w-[630px] h-[60px] pl-[48px] pr-[140px] rounded-lg border border-[#393B42] p-3 resize-none focus:outline-none text-[#818181] placeholder-[#818181]"
          style={{backgroundColor: '#1a202c'}}
        />
        <div className="w-[122px] h-[60px] px-[27px] py-[18px] absolute right-0 top-0 bg-[#98FF59] rounded-lg flex justify-center items-center gap-[10px] cursor-pointer" onClick={handleCreateClick}>
          <div className="text-black text-xl font-bold font-['Inter']">Create</div>
        </div>
        <img src="/images/home-generator/dice-2.svg" alt="" className="w-6 h-6 absolute left-3 top-[18px]" />
        <div className="w-[13.65px] h-[13.65px] absolute left-[13px] top-[27.07px] origin-top-left rotate-[-30deg] bg-[#D9D9D9]"></div>
      </div>
    </div>
  );
};

export default GeneralIntroduction;