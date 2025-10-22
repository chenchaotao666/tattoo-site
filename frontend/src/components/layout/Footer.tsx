import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsyncTranslation, useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';
import { Category } from '../../services/categoriesService';
import { colors } from '../../styles/colors';
import { handleCategoryClick } from '../../utils/categoryUtils';
import { navigateWithLanguage } from '../../utils/navigationUtils';

const logo = '/imgs/logo.svg';
const socialIcon1 = '/imgs/footer/Link → pinteres.svg';
const socialIcon2 = '/imgs/footer/Link → instagram.svg';
const socialIcon3 = '/imgs/footer/Link → x.svg';
const socialIcon4 = '/imgs/footer/Link → youtube.svg';
const socialIcon5 = '/imgs/footer/Link → tiktok.svg';


// Interface for footer links section
interface FooterSectionProps {
  title: string;
  links: Array<{
    label: string;
    url?: string;
    category?: Category;
  }>;
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => {
  const navigate = useNavigate();

  const handleLinkClick = (link: { label: string; url?: string; category?: Category }) => {
    if (link.category) {
      // 使用categoryUtils中的handleCategoryClick
      handleCategoryClick(link.category, navigate);
    } else if (link.url) {
      // 对于非分类链接，使用navigateWithLanguage保持语言一致性
      navigateWithLanguage(navigate, link.url);
    }
  };

  return (
    <div className="w-full lg:w-[200px] flex flex-col gap-3 lg:gap-6">
      <div className="text-[#ECECEC] text-sm lg:text-sm font-bold">
        {title || '\u00A0'}
      </div>
      <div className="flex flex-col gap-2">
        {links.map((link, index) => (
          <button
            key={index}
            onClick={() => handleLinkClick(link)}
            className="text-[#A5A5A5] text-sm transition-colors duration-200 text-left cursor-pointer py-1 hover:bg-transparent"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.special.highlight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#A5A5A5';
            }}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
};

interface FooterProps {
  categories: Category[];
  categoriesLoading: boolean;
}

const Footer: React.FC<FooterProps> = ({ categories, categoriesLoading }) => {
  const { t } = useAsyncTranslation('navigation');
  const { language } = useLanguage();


  const sections = [
    {
      title: t('footer.sections.tools'),
      links: [
        { label: t('menu.create') || 'Create', url: '/create' },
        { label: t('menu.inspiration') || 'Inspiration', url: '/categories' },
      ],
    },
    // 使用前21个分类，分成3组，每组7个，与Header保持一致
    ...(!categoriesLoading && categories.length > 0 ? [
      {
        title: t('categories.popularColoringPages'),
        links: categories.slice(0, 7).map(category => ({
          label: getLocalizedText(category.name, language),
          category: category
        }))
      },
      {
        title: '',
        links: categories.slice(7, 14).map(category => ({
          label: getLocalizedText(category.name, language),
          category: category
        }))
      },
      {
        title: '',
        links: categories.slice(14, 21).map(category => ({
          label: getLocalizedText(category.name, language),
          category: category
        }))
      }
    ] : [
      // 加载中时显示空组，避免布局跳动
      { title: t('categories.popularColoringPages'), links: [] },
      { title: '', links: [] },
      { title: '', links: [] }
    ]),
    {
      title: t('footer.sections.company'),
      links: [
        { label: t('footer.links.privacyPolicy'), url: '/privacy-policy' },
        { label: t('footer.links.termsOfService'), url: '/terms' },
        { label: t('footer.links.refundPolicy'), url: '/refund-policy' },
      ],
    },
  ];

  const socialIcons = [
    socialIcon1,
    socialIcon2,
    socialIcon3,
    socialIcon4,
    socialIcon5
  ];

  const socialLinks = [
    'https://pin.it/6NdatdNmR',
    'https://www.instagram.com/aitattoo_art/',
    'https://x.com/AITattooArt',
    'https://youtube.com/@aitattooart?si=yhxwYBVuMHPjGcE_',
    'https://www.tiktok.com/@stoneink_tattoo?'
  ];

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full bg-[#030414] py-8 lg:py-[60px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[60px]">
        {/* 移动端布局 */}
        <div className="lg:hidden">
          {/* Logo和联系信息 */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center gap-1 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
              <img src={logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
              <div className="text-white text-xl sm:text-2xl font-medium">Tattooinkai</div>
            </div>
            <div>
              <span className="text-[#C8C8C8] text-sm leading-6">
                {t('footer.contact.title')}<br />
              </span>
              <a 
                href="mailto:congcong@mail.xinsulv.com" 
                className="text-[#7ECBF7] text-sm underline leading-6 transition-colors duration-200"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.special.highlight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#7ECBF7';
                }}
              >
                {t('footer.contact.email')}
              </a>
            </div>
            <div className="flex items-center gap-4">
              {socialIcons.map((icon, index) => (
                <img
                  key={index}
                  src={icon}
                  alt={`Social icon ${index + 1}`}
                  className="w-5 h-5 sm:w-6 sm:h-6 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  onClick={() => handleSocialClick(socialLinks[index])}
                />
              ))}
            </div>
          </div>
          
          {/* 链接部分 - 网格布局 */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            {sections.map((section, index) => (
              <FooterSection 
                key={index}
                title={section.title}
                links={section.links}
              />
            ))}
          </div>
        </div>

        {/* 桌面端布局 */}
        <div className="hidden lg:flex">
          <div className="w-[350px] flex flex-col gap-[22px]">
            <div className="flex items-center gap-1 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
              <img src={logo} alt="Logo" className="w-10 h-10" />
              <div className="text-white text-2xl font-medium">Tattooinkai</div>
            </div>
            <div>
              <span className="text-[#C8C8C8] text-sm leading-6">
                {t('footer.contact.title')}<br />
              </span>
              <a 
                href="mailto:congcong@mail.xinsulv.com" 
                className="text-[#7ECBF7] text-sm underline leading-6 transition-colors duration-200"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.special.highlight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#7ECBF7';
                }}
              >
                {t('footer.contact.email')}
              </a>
            </div>
            <div className="flex items-center gap-5">
              {socialIcons.map((icon, index) => (
                <img
                  key={index}
                  src={icon}
                  alt={`Social icon ${index + 1}`}
                  className="w-6 h-6 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  onClick={() => handleSocialClick(socialLinks[index])}
                />
              ))}
            </div>
          </div>

          <div className="flex">
            {sections.map((section, index) => (
              <FooterSection 
                key={index}
                title={section.title}
                links={section.links}
              />
            ))}
          </div>
        </div>

        <div className="w-full h-[0px] my-6 lg:my-9 border-t border-[#26262D]"></div>
        <div className="text-[#C8C8C8] text-sm text-center lg:text-left">
          {t('footer.copyright')}
        </div>
      </div>
    </div>
  );
};

export default Footer; 