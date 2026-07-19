import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ayushman Brand
        amber: {
          DEFAULT: '#C8782A',
          light: '#E8941A',
          pale: '#FBF0DC',
          dark: '#4A3728',
        },
        teal: {
          DEFAULT: '#2D7A6B',
          light: '#3D9B8A',
          pale: '#E0F0EC',
        },
        navy: {
          DEFAULT: '#1E2D3D',
          dark: '#0f1e2e',
        },
        cream: {
          DEFAULT: '#F5F0E8',
          2: '#EDE8DC',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'warm': '0 4px 28px rgba(44, 36, 22, 0.10)',
        'warm-sm': '0 2px 12px rgba(44, 36, 22, 0.07)',
        'warm-lg': '0 8px 48px rgba(44, 36, 22, 0.14)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.6' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
