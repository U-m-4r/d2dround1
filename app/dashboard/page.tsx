'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import ClueCard from '@/components/ClueCard'

const ParticleGrid = dynamic(() => import('@/components/ParticleGrid'), { ssr: false })

interface TeamState {
  teamName: string
  currentLevel: number
  solvedCount: number
  lastSolvedAt: string | null
}

interface ClueData {
  clueId: number
  title: string
  hint: string
  difficulty: string
  order: number
}

interface RoundStatus {
  isStarted: boolean
  isPaused?: boolean
  isEnded?: boolean
  startedAt: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [team, setTeam] = useState<TeamState | null>(null)
  const [clue, setClue] = useState<ClueData | null>(null)
  const [completed, setCompleted] = useState(false)
  const [roundStatus, setRoundStatus] = useState<RoundStatus | null>(null)
  const [roundLocked, setRoundLocked] = useState(false)
  const [roundPaused, setRoundPaused] = useState(false)
  const [roundEnded, setRoundEnded] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadState = useCallback(async () => {
    setLoadError('')
    setRoundLocked(false)
    setRoundPaused(false)
    setRoundEnded(false)
    setCompleted(false)
    setClue(null)
    try {
      // Fetch fresh team state and round status together
      const [meRes, roundRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/round/status'),
      ])

      if (!meRes.ok) {
        router.push('/login?reason=session_expired')
        return
      }
      const meData = await meRes.json()
      setTeam(meData)

      if (roundRes.ok) {
        const roundData = await roundRes.json()
        setRoundStatus(roundData)
        if (!roundData.isStarted) {
          setRoundLocked(true)
          return
        }
        if (roundData.isEnded) {
          setRoundEnded(true)
          return
        }
        if (roundData.isPaused) {
          setRoundPaused(true)
          return
        }
      }

      // Fetch current clue
      const clueRes = await fetch('/api/clue/current')
      if (!clueRes.ok) {
        if (clueRes.status === 403) {
          const clueErr = await clueRes.json().catch(() => null)
          if (clueErr?.error === 'ROUND_NOT_STARTED') {
            setLoadError(clueErr.message || 'The round has not started yet.')
            return
          }
          if (clueErr?.error === 'ROUND_PAUSED') {
            setRoundPaused(true)
            return
          }
          if (clueErr?.error === 'ROUND_ENDED') {
            setRoundEnded(true)
            return
          }
        }
        setLoadError('Failed to load clue. Refresh to retry.')
        return
      }
      const clueData = await clueRes.json()

      if (clueData.completed) {
        setCompleted(true)
      } else {
        setClue(clueData.clue)
      }
    } catch {
      setLoadError('Connection lost. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadState()
  }, [loadState])

  const handleSubmit = async (answer: string): Promise<{ correct: boolean; message: string }> => {
    if (!clue) throw new Error('No active clue')

    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clueId: clue.clueId, answer }),
    })

    const data = await res.json()

    // Standardize rate-limit error text so client-side components can
    // reliably detect rate-limited responses.
    if (res.status === 429) {
      throw new Error('RATE_LIMITED:' + (data.message || 'Too many attempts.'))
    }
    if (!res.ok && res.status !== 200) {
      throw new Error(data.message || 'Submission error.')
    }

    if (data.correct) {
      // Reload state after short delay to show unlock animation
      setTimeout(() => loadState(), 2000)
    }

    return { correct: data.correct, message: data.message }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const roundStartLabel = roundStatus?.startedAt
    ? new Date(roundStatus.startedAt).toLocaleTimeString()
    : 'Waiting on admin signal'

  return (
    <main className="relative min-h-screen bg-dark-bg overflow-hidden">
      <ParticleGrid />

      {/* Top glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Round locked */}
      <AnimatePresence>
        {!isLoading && !loadError && roundLocked && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed inset-0 z-30 flex items-center justify-center px-6 py-10"
          >
            <div className="absolute inset-0 bg-black/78 backdrop-blur-[8px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,102,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(0,255,136,0.08),transparent_40%)]" />
            <div className="relative w-full max-w-3xl overflow-hidden rounded-sm border border-neon-pink/20 bg-black/55 shadow-[0_0_80px_rgba(255,0,102,0.12)]">
              <div className="relative p-8 md:p-12 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-neon-pink animate-pulse" />
                  <span className="font-mono text-xs tracking-[0.35em] text-neon-pink uppercase">
                    Mission staging bay
                  </span>
                </div>

                <div className="space-y-4 max-w-2xl">
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-mono text-sm text-white/40 uppercase tracking-[0.35em]"
                  >
                    Signal locked
                  </motion.p>
                  <h2 className="text-4xl md:text-5xl font-black leading-tight text-white">
                    Stand by. The round is
                    <span className="block text-neon-pink text-glow-pink">not live yet.</span>
                  </h2>
                  <p className="max-w-xl font-mono text-sm md:text-base text-white/55 leading-relaxed">
                    Your team connection is active, but the event gate is still sealed. The moment the
                    organizers launch the round, this screen will flip into the first clue.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { label: 'STATUS', value: 'HOLDING', tone: 'text-neon-pink' },
                    { label: 'TEAM', value: team?.teamName || '—', tone: 'text-neon-green' },
                    { label: 'LAUNCH SIGNAL', value: roundStartLabel, tone: 'text-cyber-cyan' },
                  ].map((item) => (
                    <div key={item.label} className="glass-card rounded-sm p-4 border border-white/5">
                      <p className="font-mono text-[11px] tracking-[0.35em] text-white/25 uppercase">
                        {item.label}
                      </p>
                      <p className={`mt-2 font-mono text-lg md:text-xl font-bold ${item.tone}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <button onClick={loadState} className="btn-neon text-xs px-6 py-3">
                    ↻ CHECK FOR LAUNCH
                  </button>
                  <p className="font-mono text-xs text-white/25 max-w-md">
                    Use this time to prep your investigation stack. When the gate opens, the first clue
                    unlocks immediately.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Round paused */}
      <AnimatePresence>
        {!isLoading && !loadError && roundPaused && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed inset-0 z-30 flex items-center justify-center px-6 py-10"
          >
            <div className="absolute inset-0 bg-black/78 backdrop-blur-[8px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,136,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(0,255,136,0.08),transparent_40%)]" />
            <div className="relative w-full max-w-3xl overflow-hidden rounded-sm border border-neon-green/20 bg-black/55 shadow-[0_0_80px_rgba(0,255,136,0.12)]">
              <div className="relative p-8 md:p-12 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse" />
                  <span className="font-mono text-xs tracking-[0.35em] text-neon-green uppercase">
                    Mission staging bay
                  </span>
                </div>

                <div className="space-y-4 max-w-2xl">
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-mono text-sm text-white/40 uppercase tracking-[0.35em]"
                  >
                    Signal paused
                  </motion.p>
                  <h2 className="text-4xl md:text-5xl font-black leading-tight text-white">
                    Round is paused for a
                    <span className="block text-neon-green text-glow-green">lunch break.</span>
                  </h2>
                  <p className="max-w-xl font-mono text-sm md:text-base text-white/55 leading-relaxed">
                    The timer is on hold. Take a break, step away from the terminal, and grab some food. The round will automatically resume when the organizers lift the pause.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <button onClick={loadState} className="btn-neon text-xs px-6 py-3">
                    ↻ CHECK STATUS
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Round ended */}
      <AnimatePresence>
        {!isLoading && !loadError && roundEnded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed inset-0 z-30 flex items-center justify-center px-6 py-10"
          >
            <div className="absolute inset-0 bg-black/78 backdrop-blur-[8px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,102,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(255,0,102,0.08),transparent_40%)]" />
            <div className="relative w-full max-w-3xl overflow-hidden rounded-sm border border-neon-pink/20 bg-black/55 shadow-[0_0_80px_rgba(255,0,102,0.12)]">
              <div className="relative p-8 md:p-12 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-neon-pink animate-pulse" />
                  <span className="font-mono text-xs tracking-[0.35em] text-neon-pink uppercase">
                    Mission staging bay
                  </span>
                </div>

                <div className="space-y-4 max-w-2xl">
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-mono text-sm text-white/40 uppercase tracking-[0.35em]"
                  >
                    Signal terminated
                  </motion.p>
                  <h2 className="text-4xl md:text-5xl font-black leading-tight text-white">
                    The round has
                    <span className="block text-neon-pink text-glow-pink">officially ended.</span>
                  </h2>
                  <p className="max-w-xl font-mono text-sm md:text-base text-white/55 leading-relaxed">
                    Submissions are now closed. Await further instructions from the organizers.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <button onClick={loadState} className="btn-neon text-xs px-6 py-3">
                    ↻ CHECK STATUS
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── NAV ───────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-neon-green/8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="D2D Logo" className="w-6 h-6 rounded-full" />
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="font-mono text-xs text-neon-green/60 tracking-widest">D2D MISSION CONTROL</span>
        </div>

        <div className="flex items-center gap-6">
          {team && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-white/30">TEAM:</span>
              <span className="font-mono text-xs text-neon-green font-bold">{team.teamName}</span>
            </div>
          )}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="font-mono text-xs text-white/30 hover:text-neon-pink transition-colors"
          >
            ⟶ TERMINATE SESSION
          </button>
        </div>
      </nav>

      {/* ─── MAIN ──────────────────────────────────────────────────── */}
      {!roundLocked && !roundPaused && !roundEnded && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-6 py-16">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <div className="loading-dots flex gap-2">
              <span /><span /><span />
            </div>
            <p className="font-mono text-xs text-neon-green/40">ESTABLISHING SECURE CHANNEL...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && loadError && (
          <div className="text-center space-y-4">
            <p className="font-mono text-neon-pink">⚠ {loadError}</p>
            <button onClick={loadState} className="btn-neon text-xs px-6 py-2">RETRY</button>
          </div>
        )}

        {/* Completed */}
        <AnimatePresence>
          {!isLoading && !loadError && completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-sm p-12 max-w-2xl w-full text-center space-y-6"
            >
              <div className="text-6xl">🏆</div>
              <h2 className="font-mono text-3xl font-black text-neon-green text-glow-green">
                MISSION COMPLETE
              </h2>
              <p className="text-white/50 font-mono text-sm">
                All 5 clues decoded. Your team has reached the end of the trail.
              </p>
              <div className="border border-neon-green/20 bg-neon-green/5 p-4">
                <p className="font-mono text-cyber-cyan text-sm">
                  Proceed to the Build & Pitch phase.
                </p>
              </div>
              <p className="font-mono text-xs text-white/20">
                Final time recorded. Awaiting official ranking.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active clue */}
        {!isLoading && !loadError && !completed && clue && team && (
          <ClueCard
            clueId={clue.clueId}
            title={clue.title}
            hint={clue.hint}
            difficulty={clue.difficulty}
            solvedCount={team.solvedCount}
            totalClues={5}
            onSubmit={handleSubmit}
          />
        )}
        </div>
      )}
    </main>
  )
}
