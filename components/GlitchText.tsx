'use client'

import { motion } from 'framer-motion'

interface GlitchTextProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p'
  color?: 'green' | 'cyan' | 'pink' | 'white'
}

export default function GlitchText({
  text,
  className = '',
  as: Tag = 'span',
  color = 'green',
}: GlitchTextProps) {
  const colorClass = {
    green: 'text-neon-green text-glow-green',
    cyan:  'text-cyber-cyan text-glow-cyan',
    pink:  'text-neon-pink  text-glow-pink',
    white: 'text-white',
  }[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`inline-block ${className}`}
    >
      <Tag
        className={`glitch font-mono ${colorClass}`}
        data-text={text}
      >
        {text}
      </Tag>
    </motion.div>
  )
}
