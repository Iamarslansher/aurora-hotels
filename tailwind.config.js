/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#1E354F',
          900: '#0B1F38', // Deep Navy brand primary
          950: '#061324',
        },
        ivory: {
          DEFAULT: '#F8F5EF', // Warm Ivory brand primary
          50: '#FFFFFF',
          100: '#FAF8F4',
          200: '#F8F5EF',
          300: '#EDE7D8',
          400: '#E2DAC1',
          500: '#D6CBA9',
        },
        gold: {
          50: '#FAF5ED',
          100: '#F4E8D4',
          200: '#EDDAB9',
          300: '#E5CB9E',
          400: '#DEBD8D',
          500: '#D4AF7C', // Champagne Gold brand primary
          600: '#B88E52',
          700: '#946F38',
          800: '#705125',
          900: '#4D3616',
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#138B68', // Emerald Green brand primary
          600: '#0E7053',
          700: '#0A563F',
          800: '#063C2C',
          900: '#03251B',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(11, 31, 56, 0.12)',
        'luxury-lg': '0 25px 50px -12px rgba(11, 31, 56, 0.22)',
        'gold-glow': '0 0 25px rgba(212, 175, 124, 0.35)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F4E8D4 0%, #D4AF7C 50%, #B88E52 100%)',
        'navy-gradient': 'linear-gradient(180deg, #0B1F38 0%, #061324 100%)',
        'ivory-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F8F5EF 100%)',
      },
    },
  },
  plugins: [],
}
