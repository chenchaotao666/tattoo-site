import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithLanguage } from '../../utils/navigationUtils';
import { colors } from '../../styles/colors';

const homeIcon = '/images/breadcrumb/home.png';
const chevronRightIcon = '/images/breadcrumb/chevron-right.svg';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.path && !item.current) {
      navigateWithLanguage(navigate, item.path);
    }
  };

  return (
    <div className="max-w-[1183px] mx-auto py-6 lg:pt-10 lg:pb-8">
      <nav className={`flex items-center gap-2 max-w-full md:overflow-x-auto md:scrollbar-hide flex-wrap md:flex-nowrap ${className}`}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <img 
              src={chevronRightIcon} 
              alt="chevron" 
              className="w-3 h-3 flex-shrink-0" 
            />
          )}
          {index === 0 && (
            <img 
              src={homeIcon} 
              alt="Home" 
              className="w-4 h-4 flex-shrink-0 mb-[4px]" 
            />
          )}
          {item.current ? (
            <span 
              className="text-sm font-medium leading-[21px] max-w-[150px] md:max-w-none truncate md:whitespace-nowrap"
              style={{ color: colors.text.disabled }}
            >
              {item.label}
            </span>
          ) : (
            <button
              onClick={() => handleItemClick(item)}
              className="text-sm font-medium leading-[21px] transition-colors flex-shrink-0 max-w-[150px] md:max-w-none truncate md:whitespace-nowrap"
              style={{ 
                color: hoveredIndex === index ? colors.special.highlight : colors.text.secondary 
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {item.label}
            </button>
          )}
        </Fragment>
      ))}
      </nav>
    </div>
  );
};

export default Breadcrumb; 