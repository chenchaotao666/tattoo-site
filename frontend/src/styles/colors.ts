// 全局颜色配置
export const colors = {
  // 主要颜色
  primary: {
    50: '#f0fff4',
    100: '#dcfce7', 
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#98FF59', // 主要高亮色
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // 背景颜色
  background: {
    primary: '#030414',    // 主背景色
    secondary: '#19191F',  // 次要背景色
    card: '#26262D',       // 卡片背景色
    hover: '#2A2A31',      // 悬停背景色
  },

  // 文字颜色
  text: {
    primary: '#FFFFFF',    // 主要文字
    secondary: '#ECECEC',  // 次要文字
    muted: '#C8C8C8',      // 弱化文字
    placeholder: '#818181', // 占位符文字
    disabled: '#A5A5A5',   // 禁用文字
  },

  // 边框颜色
  border: {
    primary: '#393B42',    // 主要边框
    secondary: '#26262D',  // 次要边框
    hover: '#4B5563',      // 悬停边框
  },

  // 状态颜色
  status: {
    success: '#98FF59',    // 成功状态 (与主要高亮色一致)
    error: '#EF4444',      // 错误状态
    warning: '#F59E0B',    // 警告状态
    info: '#3B82F6',       // 信息状态
  },

  // 渐变色
  gradient: {
    primary: 'linear-gradient(90deg, #59FFD0 0%, #98FF59 100%)',
    primaryGlow: 'linear-gradient(90deg, rgba(89, 255, 207, 0.40) 0%, rgba(152, 255, 89, 0.40) 100%)',
  },

  // 特殊颜色
  special: {
    highlight: '#98FF59',  // 统一高亮色
    accent: '#FF5C07',     // 强调色
    black: '#000000',
    white: '#FFFFFF',
    transparent: 'transparent',
  }
} as const;

// 导出类型定义
export type Colors = typeof colors;
export type ColorKeys = keyof Colors;
export type ColorValue = string;

// 获取颜色值的辅助函数
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let result: any = colors;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      console.warn(`Color path "${path}" not found, falling back to primary highlight`);
      return colors.special.highlight;
    }
  }
  
  return typeof result === 'string' ? result : colors.special.highlight;
};

// 常用颜色快捷方式
export const commonColors = {
  highlight: colors.special.highlight,
  background: colors.background.primary,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  borderPrimary: colors.border.primary,
  success: colors.status.success,
  error: colors.status.error,
} as const;