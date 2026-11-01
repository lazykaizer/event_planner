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
          900: '#7A1634',  /* maroon */
          950: '#4A0D22',  /* deep maroon ink */
        },
        ink: '#4A0D22',
        marigold: {
          DEFAULT: '#FF9F1C',
          light: '#FFC857',
          dark: '#E0850B',
        },
        gold: {
          antique: '#C9962B',
          light: '#E5B955',
        },
        sand: {
          warm: '#F3E6CC',
          light: '#FAF3E5',
        },
        teal: {
          peacock: '#0E7C7B',
          light: '#E2F3F2',
        },
        danger: {
          DEFAULT: '#C62839',
          light: '#FDECEE',
        },
        saffron: {
          50: '#fff8ed',
          100: '#ffeed4',
          200: '#ffd9a8',
          300: '#ffbe71',
          400: '#ff9838',
          500: '#FF9F1C', /* mapped to marigold */
          600: '#f06006',
          700: '#c74807',
          800: '#9e390e',
          900: '#7f300f',
          950: '#451605',
        },
        cream: {
          50: '#FFF7E8',  /* page background */
          100: '#FDF3E0',
          200: '#F3E6CC', /* warm sand */
          300: '#ECD8B5',
          400: '#E1C493',
          500: '#D4AF72',
          600: '#C29853',
          700: '#A67E39',
          800: '#85632A',
          900: '#64481C',
          950: '#38260C',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'Inter', 'system-ui', 'sans-serif'],
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
