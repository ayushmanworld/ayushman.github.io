import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ayushman Brand — Warm Palette
        amber: {
          DEFAULT: '#C8782A',
          50: '#FBF0DC',
          100: '#F7E0B8',
          200: '#EFC070',
          300: '#E8A030',
          400: '#D88C20',
          500: '#C8782A',
          600: '#A86020',
          700: '#885018',
          800: '#4A3728',
          900: '#2A1C10',
        },
        teal: {
          DEFAULT: '#2D7A6B',
          50: '#E0F0EC',
          100: '#C0E1D8',
          200: '#80C3B1',
          300: '#40A58A',
          400: '#388F78',
          500: '#2D7A6B',
          600: '#256558',
          700: '#1D5045',
          800: '#153B32',
          900: '#0D261F',
        },
        navy: {
          DEFAULT: '#1E2D3D',
          50: '#E8EBF0',
          100: '#D1D7E0',
          200: '#A3AFC1',
          300: '#7587A2',
          400: '#476083',
          500: '#1E2D3D',
          600: '#182433',
          700: '#121C28',
          800: '#0C141E',
          900: '#060C14',
        },
        cream: {
          DEFAULT: '#F5F0E8',
          50: '#FDFAF5',
          100: '#F5F0E8',
          200: '#EDE8DC',
          300: '#DDD6C8',
          400: '#CCC2B0',
          500: '#B8A898',
        },
        muted: {
          DEFAULT: '#6B5D50',
          foreground: '#8B7B6E',
        },

        // shadcn/ui semantic tokens
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },

      fontFamily: {
        sans: ['var(--font-dm-sans)', ...fontFamily.sans],
        serif: ['var(--font-playfair)', ...fontFamily.serif],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      boxShadow: {
        warm: '0 4px 28px rgba(44, 36, 22, 0.10)',
        'warm-sm': '0 2px 12px rgba(44, 36, 22, 0.07)',
        'warm-lg': '0 8px 48px rgba(44, 36, 22, 0.14)',
        'warm-xl': '0 20px 80px rgba(44, 36, 22, 0.20)',
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.6' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}

export default config
