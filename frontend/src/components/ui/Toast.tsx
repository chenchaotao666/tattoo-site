import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number; // 持续时间，默认5秒
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 5000
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // 延迟移除，等待动画完成
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  const getIcon = () => {
    if (type === 'success') {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_1719_6417)">
            <path d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM12.127 5.23535C11.8075 4.92394 11.2884 4.92417 10.9688 5.23535L7.05762 9.06641L5.02832 7.08105C4.7087 6.76947 4.18876 6.76951 3.86914 7.08105C3.54973 7.39256 3.54973 7.90427 3.86914 8.21582L6.47852 10.7686C6.77809 11.0603 7.25276 11.0785 7.57422 10.8232L7.63672 10.7686L12.127 6.37012C12.4465 6.05857 12.4465 5.54691 12.127 5.23535Z" fill="#98FF59"/>
          </g>
          <defs>
            <clipPath id="clip0_1719_6417">
              <rect width="16" height="16" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      );
    }
    // 可以为其他类型添加不同的图标
    return (
      <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
    );
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-20">
      <div
        className={`px-4 py-3 bg-[#26262D] rounded-lg border border-[#393B42] flex items-center gap-1.5 transition-all duration-300 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-2'
        }`}
      >
        {getIcon()}
        <div className="text-[#ECECEC] text-sm font-normal whitespace-nowrap">
          {message}
        </div>
      </div>
    </div>
  );
};

export default Toast;