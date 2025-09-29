import React from 'react';

interface NoDataProps {
  message?: string;
  className?: string;
}

const NoData: React.FC<NoDataProps> = ({ 
  message = "No data found",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      {/* SVG Image */}
      <div className="mb-6">
        <img 
          src="/imgs/no-data.svg" 
          alt="No data" 
          className="w-[305px] h-[200px] opacity-60"
        />
      </div>
      
      {/* Message */}
      <div className="text-white text-base font-normal leading-6 text-center">
        {message}
      </div>
    </div>
  );
};

export default NoData;