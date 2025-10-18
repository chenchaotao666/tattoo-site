import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadScript as loadScriptPaypal } from "@paypal/paypal-js";
import { useAuth } from '../../contexts/AuthContext';
import { PricingService } from '../../services/pricingService';
import { useAsyncTranslation } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';

// PayPal Types
import type { PayPalNamespace } from "@paypal/paypal-js";

declare global {
  interface Window {
    paypal?: PayPalNamespace | null;
  }
}

interface PaypalPaymentProps {
  onBack: () => void;
  planTitle?: string;
  credits?: number;
  days?: number;
  totalPrice?: string;
  planCode?: string;
}

const PaypalPayment: React.FC<PaypalPaymentProps> = ({
  onBack,
  planTitle = "7-Day Access",
  credits = 20,
  days = 7,
  totalPrice = "12.99",
  planCode = "day7"
}) => {
  const { t } = useAsyncTranslation('pricing');
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();
  const paypalRef = useRef<HTMLDivElement>(null);
  const planCodeRef = useRef(planCode); // 使用ref保存最新的planCode值
  const creditsRef = useRef(credits); // 使用ref保存最新的credits值
  const [isProcessing, setIsProcessing] = useState(false);

  // 更新planCodeRef当planCode变化时
  useEffect(() => {
    planCodeRef.current = planCode;
  }, [planCode]);

  // 更新creditsRef当credits变化时
  useEffect(() => {
    creditsRef.current = credits;
  }, [credits]);

  // 处理支付结果
  const handlePaymentResult = async (orderID: string) => {
    try {
      const response = await PricingService.captureOrder(orderID);
      if (response.status === 'COMPLETED') {
        await refreshUser();
        showSuccessToast(t('payment.success.message', undefined, { credits: creditsRef.current }));

        setIsProcessing(false);
        setCardLoading(false);

        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          onBack();
          navigate('/text-coloring-page');
        }, 5000);
      } else {
        showErrorToast(t('payment.errors.processingFailed'));
      }
    } catch (error: any) {
      console.error('支付失败:', error);
      // ApiError 的消息直接在 error.message 中
      const errorMessage = t('payment.errors.paymentFailed');
      showErrorToast(errorMessage);
    } finally {
      setIsProcessing(false);
      setCardLoading(false);
    }
  };

  // 加载PayPal SDK
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const loadPaypal = useRef<Promise<any> | null>(null);

  useEffect(() => {
    const initPayPal = async () => {
      try {
        if (!loadPaypal.current) {
          loadPaypal.current = loadScriptPaypal({
            clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID',
            components: "buttons,card-fields",
          });
        }

        await loadPaypal.current;
        setPaypalLoaded(true);
        console.log('PayPal SDK loaded successfully');
      } catch (error) {
        console.error('Failed to load PayPal SDK:', error);
      }
    };

    initPayPal();
  }, []);

  // PayPal CardFields 引用
  const [cardField, setCardField] = useState<any>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [paypalInitialized, setPaypalInitialized] = useState(false);


  useEffect(() => {
    if (!paypalLoaded || !window.paypal || paypalInitialized) return;

    const initializePayPal = async () => {
      try {
        const paypal = window.paypal;
        if (!paypal || !paypalRef.current) return;

        // 检查是否已经渲染过
        if (paypalRef.current.children.length > 0) {
          setPaypalInitialized(true);
          return;
        }

        // 渲染 PayPal 按钮
        if (paypal?.Buttons) {
          paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'paypal',
            height: 46,
          },
          createOrder: async () => {
            try {
              setIsProcessing(true);

              const response = await PricingService.createOrder({
                planCode: (planCodeRef.current as 'day7' | 'day14' | 'day30') || 'day7',
                method: 'paypal',
                chargeType: 'Credit'
              });
              return response.id;
            } catch (error) {
              console.error('Create order failed:', error);
              setIsProcessing(false);
              throw error;
            }
          },
          onApprove: async (data: any) => {
            const { orderID } = data;
            await handlePaymentResult(orderID);
          },
          onError: (error: any) => {
            console.error('PayPal error:', error);
            showErrorToast(t('payment.errors.paypalError'));
            setIsProcessing(false);
          },
          onCancel: () => {
            setIsProcessing(false);
          },
          }).render(paypalRef.current);
        }

        // 初始化 CardFields
        if (paypal.CardFields) {
          const cardFieldInstance = paypal.CardFields({
            createOrder: async () => {
              try {
                setIsProcessing(true);

                const response = await PricingService.createOrder({
                  planCode: (planCodeRef.current as 'day7' | 'day14' | 'day30') || 'day7',
                  method: 'card',
                  chargeType: 'Credit'
                });
                return response.id;
              } catch (error) {
                console.error('Create order failed:', error);
                setIsProcessing(false);
                setCardLoading(false);
                throw error;
              }
            },
            onApprove: async (data: any) => {
              const { orderID } = data;
              await handlePaymentResult(orderID);
            },
            onError: (error: any) => {
              console.error('CardFields error:', error);
              showErrorToast(t('payment.errors.cardError'));
              setIsProcessing(false);
              setCardLoading(false);
            }
          });

          setCardField(cardFieldInstance);

          const cardFieldOptions = {
            style: {
              input: {
                padding: "10px 15px",
                "font-size": "14px",
                border: "1px solid #26262D",
                "border-radius": "8px",
                height: "46px",
              },
            },
          };

          if (cardFieldInstance.isEligible()) {
            // 确保 DOM 元素存在后立即渲染
            const renderFields = () => {
              try {
                const nameContainer = document.getElementById("card-name-field-container");
                const numberContainer = document.getElementById("card-number-field-container");
                const cvvContainer = document.getElementById("card-cvv-field-container");
                const expiryContainer = document.getElementById("card-expiry-field-container");

                if (numberContainer && !numberContainer.hasChildNodes()) {
                  cardFieldInstance.NumberField(cardFieldOptions).render("#card-number-field-container");
                }
                if (expiryContainer && !expiryContainer.hasChildNodes()) {
                  cardFieldInstance.ExpiryField(cardFieldOptions).render("#card-expiry-field-container");
                }
                if (cvvContainer && !cvvContainer.hasChildNodes()) {
                  cardFieldInstance.CVVField(cardFieldOptions).render("#card-cvv-field-container");
                }
                if (nameContainer && !nameContainer.hasChildNodes()) {
                  cardFieldInstance.NameField(cardFieldOptions).render("#card-name-field-container");
                }

                setPaypalInitialized(true);
              } catch (error) {
                console.error('CardFields render error:', error);
                setPaypalInitialized(true);
              }
            };

            // 立即尝试渲染，如果DOM还没准备好则稍等片刻
            const numberContainer = document.getElementById("card-number-field-container");
            if (numberContainer) {
              renderFields();
            } else {
              setTimeout(renderFields, 50);
            }
          }
        } else {
          // 如果 CardFields 不可用，直接设置为初始化完成
          setPaypalInitialized(true);
        }

      } catch (error) {
        console.error('PayPal initialization error:', error);
        setPaypalInitialized(true);
      }
    };

    initializePayPal();
  }, [paypalLoaded]);

  // 处理信用卡支付
  const handleCardSubmit = async () => {
    if (!cardField) {
      showErrorToast(t('payment.paymentNotReady'));
      return;
    }

    setCardLoading(true);
    try {
      await cardField.submit();
      // CardFields 的 onApprove 会处理后续流程
    } catch (error) {
      console.error('Card payment failed:', error);
      showErrorToast(t('payment.cardPaymentFailed'));
      setCardLoading(false);
    }
  };
  
  return (
    <div className="pb-8 px-8 h-full w-full bg-[#030414] min-h-screen">
      <style>
        {`
          .paypal-field-loading {
            position: absolute;
            left: -9999px;
            opacity: 0;
            visibility: hidden;
            height: 0;
            overflow: hidden;
          }

          .paypal-field-ready {
            position: relative;
            left: auto;
            opacity: 1;
            visibility: visible;
            height: auto;
            transition: opacity 0.3s ease;
          }

          .paypal-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10;
          }

        `}
      </style>
      <div
        id="checkout-container"
        className="w-full flex-shrink-0 mx-auto max-w-[1170px]"
      >
        {/* 返回按钮 */}
        <div className="mb-6">
          <button
            className="flex items-center text-[#C8C8C8] hover:text-[#98FF59] transition-colors"
            onClick={onBack}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l-7-7 7-7m7 7H5"
              />
            </svg>
            {t('payment.backToPlans')}
          </button>
        </div>

        {/* 支付表单容器 */}
        <div className="grid grid-cols-1 rounded-2xl border-[1px] border-[#26262D] bg-[#131317] lg:grid-cols-2 w-full">
          {/* 左侧 - 订单信息 */}
          <div className="flex flex-col p-10 text-[#ECECEC] bg-[#19191F] rounded-l-2xl">
            <div className="mb-[60px]">
              <h3 className="mb-2 text-lg text-[#C8C8C8]">{t('payment.purchaseTitle', undefined, { planTitle })}</h3>
              <div className="mb-6 text-4xl font-bold text-[#FFFFFF]">{credits} {t('payment.credits')}</div>
              <div className="text-sm text-[#C8C8C8]">{days} {t('payment.days')}{t('payment.validityPeriod')}</div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>{t('payment.creditsCount')}</span>
                <span>{credits} {t('payment.credits')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('payment.validityPeriod')}</span>
                <span>{days} {t('payment.days')}</span>
              </div>
              <hr className="border-[#26262D]" />
              <div className="flex justify-between text-lg font-bold text-[#FFFFFF]">
                <span>{t('payment.totalAmount')}</span>
                <span>US${totalPrice}</span>
              </div>
            </div>
          </div>

          {/* 右侧 - 支付表单 */}
          <div className="rounded-r-2xl bg-[#131317] p-10 text-[#ECECEC]">
            <div className="space-y-3">
              {/* PayPal 按钮容器 */}
              <div ref={paypalRef} id="paypal-button-container"></div>
              
              {isProcessing && (
                <div className="text-center text-sm text-[#C8C8C8] mb-4">
                  {t('payment.processing')}
                </div>
              )}

              {/* 分割线 */}
              <div className="flex items-center my-4">
                <hr className="flex-1 border-[#26262D]" />
                <span className="px-4 text-[#C8C8C8]">{t('payment.orPayWithCard')}</span>
                <hr className="flex-1 border-[#26262D]" />
              </div>

              {/* 银行卡信息 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[#FFFFFF] font-medium">{t('payment.cardInfo')}</label>
                  <div className="flex items-center gap-2">
                    <img
                      src="/imgs/paypal/mastercard.svg"
                      alt="Mastercard"
                      className="h-5 w-[30px]"
                    />
                    <img
                      src="/imgs/paypal/visa.png"
                      alt="Visa"
                      className="h-5"
                    />
                  </div>
                </div>

                {/* PayPal CardFields 动态渲染的输入框 */}
                <div className="mb-8 relative h-[46px]">
                  <div
                    id="card-number-field-container"
                    className={`w-full h-[46px] ${paypalInitialized ? 'paypal-field-ready' : 'paypal-field-loading'}`}
                  ></div>
                  <div className={`paypal-placeholder h-[46px] bg-[rgb(25,25,31)] border border-[#26262D] rounded-lg flex items-center ${paypalInitialized ? 'hidden' : ''}`}>
                    <span className="text-[#818181] text-sm">{t('payment.cardNumber')}</span>
                  </div>
                </div>

                {/* 有效期和CVV */}
                <div className="flex gap-3 mb-8">
                  <div className="flex-1 relative h-[46px]">
                    <div
                      id="card-expiry-field-container"
                      className={`w-full h-[46px] ${paypalInitialized ? 'paypal-field-ready' : 'paypal-field-loading'}`}
                    ></div>
                    <div className={`paypal-placeholder h-[46px] bg-[rgb(25,25,31)] border border-[#26262D] rounded-lg flex items-center ${paypalInitialized ? 'hidden' : ''}`}>
                      <span className="text-[#818181] text-sm">{t('payment.expiryDate')}</span>
                    </div>
                  </div>
                  <div className="flex-1 relative h-[46px]">
                    <div
                      id="card-cvv-field-container"
                      className={`w-full h-[46px] ${paypalInitialized ? 'paypal-field-ready' : 'paypal-field-loading'}`}
                    ></div>
                    <div className={`paypal-placeholder h-[46px] bg-[rgb(25,25,31)] border border-[#26262D] rounded-lg flex items-center ${paypalInitialized ? 'hidden' : ''}`}>
                      <span className="text-[#818181] text-sm">{t('payment.cvv')}</span>
                    </div>
                  </div>
                </div>

                {/* 持卡人姓名 */}
                <div className="mb-8 relative h-[46px]">
                  <div
                    id="card-name-field-container"
                    className={`w-full h-[46px] ${paypalInitialized ? 'paypal-field-ready' : 'paypal-field-loading'}`}
                  ></div>
                  <div className={`paypal-placeholder h-[46px] bg-[rgb(25,25,31)] border border-[#26262D] rounded-lg flex items-center ${paypalInitialized ? 'hidden' : ''}`}>
                    <span className="text-[#818181] text-sm">{t('payment.cardholderName')}</span>
                  </div>
                </div>

                {/* 支付按钮 */}
                <button
                  className="w-full h-12 bg-gradient-to-r from-[#871CDF] to-[#F42F74] hover:from-[#7A19C7] hover:to-[#E1206B] text-white text-lg font-medium rounded-lg transition-all duration-200 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCardSubmit}
                  disabled={cardLoading || isProcessing}
                >
                  {cardLoading ? t('payment.processing2') : t('payment.payNow')}
                </button>

                {/* 底部说明文字 */}
                <div className="mt-4 space-y-2 text-center">
                  <div className="flex items-center justify-center text-sm text-[#C8C8C8]">
                    <span>{t('payment.technicalSupport')}</span>
                    <img
                      src="/imgs/paypal/paypal.webp"
                      alt="PayPal"
                      className="ml-1 h-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaypalPayment;