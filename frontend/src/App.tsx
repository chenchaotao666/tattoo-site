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
import CreemPaymentCallbackPage from './pages/CreemPaymentCallbackPage';
import ScrollToTop from './components/common/ScrollToTop';
import TopLoadingBar from './components/ui/TopLoadingBar';
import Toast from './components/ui/Toast';
import LoginModal from './components/auth/LoginModal';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LoginModalProvider, useLoginModal } from './contexts/LoginModalContext';
import { LanguageSyncProvider } from './components/common/LanguageSyncProvider';
import { AuthProvider } from './contexts/AuthContext';
import { UploadImageProvider } from './contexts/UploadImageContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { LoadingProvider } from './contexts/LoadingContext';

// 应用内容组件，处理语言加载状态
function AppContent() {
  const { language } = useLanguage();
  const { toast, hideToast } = useToast();
  const { isLoginModalOpen, modalView, resetToken, closeLoginModal } = useLoginModal();

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
        <Route path="/payment/creem/callback" element={<CreemPaymentCallbackPage />} />

        {/* 中文路由（/zh 前缀） */}
        <Route path="/zh" element={<HomePage />} />
        <Route path="/zh/price" element={<PricingPage />} />
        <Route path="/zh/create" element={<GeneratePage />} />
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
        <Route path="/zh/payment/creem/callback" element={<CreemPaymentCallbackPage />} />

        {/* 日语路由（/ja 前缀） */}
        <Route path="/ja" element={<HomePage />} />
        <Route path="/ja/price" element={<PricingPage />} />
        <Route path="/ja/create" element={<GeneratePage />} />
        <Route path="/ja/categories" element={<CategoriesPage />} />
        <Route path="/ja/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/ja/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/ja/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/ja/register" element={<RegisterPage />} />
        <Route path="/ja/login" element={<LoginPage />} />
        <Route path="/ja/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/ja/reset-password" element={<ResetPasswordPage />} />
        <Route path="/ja/profile" element={<ProfilePage />} />
        <Route path="/ja/creations" element={<CreationsPage />} />
        <Route path="/ja/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/ja/terms" element={<TermsPage />} />
        <Route path="/ja/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/ja/blog" element={<BlogPage />} />
        <Route path="/ja/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/ja/preview" element={<TattooPreviewPage />} />
        <Route path="/ja/payment/creem/callback" element={<CreemPaymentCallbackPage />} />

        {/* 韩语路由（/ko 前缀） */}
        <Route path="/ko" element={<HomePage />} />
        <Route path="/ko/price" element={<PricingPage />} />
        <Route path="/ko/create" element={<GeneratePage />} />
        <Route path="/ko/categories" element={<CategoriesPage />} />
        <Route path="/ko/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/ko/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/ko/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/ko/register" element={<RegisterPage />} />
        <Route path="/ko/login" element={<LoginPage />} />
        <Route path="/ko/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/ko/reset-password" element={<ResetPasswordPage />} />
        <Route path="/ko/profile" element={<ProfilePage />} />
        <Route path="/ko/creations" element={<CreationsPage />} />
        <Route path="/ko/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/ko/terms" element={<TermsPage />} />
        <Route path="/ko/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/ko/blog" element={<BlogPage />} />
        <Route path="/ko/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/ko/preview" element={<TattooPreviewPage />} />
        <Route path="/ko/payment/creem/callback" element={<CreemPaymentCallbackPage />} />

        {/* 繁体中文路由（/tw 前缀） */}
        <Route path="/tw" element={<HomePage />} />
        <Route path="/tw/price" element={<PricingPage />} />
        <Route path="/tw/create" element={<GeneratePage />} />
        <Route path="/tw/categories" element={<CategoriesPage />} />
        <Route path="/tw/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/tw/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/tw/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/tw/register" element={<RegisterPage />} />
        <Route path="/tw/login" element={<LoginPage />} />
        <Route path="/tw/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/tw/reset-password" element={<ResetPasswordPage />} />
        <Route path="/tw/profile" element={<ProfilePage />} />
        <Route path="/tw/creations" element={<CreationsPage />} />
        <Route path="/tw/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/tw/terms" element={<TermsPage />} />
        <Route path="/tw/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/tw/blog" element={<BlogPage />} />
        <Route path="/tw/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/tw/preview" element={<TattooPreviewPage />} />
        <Route path="/tw/payment/creem/callback" element={<CreemPaymentCallbackPage />} />

        {/* 西班牙语路由（/es 前缀） */}
        <Route path="/es" element={<HomePage />} />
        <Route path="/es/price" element={<PricingPage />} />
        <Route path="/es/create" element={<GeneratePage />} />
        <Route path="/es/categories" element={<CategoriesPage />} />
        <Route path="/es/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/es/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/es/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/es/register" element={<RegisterPage />} />
        <Route path="/es/login" element={<LoginPage />} />
        <Route path="/es/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/es/reset-password" element={<ResetPasswordPage />} />
        <Route path="/es/profile" element={<ProfilePage />} />
        <Route path="/es/creations" element={<CreationsPage />} />
        <Route path="/es/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/es/terms" element={<TermsPage />} />
        <Route path="/es/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/es/blog" element={<BlogPage />} />
        <Route path="/es/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/es/preview" element={<TattooPreviewPage />} />
        <Route path="/es/payment/creem/callback" element={<CreemPaymentCallbackPage />} />

        {/* 法语路由（/fr 前缀） */}
        <Route path="/fr" element={<HomePage />} />
        <Route path="/fr/price" element={<PricingPage />} />
        <Route path="/fr/create" element={<GeneratePage />} />
        <Route path="/fr/categories" element={<CategoriesPage />} />
        <Route path="/fr/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/fr/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/fr/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/fr/register" element={<RegisterPage />} />
        <Route path="/fr/login" element={<LoginPage />} />
        <Route path="/fr/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/fr/reset-password" element={<ResetPasswordPage />} />
        <Route path="/fr/profile" element={<ProfilePage />} />
        <Route path="/fr/creations" element={<CreationsPage />} />
        <Route path="/fr/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/fr/terms" element={<TermsPage />} />
        <Route path="/fr/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/fr/blog" element={<BlogPage />} />
        <Route path="/fr/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/fr/preview" element={<TattooPreviewPage />} />
        <Route path="/fr/payment/creem/callback" element={<CreemPaymentCallbackPage />} />

        {/* 德语路由（/de 前缀） */}
        <Route path="/de" element={<HomePage />} />
        <Route path="/de/price" element={<PricingPage />} />
        <Route path="/de/create" element={<GeneratePage />} />
        <Route path="/de/categories" element={<CategoriesPage />} />
        <Route path="/de/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/de/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/de/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/de/register" element={<RegisterPage />} />
        <Route path="/de/login" element={<LoginPage />} />
        <Route path="/de/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/de/reset-password" element={<ResetPasswordPage />} />
        <Route path="/de/profile" element={<ProfilePage />} />
        <Route path="/de/creations" element={<CreationsPage />} />
        <Route path="/de/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/de/terms" element={<TermsPage />} />
        <Route path="/de/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/de/blog" element={<BlogPage />} />
        <Route path="/de/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/de/preview" element={<TattooPreviewPage />} />
        <Route path="/de/payment/creem/callback" element={<CreemPaymentCallbackPage />} />

        {/* 意大利语路由（/it 前缀） */}
        <Route path="/it" element={<HomePage />} />
        <Route path="/it/price" element={<PricingPage />} />
        <Route path="/it/create" element={<GeneratePage />} />
        <Route path="/it/categories" element={<CategoriesPage />} />
        <Route path="/it/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/it/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/it/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/it/register" element={<RegisterPage />} />
        <Route path="/it/login" element={<LoginPage />} />
        <Route path="/it/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/it/reset-password" element={<ResetPasswordPage />} />
        <Route path="/it/profile" element={<ProfilePage />} />
        <Route path="/it/creations" element={<CreationsPage />} />
        <Route path="/it/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/it/terms" element={<TermsPage />} />
        <Route path="/it/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/it/blog" element={<BlogPage />} />
        <Route path="/it/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/it/preview" element={<TattooPreviewPage />} />
        <Route path="/it/payment/creem/callback" element={<CreemPaymentCallbackPage />} />

        {/* 葡萄牙语路由（/pt 前缀） */}
        <Route path="/pt" element={<HomePage />} />
        <Route path="/pt/price" element={<PricingPage />} />
        <Route path="/pt/create" element={<GeneratePage />} />
        <Route path="/pt/categories" element={<CategoriesPage />} />
        <Route path="/pt/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/pt/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/pt/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/pt/register" element={<RegisterPage />} />
        <Route path="/pt/login" element={<LoginPage />} />
        <Route path="/pt/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/pt/reset-password" element={<ResetPasswordPage />} />
        <Route path="/pt/profile" element={<ProfilePage />} />
        <Route path="/pt/creations" element={<CreationsPage />} />
        <Route path="/pt/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/pt/terms" element={<TermsPage />} />
        <Route path="/pt/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/pt/blog" element={<BlogPage />} />
        <Route path="/pt/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/pt/preview" element={<TattooPreviewPage />} />
        <Route path="/pt/payment/creem/callback" element={<CreemPaymentCallbackPage />} />

        {/* 俄语路由（/ru 前缀） */}
        <Route path="/ru" element={<HomePage />} />
        <Route path="/ru/price" element={<PricingPage />} />
        <Route path="/ru/create" element={<GeneratePage />} />
        <Route path="/ru/categories" element={<CategoriesPage />} />
        <Route path="/ru/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/ru/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/ru/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/ru/register" element={<RegisterPage />} />
        <Route path="/ru/login" element={<LoginPage />} />
        <Route path="/ru/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/ru/reset-password" element={<ResetPasswordPage />} />
        <Route path="/ru/profile" element={<ProfilePage />} />
        <Route path="/ru/creations" element={<CreationsPage />} />
        <Route path="/ru/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/ru/terms" element={<TermsPage />} />
        <Route path="/ru/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/ru/blog" element={<BlogPage />} />
        <Route path="/ru/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/ru/preview" element={<TattooPreviewPage />} />
        <Route path="/ru/payment/creem/callback" element={<CreemPaymentCallbackPage />} />
      </Routes>
      </LanguageSyncProvider>

      {/* 全局登录模态框 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSuccess={closeLoginModal}
        initialView={modalView}
        resetToken={resetToken}
      />

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
        <LoginModalProvider>
          <LoadingProvider>
            <AuthProvider>
              <UploadImageProvider>
                <CategoriesProvider>
                  <AppContent />
                </CategoriesProvider>
              </UploadImageProvider>
            </AuthProvider>
          </LoadingProvider>
        </LoginModalProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App; 