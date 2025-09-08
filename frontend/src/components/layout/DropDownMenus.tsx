import React from 'react';
import { Link } from 'react-router-dom';

interface DropDownMenuItem {
  type: 'link' | 'button' | 'divider' | 'header';
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  subLabel?: string;
}

interface DropDownMenusProps {
  isVisible: boolean;
  isAnimating: boolean;
  onClose: () => void;
  items: DropDownMenuItem[];
  className?: string;
  minWidth?: string;
}

const DropDownMenus: React.FC<DropDownMenusProps> = ({
  isVisible,
  isAnimating,
  onClose,
  items,
  className = '',
  minWidth = '180px'
}) => {
  if (!isVisible) return null;

  const renderItem = (item: DropDownMenuItem, index: number) => {
    const baseClasses = "px-4 py-1.5 text-white text-base font-medium hover:bg-[#1D1E2C] transition-colors duration-200 flex items-center gap-2 whitespace-nowrap";
    
    switch (item.type) {
      case 'header':
        return (
          <div key={index} className="px-4 py-1.5 border-b border-[#393B42]">
            <p className="text-base font-medium text-white">{item.label}</p>
            {item.subLabel && (
              <p className="text-sm text-gray-400">{item.subLabel}</p>
            )}
          </div>
        );
      
      case 'link':
        return (
          <Link
            key={index}
            to={item.href || '#'}
            className={`block ${baseClasses} ${item.className || ''}`}
            onClick={onClose}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      
      case 'button':
        return (
          <button
            key={index}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            className={`block w-full text-left ${baseClasses} ${item.className || ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      
      case 'divider':
        return <div key={index} className="border-t border-[#393B42]" />;
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`absolute top-full mt-[2px] right-0 bg-[#19191F] border border-[#393B42] rounded-lg shadow-lg py-2 z-50 transition-all duration-150 ease-out ${
        isAnimating 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 -translate-y-1 scale-95'
      } ${className}`}
      style={{ minWidth }}
    >
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
};

export default DropDownMenus;
export type { DropDownMenuItem };