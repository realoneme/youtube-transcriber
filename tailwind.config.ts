import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 背景色
        'bg-main': 'var(--color-bg-main)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-elevated': 'var(--color-bg-elevated)',

        // 文字色
        'text-main': 'var(--color-text-main)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-disabled': 'var(--color-text-disabled)',

        // 品牌色
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-light': 'var(--color-primary-light)',

        // 语义色
        info: 'var(--color-info)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',

        // 其他
        divider: 'var(--color-divider)',
        outline: 'var(--color-outline)',
      },
      boxShadow: {
        'glow-red': 'var(--shadow-glow-red)',
        'glow-blue': 'var(--shadow-glow-blue)',
        'glow-green': 'var(--shadow-glow-green)',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
