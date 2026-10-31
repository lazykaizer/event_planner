/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a9b9',
          400: '#ed7793',
          500: '#e04b6f',
          600: '#cc2952',
          700: '#a91d42',
          800: '#8b1a3b',
          900: '#6b1530',  /* deep maroon primary */
          950: '#400a1a',
        },
        saffron: {
          50: '#fff8ed',
          100: '#ffeed4',
          200: '#ffd9a8',
          300: '#ffbe71',
          400: '#ff9838',
          500: '#ff7b11',
          600: '#f06006',
          700: '#c74807',
          800: '#9e390e',
          900: '#7f300f',
          950: '#451605',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf8f0',
          200: '#faf0de',
          300: '#f5e3c5',
          400: '#efd1a3',
          500: '#e7bb7f',
          600: '#dca05c',
          700: '#cc8643',
          800: '#a66c38',
          900: '#875930',
          950: '#482d17',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
