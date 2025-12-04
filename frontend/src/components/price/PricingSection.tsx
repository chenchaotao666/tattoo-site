import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import GenerateFAQ, { FAQData } from '../common/GenerateFAQ';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncTranslation } from '../../contexts/LanguageContext';
import { PricingService } from '../../services/pricingService';
import { useToast } from '../../contexts/ToastContext';
import PricingCard from './PricingCard';
import TryNow from '../common/TryNow';
import { createLanguageAwarePath, navigateWithLanguage } from '../../utils/navigationUtils';

interface PlanConfig {
  price: number;
  credits: number;
  code: string;
  days: number;
}

// 套餐配置 - 按天数购买积分
const planConfigs: Record<string, PlanConfig> = {
  '7-Day Access': {
    price: 12.99,
    credits: 20,
    code: 'day7',
    days: 7
  },
  '14-Day Access': {
    price: 16.99,
    credits: 40,
    code: 'day14',
    days: 14
  },
  '30-Day Access': {
    price: 23.99,
    credits: 80,
    code: 'day30',
    days: 30
  }
};


// 充值成功弹窗
const SuccessModal = ({
  isOpen,
  onClose,
  credits,
  onStartCreating,
  t
}: {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  onStartCreating: () => void;
  t: any;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#030414] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative">
        {/* 弹窗主体 */}
        <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 sm:p-8 pt-16 sm:pt-20 max-w-md w-full border border-orange-200">
          {/* credits-big.svg 图片 - 响应式大小，绝对定位，一半在弹框内，一半在外部 */}
          <img
            src="/imgs/credits-big.svg"
            alt="Credits"
            className="absolute w-32 h-32 sm:w-40 sm:h-40 left-1/2 transform -translate-x-1/2 -top-16 sm:-top-20 z-10"
          />
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-4 h-4 text-[#6B7280] hover:text-[#161616] transition-colors z-20"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z" />
            </svg>
          </button>

          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-medium text-[#161616] mb-2">{t('section.successModal.title')}</h3>

            {/* 积分显示 */}
            <div className="text-4xl sm:text-6xl font-bold text-[#161616] mb-4">+{credits}</div>

            <p className="text-sm text-[#6B7280] leading-5 mb-6 sm:mb-8">
              {t('section.successModal.description')}
            </p>

            <Button
              onClick={onStartCreating}
              className="w-full bg-[#FF5C07] hover:bg-[#E54A06] text-white"
            >
              {t('section.successModal.startCreating')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


interface PricingSectionProps {
  showFAQ?: boolean;
  showCTA?: boolean;
  showTitle?: boolean;
  titleH1?: boolean;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  showFAQ = false,
  showCTA = false,
  showTitle = false,
  titleH1 = true
}) => {
  const { t, translations } = useAsyncTranslation('pricing');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccessToast, showErrorToast } = useToast();

  // FAQ 数据
  const pricingFAQData: FAQData[] = translations?.section?.planFAQ || [
    {
      question: "How does the AI Tattoo Generator work?",
      answer: "Type your tattoo idea or upload an image, choose a style, and the AI creates a realistic design you can preview and download instantly."
    },
    {
      question: "What tattoo design styles are available?",
      answer: "Choose from minimal line art, traditional, watercolor, geometric, hyper-realistic, and more—so your tattoo matches your vision."
    },
    {
      question: "How accurate is the AI Tattoo Generator skin preview?",
      answer: "Our AR and photo preview tools give a near-real look at placement, size, and color before you commit."
    },
    {
      question: "Can I use AI Tattoo Generator designs commercially?",
      answer: "Yes, for personal or commercial purposes. We recommend confirming technical feasibility with your tattoo artist."
    },
    {
      question: "Is there a mobile app version?",
      answer: "Yes. The AI Tattoo Generator app for iOS and Android lets you design, preview, and save tattoos anytime."
    },
    {
      question: "Can I edit or refine the AI tattoo design?",
      answer: "Absolutely—tweak style, details, and placement until it's perfect."
    }
  ];

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successCredits] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // 处理购买按钮点击
  const handleBuyClick = async (planTitle: string) => {
    if (!isAuthenticated) {
      navigateWithLanguage(navigate, '/login');
      return;
    }

    // 获取计划配置
    const config = planConfigs[planTitle as keyof typeof planConfigs];
    if (!config) {
      showErrorToast(t('payment.errors.invalidPlan') || '无效的套餐选择');
      return;
    }

    try {
      setIsProcessingPayment(true);

      console.log(`[Payment] Creating order for plan: ${config.code}, credits: ${config.credits}`);

      // 创建 Creem 支付订单
      const orderResponse = await PricingService.createOrder({
        planCode: config.code as 'day7' | 'day14' | 'day30',
        method: 'creem',
        chargeType: 'Credit'
      });

      console.log(`[Payment] Order created successfully:`, orderResponse);

      // 验证必需的响应字段
      if (!orderResponse.paymentUrl || !orderResponse.creemSessionId) {
        console.error('[Payment] Missing required fields in response:', orderResponse);
        throw new Error('服务器响应缺少必需字段：paymentUrl 或 creemSessionId');
      }

      // 保存订单信息到 localStorage，用于支付回调处理
      const pendingPayment = {
        orderId: orderResponse.id,
        sessionId: orderResponse.creemSessionId,
        planTitle: planTitle,
        credits: config.credits,
        amount: config.price,
        timestamp: Date.now()
      };

      localStorage.setItem('pendingCreemPayment', JSON.stringify(pendingPayment));
      console.log(`[Payment] Stored pending payment info:`, pendingPayment);

      // 跳转到 Creem 支付页面
      console.log(`[Payment] Redirecting to: ${orderResponse.paymentUrl}`);
      window.location.href = orderResponse.paymentUrl;

    } catch (error: any) {
      console.error('[Payment] Failed to create Creem payment:', error);

      let errorMessage = t('payment.errors.paymentFailed') || '支付创建失败，请重试';

      // 根据错误类型提供更具体的错误信息
      if (error.code) {
        switch (error.code) {
          case '1020':
            errorMessage = t('payment.errors.orderCreationFailed') || '创建订单失败';
            break;
          case 'NETWORK_ERROR':
            errorMessage = t('payment.errors.networkError') || '网络连接失败，请检查网络';
            break;
          case 'AUTH_ERROR':
            errorMessage = t('payment.errors.authError') || '身份验证失败，请重新登录';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      showErrorToast(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };


  // 处理开始创作按钮点击
  const handleStartCreating = () => {
    setShowSuccessModal(false);
    navigate('/create');
  };

  // Features for pricing plans
  const getFeatures = (planKey: string): string[] => {
    switch (planKey) {
      case 'day7':
        return [
          t('section.features.credits20') || '获得20积分',
          t('section.features.validFor7Days') || '7天内有效',
          t('section.features.multipleGeneration') || '可同时生成多张纹身',
          t('section.features.prioritySupport') || '优先支持'
        ];
      case 'day14':
        return [
          t('section.features.credits40') || '获得40积分',
          t('section.features.validFor14Days') || '14天内有效',
          t('section.features.multipleGeneration') || '可同时生成多张纹身',
          t('section.features.prioritySupport') || '优先支持'
        ];
      case 'day30':
        return [
          t('section.features.credits80') || '获得80积分',
          t('section.features.validFor30Days') || '30天内有效',
          t('section.features.multipleGeneration') || '可同时生成多张纹身',
          t('section.features.prioritySupport') || '优先支持'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="relative bg-[#030414]">
      {/* Main Content */}
      <div className="relative z-10 pt-4 lg:pt-20 flex flex-col items-center px-4">
        {/* 标题 - 可选 */}
        {showTitle && (
          titleH1 ? (
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E6E6E6] mb-4 sm:mb-12 md:mb-16 text-center capitalize">{t('section.title') || 'Plans & Pricing'}</h1>
          ) : (
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E6E6E6] mb-4 sm:mb-12 md:mb-16 text-center capitalize">{t('section.title') || 'Plans & Pricing'}</h2>
          )
        )}

        {/* 内容容器 */}
        <div className="relative w-full max-w-[1450px] mx-auto">
          <div className="flex flex-col items-center px-8">

                {/* Pricing Cards - 3 cards layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-items-center w-full max-w-[1170px]">
                  {Object.entries(planConfigs).map(([planKey, plan]) => {
                    const isPopular = planKey === '14-Day Access';

                    // Define original prices and discounts for each plan
                    const originalPrice = planKey === '14-Day Access' ? '31.98' :
                                         planKey === '30-Day Access' ? '55.96' : undefined;
                    const discount = planKey === '14-Day Access' ? '47%' :
                                    planKey === '30-Day Access' ? '57%' : undefined;
                    const priceNote = planKey === '7-Day Access' ? (t('section.planDescriptions.day7') || 'Perfect starter plan') :
                                     planKey === '14-Day Access' ? (t('section.planDescriptions.day14') || 'Best value for most users') :
                                     planKey === '30-Day Access' ? (t('section.planDescriptions.day30') || 'Ultimate creative freedom') : undefined;

                    return (
                      <PricingCard
                        key={planKey}
                        title={t(`section.planNames.${plan.code}`) || planKey}
                        type={plan.code as 'day7' | 'day14' | 'day30'}
                        price={plan.price.toString()}
                        originalPrice={originalPrice}
                        discount={discount}
                        priceNote={priceNote}
                        popular={isPopular}
                        features={getFeatures(plan.code)}
                        onBuyClick={() => handleBuyClick(planKey)}
                        isLoading={isProcessingPayment}
                      />
                    );
                  })}
                </div>

                {/* Payment Methods */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <div aria-hidden="true" className="h-2 w-2 rounded-full bg-green-500"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield h-4 w-4 text-gray-600" aria-hidden="true">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                    </svg>
                    <span className="text-gray-600">{t('section.paymentMethods.securePayment') || 'Secure Payment'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div aria-hidden="true" className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-check h-4 w-4 text-gray-600" aria-hidden="true">
                      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    <span className="text-gray-600">{t('section.paymentMethods.instantAccess') || 'Instant Access'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div aria-hidden="true" className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock h-4 w-4 text-gray-600" aria-hidden="true">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span className="text-gray-600">{t('section.paymentMethods.oneTimePayment') || 'One-time Payment'}</span>
                  </div>
                </div>
            </div>
        </div>

        {/* FAQ Section - 可选 */}
        {showFAQ && (
          <div className="flex justify-center py-16 lg:py-20">
            <GenerateFAQ
              faqData={pricingFAQData}
              title={t('faq.title')}
            />
          </div>
        )}

        {/* CTA Section - 可选 */}
        {showCTA && (
          <TryNow
            title={t('cta.title')}
            description={t('cta.description')}
            buttonText={t('cta.tryNow')}
            buttonLink={createLanguageAwarePath("/create")}
          />
        )}
      </div>


      {/* 充值成功弹窗 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        credits={successCredits}
        onStartCreating={handleStartCreating}
        t={t}
      />
    </div>
  );
};

export default PricingSection;