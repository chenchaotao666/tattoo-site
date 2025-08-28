const protectIcon = '/images/protect.svg';

interface FeatureItemProps {
  text: string;
  highlighted?: boolean;
}

const FeatureItem = ({ text, highlighted = false }: FeatureItemProps) => (
  <div className="flex items-center gap-2 mb-2">
    <div className="w-4 h-4 flex items-center justify-center">
      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.66675 4.5L4.66675 7.5L11.3334 1.5" stroke="#98FF59" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  popular?: boolean;
  priceNote?: string;
  features: string[];
  onBuyClick?: () => void;
}

const PricingCard = ({ 
  title, 
  price, 
  popular = false, 
  priceNote, 
  features, 
  onBuyClick
}: PricingCardProps) => {
  return (
    <div
      className={`w-full max-w-[376px] h-[500px] p-8 bg-[#131317] rounded-2xl relative overflow-hidden transition-all duration-200 border-2 ${
        popular ? 'border-[#98FF59]' : 'border-[#26262D]'
      } hover:shadow-lg`}
    >
      {popular && (
        <div className="absolute -top-1 -right-1 px-6 py-2 bg-gradient-to-r from-[#871CDF] to-[#F42F74] text-[#ECECEC] font-bold italic text-sm rounded-bl-2xl rounded-tr-2xl">
          Popular
        </div>
      )}
      
      <div className="flex flex-col h-full">
        {/* Title and Price */}
        <div className="text-center mb-6">
          <div className="text-[#ECECEC] text-4xl font-bold mb-4">
            {title} ${price}
          </div>
          {priceNote && (
            <div className="text-sm text-[#A5A5A5] mb-2">
              {priceNote}
            </div>
          )}
          {title !== 'Free' && (
            <div className="flex justify-center items-center gap-2">
              <img src={protectIcon} alt="Protect" className="w-3 h-3" />
              <div className="text-[#98FF59] text-sm">Cancel anytime</div>
            </div>
          )}
        </div>

        {/* Buy Button */}
        <div className="mb-6">
          {popular ? (
            <button 
              className="w-full h-[60px] bg-[#98FF59] text-black text-xl font-bold rounded-lg hover:bg-[#7DD149] transition-colors"
              onClick={() => {
                if (onBuyClick) onBuyClick();
              }}
            >
              Buy Now
            </button>
          ) : (
            <button 
              className="w-full h-[60px] border border-[#ECECEC] text-[#ECECEC] text-xl font-bold rounded-lg hover:bg-[#1A1A1E] transition-colors"
              onClick={() => {
                if (onBuyClick) onBuyClick();
              }}
            >
              {title === 'Free' ? 'Try Now' : 'Buy Now'}
            </button>
          )}
        </div>

        {/* Features */}
        <div className="flex-1">
          {features.map((feature, index) => (
            <FeatureItem 
              key={index} 
              text={feature} 
              highlighted={index === 0} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;