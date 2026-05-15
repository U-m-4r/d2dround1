'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import LeaderboardTable from '@/components/LeaderboardTable'

interface LeaderboardEntry {
  rank: number
  teamName: string
  solvedCount: number
  currentLevel: number
  lastSolvedAt: string | null
  suspicious?: boolean
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const getSecret = () => {
    const match = document.cookie.match(/(?:^|;\s*)d2d_admin=([^;]*)/)
    return match ? match[1] : ''
  }

  const fetchLeaderboard = useCallback(async () => {
    const secret = getSecret()
    if (!secret) { router.push('/admin?reason=auth_required'); return }
    try {
      const res = await fetch('/api/leaderboard', { headers: { 'x-admin-secret': secret } })
      if (res.status === 403) { router.push('/admin?reason=auth_required'); return }
      const data = await res.json()
      setEntries(data.leaderboard || [])
      setLastSync(new Date())
    } catch { /* silent */ } finally { setLoading(false) }
  }, [router])

  useEffect(() => {
    fetchLeaderboard()
    const t = setInterval(fetchLeaderboard, 30_000)
    return () => clearInterval(t)
  }, [fetchLeaderboard])

  return (
    <main className="min-h-screen bg-dark-bg">
      <div className="border-b border-neon-green/10 px-8 py-5 flex items-center justify-between bg-dark-panel">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="font-mono text-sm text-neon-green tracking-widest">LIVE LEADERBOARD</span>
          <span className="badge badge-cyan ml-2">ADMIN VIEW</span>
        </div>
        <div className="flex items-center gap-4">
          {lastSync && <span className="font-mono text-xs text-white/20">SYNC: {lastSync.toLocaleTimeString()}</span>}
          <button onClick={fetchLeaderboard} className="font-mono text-xs text-cyber-cyan hover:text-white transition-colors">↻ REFRESH</button>
          <button onClick={() => router.push('/admin')} className="font-mono text-xs text-white/30 hover:text-white transition-colors">← ADMIN</button>
        </div>
      </div>

      {!loading && entries.length >= 3 && (
        <div className="grid grid-cols-3 divide-x divide-neon-green/8 border-b border-neon-green/8">
          {entries.slice(0, 3).map((e, i) => (
            <motion.div key={e.teamName} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`px-8 py-6 text-center space-y-1 ${i === 0 ? 'bg-neon-green/5' : ''}`}>
              <p className="text-3xl">{['🥇','🥈','🥉'][i]}</p>
              <p className={`font-mono font-bold ${i === 0 ? 'text-neon-green text-glow-green' : 'text-white/80'}`}>{e.teamName}</p>
              <p className="font-mono text-xs text-white/30">{e.solvedCount}/5 DECODED</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading
          ? <div className="flex justify-center py-20"><div className="loading-dots flex gap-2"><span /><span /><span /></div></div>
          : <div className="glass-card rounded-sm overflow-hidden"><LeaderboardTable entries={entries} /></div>
        }
      </div>
    </main>
  )
}
