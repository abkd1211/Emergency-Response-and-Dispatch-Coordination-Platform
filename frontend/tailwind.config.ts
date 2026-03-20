import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Bespoke Colour System ─────────────────────────────────────────────
      colors: {
        // Dark Mode — "Midnight Tactical"
        obsidian: {
          950: '#05050A',
          900: '#0A0A0C',
          800: '#121216',
          700: '#1A1A20',
          600: '#222228',
          500: '#2A2A32',
          400: '#3A3A44',
          300: '#4A4A56',
          200: '#6A6A78',
          100: '#8A8A98',
        },
        // Light Mode — "Frosted Alabaster"
        alabaster: {
          50:  '#FFFFFF',
          100: '#F4F5F7',
          200: '#EAECF0',
          300: '#D8DCE6',
          400: '#BEC4D2',
          500: '#9AA3B8',
          600: '#6B7590',
          700: '#4A5268',
          800: '#2E3349',
          900: '#1A1E2E',
        },
        // Emergency Accent — Dark Mode neon
        crimson: {
          DEFAULT: '#FF2A55',
          glow:    '#FF2A5540',
          muted:   '#CC2244',
          light:   '#FF6680',
        },
        cyan: {
          neon:    '#00F0FF',
          glow:    '#00F0FF30',
          muted:   '#00B8CC',
          light:   '#66F5FF',
        },
        volt: {
          DEFAULT: '#CCFF00',
          glow:    '#CCFF0030',
          muted:   '#99CC00',
          light:   '#DDFF55',
        },
        // Emergency — Light Mode jewel tones
        ruby:     { DEFAULT: '#C0392B', light: '#E74C3C', bg: '#FDECEA' },
        sapphire: { DEFAULT: '#1A5276', light: '#2980B9', bg: '#EAF2FB' },
        amber:    { DEFAULT: '#9A6C00', light: '#D4A017', bg: '#FDF6E3' },
        emerald:  { DEFAULT: '#1D6A45', light: '#27AE60', bg: '#EAFAF1' },
      },

      // ─── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-jetbrains)', 'Consolas', 'monospace'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
      },

      // ─── Animations ────────────────────────────────────────────────────────
      animation: {
        'pulse-ring':   'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':     'slide-up 0.3s ease-out',
        'slide-down':   'slide-down 0.3s ease-out',
        'fade-in':      'fade-in 0.2s ease-out',
        'shimmer':      'shimmer 2s linear infinite',
        'ping-slow':    'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-pulse':   'glow-pulse 2s ease-in-out infinite',
        'vehicle-move': 'vehicle-move 0.5s ease-out',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.3' },
        },
        'slide-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to:   { transform: 'translateY(0)',   opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px 0px var(--glow-color)' },
          '50%':       { boxShadow: '0 0 24px 4px var(--glow-color)' },
        },
      },

      // ─── Box Shadows ────────────────────────────────────────────────────────
      boxShadow: {
        'glass':       '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        'glass-dark':  '0 8px 32px 0 rgba(0, 0, 0, 0.48)',
        'card':        '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
        'card-hover':  '0 8px 24px 0 rgba(0, 0, 0, 0.16)',
        'crimson':     '0 0 24px 0 rgba(255, 42, 85, 0.4)',
        'cyan':        '0 0 24px 0 rgba(0, 240, 255, 0.4)',
        'volt':        '0 0 24px 0 rgba(204, 255, 0, 0.4)',
        'inset-glass': 'inset 0 1px 0 0 rgba(255,255,255,0.1)',
      },

      // ─── Backdrop Blur ──────────────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
        glass: '12px',
        heavy: '24px',
      },

      // ─── Background Image ───────────────────────────────────────────────────
      backgroundImage: {
        'noise':          "url('/noise.svg')",
        'radial-dark':    'radial-gradient(ellipse at 50% 0%, #1A1A2E 0%, #0A0A0C 70%)',
        'radial-crimson': 'radial-gradient(ellipse at 50% 0%, rgba(255,42,85,0.15) 0%, transparent 70%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },

      // ─── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
