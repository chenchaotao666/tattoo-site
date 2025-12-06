import React from 'react';

interface Step {
  step: string;
  title: string;
  description: string;
}

interface HowToCreateProps {
  title: string;
  steps: Step[];
}

const HowToCreate: React.FC<HowToCreateProps> = ({ title, steps }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-16">
      {/* Title */}
      <h2 className="text-center text-[#ECECEC] text-3xl md:text-3xl lg:text-[56px] font-inter font-bold capitalize mb-8 md:mb-16 break-words">
        {title}
      </h2>

      {/* Steps Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-[21px]">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-[#19191F] rounded-2xl p-6 md:p-8 lg:p-9 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="text-[#A5A5A5] text-sm md:text-base font-inter font-normal break-words">
                  {step.step}
                </div>
                <h3 className="text-[#ECECEC] text-lg md:text-xl font-inter font-medium capitalize break-words leading-tight">
                  {step.title}
                </h3>
              </div>
              <div className="text-[#A5A5A5] text-sm md:text-base font-inter font-normal leading-6 break-words">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowToCreate;