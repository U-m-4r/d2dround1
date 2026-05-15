// Simple in-memory rate limiter for ~50 concurrent teams
// Limits to maxAttempts per windowMs per key (teamId or IP)

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 30_000 // 30 seconds

export function checkRateLimit(key: string): {
  allowed: boolean
  remaining: number
  resetInMs: number
} {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetInMs: WINDOW_MS }
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: entry.resetAt - now,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.count,
    resetInMs: entry.resetAt - now,
  }
}

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)
