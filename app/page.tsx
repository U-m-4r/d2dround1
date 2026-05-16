'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const ParticleGrid = dynamic(() => import('@/components/ParticleGrid'), { ssr: false })

const HERO_WORDS = ['INVESTIGATE.', 'DECODE.', 'DEPLOY.']

const TERMINAL_LINES = [
  '> Initialising D2D secure channel...',
  '> Handshake confirmed.',
  '> 5 encrypted nodes detected.',
  '> Trail origin: UNKNOWN',
  '> Awaiting investigator credentials...',
  '> // Good luck. You will need it.',
]

export default function LandingPage() {
  const [termLines, setTermLines] = useState<string[]>([])
  const [wordIndex, setWordIndex] = useState(0)

  // Typewriter for terminal
  useEffect(() => {
    const interval = setInterval(() => {
      setTermLines((prev) => {
        if (prev.length >= TERMINAL_LINES.length) {
          clearInterval(interval)
          return prev
        }
        return [...prev, TERMINAL_LINES[prev.length]]
      })
    }, 600)
    return () => clearInterval(interval)
  }, [])

  // Cycle hero words
  useEffect(() => {
    const t = setInterval(() => {
      setWordIndex((p) => (p + 1) % HERO_WORDS.length)
    }, 2000)
    return () => clearInterval(t)
  }, [])

  // Hidden easter egg
  useEffect(() => {
    console.log('%c D2D SYSTEM ONLINE ', 'background:#00ff88;color:#020408;font-family:monospace;font-size:14px;font-weight:bold;padding:4px 8px;')
    console.log('%c You are closer than you think. ', 'color:#00d4ff;font-family:monospace;font-size:12px;')
    console.log('%c CTRL+SHIFT+D — if you dare. ', 'color:#ff0066;font-family:monospace;font-size:11px;')
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-dark-bg">
      <ParticleGrid />

      {/* Hero gradient radial */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,255,136,0.12) 0%, rgba(0,212,255,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Scanline overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none scanlines" aria-hidden />

      {/* ─── NAV ───────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-neon-green/8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="D2D Logo" className="w-8 h-8 rounded-full" />
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="font-mono text-sm text-neon-green tracking-widest">
            DECODE2DEPLOY
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button id="nav-login-btn" className="btn-neon text-xs px-5 py-2">
              ACCESS TERMINAL
            </button>
          </Link>
        </div>
      </nav>

      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-6 gap-8">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="badge badge-cyan"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
          DEVELOPER INVESTIGATION CHALLENGE
        </motion.div>

        {/* Main headline */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black font-sans tracking-tight leading-none"
          >
            <span className="block text-white">DECODE</span>
            <span
              className="block glitch text-neon-green text-glow-green"
              data-text="2DEPLOY"
            >
              2DEPLOY
            </span>
          </motion.h1>

          {/* Animated cycling word */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="h-12 flex items-center justify-center"
          >
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="font-mono text-2xl md:text-3xl font-bold text-cyber-cyan text-glow-cyan"
            >
              {HERO_WORDS[wordIndex]}
            </motion.span>
          </motion.div>
        </div>

        {/* Sub-text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="max-w-xl text-white/40 text-base leading-relaxed font-mono"
        >
          Five encrypted clues. Hidden across the internet. Only developer instinct unlocks
          the path. <span className="text-neon-green/60">Will your team crack the trail?</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/login">
            <button id="hero-login-btn" className="btn-neon px-10 py-4 text-sm">
              ⟶ ENTER AS TEAM
            </button>
          </Link>
        </motion.div>

        {/* Clue stage indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center gap-2"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-8 h-8 border border-neon-green/20 flex items-center justify-center font-mono text-xs text-neon-green/40"
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              {i < 4 && <div className="w-6 h-px bg-neon-green/15" />}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── FEATURE STRIP ─────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-neon-green/8 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neon-green/8">
        {[
          {
            icon: '🔍',
            title: 'INVESTIGATE',
            desc: 'Hunt across GitHub, social media, dev tools, and hidden internet trails.',
          },
          {
            icon: '🧩',
            title: 'DECODE',
            desc: '5 sequential puzzle nodes. Crack one to unlock the next.',
          },
          {
            icon: '⚡',
            title: 'DEPLOY',
            desc: 'Speed matters. Earliest solver on tie-breaks wins.',
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="p-8 space-y-3 hover:bg-neon-green/2 transition-colors">
            <div className="text-3xl">{icon}</div>
            <h3 className="font-mono text-sm font-bold text-neon-green tracking-widest">{title}</h3>
            <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      {/* ─── TERMINAL BLOCK ────────────────────────────────────────── */}
      <section className="relative z-10 px-8 py-16 flex justify-center">
        <div className="glass-card rounded-sm w-full max-w-2xl overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-neon-green/10 bg-neon-green/3">
            <div className="w-3 h-3 rounded-full bg-neon-pink/80" />
            <div className="w-3 h-3 rounded-full bg-neon-yellow/80" />
            <div className="w-3 h-3 rounded-full bg-neon-green/80" />
            <span className="ml-4 font-mono text-xs text-white/30">d2d-system — bash</span>
          </div>
          <div className="p-6 space-y-2 font-mono text-sm min-h-[200px]">
            {termLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`${
                  line && line.startsWith('>')
                    ? 'text-neon-green'
                    : line && line.startsWith('//')
                    ? 'text-white/30 italic'
                    : 'text-cyber-cyan'
                }`}
              >
                {line}
              </motion.p>
            ))}
            <span className="text-neon-green animate-blink">█</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neon-green/8 px-8 py-6 flex items-center justify-between">
        <span className="font-mono text-xs text-white/20">© 2025 MPC — Decode2Deploy</span>
        <span className="font-mono text-xs text-white/20">ALL SYSTEMS OPERATIONAL</span>
      </footer>
    </main>
  )
}
