import React, { useState, useEffect, useRef } from 'react';

interface ExpandableContentProps {
  content: React.ReactNode;
  maxLines?: number;
  viewMoreText?: string;
  collapseText?: string;
  className?: string;
}

const ExpandableContent: React.FC<ExpandableContentProps> = ({
  content,
  maxLines = 2,
  viewMoreText = '查看更多',
  collapseText = '收起',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 延迟计算确保DOM完全渲染
    const timer = setTimeout(() => {
      if (hiddenRef.current && contentRef.current) {
        const hiddenElement = hiddenRef.current;
        const contentElement = contentRef.current;

        // 确保隐藏元素和显示元素有相同的宽度
        const containerWidth = contentElement.offsetWidth;
        hiddenElement.style.width = `${containerWidth}px`;

        // 计算行数
        const lineHeight = parseFloat(getComputedStyle(hiddenElement).lineHeight);
        const height = hiddenElement.scrollHeight;
        const lines = Math.round(height / lineHeight);

        setNeedsExpansion(lines > maxLines);
        setIsInitialized(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [maxLines, content]);

  return (
    <div className={`relative ${className}`}>
      {/* 隐藏元素用于计算高度 */}
      <div
        ref={hiddenRef}
        className="text-lg leading-relaxed"
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
          fontSize: '18px',
          whiteSpace: 'pre-line'
        }}
      >
        {content}
      </div>

      {/* 实际显示的内容 */}
      <div
        ref={contentRef}
        className="text-lg leading-relaxed"
        style={{
          opacity: isInitialized ? 1 : 0,
          visibility: isInitialized ? 'visible' : 'hidden',
          transition: 'opacity 0.2s ease-in-out',
          fontSize: '18px'
        }}
      >
        {/* 根据需要显示省略或完整内容 */}
        {isInitialized && (
          <div
            style={{
              whiteSpace: isExpanded || !needsExpansion ? 'pre-line' : 'normal',
              display: !isExpanded && needsExpansion ? '-webkit-box' : 'block',
              WebkitLineClamp: !isExpanded && needsExpansion ? maxLines : 'none',
              WebkitBoxOrient: 'vertical' as const,
              overflow: !isExpanded && needsExpansion ? 'hidden' : 'visible',
              paddingRight: !isExpanded && needsExpansion ? '110px' : '0px'
            }}
          >
            {content}
          </div>
        )}
      </div>

      {needsExpansion && !isExpanded && isInitialized && (
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-0 right-0 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-200 inline-flex items-center gap-1"
        >
          <span className='text-lg mt-[1px]'>{viewMoreText}</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {needsExpansion && isExpanded && isInitialized && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-200"
          >
            <span className='text-lg'>{collapseText}</span>
            <svg
              className="w-4 h-4 transition-transform duration-200 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpandableContent;