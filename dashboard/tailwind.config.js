/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'runeflow': {
          50: '#fef7f0',
          100: '#feeee0',
          200: '#fcd9b8',
          300: '#f9c08a',
          400: '#f59e5b',
          500: '#ff6b35',
          600: '#ed5a2b',
          700: '#c64622',
          800: '#9d3920',
          900: '#7e301c',
        },
        'runic-gold': {
          50: '#fefbf3',
          100: '#fdf6e3',
          200: '#faebc1',
          300: '#f6dc94',
          400: '#f0c565',
          500: '#d4af37',
          600: '#c19b2d',
          700: '#a18226',
          800: '#836a23',
          900: '#6b5621',
        },
        'dark': {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#0a0a0a',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'runic-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-in',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { 
            boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)',
            transform: 'scale(1)',
          },
          '100%': { 
            boxShadow: '0 0 40px rgba(255, 107, 53, 0.6)',
            transform: 'scale(1.02)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      fontFamily: {
        'norse': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
