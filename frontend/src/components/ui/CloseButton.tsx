import React from 'react';

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const variantClasses = {
    default: 'text-[#6B7280] hover:text-[#161616] bg-white border-gray-200',
    white: 'text-white hover:text-gray-300 bg-transparent border-white/20'
  };

  return (
    <button
      onClick={onClick}
      className={`fixed top-4 right-8 ${sizeClasses[size]} transition-all duration-200 z-[10000] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl border ${variantClasses[variant]} ${className}`}
    >
      <svg className={iconSizeClasses[size]} viewBox="0 0 16 16" fill="currentColor">
        <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
      </svg>
    </button>
  );
};

export default CloseButton;