import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, Language, useAsyncTranslation } from '../../contexts/LanguageContext';
import { useLoginModal } from '../../contexts/LoginModalContext';
import { generateLanguagePath } from '../common/LanguageRouter';
import { Category } from '../../services/categoriesService';
import CategoryMenus from './CategoryMenus';
import IntlSelector from './IntlSelector';
import DropDownMenus, { DropDownMenuItem } from './DropDownMenus';
import { colors } from '../../styles/colors';

// 导入图标 - 使用正确的 public 路径
const logo = '/imgs/header/logo.svg';
const defaultAvatar = '/imgs/default-avatar.svg';
const googleDefaultAvatar = '/imgs/default-avatar-g.png';
const colorPaletteIcon = '/imgs/color-palette.png';


interface HeaderProps {
  backgroundColor?: 'transparent' | 'white';
  categories: Category[];
  categoriesLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ categories, categoriesLoading }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { t: navT } = useAsyncTranslation('navigation');
  const { openLoginModal } = useLoginModal();
  const navigate = useNavigate();
  const location = useLocation();

  // 获取用户头像，如果是谷歌邮箱用户且没有自定义头像，使用谷歌默认头像
  const getUserAvatar = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    
    // 如果没有邮箱信息，不显示头像
    if (!user?.email) {
      return '';
    }
    
    if (user.email.toLowerCase().endsWith('@gmail.com')) {
      return googleDefaultAvatar;
    }
    
    return '';
  };

  // 生成带语言前缀的链接
  const createLocalizedLink = (path: string) => {
    return generateLanguagePath(language, path);
  };

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isUserDropdownVisible, setIsUserDropdownVisible] = useState(false);
  const [isUserDropdownAnimating, setIsUserDropdownAnimating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [isMobileMenuAnimating, setIsMobileMenuAnimating] = useState(false);
  const [isMobileLanguageDropdownOpen, setIsMobileLanguageDropdownOpen] = useState(false);
  const [isMobileLanguageVisible, setIsMobileLanguageVisible] = useState(false);
  const [isMobileLanguageAnimating, setIsMobileLanguageAnimating] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isCategoriesDropdownVisible, setIsCategoriesDropdownVisible] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 用户下拉菜单
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      // 分类下拉菜单
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesDropdownOpen(false);
      }
      // 移动端菜单 - 排除汉堡菜单按钮的点击
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target as Node) &&
          hamburgerButtonRef.current &&
          !hamburgerButtonRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setIsMobileLanguageDropdownOpen(false); // 关闭移动端菜单时也关闭语言下拉框
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, isUserDropdownOpen, isMobileLanguageDropdownOpen, isCategoriesDropdownOpen]);

  // 控制移动端菜单的显示动画
  useEffect(() => {
    if (isMobileMenuOpen) {
      // 1. 立即显示DOM
      setIsMobileMenuVisible(true);
      document.body.classList.add('mobile-menu-open');
      
      // 2. 下一帧开始渐入动画
      const timer = setTimeout(() => {
        setIsMobileMenuAnimating(true);
      }, 10);
      
      return () => clearTimeout(timer);
    } else {
      // 1. 立即开始渐出动画
      setIsMobileMenuAnimating(false);
      document.body.classList.remove('mobile-menu-open');
      
      // 2. 延迟隐藏DOM，让退出动画完成
      const timer = setTimeout(() => {
        setIsMobileMenuVisible(false);
      }, 200); // 匹配CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [isMobileMenuOpen]);

  // 控制移动端语言下拉框的显示动画
  useEffect(() => {
    if (isMobileLanguageDropdownOpen) {
      setIsMobileLanguageVisible(true);
      const timer = setTimeout(() => {
        setIsMobileLanguageAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsMobileLanguageAnimating(false);
      const timer = setTimeout(() => {
        setIsMobileLanguageVisible(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isMobileLanguageDropdownOpen]);


  // 控制用户下拉框的显示动画
  useEffect(() => {
    if (isUserDropdownOpen) {
      setIsUserDropdownVisible(true);
      const timer = setTimeout(() => {
        setIsUserDropdownAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsUserDropdownAnimating(false);
      const timer = setTimeout(() => {
        setIsUserDropdownVisible(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isUserDropdownOpen]);

  // 控制分类下拉框的显示（无动画）
  useEffect(() => {
    setIsCategoriesDropdownVisible(isCategoriesDropdownOpen);
  }, [isCategoriesDropdownOpen]);


  const handleLogout = async () => {
    try {
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
      await logout(); // 这里会自动跳转到首页
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // 将API数据转换为菜单显示格式
  const getCategoriesMenuData = () => {
    if (categoriesLoading || !categories || categories.length === 0) {
      return { title: '', categories: [] };
    }

    // 取前21个分类（3列 × 7个）
    const displayCategories = categories.slice(0, 21);
    
    return {
      title: navT('categories.popularColoringPages', 'Popular Tattoos'),
      categories: displayCategories
    };
  };

  const categoriesMenuData = getCategoriesMenuData();

  // 判断当前是否在首页（支持多语言路径）
  const isHomePage = location.pathname === '/' || location.pathname === '/en/' || location.pathname === '/zh/' || location.pathname === '/ja/' ||
                    location.pathname === '/en' || location.pathname === '/zh' || location.pathname === '/ja';

  // 汉堡菜单图标组件
  const HamburgerIcon = () => (
    <div className="w-6 h-6 flex justify-center items-center">
      {isMobileMenuOpen ? (
        // 三个竖杆
        <div className="flex justify-center items-center gap-1">
          <div className="w-0.5 h-5 bg-white transition-all duration-300"></div>
          <div className="w-0.5 h-5 bg-white transition-all duration-300"></div>
          <div className="w-0.5 h-5 bg-white transition-all duration-300"></div>
        </div>
      ) : (
        // 三个横杆
        <div className="flex flex-col justify-center items-center gap-1">
          <div className="w-5 h-0.5 bg-white transition-all duration-300"></div>
          <div className="w-5 h-0.5 bg-white transition-all duration-300"></div>
          <div className="w-5 h-0.5 bg-white transition-all duration-300"></div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 w-full h-[70px] py-[15px] backdrop-blur-md flex justify-between items-center z-50"
        style={{
          ...(isHomePage && {
            backgroundImage: `url('/imgs/header/bg.png')`,
            backgroundSize: 'auto auto',
            backgroundPosition: '-6px top',
            backgroundRepeat: 'repeat-x',
          }),
          backgroundColor: '#030414',
        }}
      >
        {/* Logo */}
        <Link to={createLocalizedLink("/")} className="relative z-10 pl-4 sm:pl-5 flex justify-start items-center gap-1 hover:opacity-90 transition-opacity duration-200">
          <img src={logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
          <div className="text-white text-xl sm:text-2xl font-medium">Tattooinkai</div>
        </Link>

        {/* 桌面端导航菜单 */}
        <div className="hidden lg:flex relative z-10 max-h-6 justify-start items-start gap-10 flex-wrap">
          <Link to={createLocalizedLink("/")} className={`px-4 py-4 -mx-4 -my-4 text-white text-base font-medium leading-6 hover:text-[${colors.special.highlight}] transition-colors duration-200 block`}>
            {navT('menu.home', 'Home')}
          </Link>

          <Link to={createLocalizedLink("/create")} className={`px-4 py-4 -mx-4 -my-4 text-white text-base font-medium leading-6 hover:text-[${colors.special.highlight}] transition-colors duration-200 block`}>
            {navT('menu.create', 'Create')}
          </Link>
          
          {/* 分类 - 带下拉菜单 */}
          <div 
            className="relative" 
            ref={categoriesDropdownRef}
            onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
            onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
          >
            <Link 
              to={createLocalizedLink("/categories")} 
              className={`px-4 py-4 -mx-4 -my-4 text-white text-base font-medium leading-6 hover:text-[${colors.special.highlight}] transition-colors duration-200 flex items-center gap-1 group`}
            >
              {navT('menu.inspiration', 'Inspiration')}
              <svg 
                className={`w-5 h-5 transition-colors duration-200 group-hover:text-[${colors.special.highlight}]`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>

            <CategoryMenus
              isVisible={isCategoriesDropdownVisible}
              popularMenus={categoriesMenuData}
              NewMenus={[]}
              onClose={() => {
                setIsCategoriesDropdownOpen(false);
              }}
            />
          </div>

          
          <Link to={createLocalizedLink("/price")} className={`px-4 py-4 -mx-4 -my-4 text-white text-base font-medium leading-6 hover:text-[${colors.special.highlight}] transition-colors duration-200 block`}>
            {navT('menu.pricing', 'Pricing')}
          </Link>
          <Link to={createLocalizedLink("/blog")} className={`px-4 py-4 -mx-4 -my-4 text-white text-base font-medium leading-6 hover:text-[${colors.special.highlight}] transition-colors duration-200 block`}>
            {navT('menu.blog', 'Blog')}
          </Link>
        </div>

        {/* 桌面端右侧菜单 */}
        <div className="hidden lg:flex relative z-10 min-w-[300px] pr-5 justify-end items-center gap-[20px]">
          <IntlSelector />
          
          {/* 用户认证区域 */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* 积分显示 */}
              <Link 
                to={createLocalizedLink("/price")}
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg hover:bg-[#374151] transition-colors duration-200 cursor-pointer flex-shrink-0 min-w-[80px]" 
                style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM8.46191 3.11035C8.29112 2.69971 7.70888 2.69971 7.53809 3.11035L6.53027 5.5332C6.45827 5.70632 6.29529 5.82486 6.1084 5.83984L3.49219 6.0498C3.04886 6.08535 2.86926 6.6384 3.20703 6.92773L5.2002 8.63574C5.34257 8.75772 5.40483 8.94947 5.36133 9.13184L4.75195 11.6846C4.64877 12.1171 5.1195 12.4592 5.49902 12.2275L7.73926 10.8594C7.89927 10.7616 8.10073 10.7616 8.26074 10.8594L10.501 12.2275C10.8805 12.4592 11.3512 12.1171 11.248 11.6846L10.6387 9.13184C10.5952 8.94947 10.6574 8.75772 10.7998 8.63574L12.793 6.92773C13.1307 6.6384 12.9511 6.08535 12.5078 6.0498L9.8916 5.83984C9.70471 5.82486 9.54173 5.70632 9.46973 5.5332L8.46191 3.11035Z" fill="#98FF59"/>
                </svg>
                <span className="text-sm font-medium text-white tabular-nums">
                  {user ? user.credits : ''}
                </span>
              </Link>

              {/* 用户头像和下拉菜单 */}
              <div className="relative flex-shrink-0 w-[50px]" ref={userDropdownRef}>
                <div 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  style={
                    {
                      '--hover-color': colors.special.highlight,
                    } as React.CSSProperties
                  }
                >
                  {getUserAvatar() ? (
                    <img
                      className="w-6 h-6 rounded-full object-cover"
                      src={getUserAvatar()!}
                      alt="头像"
                    />
                  ) : (
                    user?.username ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#12B89B] text-white text-xs font-bold" >
                        {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                    ) : (<div className="w-6 h-6 rounded-full flex items-center justify-center" ></div>)
                  )}
                  <svg 
                    className={`w-5 h-5 transition-all duration-200 text-white group-hover:text-[var(--hover-color)] ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* 用户下拉菜单 */}
                <DropDownMenus
                  isVisible={isUserDropdownVisible}
                  isAnimating={isUserDropdownAnimating}
                  onClose={() => setIsUserDropdownOpen(false)}
                  items={[
                    {
                      type: 'header',
                      label: user?.username || '...',
                      subLabel: user?.email || '...'
                    },
                    {
                      type: 'link',
                      label: navT('menu.profile', 'Profile'),
                      href: createLocalizedLink("/profile"),
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )
                    },
                    {
                      type: 'link', 
                      label: navT('menu.myCreations', 'My Creations'),
                      href: createLocalizedLink("/creations"),
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )
                    },
                    {
                      type: 'divider'
                    },
                    {
                      type: 'button',
                      label: navT('menu.logout', 'Logout'),
                      onClick: handleLogout,
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      )
                    }
                  ]}
                />
              </div>
            </div>
          ) : !isLoading ? (
            /* 未登录状态 - 显示登录按钮 */
            <button
              onClick={openLoginModal}
              className="inline-flex items-center px-4 py-1 border border-white text-sm font-medium rounded-md text-white hover:bg-gray-800 transition-colors duration-200"
            >
              {navT('menu.login', 'Login')}
            </button>
          ) : (
            /* 加载状态 - 只在有token但正在验证时显示 */
            <div className="flex items-center gap-4">
              <div className="w-20 h-8 rounded-lg bg-gray-200 animate-pulse"></div>
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* 移动端右侧区域 */}
        <div className="lg:hidden flex items-center">
          {/* 移动端积分显示（仅在已登录时显示） */}
          {isAuthenticated && (
            <div className="pr-3">
              <Link 
                to={createLocalizedLink("/price")}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#374151] transition-colors duration-200 cursor-pointer min-w-[72px]" 
                style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM8.46191 3.11035C8.29112 2.69971 7.70888 2.69971 7.53809 3.11035L6.53027 5.5332C6.45827 5.70632 6.29529 5.82486 6.1084 5.83984L3.49219 6.0498C3.04886 6.08535 2.86926 6.6384 3.20703 6.92773L5.2002 8.63574C5.34257 8.75772 5.40483 8.94947 5.36133 9.13184L4.75195 11.6846C4.64877 12.1171 5.1195 12.4592 5.49902 12.2275L7.73926 10.8594C7.89927 10.7616 8.10073 10.7616 8.26074 10.8594L10.501 12.2275C10.8805 12.4592 11.3512 12.1171 11.248 11.6846L10.6387 9.13184C10.5952 8.94947 10.6574 8.75772 10.7998 8.63574L12.793 6.92773C13.1307 6.6384 12.9511 6.08535 12.5078 6.0498L9.8916 5.83984C9.70471 5.82486 9.54173 5.70632 9.46973 5.5332L8.46191 3.11035Z" fill="#10B981"/>
                </svg>
                <span className="text-sm font-medium text-white tabular-nums">
                  {user ? user.credits : ''}
                </span>
              </Link>
            </div>
          )}

          {/* 汉堡菜单按钮 */}
          <div className="pr-4">
            <button
              ref={hamburgerButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center"
              aria-label={t('common.buttons.openMenu')}
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {isMobileMenuVisible && (
        <div 
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-[70px] right-4 w-60 z-50 transition-all duration-200 ease-out ${
            isMobileMenuAnimating 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 -translate-y-2 scale-95'
          }`}
        >
          <div className="bg-white shadow-lg rounded-lg p-1 space-y-0.5 border border-gray-200">
            {/* 用户信息区域 */}
            {isAuthenticated ? (
              <div className="py-2 border-b border-gray-200">
                <div className="px-3 pt-2">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getUserAvatar() ? (
                        <img
                          className="w-full h-full rounded-full object-cover"
                          src={getUserAvatar()!}
                          alt="头像"
                        />
                      ) : (
                        user?.username ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#12B89B] text-white text-xs font-bold" >
                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                        ) : (<div className="w-6 h-6 rounded-full flex items-center justify-center" ></div>)
                      )}
                    </div>
                    <div className="ml-3">
                      {user?.username && (
                        <p className="text-base font-semibold leading-normal text-gray-900">{user.username}</p>
                      )}
                      <p className="text-sm text-gray-600">{user?.email || '...'}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link 
                      to={createLocalizedLink("/price")}
                      className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200 cursor-pointer inline-flex min-w-[60px] px-3 py-1.5 rounded-lg"
                      style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}
                      onClick={handleMobileLinkClick}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM8.46191 3.11035C8.29112 2.69971 7.70888 2.69971 7.53809 3.11035L6.53027 5.5332C6.45827 5.70632 6.29529 5.82486 6.1084 5.83984L3.49219 6.0498C3.04886 6.08535 2.86926 6.6384 3.20703 6.92773L5.2002 8.63574C5.34257 8.75772 5.40483 8.94947 5.36133 9.13184L4.75195 11.6846C4.64877 12.1171 5.1195 12.4592 5.49902 12.2275L7.73926 10.8594C7.89927 10.7616 8.10073 10.7616 8.26074 10.8594L10.501 12.2275C10.8805 12.4592 11.3512 12.1171 11.248 11.6846L10.6387 9.13184C10.5952 8.94947 10.6574 8.75772 10.7998 8.63574L12.793 6.92773C13.1307 6.6384 12.9511 6.08535 12.5078 6.0498L9.8916 5.83984C9.70471 5.82486 9.54173 5.70632 9.46973 5.5332L8.46191 3.11035Z" fill="#10B981"/>
                      </svg>
                      <span className="text-sm font-medium text-white tabular-nums">
                        {user ? user.credits : ''}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
            
            {/* 语言选择 - 下拉方式 */}
            <div className="py-1 border-b border-gray-200">
              <div className="px-3 relative">
                <button 
                  className="flex items-center justify-between w-full py-2 text-sm font-normal text-gray-700 transition-colors duration-200"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMobileLanguageDropdownOpen(!isMobileLanguageDropdownOpen);
                  }}
                >
                  <span className="whitespace-nowrap">
                    {language === 'zh' ? navT('language.chinese', '简体中文') : 
                     language === 'ja' ? navT('language.japanese', '日本語') : 
                     navT('language.english', 'English')}
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-all duration-200 ${isMobileLanguageDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* 下拉菜单 - 浮动样式 */}
                {isMobileLanguageVisible && (
                  <div className={`absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 transition-all duration-150 ease-out ${
                    isMobileLanguageAnimating 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 -translate-y-1 scale-95'
                  }`}>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLanguage('zh');
                        setIsMobileLanguageDropdownOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
                    >
                      {navT('language.chinese', '简体中文')} {language === 'zh' ? '✓' : ''}
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLanguage('en');
                        setIsMobileLanguageDropdownOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
                    >
                      {navT('language.english', 'English')} {language === 'en' ? '✓' : ''}
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLanguage('ja');
                        setIsMobileLanguageDropdownOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
                    >
                      {navT('language.japanese', '日本語')} {language === 'ja' ? '✓' : ''}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 导航链接 */}
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/")} 
                className={`block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[${colors.special.highlight}] hover:bg-gray-50 transition-colors duration-200`}
                onClick={handleMobileLinkClick}
              >
                {navT('menu.home', 'Home')}
              </Link>
            </div>
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/categories")} 
                className={`block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[${colors.special.highlight}] hover:bg-gray-50 transition-colors duration-200`}
                onClick={handleMobileLinkClick}
              >
                {navT('menu.inspiration', 'Inspiration')}
              </Link>
            </div>
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/create")} 
                className={`block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[${colors.special.highlight}] hover:bg-gray-50 transition-colors duration-200`}
                onClick={handleMobileLinkClick}
              >
                {navT('menu.create', 'Create')}
              </Link>
            </div>
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/price")} 
                className={`block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[${colors.special.highlight}] hover:bg-gray-50 transition-colors duration-200`}
                onClick={handleMobileLinkClick}
              >
                {navT('menu.pricing', 'Pricing')}
              </Link>
            </div>
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/blog")} 
                className={`block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[${colors.special.highlight}] hover:bg-gray-50 transition-colors duration-200`}
                onClick={handleMobileLinkClick}
              >
                {navT('menu.blog', 'Blog')}
              </Link>
            </div>

            {/* 用户菜单 */}
            {isAuthenticated && user ? (
              <>
                <div className="border-b border-gray-200">
                  <Link
                    to={createLocalizedLink("/profile")}
                    className={`block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[${colors.special.highlight}] hover:bg-gray-50 transition-colors duration-200`}
                    onClick={handleMobileLinkClick}
                  >
                    {navT('menu.profile', 'Profile')}
                  </Link>
                </div>
                <div className="border-b border-gray-200">
                  <Link
                    to={createLocalizedLink("/creations")}
                    className={`block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[${colors.special.highlight}] hover:bg-gray-50 transition-colors duration-200`}
                    onClick={handleMobileLinkClick}
                  >
                    {navT('menu.myCreations', 'My Creations')}
                  </Link>
                </div>
                <div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                  >
                    {navT('menu.logout', 'Logout')}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <button
                  onClick={() => {
                    openLoginModal();
                    setIsMobileMenuOpen(false); // 关闭移动菜单
                  }}
                  className="block w-full text-left px-3 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                >
                  {navT('menu.login', 'Login')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;