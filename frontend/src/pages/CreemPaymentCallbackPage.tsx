import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { PricingService } from '../services/pricingService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { navigateWithLanguage } from '../utils/navigationUtils';

const CreemPaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { showSuccessToast, showErrorToast } = useToast();
  const { t } = useAsyncTranslation('pricing');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cancelled'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        console.log('[PaymentCallback] Starting payment verification process');

        // 从 URL 参数获取支付状态
        const paymentStatus = searchParams.get('status');
        const sessionId = searchParams.get('session_id');
        const error = searchParams.get('error');

        console.log('[PaymentCallback] URL params:', { paymentStatus, sessionId, error });

        // 从 localStorage 获取待处理的支付信息
        const pendingPaymentStr = localStorage.getItem('pendingCreemPayment');
        if (!pendingPaymentStr) {
          console.warn('[PaymentCallback] No pending payment found in localStorage');
          throw new Error('未找到待处理的支付信息，请重新发起支付');
        }

        let pendingPayment;
        try {
          pendingPayment = JSON.parse(pendingPaymentStr);
          console.log('[PaymentCallback] Pending payment info:', pendingPayment);
        } catch (parseError) {
          console.error('[PaymentCallback] Failed to parse pending payment:', parseError);
          throw new Error('支付信息格式错误，请重新发起支付');
        }

        // 检查支付信息是否过期（超过30分钟）
        const now = Date.now();
        const paymentAge = now - (pendingPayment.timestamp || 0);
        const MAX_PAYMENT_AGE = 30 * 60 * 1000; // 30分钟

        if (paymentAge > MAX_PAYMENT_AGE) {
          console.warn('[PaymentCallback] Payment session expired:', paymentAge / 1000 / 60, 'minutes');
          localStorage.removeItem('pendingCreemPayment');
          throw new Error('支付会话已过期，请重新发起支付');
        }

        // 检查支付是否被取消
        if (paymentStatus === 'cancelled' || error === 'cancelled') {
          console.log('[PaymentCallback] Payment was cancelled by user');
          setStatus('cancelled');
          setMessage(t('payment.cancelled') || '支付已取消');
          localStorage.removeItem('pendingCreemPayment');
          return;
        }

        // 检查是否有其他错误
        if (error && error !== 'cancelled') {
          console.error('[PaymentCallback] Payment error from URL:', error);
          throw new Error(`支付过程中发生错误：${error}`);
        }

        // 验证 sessionId 是否匹配
        const targetSessionId = sessionId || pendingPayment.sessionId;
        if (!targetSessionId) {
          console.error('[PaymentCallback] No session ID available');
          throw new Error('缺少支付会话ID');
        }

        if (sessionId && sessionId !== pendingPayment.sessionId) {
          console.error('[PaymentCallback] Session ID mismatch:', {
            urlSessionId: sessionId,
            storedSessionId: pendingPayment.sessionId
          });
          throw new Error('支付会话ID不匹配，请重新发起支付');
        }

        console.log('[PaymentCallback] Verifying payment with sessionId:', targetSessionId);

        // 验证 Creem 支付状态
        const verifyResponse = await PricingService.verifyCreemPayment(targetSessionId);
        console.log('[PaymentCallback] Verification response:', verifyResponse);

        if (verifyResponse.status === 'COMPLETED') {
          // 支付成功
          console.log('[PaymentCallback] Payment completed successfully');

          await refreshUser();
          setStatus('success');
          setMessage(t('payment.success.message', undefined, { credits: pendingPayment.credits }) ||
                    `支付成功！您已获得 ${pendingPayment.credits} 积分`);

          showSuccessToast(t('payment.success.message', undefined, { credits: pendingPayment.credits }) ||
                          `支付成功！您已获得 ${pendingPayment.credits} 积分`);

          // 清理 localStorage
          localStorage.removeItem('pendingCreemPayment');

          // 3秒后跳转到创作页面
          setTimeout(() => {
            navigateWithLanguage(navigate, '/text-coloring-page');
          }, 3000);

        } else if (verifyResponse.status === 'PENDING') {
          // 支付处理中，继续等待
          console.log('[PaymentCallback] Payment is still pending, will retry...');
          setMessage(t('payment.processing') || '支付处理中，请稍候...');

          // 5秒后重新检查
          setTimeout(() => {
            window.location.reload();
          }, 5000);

        } else {
          // 支付失败
          console.error('[PaymentCallback] Payment verification failed:', verifyResponse);
          throw new Error(verifyResponse.message || '支付验证失败');
        }

      } catch (error: any) {
        console.error('[PaymentCallback] Error during payment verification:', error);
        setStatus('error');

        let errorMessage = '支付验证失败';
        if (error.code) {
          switch (error.code) {
            case '1025':
              errorMessage = t('payment.errors.verificationFailed') || '验证支付状态失败';
              break;
            case 'NETWORK_ERROR':
              errorMessage = t('payment.errors.networkError') || '网络连接失败，请检查网络';
              break;
            default:
              errorMessage = error.message || errorMessage;
          }
        } else {
          errorMessage = error.message || t('payment.errors.verificationFailed') || errorMessage;
        }

        setMessage(errorMessage);
        showErrorToast(errorMessage);

        // 清理 localStorage
        localStorage.removeItem('pendingCreemPayment');
      }
    };

    handlePaymentCallback();
  }, [searchParams, refreshUser]);

  const handleReturnToPricing = () => {
    navigateWithLanguage(navigate, '/pricing');
  };

  const handleGoToCreations = () => {
    navigateWithLanguage(navigate, '/text-coloring-page');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#030414] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#131317] rounded-2xl border border-[#26262D] p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 border-4 border-[#98FF59] border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-xl font-semibold text-white mb-4">
                {t('payment.verifying') || '验证支付状态...'}
              </h2>
              <p className="text-[#C8C8C8]">
                {message || (t('payment.pleaseWait') || '请稍候，我们正在验证您的支付...')}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-4">
                {t('payment.success.title') || '支付成功！'}
              </h2>
              <p className="text-[#C8C8C8] mb-6">{message}</p>
              <button
                onClick={handleGoToCreations}
                className="w-full bg-[#98FF59] text-black py-3 rounded-lg font-medium hover:bg-[#7DE147] transition-colors"
              >
                {t('payment.success.startCreating') || '开始创作'}
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-4">
                {t('payment.error.title') || '支付失败'}
              </h2>
              <p className="text-[#C8C8C8] mb-6">{message}</p>
              <button
                onClick={handleReturnToPricing}
                className="w-full bg-[#98FF59] text-black py-3 rounded-lg font-medium hover:bg-[#7DE147] transition-colors"
              >
                {t('payment.error.tryAgain') || '返回重试'}
              </button>
            </>
          )}

          {status === 'cancelled' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-4">
                {t('payment.cancelled.title') || '支付已取消'}
              </h2>
              <p className="text-[#C8C8C8] mb-6">{message}</p>
              <button
                onClick={handleReturnToPricing}
                className="w-full bg-[#98FF59] text-black py-3 rounded-lg font-medium hover:bg-[#7DE147] transition-colors"
              >
                {t('payment.cancelled.returnToPricing') || '返回选择套餐'}
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CreemPaymentCallbackPage;