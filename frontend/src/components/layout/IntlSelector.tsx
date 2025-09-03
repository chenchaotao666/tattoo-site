import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language, useAsyncTranslation } from '../../contexts/LanguageContext';
import { colors } from '../../styles/colors';

interface IntlSelectorProps {
  className?: string;
}

const IntlSelector: React.FC<IntlSelectorProps> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const { t: navT } = useAsyncTranslation('navigation');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isDropdownAnimating, setIsDropdownAnimating] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 控制下拉框的显示动画
  useEffect(() => {
    if (isDropdownOpen) {
      setIsDropdownVisible(true);
      const timer = setTimeout(() => {
        setIsDropdownAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsDropdownAnimating(false);
      const timer = setTimeout(() => {
        setIsDropdownVisible(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isDropdownOpen]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsDropdownOpen(false);
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`} ref={dropdownRef}>
      <div 
        className="px-3 py-1.5 rounded-lg flex justify-start items-center gap-1.5 transition-colors duration-200 cursor-pointer min-w-fit group"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        style={
          {
            '--hover-color': colors.special.highlight,
          } as React.CSSProperties
        }
      >
        <svg 
          className="w-5 h-5 flex-shrink-0 text-white group-hover:text-[var(--hover-color)] transition-colors duration-200" 
          viewBox="0 0 20 20" 
          fill="none"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M9.99984 18.3333C14.6022 18.3333 18.3332 14.6024 18.3332 10C18.3332 5.39762 14.6022 1.66667 9.99984 1.66667C5.39746 1.66667 1.6665 5.39762 1.6665 10C1.6665 14.6024 5.39746 18.3333 9.99984 18.3333Z" 
            stroke="currentColor" 
            strokeWidth="1.25" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M1.6665 10H18.3332" 
            stroke="currentColor" 
            strokeWidth="1.25" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M9.99984 18.3333C11.8408 18.3333 13.3332 14.6024 13.3332 10C13.3332 5.39762 11.8408 1.66667 9.99984 1.66667C8.15888 1.66667 6.6665 5.39762 6.6665 10C6.6665 14.6024 8.15888 18.3333 9.99984 18.3333Z" 
            stroke="currentColor" 
            strokeWidth="1.25" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M4.10742 4.22607C5.61546 5.73412 7.69879 6.66687 9.99996 6.66687C12.3012 6.66687 14.3845 5.73412 15.8925 4.22607" 
            stroke="currentColor" 
            strokeWidth="1.25" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M15.8925 15.7741C14.3845 14.2661 12.3012 13.3333 9.99996 13.3333C7.69879 13.3333 5.61546 14.2661 4.10742 15.7741" 
            stroke="currentColor" 
            strokeWidth="1.25" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-white group-hover:text-[var(--hover-color)] text-base font-medium leading-6 whitespace-nowrap flex-shrink-0 transition-colors duration-200">
          {language === 'zh' ? navT('language.chinese', '简体中文') : 
           language === 'ja' ? navT('language.japanese', '日本語') : 
           navT('language.english', 'English')}
        </span>
        <svg 
          className={`w-5 h-5 flex-shrink-0 transition-all duration-200 text-white group-hover:text-[var(--hover-color)] ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {/* 语言下拉菜单 */}
      {isDropdownVisible && (
        <div className={`absolute top-full mt-[2px] right-0 bg-[#19191F] border border-[#393B42] rounded-lg shadow-lg py-2 min-w-[120px] z-50 transition-all duration-150 ease-out ${
          isDropdownAnimating 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 -translate-y-1 scale-95'
        }`}>
          <div
            className="px-4 py-1.5 text-white text-base font-medium hover:bg-[#1D1E2C] cursor-pointer transition-colors duration-200 whitespace-nowrap"
            onClick={() => handleLanguageSelect('en')}
          >
            {navT('language.english', 'English')}
          </div>
          <div
            className="px-4 py-1.5 text-white text-base font-medium hover:bg-[#1D1E2C] cursor-pointer transition-colors duration-200 whitespace-nowrap"
            onClick={() => handleLanguageSelect('zh')}
          >
            {navT('language.chinese', '简体中文')}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntlSelector;