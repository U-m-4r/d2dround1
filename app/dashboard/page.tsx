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

export default function DashboardPage() {
  const router = useRouter()
  const [team, setTeam] = useState<TeamState | null>(null)
  const [clue, setClue] = useState<ClueData | null>(null)
  const [completed, setCompleted] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadState = useCallback(async () => {
    try {
      // Fetch fresh team state
      const meRes = await fetch('/api/auth/me')
      if (!meRes.ok) {
        router.push('/login?reason=session_expired')
        return
      }
      const meData = await meRes.json()
      setTeam(meData)

      // Fetch current clue
      const clueRes = await fetch('/api/clue/current')
      if (!clueRes.ok) {
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

    if (res.status === 429) {
      throw new Error(data.message || 'Too many attempts.')
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

      {/* ─── NAV ───────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-neon-green/8">
        <div className="flex items-center gap-3">
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
    </main>
  )
}
