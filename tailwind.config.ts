import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
    './fsd/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
      },
      colors: {
        primary: '#48494F',
        secondary: '#8C8C8C',
      },
      keyframes: {
        'status-ambient': {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)', boxShadow: '0 0 0 0 rgba(251,146,60,0.22)' },
          '45%': { transform: 'translate3d(0, -1px, 0) scale(1.008)', boxShadow: '0 12px 32px -18px rgba(251,146,60,0.45)' },
          '70%': { transform: 'translate3d(0, 1px, 0) scale(0.998)', boxShadow: '0 0 0 0 rgba(251,146,60,0.12)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1)', boxShadow: '0 0 0 0 rgba(251,146,60,0.22)' },
        },
        'status-core': {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.12)' },
        },
        'interface-breathe': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)', filter: 'saturate(100%) brightness(100%)' },
          '55%': { transform: 'translate3d(0,-1.2px,0) scale(0.998)', filter: 'saturate(104%) brightness(103%)' },
        },
        'interface-lilt': {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%': { transform: 'translate3d(0,-0.6px,0)' },
          '70%': { transform: 'translate3d(0,0.6px,0)' },
        },
        'border-liquid': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(148, 163, 184, 0.12)',
            borderColor: 'rgba(255,255,255,0.14)',
          },
          '45%': {
            boxShadow: '0 18px 46px -18px rgba(59, 130, 246, 0.30)',
            borderColor: 'rgba(125, 211, 252, 0.35)',
          },
          '60%': {
            boxShadow: '0 12px 32px -16px rgba(244, 114, 182, 0.25)',
            borderColor: 'rgba(244, 114, 182, 0.3)',
          },
        },
        'typing-dot': {
          '0%, 80%, 100%': {
            opacity: '0.3',
            transform: 'scale(0.8) translateY(0px)',
            filter: 'blur(0.5px)',
          },
          '40%': {
            opacity: '1',
            transform: 'scale(1.2) translateY(-3px)',
            filter: 'blur(0px)',
          },
        },
        'gradient-wave': {
          '0%': {
            backgroundPosition: '0% 50%',
            backgroundSize: '200% 200%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
            backgroundSize: '200% 200%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
            backgroundSize: '200% 200%',
          },
        },
        'button-warp': {
          '0%, 100%': {
            transform: 'scale(1) perspective(1000px) rotateX(0deg)',
            boxShadow: '0 8px 20px -6px rgba(251,146,60,0.35)',
          },
          '25%': {
            transform: 'scale(1.015) perspective(1000px) rotateX(1deg)',
            boxShadow: '0 12px 28px -4px rgba(244,114,182,0.45)',
          },
          '50%': {
            transform: 'scale(1.02) perspective(1000px) rotateX(0deg)',
            boxShadow: '0 14px 32px -2px rgba(236,72,153,0.5)',
          },
          '75%': {
            transform: 'scale(1.015) perspective(1000px) rotateX(-1deg)',
            boxShadow: '0 12px 28px -4px rgba(244,114,182,0.45)',
          },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blob-drift-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.6' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)', opacity: '0.8' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)', opacity: '0.5' },
        },
        'blob-drift-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.5' },
          '25%': { transform: 'translate(-40px, 30px) scale(1.05)', opacity: '0.7' },
          '50%': { transform: 'translate(20px, -20px) scale(1.15)', opacity: '0.6' },
          '75%': { transform: 'translate(-10px, -40px) scale(0.9)', opacity: '0.55' },
        },
        'blob-drift-3': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.55' },
          '40%': { transform: 'translate(50px, 20px) scale(1.08)', opacity: '0.7' },
          '70%': { transform: 'translate(-30px, -30px) scale(0.92)', opacity: '0.45' },
        },
      },
      animation: {
        'status-ambient': 'status-ambient 2.8s ease-in-out infinite',
        'status-core': 'status-core 1.4s ease-in-out infinite',
        'interface-breathe': 'interface-breathe 9s ease-in-out infinite',
        'interface-lilt': 'interface-lilt 12s ease-in-out infinite',
        'border-liquid': 'border-liquid 5.5s ease-in-out infinite',
        'typing-dot': 'typing-dot 1.4s ease-in-out infinite',
        'gradient-wave': 'gradient-wave 3s ease-in-out infinite',
        'button-warp': 'button-warp 4s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'blob-drift-1': 'blob-drift-1 8s ease-in-out infinite',
        'blob-drift-2': 'blob-drift-2 10s ease-in-out infinite',
        'blob-drift-3': 'blob-drift-3 12s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
