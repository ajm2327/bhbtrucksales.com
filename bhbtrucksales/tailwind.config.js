/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f2',
          100: '#fce7e7',
          200: '#f9d2d2',
          300: '#f4b0b0',
          400: '#ec8181',
          500: '#8B0000',
          600: '#7a0000',
          700: '#690000',
          800: '#580000',
          900: '#4a0000',
        }
      }
    },
  },
  plugins: [],
}