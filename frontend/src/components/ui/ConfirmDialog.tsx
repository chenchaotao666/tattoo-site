import React from 'react';
import BaseButton from './BaseButton';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'danger' | 'primary';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmText,
  cancelText,
}) => {
  const { t } = useAsyncTranslation('components');

  // Use default values from translations if not provided
  const finalMessage = message || t('dialog.confirmDelete');
  const finalConfirmText = confirmText || t('dialog.delete');
  const finalCancelText = cancelText || t('dialog.cancel');
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-[#030414] opacity-70"></div>
      
      {/* 对话框 */}
      <div className="relative bg-[#19191F] rounded-2xl border border-[#393B42] w-[490px] h-[190px] flex flex-col">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-4 h-4 flex items-center justify-center hover:opacity-70 transition-opacity"
        >
          <img src="/imgs/close-x.svg" alt={t('dialog.close')} className="w-4 h-4 filter brightness-0 invert" />
        </button>

        {/* 内容区域 */}
        <div className="absolute left-[30px] top-[30px]">
          {/* 警告图标 */}
          <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
            <img src="/imgs/notice.svg" alt={t('dialog.notice')} className="w-6 h-6" />
          </div>
        </div>
        
        {/* 消息文本 */}
        <div className="absolute left-[62px] top-[32px] text-[#ECECEC] text-base font-medium">
          {finalMessage}
        </div>

        {/* 取消按钮 */}
        <div className="absolute left-[208px] top-[112px]">
          <BaseButton
            onClick={onClose}
            variant="secondary"
            width="w-[120px]"
            height="h-[48px]"
            fontSize="text-lg"
          >
            {finalCancelText}
          </BaseButton>
        </div>
        
        {/* 确认按钮 */}
        <div className="absolute left-[340px] top-[112px]">
          <BaseButton
            onClick={handleConfirm}
            variant="primary"
            width="w-[120px]"
            height="h-[48px]"
            fontSize="text-lg"
          >
            {finalConfirmText}
          </BaseButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 