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
        slate: {
          950: '#050605',
          900: '#0B0D0B',
          800: '#111411',
          700: '#292D29',
          600: '#3B433B',
          500: '#6F766F',
          400: '#A3AAA3',
          300: '#C7CEC4',
          200: '#E0E6DC',
          100: '#F2F4F0'
        },
        dark: {
          900: '#0B0D0B',
          800: '#111411',
          700: '#292D29',
          600: '#3B433B'
        },
        emerald: {
          300: '#BEF264',
          400: '#A3E635',
          500: '#84A93B',
          600: '#6F8F32',
          900: '#26351B'
        },
        cyan: {
          300: '#BEF264',
          400: '#A3E635',
          500: '#84A93B',
          900: '#26351B'
        },
        amber: {
          300: '#FDE68A',
          400: '#EAB308',
          500: '#CA8A04',
          900: '#422006'
        },
        rose: {
          300: '#FCA5A5',
          400: '#EF4444',
          500: '#DC2626',
          900: '#450A0A'
        },
        violet: {
          300: '#BEF264',
          400: '#A3E635',
          500: '#84A93B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
