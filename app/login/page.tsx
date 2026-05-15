'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const ParticleGrid = dynamic(() => import('@/components/ParticleGrid'), { ssr: false })

export default function LoginPage() {
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [bootLines, setBootLines] = useState<string[]>([])

  // Boot sequence animation
  useEffect(() => {
    const lines = [
      'LOADING SECURE SHELL...',
      'PROTOCOL: D2D-AUTH v2.1',
      'SESSION KEY GENERATED.',
      'AWAITING CREDENTIALS.',
    ]
    const t = setInterval(() => {
      setBootLines((p) => {
        if (p.length >= lines.length) {
          clearInterval(t)
          return p
        }
        return [...p, lines[p.length]]
      })
    }, 400)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!teamName.trim() || !password.trim() || status === 'loading') return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: teamName.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.message || 'ACCESS DENIED. Check credentials.')
        return
      }

      setStatus('success')
      setTimeout(() => router.push('/dashboard'), 800)
    } catch {
      setStatus('error')
      setErrorMsg('CONNECTION FAILED. Retry.')
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-dark-bg overflow-hidden">
      <ParticleGrid />

      {/* Radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Link href="/" className="font-mono text-xs text-white/30 hover:text-neon-green transition-colors flex items-center gap-2">
            ← BACK TO BASE
          </Link>
        </motion.div>

        {/* Boot lines */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-1"
        >
          {bootLines.map((line, i) => (
            <p key={i} className="font-mono text-xs text-neon-green/30">{`> ${line}`}</p>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="glass-card rounded-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="border-b border-neon-green/10 px-8 py-5 flex items-center gap-3 bg-neon-green/3">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="font-mono text-sm text-neon-green tracking-widest">SECURE LOGIN</span>
            <span className="ml-auto font-mono text-xs text-white/20">D2D-AUTH</span>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-white">TEAM AUTHENTICATION</h1>
              <p className="font-mono text-xs text-white/30">ENTER TEAM CREDENTIALS TO ACCESS MISSION</p>
            </div>

            {/* Team name */}
            <div className="space-y-2">
              <label htmlFor="team-name" className="block font-mono text-xs text-neon-green/50 uppercase tracking-widest">
                {'>'} TEAM IDENTIFIER
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-neon-green/40 text-sm select-none pointer-events-none">[</span>
                <input
                  id="team-name"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="TEAM_NAME"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={status === 'loading' || status === 'success'}
                  className="terminal-input pl-8 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-neon-green/40 text-sm select-none pointer-events-none">]</span>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="access-code" className="block font-mono text-xs text-neon-green/50 uppercase tracking-widest">
                {'>'} ACCESS CODE
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-neon-green/40 text-sm select-none pointer-events-none">[</span>
                <input
                  id="access-code"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={status === 'loading' || status === 'success'}
                  className="terminal-input pl-8 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-neon-green/40 text-sm select-none pointer-events-none">]</span>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {status === 'error' && errorMsg && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="border border-neon-pink/30 bg-neon-pink/5 px-4 py-3 font-mono text-xs text-neon-pink flex items-start gap-2"
                >
                  <span className="mt-0.5">⚠</span>
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              id="login-submit-btn"
              type="submit"
              disabled={status === 'loading' || status === 'success' || !teamName.trim() || !password.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-neon w-full py-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="loading-dots flex gap-1"><span /><span /><span /></span>
                  AUTHENTICATING
                </span>
              ) : status === 'success' ? (
                '✓ ACCESS GRANTED — REDIRECTING'
              ) : (
                '⟶ AUTHENTICATE'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center font-mono text-xs text-white/15"
        >
          Credentials assigned during registration. Contact event admin if locked out.
        </motion.p>
      </div>
    </main>
  )
}
