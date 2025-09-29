import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PricingService, OrderInfo } from '../services/pricingService';
import { UserService } from '../services/userService';
import { ApiError } from '../utils/apiUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { navigateWithLanguage } from '../utils/navigationUtils';
import SEOHead from '../components/common/SEOHead';
import Layout from '../components/layout/Layout';
import PasswordInput from '../components/ui/PasswordInput';

const ProfilePage: React.FC = () => {
  const { t } = useAsyncTranslation('profile');
  const { t: tCommon } = useAsyncTranslation('common');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: authUser, refreshUser, logout, isLoading: authLoading } = useAuth();
  
  const [user, setUser] = useState<typeof authUser>(null);
  const [formData, setFormData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [orderHistory, setOrderHistory] = useState<OrderInfo[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);

  const loadUserProfile = async () => {
    try {
      setIsLoadingUser(true);
      
      // 此时 authUser 已经确保不为 null（在 useEffect 中检查过）
      if (!authUser) {
        console.error('loadUserProfile called without authUser');
        return;
      }

      setUser(authUser);
      setFormData(prev => ({
        ...prev,
        username: authUser.username
      }));
      setAvatarPreview(authUser.avatar || '');
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setErrors({ general: t('messages.loadUserFailed') });
    } finally {
      setIsLoadingUser(false);
    }
  };

  const loadOrderHistory = async () => {
    try {
      setIsLoadingOrders(true);
      
      // 获取全部订单记录，不分页
      const response = await PricingService.getOrderHistory(1, 1000);
      setOrderHistory(response || []);
    } catch (error) {
      console.error('Failed to load order history:', error);
      // 确保在出错时设置为空数组，避免 undefined
      setOrderHistory([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }

  // 处理认证状态变化
  useEffect(() => {
    // 等待认证初始化完成
    if (authLoading) {
      return;
    }
    
    // 如果认证完成但用户未登录，跳转到登录页面
    if (!authUser) {
      navigateWithLanguage(navigate, '/login', { 
        state: { 
          from: { pathname: '/profile' },
          message: t('messages.loginRequired')
        }
      });
      return;
    }
    
    // 如果用户已登录，初始化用户数据
    loadUserProfile();
  }, [authLoading]);

  // 加载订单历史
  useEffect(() => {
    if (user) {
      loadOrderHistory();
    }
  }, [user]);

  // 表单验证
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.username.trim()) {
      newErrors.username = t('errors.username.required');
    } else if (formData.username.length < 2) {
      newErrors.username = t('errors.username.minLength');
    } else if (formData.username.length > 20) {
      newErrors.username = t('errors.username.maxLength');
    }

    if (formData.newPassword || formData.currentPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = t('errors.password.currentRequired');
      }

      if (!formData.newPassword) {
        newErrors.newPassword = t('errors.password.newRequired');
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = t('errors.password.minLength');
      } else if (formData.newPassword.length > 50) {
        newErrors.newPassword = t('errors.password.maxLength');
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t('errors.password.confirmRequired');
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = t('errors.password.confirmMismatch');
      }

      if (formData.currentPassword === formData.newPassword) {
        newErrors.newPassword = t('errors.password.samePassword');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 实时密码校验
    if (name === 'newPassword') {
      const newErrors: {[key: string]: string} = {};
      
      if (value && value.length < 6) {
        newErrors.newPassword = t('errors.password.minLength');
      } else if (value && value.length > 50) {
        newErrors.newPassword = t('errors.password.maxLength');
      } else if (value && formData.currentPassword && value === formData.currentPassword) {
        newErrors.newPassword = t('errors.password.samePassword');
      }
      
      // 如果确认新密码已经输入，检查是否匹配
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newErrors.confirmPassword = t('errors.password.confirmMismatch');
      } else if (formData.confirmPassword && value === formData.confirmPassword) {
        // 密码匹配时清除确认密码错误
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
      
      setErrors(prev => ({
        ...prev,
        newPassword: newErrors.newPassword || '',
        ...(newErrors.confirmPassword !== undefined && { confirmPassword: newErrors.confirmPassword })
      }));
    } else if (name === 'confirmPassword') {
      // 确认新密码实时校验
      const newErrors: {[key: string]: string} = {};
      
      if (value && formData.newPassword !== value) {
        newErrors.confirmPassword = t('errors.password.confirmMismatch');
      }
      
      setErrors(prev => ({
        ...prev,
        confirmPassword: newErrors.confirmPassword || ''
      }));
    } else {
      // 其他字段清除错误
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // 处理头像选择
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ avatar: t('errors.avatar.fileType') });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatar: t('errors.avatar.fileSize') });
      return;
    }

    setSelectedAvatarFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (errors.avatar) {
      setErrors(prev => ({
        ...prev,
        avatar: ''
      }));
    }
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };


  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const updateData: any = {};
      if (formData.username !== user?.username) {
        updateData.username = formData.username.trim();
      }
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }
      
      if (Object.keys(updateData).length > 0) {
        await UserService.updateUser(updateData);
      }

      if (selectedAvatarFile) {
        await UserService.uploadAvatar(selectedAvatarFile);
      }

      await refreshUser();

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSelectedAvatarFile(null);

      setSuccessMessage(t('messages.success'));
    } catch (error) {
      console.error('Update profile failed:', error);
      
      if (error instanceof ApiError) {
        switch (error.errorCode) {
          case '1002':
            setErrors({ username: t('errors.username.exists') });
            break;
          case '1005':
            setErrors({ currentPassword: t('errors.password.currentIncorrect') });
            break;
          case '1003':
            setErrors({ general: t('errors.format') });
            break;
          case '3001':
            setErrors({ avatar: t('errors.avatar.uploadFailed') });
            break;
          default:
            setErrors({ general: error.message || t('errors.updateFailed') });
        }
      } else {
        setErrors({ general: t('messages.networkError') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // 获取订单状态显示
  const getOrderStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: t('orderTable.paid'), className: 'bg-green-100 text-green-800' };
      case 'failed':
        return { text: t('orderTable.failed'), className: 'bg-red-100 text-red-800' };
      case 'pending':
        return { text: t('orderTable.pending'), className: 'bg-yellow-100 text-yellow-800' };
      case 'cancelled':
        return { text: t('orderTable.cancelled'), className: 'bg-gray-100 text-gray-800' };
      default:
        return { text: t('orderTable.unpaid'), className: 'bg-red-100 text-red-800' };
    }
  };



  // 显示加载状态：认证初始化期间或用户数据加载期间
  if (authLoading || isLoadingUser) {
    return null;
  }

  return (
    <Layout>
      <SEOHead
        title={tCommon('seo.profile.title')}
        description={tCommon('seo.profile.description')}
        canonicalUrl={`${window.location.origin}/profile`}
      />
      <div className="min-h-screen" style={{backgroundColor: '#030414'}}>
        <div className="max-w-screen-xl px-4 pt-6 pb-10 mx-auto">
        {/* 用户信息区域 */}
        <div className="rounded-lg shadow-sm border mb-6" style={{backgroundColor: '#19191F', borderColor: '#131317'}}>
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* 用户基本信息 */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview || user?.avatar ? (
                    <img
                      className="w-16 h-16 rounded-full object-cover"
                      src={avatarPreview || user?.avatar || '/imgs/default-avatar.svg'}
                      alt={t('avatar')}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="absolute inset-0 w-full h-full rounded-full bg-[#030414] bg-opacity-50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-semibold" style={{color: '#98FF59'}}>{user?.username}</h2>
                  <p style={{color: '#CCCCCC'}}>{user?.email}</p>
                </div>
              </div>

              {/* 积分信息 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM8.46191 3.11035C8.29112 2.69971 7.70888 2.69971 7.53809 3.11035L6.53027 5.5332C6.45827 5.70632 6.29529 5.82486 6.1084 5.83984L3.49219 6.0498C3.04886 6.08535 2.86926 6.6384 3.20703 6.92773L5.2002 8.63574C5.34257 8.75772 5.40483 8.94947 5.36133 9.13184L4.75195 11.6846C4.64877 12.1171 5.1195 12.4592 5.49902 12.2275L7.73926 10.8594C7.89927 10.7616 8.10073 10.7616 8.26074 10.8594L10.501 12.2275C10.8805 12.4592 11.3512 12.1171 11.248 11.6846L10.6387 9.13184C10.5952 8.94947 10.6574 8.75772 10.7998 8.63574L12.793 6.92773C13.1307 6.6384 12.9511 6.08535 12.5078 6.0498L9.8916 5.83984C9.70471 5.82486 9.54173 5.70632 9.46973 5.5332L8.46191 3.11035Z" fill="#98FF59"/>
                  </svg>
                  <span className="text-sm font-medium text-white tabular-nums">
                    {user ? user.credits : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 订单记录 */}
        <div className="rounded-lg shadow-sm border mb-6" style={{backgroundColor: '#19191F', borderColor: '#131317'}}>
          <div className="px-6 py-4 border-b" style={{borderColor: '#131317'}}>
            <h1 className="text-lg font-semibold text-white">{t('sections.orderHistory')}</h1>
          </div>
          <div className="px-6 py-4">
            {isLoadingOrders ? null : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{backgroundColor: '#131317'}}>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider" style={{color: '#CCCCCC'}}>
                          {t('orderTable.orderId')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider" style={{color: '#CCCCCC'}}>
                          {t('orderTable.planInfo')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider" style={{color: '#CCCCCC'}}>
                          {t('orderTable.amount')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider" style={{color: '#CCCCCC'}}>
                          {t('orderTable.createdAt')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider" style={{color: '#CCCCCC'}}>
                          {t('orderTable.paymentStatus')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{backgroundColor: '#19191F', borderColor: '#131317'}}>
                      {orderHistory && orderHistory.length > 0 ? (
                          orderHistory.map((order) => {
                            const statusDisplay = getOrderStatusDisplay(order.status);
                            return (
                              <tr key={order.orderId}>
                                <td className="px-4 py-4 whitespace-nowrap" style={{color: '#CCCCCC'}}>
                                  <h3 className="text-sm font-medium">{order.orderId}</h3>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm" style={{color: '#CCCCCC'}}>
                                  <div className="flex items-center gap-2">
                                    <span>{order.planCode}</span>
                                    <span>{order.chargeType}</span>
                                    {order.creditsAdded > 0 && (
                                      <span style={{color: '#98FF59'}}>+{order.creditsAdded} 积分</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm" style={{color: '#CCCCCC'}}>
                                  {order.amount} {order.currency}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm" style={{color: '#CCCCCC'}}>
                                  {new Date(order.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusDisplay.className}`}>
                                    {statusDisplay.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center" style={{color: '#CCCCCC'}}>
                              {t('orderTable.noOrders')}
                            </td>
                          </tr>
                        )
                      }
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 基本信息和密码修改 */}
        <div className="rounded-lg shadow-sm border" style={{backgroundColor: '#19191F', borderColor: '#131317'}}>
          <div className="px-6 py-4 border-b" style={{borderColor: '#131317'}}>
            <h2 className="text-lg font-semibold text-white">{t('sections.basicInfo')}</h2>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {successMessage && (
              <div className="rounded-md p-4" style={{backgroundColor: '#1a4f3a'}}>
                <div className="text-sm" style={{color: '#98FF59'}}>{successMessage}</div>
              </div>
            )}

            {errors.general && (
              <div className="rounded-md p-4" style={{backgroundColor: '#4a1a1a'}}>
                <div className="text-sm" style={{color: '#ff6b6b'}}>{errors.general}</div>
              </div>
            )}

            {errors.avatar && (
              <div className="rounded-md p-4" style={{backgroundColor: '#4a1a1a'}}>
                <div className="text-sm" style={{color: '#ff6b6b'}}>{errors.avatar}</div>
              </div>
            )}
            {/* 用户名 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium" style={{color: '#CCCCCC'}}>
                {t('fields.username')}
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm`}
                  style={{
                    backgroundColor: '#131317',
                    borderColor: errors.username ? '#ff6b6b' : '#666666',
                    color: '#CCCCCC'
                  }}
                  placeholder={t('placeholders.username')}
                />
                {errors.username && (
                  <p className="mt-1 text-sm" style={{color: '#ff6b6b'}}>{errors.username}</p>
                )}
              </div>
            </div>

            {/* 邮箱（只读） */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{color: '#CCCCCC'}}>
                {t('fields.email')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm"
                  style={{
                    backgroundColor: '#0f0f0f',
                    borderColor: '#666666',
                    color: '#888888'
                  }}
                />
                <p className="mt-1 text-xs" style={{color: '#888888'}}>{t('hints.emailReadonly')}</p>
              </div>
            </div>

            {/* 密码修改 - 可折叠 */}
            <div className="border rounded-lg" style={{borderColor: '#131317'}}>
              <button
                type="button"
                onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
                className="w-full px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-inset"
                style={{
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#131317';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <h4 className="text-md font-medium" style={{color: '#98FF59'}}>{t('sections.changePassword')}</h4>
                <svg
                  className={`h-5 w-5 transition-transform ${isPasswordSectionOpen ? 'rotate-180' : ''}`}
                  style={{color: '#98FF59'}}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isPasswordSectionOpen && (
                <div className="px-4 pb-4 space-y-1 border-t" style={{borderColor: '#131317'}}>
                  
                  {/* 当前密码 */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium mt-4" style={{color: '#CCCCCC'}}>
                      {t('fields.currentPassword')}
                    </label>
                    <div className="mt-1">
                      <PasswordInput
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder={t('placeholders.currentPassword')}
                        error={errors.currentPassword}
                        className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <div className="mt-1 h-5">
                        {errors.currentPassword && (
                          <p className="text-sm" style={{color: '#ff6b6b'}}>{errors.currentPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 新密码 */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium" style={{color: '#CCCCCC'}}>
                      {t('fields.newPassword')}
                    </label>
                    <div className="mt-1">
                      <PasswordInput
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder={t('placeholders.newPassword')}
                        error={errors.newPassword}
                        className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <div className="mt-1 h-5">
                        {errors.newPassword && (
                          <p className="text-sm" style={{color: '#ff6b6b'}}>{errors.newPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 确认新密码 */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{color: '#CCCCCC'}}>
                      {t('fields.confirmPassword')}
                    </label>
                    <div className="mt-1">
                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder={t('placeholders.confirmPassword')}
                        error={errors.confirmPassword}
                        className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <div className="mt-1 h-5">
                        {errors.confirmPassword && (
                          <p className="text-sm" style={{color: '#ff6b6b'}}>{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 按钮组 */}
            <div className="flex justify-between pt-6 border-t" style={{borderColor: '#131317'}}>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: '#131317',
                  borderColor: '#666666',
                  color: '#CCCCCC'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#19191F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#131317';
                }}
              >
                {t('buttons.logout')}
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: '#131317',
                    borderColor: '#666666',
                    color: '#CCCCCC'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#19191F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#131317';
                  }}
                >
                  {t('buttons.cancel')}
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#98FF59',
                    color: '#030414'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#7BCC47';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#98FF59';
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" style={{color: '#030414'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    t('buttons.save')
                  )}
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </form>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 