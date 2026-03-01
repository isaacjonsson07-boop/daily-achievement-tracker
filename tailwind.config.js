/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sa: {
          // Backgrounds (lighter for better readability)
          bg: '#252730',
          'bg-warm': '#2C2E38',
          'bg-lift': '#343640',
          'bg-hover': '#3C3E49',

          // Text hierarchy (brighter across the board)
          cream: '#FFFFFF',
          'cream-soft': '#F0EDE6',
          'cream-muted': '#D4D0C8',
          'cream-faint': '#ADA9A0',

          // Accent — gold (primary brand)
          gold: '#D4B478',
          'gold-light': '#DFCA98',
          'gold-soft': 'rgba(212, 180, 120, 0.15)',
          'gold-border': 'rgba(212, 180, 120, 0.30)',

          // Semantic — success
          green: '#5ADB7E',
          'green-soft': 'rgba(90, 219, 126, 0.14)',
          'green-border': 'rgba(90, 219, 126, 0.30)',

          // Semantic — warning / attention
          rose: '#E07070',
          'rose-soft': 'rgba(230, 100, 100, 0.12)',
          'rose-border': 'rgba(230, 100, 100, 0.25)',

          // Semantic — info / neutral accent
          blue: '#6DB5F5',
          'blue-soft': 'rgba(109, 181, 245, 0.14)',
          'blue-border': 'rgba(109, 181, 245, 0.30)',

          // Borders and dividers
          border: 'rgba(240, 237, 230, 0.16)',
          'border-light': 'rgba(240, 237, 230, 0.24)',
          'border-active': 'rgba(201, 169, 110, 0.60)',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.5' }],
        'sm': ['0.9375rem', { lineHeight: '1.6' }],
        'base': ['1.0625rem', { lineHeight: '1.7' }],
        'lg': ['1.1875rem', { lineHeight: '1.6' }],
        'xl': ['1.375rem', { lineHeight: '1.4' }],
        '2xl': ['1.75rem', { lineHeight: '1.3' }],
        '3xl': ['2.125rem', { lineHeight: '1.2' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'sa': '8px',
        'sa-sm': '6px',
        'sa-lg': '12px',
      },
      boxShadow: {
        'sa': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'sa-lg': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        'sa-glow': '0 0 20px rgba(201, 169, 110, 0.08)',
      },
      animation: {
        'rise': 'rise 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
      },
    },
  },
  plugins: [],
};
