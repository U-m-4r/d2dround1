'use client'

import { forwardRef, useState } from 'react'

interface TerminalInputProps {
  id?: string
  value: string
  onChange: (v: string) => void
  onSubmit?: () => void
  placeholder?: string
  disabled?: boolean
  label?: string
  error?: string
  type?: 'text' | 'password'
}

const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  (
    {
      id,
      value,
      onChange,
      onSubmit,
      placeholder = 'ENTER_CODE',
      disabled = false,
      label,
      error,
      type = 'text',
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false)

    const handleKey = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && onSubmit) onSubmit()
    }

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block font-mono text-xs text-neon-green/60 uppercase tracking-widest"
          >
            {`> ${label}`}
          </label>
        )}

        <div
          className={`relative transition-all duration-200 ${
            focused ? 'glow-green' : ''
          } ${error ? 'border-neon-pink' : ''}`}
        >
          {/* Bracket decoration */}
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-neon-green/40 text-sm select-none pointer-events-none"
            aria-hidden
          >
            [
          </span>

          <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKey}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className="terminal-input pl-8 pr-8 disabled:opacity-40 disabled:cursor-not-allowed"
          />

          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-neon-green/40 text-sm select-none pointer-events-none"
            aria-hidden
          >
            ]
          </span>

          {/* Blinking cursor appended to value */}
          {focused && (
            <span
              className="absolute right-8 top-1/2 -translate-y-1/2 w-2 h-4 bg-neon-green animate-blink"
              aria-hidden
            />
          )}
        </div>

        {error && (
          <p className="font-mono text-xs text-neon-pink flex items-center gap-2">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    )
  }
)

TerminalInput.displayName = 'TerminalInput'
export default TerminalInput
