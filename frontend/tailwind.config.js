/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f3ff',
          100: '#dde3ff',
          200: '#c2ccff',
          300: '#9aabff',
          400: '#697fff',
          500: '#4257fb',
          600: '#2c3aef',
          700: '#242dd4',
          800: '#2028ab',
          900: '#1e2787',
          950: '#131650',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 2px 20px rgba(19,22,80,0.07)',
        'card-lg':  '0 8px 40px rgba(19,22,80,0.12)',
        glow:       '0 0 30px rgba(66,87,251,0.2)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
