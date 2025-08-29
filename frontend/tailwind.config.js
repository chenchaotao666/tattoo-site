import { colors as customColors } from './src/styles/colors.ts';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 引用全局颜色配置
        ...customColors,
        // 保留现有的 Tailwind 语义化颜色
        primary: {
          DEFAULT: customColors.special.highlight,
          foreground: customColors.text.primary,
        },
        secondary: {
          DEFAULT: "#F9FAFB",
          foreground: customColors.text.disabled,
        },
        destructive: {
          DEFAULT: customColors.status.error,
          foreground: customColors.text.primary,
        },
        accent: {
          DEFAULT: customColors.special.accent,
        },
        background: customColors.background.primary,
        border: customColors.border.primary,
        input: "#E5E7EB",
        ring: customColors.special.highlight,
        // 添加语义化别名
        highlight: customColors.special.highlight,
        success: customColors.status.success,
        warning: customColors.status.warning,
        info: customColors.status.info,
      },
    },
  },
  plugins: [],
} 