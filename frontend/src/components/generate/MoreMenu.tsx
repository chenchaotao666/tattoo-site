import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../../styles/colors';
import { BaseImage } from '../../services/imageService';
import DeleteImageConfirmDialog from '../ui/DeleteImageConfirmDialog';

interface MoreMenuProps {
  // 图片数据
  images: BaseImage[];
  currentSelectedImage?: string | null;
  
  // UI状态
  isAbsolute?: boolean;
  
  // 回调 - 通知父组件状态更新
  onImagesDeleted?: (deletedIds: string[]) => void;
}

const MoreMenu: React.FC<MoreMenuProps> = ({
  images,
  currentSelectedImage,
  isAbsolute = false,
  onImagesDeleted,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showShareSubmenu, setShowShareSubmenu] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // 计算当前操作的图片数据
  const targetImages = React.useMemo(() => {
    if (!currentSelectedImage) return [];
    
    const selectedImage = images.find(img => img.id === currentSelectedImage);
    if (!selectedImage) return [];
    
    const batchId = selectedImage.batchId;
    if (batchId) {
      // 批次图片
      return images.filter(img => img.batchId === batchId);
    } else {
      // 单张图片
      return [selectedImage];
    }
  }, [images, currentSelectedImage]);
  
  const isBatch = targetImages.length > 1;

  // 菜单切换函数
  const onMoreMenuToggle = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  // 监听点击外部事件
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
        setShowShareSubmenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(isBatch ? 'Report batch clicked' : 'Report single clicked');
    onMoreMenuToggle();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
    onMoreMenuToggle();
  };

  const handleConfirmDelete = async () => {
    if (targetImages.length === 0) return;
    
    try {
      const { ImageService } = await import('../../services/imageService');
      const imageIds = targetImages.map(img => img.id);
      
      // 并行删除所有图片
      const deletePromises = imageIds.map(async (imageId) => {
        try {
          const success = await ImageService.deleteImage(imageId);
          return { imageId, success };
        } catch (error) {
          console.error(`Delete image ${imageId} error:`, error);
          return { imageId, success: false };
        }
      });
      
      const results = await Promise.all(deletePromises);
      const successIds = results.filter(r => r.success).map(r => r.imageId);
      const failedIds = results.filter(r => !r.success).map(r => r.imageId);
      
      // 内部处理删除结果
      if (successIds.length > 0) {
        console.log(`Successfully deleted ${successIds.length} images`);
        // 通知父组件更新图片列表
        onImagesDeleted?.(successIds);
      }
      
      if (failedIds.length > 0) {
        console.warn(`Failed to delete ${failedIds.length} images:`, failedIds);
        // 这里可以添加错误提示UI，目前只记录日志
      }
      
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete error:', error);
      // 这里可以添加错误提示UI，目前只记录日志
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleShareAreaMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setShowShareSubmenu(true);
  };

  const handleShareAreaMouseLeave = () => {
    // 整个Share区域（包括按钮和子菜单）离开时才隐藏
    const timeout = setTimeout(() => {
      setShowShareSubmenu(false);
    }, 100);
    setHideTimeout(timeout);
  };

  const handleShareToX = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Share to X clicked');
    setShowShareSubmenu(false);
    onMoreMenuToggle(); // This will close the main menu
    // TODO: Add X share functionality
  };

  const handleShareToFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Share to Facebook clicked');
    setShowShareSubmenu(false);
    onMoreMenuToggle(); // This will close the main menu
    // TODO: Add Facebook share functionality
  };

  return (
    <div className="relative more-menu-container" ref={menuRef}>
      {/* More Options Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          console.log(`More menu toggle clicked (${isBatch ? 'batch' : 'single'}), showMoreMenu:`, showMoreMenu);
          onMoreMenuToggle();
        }}
        className={`bg-[#19191F] hover:bg-[#2D2D35] rounded-lg transition-all duration-200 flex items-center justify-center ${isAbsolute ? 'absolute right-0 top-0' : ''}`}
        style={{ width: '48px', height: '48px' }}
      >
        <div className="w-6 h-6 relative overflow-hidden">
          <div 
            className="w-1 h-1 absolute rounded-full" 
            style={{ 
              left: '10px', 
              top: '10px',
              backgroundColor: showMoreMenu ? colors.special.highlight : '#ECECEC'
            }} 
          />
          <div 
            className="w-1 h-1 absolute rounded-full" 
            style={{ 
              left: '18px', 
              top: '10px',
              backgroundColor: showMoreMenu ? colors.special.highlight : '#ECECEC'
            }} 
          />
          <div 
            className="w-1 h-1 absolute rounded-full" 
            style={{ 
              left: '2px', 
              top: '10px',
              backgroundColor: showMoreMenu ? colors.special.highlight : '#ECECEC'
            }} 
          />
        </div>
      </button>
      
      {/* 下拉菜单 */}
      {showMoreMenu && (
        <div className="absolute top-full mt-2 right-0 bg-[#26262D] border border-[#393B42] rounded-lg shadow-lg px-3 py-1 w-[136px] z-50">
      <div className="flex flex-col gap-[8px]">
        {/* Report */}
        <button
          onClick={handleReportClick}
          className="flex items-end gap-1 group py-2 px-1 -mx-1 rounded hover:bg-[#2D2D35] transition-colors text-[#98FF59]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
            <g clipPath="url(#clip0_1721_4622)">
              <path 
                d="M6.95162 3.08382C7.5273 2.06841 8.46881 2.06841 9.0444 3.08382L13.7505 11.3885C14.3255 12.405 13.8547 13.2342 12.7046 13.2342H3.29147C2.14133 13.2342 1.67005 12.405 2.24557 11.3885L6.95162 3.08382ZM7.99948 10.1405C7.79688 10.1405 7.62887 10.2074 7.49557 10.3407C7.36237 10.474 7.29537 10.6445 7.29537 10.8524C7.29539 11.055 7.36228 11.223 7.49557 11.3563C7.62887 11.4896 7.79688 11.5564 7.99948 11.5565C8.20209 11.5565 8.37007 11.4895 8.50338 11.3563C8.6367 11.223 8.70357 11.055 8.70358 10.8524C8.70358 10.6444 8.63669 10.474 8.50338 10.3407C8.37005 10.2073 8.20214 10.1405 7.99948 10.1405ZM7.33541 5.49983L7.37545 6.69222L7.59127 9.42854H8.40768L8.6235 6.69222L8.66354 5.49983H7.33541Z" 
                fill="#ECECEC" 
                className="group-hover:fill-[#98FF59]"
              />
            </g>
            <defs>
              <clipPath id="clip0_1721_4622">
                <rect width="12" height="12" fill="white" transform="translate(2 2)"/>
              </clipPath>
            </defs>
          </svg>
          <span 
            className="text-[#ECECEC] text-xs font-normal group-hover:text-[#98FF59]"
          >
            Report
          </span>
        </button>
        
        {/* Share */}
        <div 
          className="relative"
          onMouseEnter={handleShareAreaMouseEnter}
          onMouseLeave={handleShareAreaMouseLeave}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="flex items-center gap-1 group py-2 px-1 -mx-1 rounded hover:bg-[#2D2D35] transition-colors w-[118px]"
          >
            <div className="flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                <path fillRule="evenodd" clipRule="evenodd" d="M10.7588 2C11.624 2 12.3253 2.70135 12.3253 3.5665C12.3253 3.92632 12.2032 4.26856 11.983 4.54402C11.6878 4.91328 11.241 5.13301 10.7588 5.13301C10.4137 5.13301 10.0869 5.0204 9.82085 4.82133L5.77386 8.18177C5.88249 8.39714 5.94111 8.63754 5.94111 8.8867C5.94111 8.98904 5.93124 9.09012 5.91193 9.18881L10.306 11.383C10.5971 11.061 11.0154 10.867 11.4682 10.867C12.1256 10.867 12.7061 11.2757 12.9343 11.8808C13.0004 12.0562 13.0347 12.2428 13.0347 12.4335C13.0347 13.2987 12.3334 14 11.4682 14C10.603 14 9.9017 13.2987 9.9017 12.4335C9.9017 12.3278 9.91224 12.2234 9.93282 12.1217L5.54347 9.92985C5.25221 10.2562 4.83098 10.4532 4.37461 10.4532C3.50945 10.4532 2.80811 9.75186 2.80811 8.8867C2.80811 8.02154 3.50945 7.3202 4.37461 7.3202C4.67954 7.3202 4.97085 7.40804 5.21886 7.56693L9.3121 4.16807C9.23383 3.97994 9.19234 3.77617 9.19234 3.5665C9.19234 2.70135 9.89369 2 10.7588 2ZM10.4933 4.25635C10.4491 4.23935 10.4067 4.21814 10.3667 4.19304L10.4933 4.25635Z" fill="#ECECEC" className="group-hover:fill-[#98FF59]"/>
              </svg>
              <span className="text-[#ECECEC] text-xs font-normal group-hover:text-[#98FF59]">Share</span>
            </div>
            <svg width="5" height="6" viewBox="0 0 5 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-auto">
              <path d="M5 3L0.5 5.59808L0.5 0.401924L5 3Z" fill="#ECECEC" className="group-hover:fill-[#98FF59]"/>
            </svg>
          </button>
          
          {/* Share Submenu */}
          {showShareSubmenu && (
            <>
              {/* Invisible bridge to prevent submenu from disappearing */}
              <div className="absolute left-full top-0 w-2 h-full z-50"></div>
              <div 
                className="absolute left-full top-0 ml-2 bg-[#26262D] border border-[#393B42] rounded-lg shadow-lg px-3 py-1 w-[160px] z-60"
              >
                <div className="flex flex-col gap-[8px]">
                  {/* Share to X */}
                  <button
                    onClick={handleShareToX}
                    className="flex items-start gap-1 group py-2 px-1 -mx-1 rounded hover:bg-[#2D2D35] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                      <path d="M9.52 6.77L15.48 0H14.06L8.88 5.88L4.76 0H0L6.24 8.96L0 16H1.42L6.88 9.78L11.24 16H16L9.52 6.77ZM7.6 8.97L6.98 8.09L1.92 1.03H4.08L8.16 6.72L8.78 7.6L14.06 15.01H11.9L7.6 8.97Z" fill="#ECECEC" className="group-hover:fill-[#98FF59]"/>
                    </svg>
                    <span className="text-[#ECECEC] text-xs font-normal whitespace-nowrap group-hover:text-[#98FF59]">Share to X</span>
                  </button>
                  
                  {/* Share to Facebook */}
                  <button
                    onClick={handleShareToFacebook}
                    className="flex items-end gap-1 group py-2 px-1 -mx-1 rounded hover:bg-[#2D2D35] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                      <path d="M16 8C16 3.58 12.42 0 8 0S0 3.58 0 8C0 11.97 2.84 15.23 6.56 15.91V10.31H4.59V8H6.56V6.23C6.56 4.29 7.73 3.2 9.48 3.2C10.32 3.2 11.2 3.36 11.2 3.36V5.25H10.24C9.3 5.25 8.94 5.81 8.94 6.39V8H11.12L10.72 10.31H8.94V15.91C12.66 15.23 16 11.97 16 8Z" fill="#ECECEC" className="group-hover:fill-[#98FF59]"/>
                    </svg>
                    <span className="text-[#ECECEC] text-xs font-normal whitespace-nowrap group-hover:text-[#98FF59]">Share to Facebook</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Divider */}
        <div className="w-[112px] h-0 border-t border-[#393B42]"></div>
        
        {/* Delete */}
        <button
          onClick={handleDeleteClick}
          className="flex items-end gap-1 group py-2 px-1 -mx-1 rounded hover:bg-[#2D2D35] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
            <g clipPath="url(#clip0_1721_4637)">
              <path d="M9.39941 2.14545C9.53623 2.14545 9.6636 2.21683 9.73438 2.33392L10.5645 3.70892H13.4707C13.6865 3.70898 13.8613 3.88376 13.8613 4.09955C13.8612 4.31527 13.6864 4.49012 13.4707 4.49017H12.5117V11.915C12.5117 12.7783 11.8115 13.4784 10.9482 13.4785H5.0459C4.18274 13.4783 3.48242 12.7782 3.48242 11.915V4.49017H2.52832C2.31262 4.49008 2.13778 4.31525 2.1377 4.09955C2.1377 3.88378 2.31257 3.70901 2.52832 3.70892H5.43652L6.28613 2.33099C6.35731 2.21565 6.4836 2.14545 6.61914 2.14545H9.39941ZM6.90332 6.50189C6.67699 6.50211 6.49339 6.68571 6.49316 6.91205V10.4697C6.49336 10.696 6.67697 10.8796 6.90332 10.8798C7.12986 10.8798 7.31328 10.6962 7.31348 10.4697V6.91205C7.31325 6.68558 7.12984 6.50189 6.90332 6.50189ZM9.08887 6.50189C8.86268 6.50229 8.67893 6.68582 8.67871 6.91205V10.4697C8.6789 10.6959 8.86266 10.8794 9.08887 10.8798C9.31541 10.8798 9.49981 10.6962 9.5 10.4697V6.91205C9.49978 6.68558 9.31539 6.50189 9.08887 6.50189Z" fill="#ECECEC" className="group-hover:fill-[#98FF59]"/>
            </g>
            <defs>
              <clipPath id="clip0_1721_4637">
                <rect width="12" height="12" fill="white" transform="translate(2 2)"/>
              </clipPath>
            </defs>
          </svg>
          <span className="text-[#ECECEC] text-xs font-normal group-hover:text-[#98FF59]">Delete</span>
        </button>
      </div>
    </div>
      )}
      
      {/* 删除确认对话框 */}
      <DeleteImageConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={false}
      />
    </div>
  );
};

export default MoreMenu;