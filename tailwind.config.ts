import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00ff88',
        'cyber-cyan': '#00d4ff',
        'neon-pink': '#ff0066',
        'neon-yellow': '#f0ff00',
        'dark-bg': '#020408',
        'dark-panel': '#070d14',
        'dark-card': '#0a1220',
        'border-glow': 'rgba(0,255,136,0.3)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0,255,136,0.4), 0 0 60px rgba(0,255,136,0.1)',
        'neon-cyan': '0 0 20px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.1)',
        'neon-pink': '0 0 20px rgba(255,0,102,0.4), 0 0 60px rgba(255,0,102,0.1)',
        'panel': '0 0 0 1px rgba(0,255,136,0.1), 0 4px 40px rgba(0,0,0,0.8)',
      },
      animation: {
        'glitch': 'glitch 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'matrix-rain': 'matrixRain 20s linear infinite',
        'scan-line': 'scanLine 4s ease-in-out infinite',
        'flicker': 'flicker 0.15s infinite',
        'blink': 'blink 1s step-end infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)', filter: 'hue-rotate(90deg)' },
          '40%': { transform: 'translate(2px, -2px)', filter: 'hue-rotate(180deg)' },
          '60%': { transform: 'translate(-1px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,255,136,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0,255,136,0.6), 0 0 80px rgba(0,255,136,0.2)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)",
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.15) 0%, rgba(0,212,255,0.05) 40%, transparent 70%)',
      },
      backgroundSize: {
        'cyber-grid': '40px 40px',
      },
    },
  },
  plugins: [],
}

export default config
