import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import GeneratePage from './pages/GeneratePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoriesDetailPage from './pages/CategoriesDetailPage';
import ImageDetailPage from './pages/ImageDetailPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import CreationsPage from './pages/CreationsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import TattooPreviewPage from './pages/TattooPreviewPage';
import ScrollToTop from './components/common/ScrollToTop';
import TopLoadingBar from './components/ui/TopLoadingBar';
import Toast from './components/ui/Toast';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LanguageSyncProvider } from './components/common/LanguageSyncProvider';
import { AuthProvider } from './contexts/AuthContext';
import { UploadImageProvider } from './contexts/UploadImageContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { LoadingProvider } from './contexts/LoadingContext';

// 应用内容组件，处理语言加载状态
function AppContent() {
  const { language } = useLanguage();
  const { toast, hideToast } = useToast();

  // 动态更新HTML lang属性，帮助Google按钮自动选择正确语言
  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <Router>
      <TopLoadingBar />
      <LanguageSyncProvider>
        <ScrollToTop />
        <Routes>
        {/* 英文路由（默认路径，无语言前缀） */}
        <Route path="/" element={<HomePage />} />
        <Route path="/price" element={<PricingPage />} />
        <Route path="/create" element={<GeneratePage />} />
        <Route path="/text-coloring-page" element={<GeneratePage />} />
        <Route path="/image-coloring-page" element={<GeneratePage/>} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/creations" element={<CreationsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/preview" element={<TattooPreviewPage />} />

        {/* 中文路由（/zh 前缀） */}
        <Route path="/zh" element={<HomePage />} />
        <Route path="/zh/price" element={<PricingPage />} />
        <Route path="/zh/create" element={<GeneratePage />} />
        <Route path="/zh/text-coloring-page" element={<GeneratePage />} />
        <Route path="/zh/image-coloring-page" element={<GeneratePage/>} />
        <Route path="/zh/categories" element={<CategoriesPage />} />
        <Route path="/zh/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/zh/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/zh/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/zh/register" element={<RegisterPage />} />
        <Route path="/zh/login" element={<LoginPage />} />
        <Route path="/zh/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/zh/reset-password" element={<ResetPasswordPage />} />
        <Route path="/zh/profile" element={<ProfilePage />} />
        <Route path="/zh/creations" element={<CreationsPage />} />
        <Route path="/zh/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/zh/terms" element={<TermsPage />} />
        <Route path="/zh/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/zh/blog" element={<BlogPage />} />
        <Route path="/zh/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/zh/preview" element={<TattooPreviewPage />} />
      </Routes>
      </LanguageSyncProvider>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </Router>
  );
}

// 主App组件
function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <LoadingProvider>
          <AuthProvider>
            <UploadImageProvider>
              <CategoriesProvider>
                <AppContent />
              </CategoriesProvider>
            </UploadImageProvider>
          </AuthProvider>
        </LoadingProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App; 