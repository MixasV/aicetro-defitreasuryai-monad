import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d6e4ff',
          200: '#b4cdfc',
          300: '#8bb0f8',
          400: '#5e8ef5',
          500: '#346ef0',
          600: '#1f55d6',
          700: '#173ea6',
          800: '#132f80',
          900: '#102460'
        },
        success: '#22c55e',
        warning: '#fbbf24',
        danger: '#ef4444'
      },
      boxShadow: {
        card: '0 20px 45px -20px rgba(36, 99, 235, 0.35)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
