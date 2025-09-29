import { Link } from 'react-router-dom';

interface TryNowProps {
  className?: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  onButtonClick?: () => void;
}

const TryNow: React.FC<TryNowProps> = ({
  className = "",
  title,
  description,
  buttonText,
  buttonLink,
  onButtonClick
}) => {
  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div className="w-[1440px] mx-4 sm:mx-6 bg-cover bg-center bg-no-repeat relative rounded-lg overflow-hidden" style={{backgroundImage: 'url(/imgs/try-now/try-now-bg.png)'}}>
        {/* Gradient overlay */}
        <div className="absolute inset-0 w-full h-full" style={{background: 'linear-gradient(180deg, rgba(3, 4, 20, 0.60) 0%, rgba(0, 0, 0, 0.40) 100%)'}}></div>

        <div className="w-full flex justify-center items-center px-4 sm:px-6 py-12 lg:py-16 relative z-10">
          <div className="w-full flex flex-col justify-start items-center gap-4 sm:gap-6">
          <h2 className="text-center text-[#ECECEC] text-2xl sm:text-3xl md:text-4xl lg:text-[56px] font-bold leading-tight sm:leading-[1.25] lg:leading-[67.2px] px-4 sm:px-0 capitalize">
            {title}
          </h2>
          
          <h3 className="w-full text-center text-[#ECECEC] text-lg leading-6 px-4 sm:px-0">
            {description}
          </h3>
          
          {onButtonClick ? (
            <button
              className="h-[60px] px-[70px] pr-3 bg-white rounded-lg flex justify-center items-center gap-10 hover:bg-gray-300 transition-colors duration-200"
              onClick={onButtonClick}
            >
              <div className="text-black text-xl font-bold">
                {buttonText}
              </div>
              <div className="w-9 h-9 bg-[#030414] rounded-full flex items-center justify-center">
                <img src="/imgs/try-now/right-arrow.png" alt="Right arrow" className="w-6 h-6" />
              </div>
            </button>
          ) : (
            <Link to={buttonLink || '#'} className="w-auto">
              <button className="h-[60px] px-[70px] pr-3 bg-white rounded-lg flex justify-center items-center gap-10 hover:bg-gray-300 transition-colors duration-200">
                <div className="text-black text-xl font-bold">
                  {buttonText}
                </div>
                <div className="w-9 h-9 bg-[#030414] rounded-full flex items-center justify-center">
                  <img src="/imgs/try-now/right-arrow.png" alt="Right arrow" className="w-6 h-6" />
                </div>
              </button>
            </Link>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryNow;