'use client'

import { useState } from 'react'

export default function AdminRegisterPage() {
  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  const [adminSecret, setAdminSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/register-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ teamName, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Request failed')
      setMessage(`Team created: ${data.teamName}`)
      setTeamName('')
      setPassword('')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-bg p-6">
      <div className="glass-card rounded-sm p-8 max-w-lg w-full">
        <div className="mb-6">
          <h2 className="font-mono text-2xl text-neon-green font-bold">Admin — Register Team</h2>
          <p className="font-mono text-xs text-white/40 mt-1">Create a team (admin only)</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-neon-green/60 uppercase tracking-widest">ADMIN SECRET</label>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="terminal-input mt-2 w-full"
              placeholder="Enter admin secret"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-neon-green/60 uppercase tracking-widest">TEAM NAME</label>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="terminal-input mt-2 w-full"
              placeholder="Team Phoenix"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-neon-green/60 uppercase tracking-widest">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="terminal-input mt-2 w-full"
              placeholder="Choose a secure password"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full py-3 text-sm tracking-widest disabled:opacity-40"
            >
              {loading ? 'Creating…' : 'CREATE TEAM'}
            </button>
          </div>

          {message && (
            <div className="mt-4">
              <p className="font-mono text-sm text-cyber-cyan">{message}</p>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}
