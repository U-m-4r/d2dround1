'use client'

import { motion } from 'framer-motion'

interface LeaderboardEntry {
  rank: number
  teamName: string
  solvedCount: number
  currentLevel: number
  lastSolvedAt: string | null
  suspicious?: boolean
  totalWrongAttempts?: number
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  totalClues?: number
}

const RANK_COLORS = ['text-neon-yellow', 'text-white/60', 'text-neon-green/60']
const RANK_ICONS  = ['🥇', '🥈', '🥉']

function formatTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

export default function LeaderboardTable({
  entries,
  totalClues = 5,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20 font-mono text-white/20 text-sm">
        NO TEAMS REGISTERED YET
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neon-green/10">
            {['RANK', 'TEAM', 'DECODED', 'WRONG ATTEMPTS', 'CURRENT STAGE', 'LAST SOLVE', 'STATUS'].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-mono text-xs text-neon-green/40 uppercase tracking-widest font-normal"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <motion.tr
              key={entry.teamName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className={`border-b border-white/3 hover:bg-neon-green/2 transition-colors ${
                i < 3 ? 'bg-neon-green/2' : ''
              }`}
            >
              {/* Rank */}
              <td className="px-4 py-4">
                <span className={`font-mono text-lg font-bold ${RANK_COLORS[i] ?? 'text-white/40'}`}>
                  {i < 3 ? RANK_ICONS[i] : `#${entry.rank}`}
                </span>
              </td>

              {/* Team name */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {entry.suspicious && (
                    <span title="Suspicious activity detected" className="text-neon-pink text-xs">
                      ⚠
                    </span>
                  )}
                  <span className={`font-mono font-medium ${i === 0 ? 'text-neon-green text-glow-green' : 'text-white'}`}>
                    {entry.teamName}
                  </span>
                </div>
              </td>

              {/* Clues solved */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neon-green font-bold">{entry.solvedCount}</span>
                  <span className="font-mono text-white/20 text-xs">/{totalClues}</span>
                  {/* Mini progress dots */}
                  <div className="flex gap-0.5 ml-2">
                    {Array.from({ length: totalClues }, (_, j) => (
                      <div
                        key={j}
                        className={`w-2 h-2 rounded-full ${
                          j < entry.solvedCount ? 'bg-neon-green' : 'bg-white/8'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </td>

              {/* Wrong attempts */}
              <td className="px-4 py-4">
                <span
                  className={`font-mono text-sm font-bold ${
                    (entry.totalWrongAttempts ?? 0) > 15
                      ? 'text-neon-pink'
                      : (entry.totalWrongAttempts ?? 0) > 8
                        ? 'text-cyber-cyan'
                        : 'text-white/50'
                  }`}
                >
                  {entry.totalWrongAttempts ?? 0}
                </span>
              </td>

              {/* Current stage */}
              <td className="px-4 py-4">
                <span className="badge badge-cyan">
                  {entry.currentLevel > totalClues ? 'COMPLETE' : `CLUE ${entry.currentLevel}`}
                </span>
              </td>

              {/* Last solve time */}
              <td className="px-4 py-4 font-mono text-xs text-white/40">
                {formatTime(entry.lastSolvedAt)}
              </td>

              {/* Status */}
              <td className="px-4 py-4">
                {entry.solvedCount === totalClues ? (
                  <span className="badge badge-green">COMPLETE</span>
                ) : entry.suspicious ? (
                  <span className="badge badge-pink">FLAGGED</span>
                ) : entry.solvedCount > 0 ? (
                  <span className="badge badge-cyan">ACTIVE</span>
                ) : (
                  <span className="badge" style={{ color: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    IDLE
                  </span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
