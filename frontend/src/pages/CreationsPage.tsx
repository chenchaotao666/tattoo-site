import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ImageGrid from '../components/iamges/ImageGrid';
import { getDisplayImages } from '../utils/imageUtils';
import CreationDetail from '../components/creations/CreationDetail';
import { useAuth } from '../contexts/AuthContext';
import { ImageService, BaseImage } from '../services/imageService';
import DeleteImageConfirmDialog from '../components/ui/DeleteImageConfirmDialog';
import BackToTop from '../components/common/BackToTop';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import TryNow from '../components/common/TryNow';
import { createLanguageAwarePath, navigateWithLanguage } from '../utils/navigationUtils';


interface CreationsPageProps {}

const CreationsPage: React.FC<CreationsPageProps> = () => {
  const { t } = useAsyncTranslation('creations');
  const { t: tCommon } = useAsyncTranslation('common');
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // 状态管理
  const [images, setImages] = useState<BaseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [selectedImage, setSelectedImage] = useState<BaseImage | null>(null);

  // 存储所有图片数据的缓存
  const [allImages, setAllImages] = useState<BaseImage[]>([]);
  
  // 存储用户生成的全量图片数据（未过滤批次）
  const [fullImages, setFullImages] = useState<BaseImage[]>([]);

  // 检查用户登录状态并加载数据
  useEffect(() => {
    // 等待认证初始化完成
    if (authLoading) {
      return;
    }
    
    // 如果认证完成但用户未登录，跳转到登录页面
    if (!isAuthenticated) {
      navigateWithLanguage(navigate, '/login');
      return;
    }
    
    // 如果用户已登录，加载用户图片
    loadUserImages();
  }, [authLoading, isAuthenticated]);

  // 加载用户图片 - 一次性加载所有数据
  const loadUserImages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      const searchParams = {
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const
      };

      // 使用新的专用用户图片接口
      const result = await ImageService.getUserOwnImages(searchParams);
      
      // 保存全量图片数据（未过滤）
      setFullImages(result.images);
      
      // 过滤批次图片：每个批次只保留第一张图片用于历史显示
      const filteredImages = getDisplayImages(result.images);
      
      // 保存所有图片到缓存（包含批次处理后的）
      setAllImages(filteredImages);
      
      setImages(filteredImages);
    } catch (err) {
      console.error('Failed to load user images:', err);
      setError(t('messages.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 删除图片
  const handleDelete = async (imageId: string) => {
    try {
      const success = await ImageService.deleteImage(imageId);
      if (success) {
        // 同时更新缓存和显示的图片
        const newAllImages = allImages.filter(img => img.id !== imageId);
        setAllImages(newAllImages);
        setImages(images.filter(img => img.id !== imageId));
        
        setShowDeleteConfirm(null);
      } else {
        setError(t('messages.deleteFailed'));
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setError(t('messages.deleteFailed'));
    }
  };

  // 举报图片
  const handleReport = async (imageId: string) => {
    if (!reportContent.trim()) {
      setError(t('messages.reportContentRequired'));
      return;
    }

    try {
      setSubmittingReport(true);
      const success = await ImageService.reportImage({
        imageId,
        content: reportContent
      });
      
      if (success) {
        setShowReportDialog(null);
        setReportContent('');
        setError(null);
        // 可以显示成功提示
      } else {
        setError(t('messages.reportFailed'));
      }
    } catch (error) {
      console.error('Report failed:', error);
      setError(t('messages.reportFailed'));
    } finally {
      setSubmittingReport(false);
    }
  };

  // 处理图片点击
  const handleImageClick = (image: BaseImage) => {
    setSelectedImage(image);
  };

  // 关闭详情页面
  const handleCloseDetail = () => {
    setSelectedImage(null);
  };

  // 获取当前图片的索引
  const getCurrentImageIndex = () => {
    if (!selectedImage) return -1;
    return images.findIndex(img => img.id === selectedImage.id);
  };

  // 切换到上一张图片
  const handlePreviousImage = () => {
    const currentIndex = getCurrentImageIndex();
    if (currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    }
  };

  // 切换到下一张图片
  const handleNextImage = () => {
    const currentIndex = getCurrentImageIndex();
    if (currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1]);
    }
  };

  // 选择批次中的特定图片
  const handleImageSelect = (image: BaseImage) => {
    setSelectedImage(image);
  };

  // 处理图片批量删除 - 从MoreMenu组件触发
  const handleImagesDeleted = (deletedIds: string[]) => {
    // 更新所有图片缓存
    const newAllImages = allImages.filter(img => !deletedIds.includes(img.id));
    setAllImages(newAllImages);
    
    // 更新显示的图片列表
    const newImages = images.filter(img => !deletedIds.includes(img.id));
    setImages(newImages);
    
    // 同时更新全量图片数据
    const newFullImages = fullImages.filter(img => !deletedIds.includes(img.id));
    setFullImages(newFullImages);
    
    console.log(`Successfully updated UI after deleting ${deletedIds.length} images`);
  };


  return (
    <Layout>
      <SEOHead
        title={tCommon('seo.creations.title')}
        description={tCommon('seo.creations.description')}
        keywords={tCommon('seo.creations.keywords')}
        ogTitle={tCommon('seo.creations.title')}
        ogDescription={tCommon('seo.creations.description')}
        canonicalUrl={`${window.location.origin}/creations`}
      />
      <div className="min-h-screen bg-[#030414]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* 页面标题 */}
          <div className="mb-8">
            <div className="mx-auto" style={{ width: '1184px' }}>
              <h1 style={{ color: '#ECECEC', fontSize: '20px', fontFamily: 'Inter', fontWeight: 700, wordWrap: 'break-word', textAlign: 'left' }}>
                {t('title')}
              </h1>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 内容区域 */}
          {loading ? null : (
            <div className="mb-8 lg:mb-20">
              <ImageGrid
                images={images}
                isLoading={false}
                noDataTitle={t('emptyState.title')}
                showPrompt={false}
                onImageClick={handleImageClick}
              />
            </div>
          )}
        </div>
      </div>

      <div className="pt-20">
        {/* TryNow component */}
        <TryNow
          title={tCommon('tryNow.title')}
          description={tCommon('tryNow.description')}
          buttonText={tCommon('tryNow.tryNow')}
          buttonLink={createLanguageAwarePath("/create")}
        />
      </div>

      {/* 删除确认对话框 */}
      <DeleteImageConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
      />

      {/* 举报对话框 */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-[#030414] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dialogs.report.title')}</h3>
            <textarea
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              placeholder={t('dialogs.report.placeholder')}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {reportContent.length}/500
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReportDialog(null);
                  setReportContent('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('dialogs.report.cancel')}
              </button>
              <button
                onClick={() => showReportDialog && handleReport(showReportDialog)}
                disabled={!reportContent.trim() || submittingReport}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('dialogs.report.submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      <BackToTop />
      
      {/* 创作详情弹窗 */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={handleCloseDetail}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <CreationDetail 
              image={selectedImage} 
              allImages={images}
              fullImages={fullImages}
              onClose={handleCloseDetail}
              onNext={handleNextImage}
              onPrevious={handlePreviousImage}
              onImageSelect={handleImageSelect}
              onImagesDeleted={handleImagesDeleted}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CreationsPage; 