/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sa: {
          // Backgrounds (Claude-style warm cream)
          bg: '#F4F3EE',
          'bg-warm': '#EDECE7',
          'bg-lift': '#E5E4DF',
          'bg-hover': '#DDDCD7',

          // Text hierarchy (dark text on light bg)
          cream: '#1A1A1A',
          'cream-soft': '#2E2E2E',
          'cream-muted': '#5C5C5C',
          'cream-faint': '#8A8A85',

          // Accent — gold (primary brand)
          gold: '#A8863A',
          'gold-light': '#C09E52',
          'gold-soft': 'rgba(168, 134, 58, 0.10)',
          'gold-border': 'rgba(168, 134, 58, 0.25)',

          // Semantic — success
          green: '#2D8A4E',
          'green-soft': 'rgba(45, 138, 78, 0.10)',
          'green-border': 'rgba(45, 138, 78, 0.25)',

          // Semantic — warning / attention
          rose: '#C94444',
          'rose-soft': 'rgba(201, 68, 68, 0.08)',
          'rose-border': 'rgba(201, 68, 68, 0.20)',

          // Semantic — info / neutral accent
          blue: '#3B7DD8',
          'blue-soft': 'rgba(59, 125, 216, 0.10)',
          'blue-border': 'rgba(59, 125, 216, 0.25)',

          // Borders and dividers
          border: 'rgba(0, 0, 0, 0.08)',
          'border-light': 'rgba(0, 0, 0, 0.12)',
          'border-active': 'rgba(168, 134, 58, 0.40)',
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
