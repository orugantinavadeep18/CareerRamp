/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        bg: '#0a0a0f',
        surface: '#12121a',
        surface2: '#1a1a26',
        amber: {
          DEFAULT: '#f59e0b',
          light: '#fcd34d',
          glow: 'rgba(245,158,11,0.15)',
        },
        rose: { DEFAULT: '#f43f5e' },
        teal: { DEFAULT: '#14b8a6' },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'pulse-slow': 'pulse 2s infinite',
        'bounce-dot': 'bounceDot 1.2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 25%, rgba(245,158,11,0.1) 50%, transparent 75%)',
      },
    },
  },
  plugins: [],
}
