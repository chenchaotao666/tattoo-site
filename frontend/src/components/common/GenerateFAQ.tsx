import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors } from '../../styles/colors';

const expandDefaultIcon = '/imgs/expand-default.svg';
const expandColorIcon = '/imgs/expand-color.svg';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  onClick: () => void;
  isLast?: boolean;
}

export interface FAQData {
  question: string;
  answer: string;
}

interface GenerateFAQProps {
  className?: string;
  faqData: FAQData[];
  title?: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen = false, onClick, isLast = false }) => {
  return (
    <div className={`w-full w-[970px] px-5 py-7 ${!isLast ? 'mb-5' : ''} rounded-2xl border border-[#26262D] ${isOpen ? 'bg-[#19191F]' : 'bg-transparent'}`}>
      <div 
        className="flex justify-between items-center gap-4 cursor-pointer hover:bg-[#2A2A30] transition-colors duration-200 -mx-5 -my-7 px-5 py-7 rounded-2xl"
        onClick={onClick}
      >
        <div 
          className="text-xl font-bold leading-tight flex-1"
          style={{ color: isOpen ? colors.special.highlight : '#ECECEC' }}
        >
          {question}
        </div>
        <img 
          src={isOpen ? expandColorIcon : expandDefaultIcon} 
          alt={isOpen ? "Collapse" : "Expand"} 
          className="w-6 h-6 flex-shrink-0 transition-opacity duration-200 pointer-events-none"
        />
      </div>
      
      {isOpen && (
        <div className="text-[#A5A5A5] text-sm leading-5 mt-10 pr-10 cursor-text select-text">
          {answer}
        </div>
      )}
    </div>
  );
};

const GenerateFAQ: React.FC<GenerateFAQProps> = ({ 
  className = "",
  faqData,
  title
}) => {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState<number[]>([0]); // 默认打开第一个

  const handleClick = (index: number) => {
    setOpenItems(prevOpenItems => {
      if (prevOpenItems.includes(index)) {
        // 如果已经打开，则关闭
        return prevOpenItems.filter(item => item !== index);
      } else {
        // 如果未打开，则添加到打开列表
        return [...prevOpenItems, index];
      }
    });
  };

  return (
    <div className={`w-full max-w-[970px] mx-auto px-4 pb-[5rem] ${className}`}>
      {/* Header */}
      <div className="text-center mb-8 md:mb-16">
        <h2 className="text-3xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-[56px] font-bold text-[#ECECEC]">
          {title || t('faq.title')}
        </h2>
      </div>

      {/* FAQ List */}
      <div className="w-full flex flex-col items-center">
        {faqData.map((item, index) => (
          <FAQItem 
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openItems.includes(index)}
            onClick={() => handleClick(index)}
            isLast={index === faqData.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default GenerateFAQ;