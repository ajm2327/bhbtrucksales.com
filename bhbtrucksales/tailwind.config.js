/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f2',
          100: '#fce7e7',
          200: '#f9d2d2',
          300: '#f4b0b0',
          400: '#ec8181',
          500: '#dc4444',
          600: '#c53030',
          700: '#9b2c2c',
          800: '#822727',
          900: '#6b2c2c',
          950: '#4a0000',
        },
        primary: {
          50: '#fdf2f2',
          500: '#8B0000',
          600: '#7a0000',
          700: '#690000',
          800: '#580000',
          900: '#4a0000',
        }
      },
      animation: {
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}