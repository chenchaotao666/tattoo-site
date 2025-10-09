import React from 'react';

export interface BaseButtonProps {
  children: React.ReactNode;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary';
  width?: string;
  height?: string;
  fontSize?: 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const BaseButton: React.FC<BaseButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  width = 'w-[200px]',
  height = 'h-[60px]',
  fontSize = 'text-xl',
  disabled = false,
  className = '',
  style
}) => {
  const baseClasses = `${width} ${height} px-4 rounded-lg flex justify-center items-center transition-colors`;
  
  const variantClasses = {
    primary: 'bg-[#98FF59] hover:bg-[#B3FF7A] text-[#161616] font-bold',
    secondary: 'border border-[#A5A5A5] hover:bg-[#333333] text-[#ECECEC] font-bold'
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';

  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`;

  return (
    <button
      className={finalClassName}
      onClick={disabled ? undefined : (e) => onClick?.(e)}
      disabled={disabled}
      style={style}
    >
      <div className={`${fontSize} font-bold ${variant === 'primary' ? 'text-[#161616]' : 'text-[#ECECEC]'}`}>
        {children}
      </div>
    </button>
  );
};

export default BaseButton;