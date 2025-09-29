import React from 'react';

interface GenerateProgressProps {
  progress: number; // 0-100
  size?: 'small' | 'large';
  showPercentage?: boolean;
  className?: string;
}

const GenerateProgress: React.FC<GenerateProgressProps> = ({ 
  progress, 
  size = 'large', 
  showPercentage = false,
  className = '' 
}) => {
  const isSmall = size === 'small';
  const videoSize = isSmall ? 'w-16 h-16' : 'w-96 h-96';

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* 加载视频动画 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className={`${videoSize} bg-blend-lighten object-cover rounded-full`}
      >
        <source src="/imgs/generate/loading.mp4" type="video/mp4" />
        {/* 如果视频加载失败，显示备用的圆圈动画 */}
      </video>
      
      {/* 百分比文字和生成状态文字 (仅大尺寸显示) */}
      {showPercentage && !isSmall && (
        <div className="mt-4 flex flex-col items-center">
          <div className="justify-start text-[#ECECEC] text-[36px] font-semibold font-['PingFang_SC'] leading-none">
            {Math.round(progress)}%
          </div>
          <div className="justify-start text-[#A5A5A5] text-[20px] font-normal font-['PingFang_SC'] mt-2">
            Generating...
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateProgress; 