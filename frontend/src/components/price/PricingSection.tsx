import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import GenerateFAQ, { FAQData } from '../common/GenerateFAQ';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncTranslation } from '../../contexts/LanguageContext';
import PaypalPayment from './PaypalPayment';
import PricingCard from './PricingCard';
import { colors } from '../../styles/colors';

const arrowRightIcon = '/images/arrow-right-outline.svg';

interface PlanConfig {
  monthly: {
    price: number;
    credits: number;
    code: string;
  };
  yearly: {
    price: number;
    credits: number;
    code: string;
    monthlyPrice: number;
  };
}

// 套餐配置 - 只保留3个计划
const planConfigs: Record<string, PlanConfig> = {
  'Free': {
    monthly: { price: 0, credits: 10, code: 'FREE' },
    yearly: { price: 0, credits: 10, code: 'FREE', monthlyPrice: 0 }
  },
  'Lite': {
    monthly: { price: 10, credits: 300, code: 'LITE_MONTHLY' },
    yearly: { price: 60, credits: 300, code: 'LITE_YEARLY', monthlyPrice: 5 }
  },
  'Pro': {
    monthly: { price: 20, credits: 800, code: 'PRO_MONTHLY' },
    yearly: { price: 144, credits: 800, code: 'PRO_YEARLY', monthlyPrice: 12 }
  }
};



// 充值成功弹窗
const SuccessModal = ({ 
  isOpen, 
  onClose, 
  credits,
  onStartCreating
}: {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  onStartCreating: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative">
        {/* 弹窗主体 */}
        <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 sm:p-8 pt-16 sm:pt-20 max-w-md w-full border border-orange-200">
          {/* credits-big.svg 图片 - 响应式大小，绝对定位，一半在弹框内，一半在外部 */}
          <img 
            src="/images/credits-big.svg" 
            alt="Credits" 
            className="absolute w-32 h-32 sm:w-40 sm:h-40 left-1/2 transform -translate-x-1/2 -top-16 sm:-top-20 z-10"
          />
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-4 h-4 text-[#6B7280] hover:text-[#161616] transition-colors z-20"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
            </svg>
          </button>

          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-medium text-[#161616] mb-2">Subscribe successfully</h3>
            
            {/* 积分显示 */}
            <div className="text-4xl sm:text-6xl font-bold text-[#161616] mb-4">+{credits}</div>
            
            <p className="text-sm text-[#6B7280] leading-5 mb-6 sm:mb-8">
              Thank you for your support, now you can start your creative journey!
            </p>

            <Button
              onClick={onStartCreating}
              className="w-full bg-[#FF5C07] hover:bg-[#E54A06] text-white"
            >
              Start Creating
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
}

const PricingSection: React.FC<PricingSectionProps> = ({ 
  showFAQ = false, 
  showCTA = false,
  showTitle = false
}) => {
  const { t, translations } = useAsyncTranslation('pricing');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // FAQ 数据
  const pricingFAQData: FAQData[] = [
    {
      question: t('faq.question1.q'),
      answer: t('faq.question1.a')
    },
    {
      question: t('faq.question2.q'),
      answer: t('faq.question2.a')
    },
    {
      question: t('faq.question3.q'),
      answer: t('faq.question3.a')
    },
    {
      question: t('faq.question4.q'),
      answer: t('faq.question4.a')
    },
    {
      question: t('faq.question5.q'),
      answer: t('faq.question5.a')
    },
    {
      question: t('faq.question6.q'),
      answer: t('faq.question6.a')
    }
  ];
  
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successCredits] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [currentPlanCode, setCurrentPlanCode] = useState<string>('');
  const [showPaypalPayment, setShowPaypalPayment] = useState(false);

  // Function to handle billing period change
  const handleBillingPeriodChange = (period: 'monthly' | 'yearly') => {
    setBillingPeriod(period);
  };

  // 处理购买按钮点击
  const handleBuyClick = (planTitle: string) => {
    if (planTitle === 'Free') {
      navigate('/text-coloring-page');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // 获取计划配置
    const config = planConfigs[planTitle as keyof typeof planConfigs];
    if (config) {
      const planCode = config[billingPeriod].code;
      setCurrentPlan(planTitle);
      setCurrentPlanCode(planCode);
      setShowPaypalPayment(true);
    }
  };

  // 处理返回套餐按钮点击
  const handleBackToPricing = () => {
    setShowPaypalPayment(false);
  };

  // 获取当前计划的积分数
  const getCurrentCredits = () => {
    const config = planConfigs[currentPlan as keyof typeof planConfigs];
    if (config) {
      return config[billingPeriod].credits;
    }
    return 0;
  };

  // 获取当前计划的月付价格
  const getCurrentMonthlyPrice = () => {
    const config = planConfigs[currentPlan as keyof typeof planConfigs];
    if (config) {
      return billingPeriod === 'monthly' ? config.monthly.price.toFixed(2) : config.yearly.monthlyPrice.toFixed(2);
    }
    return '';
  };

  // 获取当前计划的价格
  const getCurrentPrice = () => {
    const config = planConfigs[currentPlan as keyof typeof planConfigs];
    if (config) {
      return config[billingPeriod].price.toFixed(2);
    }
    return '';
  };

  // 处理开始创作按钮点击
  const handleStartCreating = () => {
    setShowSuccessModal(false);
    navigate('/text-coloring-page');
  };

  // Features for pricing plans
  const getFeatures = (planKey: string): string[] => {
    switch (planKey) {
      case 'Free':
        return translations?.plans?.free?.features || [];
      case 'Lite':
        return translations?.plans?.lite?.features || [];
      case 'Pro':
        return translations?.plans?.pro?.features || [];
      case 'Max':
        return translations?.plans?.max?.features || [];
      default:
        return [];
    }
  };

  return (
    <div className="relative bg-black min-h-screen">
      {/* Main Content */}
      <div className="relative z-10 pt-4 lg:pt-16 flex flex-col items-center px-4">
        {/* 标题 - 可选 */}
        {showTitle && (
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E6E6E6] mb-4 sm:mb-12 md:mb-16 text-center capitalize">Plans & Pricing</h1>
        )}
        
        {/* 内容容器 */}
        <div className="relative w-full max-w-[1450px] mx-auto overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: showPaypalPayment ? 'translateX(-50%)' : 'translateX(0%)',
              width: '200%'
            }}
          >
            {/* 定价内容面板 */}
            <div className="w-1/2 flex-shrink-0 px-8">
              <div className="flex flex-col items-center">
              {/* Toggle for Monthly/Yearly */}
              <div className="h-10 sm:h-12 bg-[#F2F3F5] rounded-3xl inline-flex items-center p-1 mb-8 sm:mb-12 md:mb-16">
                <div 
                  className={`w-24 sm:w-[150px] h-8 sm:h-10 rounded-3xl flex justify-center items-center cursor-pointer transition-all duration-200 ${
                    billingPeriod === 'monthly' ? 'bg-white' : 'hover:bg-white/50'
                  }`}
                  onClick={() => handleBillingPeriodChange('monthly')}
                >
                  <div className={`text-xs sm:text-sm font-bold ${billingPeriod === 'monthly' ? 'text-[#FF5C07]' : 'text-[#6B7280]'}`}>
                    Monthly
                  </div>
                </div>
                <div 
                  className={`w-32 sm:w-[150px] h-8 sm:h-10 rounded-3xl flex justify-center items-center cursor-pointer transition-all duration-200 ${
                    billingPeriod === 'yearly' ? 'bg-white' : 'hover:bg-white/50'
                  }`}
                  onClick={() => handleBillingPeriodChange('yearly')}
                >
                  <div className={`text-xs sm:text-sm ${billingPeriod === 'yearly' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280] font-medium'}`}>
                    Yearly
                  </div>
                </div>
              </div>
              
              {/* Pricing Cards - 3 cards layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 justify-items-center mb-8 sm:mb-12 md:mb-16 w-full max-w-[1170px]">
                {Object.entries(planConfigs).map(([planKey, plan]) => {
                  const isLite = planKey === 'Lite';
                  return (
                    <PricingCard
                      key={planKey}
                      title={planKey}
                      price={planKey === 'Free' ? '0' : billingPeriod === 'monthly' ? plan.monthly.price.toString() : plan.yearly.monthlyPrice.toString()}
                      priceNote={billingPeriod === 'yearly' && planKey !== 'Free' ? `For first time，then $${plan.monthly.price}/month` : undefined}
                      popular={isLite}
                      features={getFeatures(planKey)}
                      onBuyClick={() => handleBuyClick(planKey)}
                    />
                  );
                })}
              </div>
              
                {/* Payment Methods */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                  <div className="text-[#C8C8C8] text-sm">Secure Payment:</div>
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    {/* Payment provider icons */}
                    <div className="w-[101px] h-6 bg-gray-300 rounded"></div>
                    <div className="w-[42px] h-6 bg-gray-300 rounded"></div>
                    <div className="w-[64px] h-6 bg-gray-300 rounded"></div>
                    <div className="w-9 h-6 bg-gray-300 rounded"></div>
                    <div className="w-[39px] h-6 bg-gray-300 rounded"></div>
                    <div className="w-[34px] h-6 bg-gray-300 rounded"></div>
                  </div>
                  <div 
                    className="text-[#ECECEC] text-sm cursor-pointer transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.special.highlight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#ECECEC';
                    }}
                  >
                    More &gt;&gt;
                  </div>
                </div>
              </div>
            </div>

            {/* PayPal Payment Component */}
            <div className="w-1/2 flex-shrink-0">
              <PaypalPayment
                onBack={handleBackToPricing}
                planTitle={currentPlan}
                credits={getCurrentCredits()}
                monthlyPrice={getCurrentMonthlyPrice()}
                totalPrice={getCurrentPrice()}
                discount="46%"
                planCode={currentPlanCode}
                billingPeriod={billingPeriod}
              />
            </div>
          </div>
        </div>
        
        {/* FAQ Section - 可选 */}
        {showFAQ && (
          <div className="mt-[4rem]">
            <GenerateFAQ 
              faqData={pricingFAQData} 
              title={t('faq.title')}
            />
          </div>
        )}
        
        {/* CTA Section - 可选 */}
        {showCTA && (
          <div className="w-full bg-[#030414] py-12 sm:py-16 md:py-24 border-t border-b border-[#F3F4F6]">
            <div className="max-w-[800px] mx-auto flex flex-col items-center gap-4 sm:gap-6 px-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#111928] text-center">{t('cta.title')}</h2>
              <p className="text-[#6B7280] text-center text-sm sm:text-base">
                {t('cta.description')}
              </p>
              <Button 
                variant="gradient"
                className="h-12 sm:h-14 px-4 sm:px-5 py-2.5 text-lg sm:text-xl font-bold flex items-center gap-2"
                onClick={() => window.location.href = '/text-coloring-page'}
              >
                {t('cta.button')}
                <img src={arrowRightIcon} alt="Arrow right" className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>


      {/* 充值成功弹窗 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        credits={successCredits}
        onStartCreating={handleStartCreating}
      />
    </div>
  );
};

export default PricingSection;