import { colors } from '../../styles/colors';
import BaseButton from '../ui/BaseButton';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

const protectIcon = '/imgs/protect.svg';

interface FeatureItemProps {
  text: string;
  highlighted?: boolean;
}

const FeatureItem = ({ text, highlighted = false }: FeatureItemProps) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-4 h-4 flex items-center justify-center">
      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.66675 4.5L4.66675 7.5L11.3334 1.5" stroke={colors.special.highlight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className={`text-sm leading-6 ${highlighted ? "text-[#ECECEC] font-bold" : "text-[#C8C8C8]"}`}>
      {text}
    </div>
  </div>
);

interface PricingCardProps {
  title: string;
  price: string;
  type: 'day7' | 'day14' | 'day30';
  popular?: boolean;
  priceNote?: string;
  originalPrice?: string;
  discount?: string;
  features: string[];
  onBuyClick?: () => void;
  isLoading?: boolean;
}

const PricingCard = ({
  title,
  price,
  type,
  popular = false,
  priceNote,
  originalPrice,
  discount,
  features,
  onBuyClick,
  isLoading = false
}: PricingCardProps) => {
  const { t } = useAsyncTranslation('components');
  return (
    <div
      className={`w-full max-w-[376px] h-[545px] p-8 bg-[#131317] rounded-2xl relative transition-all duration-200 border-2 ${
        popular ? `border-[${colors.special.highlight}]` : 'border-[#26262D]'
      } hover:shadow-lg`}
    >
      {popular && (
        <div className="absolute -top-[4px] -right-[2px] px-6 py-2 bg-gradient-to-r from-[#871CDF] to-[#F42F74] text-[#ECECEC] font-bold italic text-sm rounded-bl-2xl rounded-tr-2xl">
          {t('pricing.popular')}
        </div>
      )}
      
      {discount && type === 'day14' && (
        <div className="absolute -right-3 top-12 z-10">
          <div className="px-3 h-8 shadow-lg rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white leading-none transform">{t('pricing.save', undefined, { discount })}</span>
          </div>
        </div>
      )}
      
      {discount && type === 'day30' && (
        <div className="absolute -right-3 top-12 z-10">
          <div className="px-3 h-8 shadow-lg rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white leading-none transform">{t('pricing.save', undefined, { discount })}</span>
          </div>
        </div>
      )}
      
      <div className="flex flex-col h-full justify-center">
        {/* Title and Price */}
        <div className="flex flex-col space-y-1.5 pb-6 text-center">
          {type === 'day7' && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap h-6 w-6 text-white" aria-hidden="true">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
              </svg>
            </div>
          )}
          {type === 'day14' && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gem h-6 w-6 text-white" aria-hidden="true">
                <path d="M6 3h12l4 6-10 13L2 9Z"></path>
                <path d="M11 3 8 9l4 13 4-13-3-6"></path>
                <path d="M2 9h20"></path>
              </svg>
            </div>
          )}
          {type === 'day30' && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-violet-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown h-6 w-6 text-white" aria-hidden="true">
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
                <path d="M5 21h14"></path>
              </svg>
            </div>
          )}
          <h3 className="tracking-tight text-xl font-semibold text-white">{title}</h3>
          <div className="flex items-baseline justify-center gap-2">
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">${originalPrice}</span>
            )}
            <span className="text-4xl font-bold text-white">${price}</span>
          </div>
          {priceNote && (
            <p className="text-sm font-medium text-emerald-600">{priceNote}</p>
          )}
        </div>

        {/* Buy Button */}
        <div className="mb-6">
          {popular ? (
            <BaseButton
              variant="primary"
              width="w-full"
              height="h-[60px]"
              disabled={isLoading}
              onClick={() => {
                if (onBuyClick && !isLoading) onBuyClick();
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('pricing.processing') || 'Processing...'}</span>
                </div>
              ) : (
                t('pricing.buyNow')
              )}
            </BaseButton>
          ) : (
            <BaseButton
              variant="secondary"
              width="w-full"
              height="h-[60px]"
              disabled={isLoading}
              onClick={() => {
                if (onBuyClick && !isLoading) onBuyClick();
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#030414] border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('pricing.processing') || 'Processing...'}</span>
                </div>
              ) : (
                t('pricing.buyNow')
              )}
            </BaseButton>
          )}
        </div>

        {/* Features */}
        <div className="flex-1">
          {features.map((feature, index) => (
            <FeatureItem 
              key={index} 
              text={feature} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;