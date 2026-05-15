'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface ClueCardProps {
  clueId: number
  title: string
  hint: string
  difficulty: string
  solvedCount: number
  totalClues?: number
  onSubmit: (answer: string) => Promise<{ correct: boolean; message: string }>
  isLoading?: boolean
}

const DIFFICULTY_BADGE: Record<string, string> = {
  easy:   'badge-green',
  medium: 'badge-cyan',
  hard:   'badge-pink',
}

export default function ClueCard({
  clueId,
  title,
  hint,
  difficulty,
  solvedCount,
  totalClues = 5,
  onSubmit,
  isLoading = false,
}: ClueCardProps) {
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'correct' | 'wrong' | 'rate-limited'>('idle')
  const [message, setMessage] = useState('')
  const [shake, setShake] = useState(false)
  const [showUnlock, setShowUnlock] = useState(false)

  const progress = ((solvedCount) / totalClues) * 100

  const handleSubmit = async () => {
    if (!answer.trim() || status === 'loading') return
    setStatus('loading')
    setMessage('')

    try {
      const result = await onSubmit(answer)

      if (result.correct) {
        setStatus('correct')
        setMessage(result.message)
        setShowUnlock(true)
      } else {
        setStatus('wrong')
        setMessage(result.message)
        setShake(true)
        setTimeout(() => setShake(false), 600)
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Connection error.'
      if (errMsg.includes('RATE_LIMITED') || errMsg.includes('Too many')) {
        setStatus('rate-limited')
        setMessage(errMsg)
      } else {
        setStatus('wrong')
        setMessage('TRANSMISSION ERROR. Retry.')
      }
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setTimeout(() => setStatus('idle'), 4000)
    }
    setAnswer('')
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Unlock flash overlay */}
      <AnimatePresence>
        {showUnlock && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-neon-green/10 rounded-sm" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 text-center space-y-3"
            >
              <div className="text-5xl">🔓</div>
              <p className="font-mono text-neon-green text-xl font-bold text-glow-green">
                ACCESS GRANTED
              </p>
              <p className="font-mono text-cyber-cyan text-sm">{message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`glass-card rounded-sm p-8 space-y-8 ${shake ? 'animate-glitch' : ''} ${showUnlock ? 'pointer-events-none blur-sm' : ''}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-neon-green/40 uppercase tracking-widest">
                CLUE_{String(clueId).padStart(2, '0')}
              </span>
              <span className={`badge ${DIFFICULTY_BADGE[difficulty] ?? 'badge-cyan'}`}>
                {difficulty}
              </span>
            </div>
            <h2 className="font-mono text-2xl font-bold text-neon-green text-glow-green">
              {title}
            </h2>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-white/30 uppercase tracking-widest">Stage</p>
            <p className="font-mono text-3xl font-bold text-cyber-cyan">
              {clueId}
              <span className="text-white/20 text-lg">/{totalClues}</span>
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between font-mono text-xs text-white/30">
            <span>MISSION PROGRESS</span>
            <span>{solvedCount}/{totalClues} DECODED</span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalClues }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-colors duration-500 ${
                  i < solvedCount
                    ? 'bg-neon-green glow-green'
                    : i === solvedCount
                    ? 'bg-cyber-cyan/40'
                    : 'bg-white/5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Clue hint */}
        <div className="border border-neon-green/10 bg-neon-green/3 p-6 space-y-3">
          <p className="font-mono text-xs text-neon-green/40 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            INCOMING TRANSMISSION
          </p>
          <p className="text-white/80 leading-relaxed text-base">{hint}</p>
        </div>

        {/* Answer input */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block font-mono text-xs text-neon-green/50 uppercase tracking-widest">
              {'>'} ENTER ACCESS CODE
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-neon-green/40 text-sm select-none pointer-events-none">
                [
              </span>
              <input
                id="answer-input"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={status === 'loading' || status === 'correct'}
                placeholder="ENTER_TOKEN_HERE"
                autoComplete="off"
                spellCheck={false}
                className="terminal-input pl-8 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-neon-green/40 text-sm select-none pointer-events-none">
                ]
              </span>
            </div>
          </div>

          {/* Status message */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.p
                key={message}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`font-mono text-sm flex items-center gap-2 ${
                  status === 'correct'
                    ? 'text-neon-green'
                    : status === 'rate-limited'
                    ? 'text-neon-yellow'
                    : 'text-neon-pink'
                }`}
              >
                <span>{status === 'correct' ? '✓' : '⚠'}</span>
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            id="submit-btn"
            onClick={handleSubmit}
            disabled={status === 'loading' || status === 'correct' || !answer.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn-neon w-full py-4 text-sm tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <span className="loading-dots flex items-center justify-center gap-2">
                VERIFYING<span /><span /><span />
              </span>
            ) : (
              '⟶ VERIFY TOKEN'
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
