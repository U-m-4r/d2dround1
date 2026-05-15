'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LeaderboardTable from '@/components/LeaderboardTable'

interface TeamEntry {
  teamId: string
  teamName: string
  solvedCount: number
  currentLevel: number
  lastSolvedAt: string | null
  lastActive: string | null
  suspicious: boolean
  totalWrongAttempts: number
}

interface Submission {
  id: string
  teamName: string
  clueId: number
  submittedAnswer: string
  isCorrect: boolean
  submittedAt: string
  ipAddress: string
}

type Tab = 'leaderboard' | 'teams' | 'submissions'

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState<Tab>('leaderboard')

  // Data
  const [leaderboard, setLeaderboard] = useState<TeamEntry[]>([])
  const [teams, setTeams] = useState<TeamEntry[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [unlockMsg, setUnlockMsg] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const headers = { 'x-admin-secret': secret }

  const fetchAll = useCallback(async () => {
    if (!secret) return
    setRefreshing(true)
    try {
      const [lbRes, teamsRes, subRes] = await Promise.all([
        fetch('/api/leaderboard', { headers }),
        fetch('/api/admin/teams', { headers }),
        fetch('/api/admin/submissions?limit=100', { headers }),
      ])
      if (lbRes.ok) {
        const d = await lbRes.json()
        setLeaderboard(d.leaderboard)
      }
      if (teamsRes.ok) {
        const d = await teamsRes.json()
        setTeams(d.teams)
      }
      if (subRes.ok) {
        const d = await subRes.json()
        setSubmissions(d.submissions)
      }
      setLastRefresh(new Date())
    } catch {
      // silent
    } finally {
      setRefreshing(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret])

  // Auto-refresh every 30s when authed
  useEffect(() => {
    if (!authed) return
    fetchAll()
    const t = setInterval(fetchAll, 30_000)
    return () => clearInterval(t)
  }, [authed, fetchAll])

  // Store admin secret in session cookie for /leaderboard route guard
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    const res = await fetch('/api/leaderboard', {
      headers: { 'x-admin-secret': secret },
    })
    if (res.ok) {
      // Set admin cookie for middleware
      document.cookie = `d2d_admin=${secret};path=/;max-age=86400`
      setAuthed(true)
    } else {
      setAuthError('INVALID ADMIN SECRET.')
    }
  }

  const handleUnlock = async (teamId: string, teamName: string, currentClueId: number) => {
    setUnlocking(teamId)
    setUnlockMsg('')
    try {
      const res = await fetch('/api/admin/unlock', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, clueId: currentClueId }),
      })
      const data = await res.json()
      if (res.ok) {
        setUnlockMsg(`✓ ${teamName} advanced.`)
        fetchAll()
      } else {
        setUnlockMsg(`⚠ ${data.message || 'Error'}`)
      }
    } catch {
      setUnlockMsg('Connection error.')
    } finally {
      setUnlocking(null)
      setTimeout(() => setUnlockMsg(''), 4000)
    }
  }

  // ── Auth gate ───────────────────────────────────────────────────────
  if (!authed) {
    return (
      <main className="min-h-screen bg-dark-bg flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-sm w-full max-w-sm overflow-hidden"
        >
          <div className="border-b border-neon-pink/20 px-6 py-4 bg-neon-pink/5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
            <span className="font-mono text-sm text-neon-pink tracking-widest">ADMIN ACCESS</span>
          </div>
          <form onSubmit={handleAuth} className="p-8 space-y-6">
            <h1 className="font-mono text-lg font-bold text-white">RESTRICTED ZONE</h1>
            <p className="font-mono text-xs text-white/30">Enter admin passphrase to continue.</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-neon-pink/40 text-sm pointer-events-none">[</span>
              <input
                id="admin-secret-input"
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="ADMIN_SECRET"
                className="terminal-input pl-8 pr-8"
                style={{ borderColor: 'rgba(255,0,102,0.3)', color: '#ff0066' }}
                autoComplete="off"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-neon-pink/40 text-sm pointer-events-none">]</span>
            </div>
            {authError && (
              <p className="font-mono text-xs text-neon-pink">⚠ {authError}</p>
            )}
            <button
              type="submit"
              className="btn-neon-pink w-full py-3 text-xs"
            >
              ⟶ AUTHENTICATE
            </button>
          </form>
        </motion.div>
      </main>
    )
  }

  const flaggedCount = teams.filter((t) => t.suspicious).length
  const correctSubs = submissions.filter((s) => s.isCorrect).length
  const wrongSubs   = submissions.filter((s) => !s.isCorrect).length

  // ── Dashboard ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="border-b border-neon-pink/15 bg-dark-panel px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
          <span className="font-mono text-sm text-neon-pink tracking-widest">D2D ADMIN CONSOLE</span>
        </div>
        <div className="flex items-center gap-4">
          {lastRefresh && (
            <span className="font-mono text-xs text-white/20">
              LAST SYNC: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            id="admin-refresh-btn"
            onClick={fetchAll}
            disabled={refreshing}
            className="font-mono text-xs text-cyber-cyan hover:text-white transition-colors disabled:opacity-40"
          >
            {refreshing ? 'SYNCING...' : '↻ REFRESH'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'TOTAL TEAMS', value: teams.length, color: 'text-neon-green' },
            { label: 'FLAGGED', value: flaggedCount, color: flaggedCount > 0 ? 'text-neon-pink' : 'text-white/40' },
            { label: 'CORRECT SUBS', value: correctSubs, color: 'text-cyber-cyan' },
            { label: 'WRONG SUBS', value: wrongSubs, color: wrongSubs > 50 ? 'text-neon-pink' : 'text-white/60' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card rounded-sm p-5 space-y-1">
              <p className="font-mono text-xs text-white/30 uppercase tracking-widest">{label}</p>
              <p className={`font-mono text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Unlock msg toast */}
        <AnimatePresence>
          {unlockMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-cyber-cyan/30 bg-cyber-cyan/5 px-4 py-3 font-mono text-xs text-cyber-cyan"
            >
              {unlockMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-0 border border-neon-green/10 w-fit">
          {(['leaderboard', 'teams', 'submissions'] as Tab[]).map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all ${
                tab === t
                  ? 'bg-neon-green/10 text-neon-green border-r border-neon-green/10'
                  : 'text-white/30 hover:text-white border-r border-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Leaderboard tab ── */}
        {tab === 'leaderboard' && (
          <div className="glass-card rounded-sm overflow-hidden">
            <div className="border-b border-neon-green/10 px-6 py-4 flex items-center justify-between">
              <span className="font-mono text-sm text-neon-green tracking-widest">LIVE RANKINGS</span>
              <span className="badge badge-green">{leaderboard.length} TEAMS</span>
            </div>
            <LeaderboardTable entries={leaderboard} />
          </div>
        )}

        {/* ── Teams tab ── */}
        {tab === 'teams' && (
          <div className="glass-card rounded-sm overflow-hidden">
            <div className="border-b border-neon-green/10 px-6 py-4">
              <span className="font-mono text-sm text-neon-green tracking-widest">TEAM MANAGEMENT</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neon-green/10">
                    {['TEAM', 'SOLVED', 'CURRENT CLUE', 'WRONG ATTEMPTS', 'STATUS', 'ACTION'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-mono text-xs text-neon-green/40 uppercase tracking-widest font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.teamId} className={`border-b border-white/3 ${t.suspicious ? 'bg-neon-pink/3' : ''}`}>
                      <td className="px-4 py-3 font-mono text-sm font-medium text-white">
                        {t.suspicious && <span className="text-neon-pink mr-2" title="Suspicious">⚠</span>}
                        {t.teamName}
                      </td>
                      <td className="px-4 py-3 font-mono text-neon-green font-bold">{t.solvedCount}/5</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-cyan">CLUE {t.currentLevel > 5 ? '—' : t.currentLevel}</span>
                      </td>
                      <td className={`px-4 py-3 font-mono text-sm ${t.totalWrongAttempts > 15 ? 'text-neon-pink' : 'text-white/50'}`}>
                        {t.totalWrongAttempts}
                      </td>
                      <td className="px-4 py-3">
                        {t.suspicious ? (
                          <span className="badge badge-pink">FLAGGED</span>
                        ) : t.solvedCount === 5 ? (
                          <span className="badge badge-green">DONE</span>
                        ) : (
                          <span className="badge badge-cyan">ACTIVE</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {t.currentLevel <= 5 && (
                          <button
                            id={`unlock-${t.teamId}`}
                            onClick={() => handleUnlock(t.teamId, t.teamName, t.currentLevel)}
                            disabled={unlocking === t.teamId}
                            className="font-mono text-xs text-cyber-cyan hover:text-white border border-cyber-cyan/30 px-3 py-1 hover:bg-cyber-cyan/10 transition-all disabled:opacity-40"
                          >
                            {unlocking === t.teamId ? '...' : `UNLOCK CLUE ${t.currentLevel}`}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Submissions tab ── */}
        {tab === 'submissions' && (
          <div className="glass-card rounded-sm overflow-hidden">
            <div className="border-b border-neon-green/10 px-6 py-4 flex items-center justify-between">
              <span className="font-mono text-sm text-neon-green tracking-widest">SUBMISSION LOG</span>
              <span className="badge badge-cyan">{submissions.length} ENTRIES</span>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-dark-panel">
                  <tr className="border-b border-neon-green/10">
                    {['TIME', 'TEAM', 'CLUE', 'ANSWER', 'RESULT', 'IP'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-mono text-xs text-neon-green/40 uppercase tracking-widest font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className={`border-b border-white/3 ${s.isCorrect ? 'bg-neon-green/2' : ''}`}>
                      <td className="px-4 py-2 font-mono text-xs text-white/30">
                        {new Date(s.submittedAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-white">{s.teamName}</td>
                      <td className="px-4 py-2 font-mono text-xs text-cyber-cyan">#{s.clueId}</td>
                      <td className="px-4 py-2 font-mono text-xs text-white/60 max-w-[160px] truncate">
                        {s.submittedAnswer}
                      </td>
                      <td className="px-4 py-2">
                        {s.isCorrect ? (
                          <span className="badge badge-green text-[10px]">✓ CORRECT</span>
                        ) : (
                          <span className="badge badge-pink text-[10px]">✗ WRONG</span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-white/20">{s.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
