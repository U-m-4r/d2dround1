import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { JWT_SECRET } from '@/lib/env'

const COOKIE_NAME = 'd2d_session'

export interface JWTPayload {
  teamId: string
  teamName: string
  currentLevel: number
}

export function signToken(payload: JWTPayload): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET not configured')
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!JWT_SECRET) return null
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Next.js 15: cookies() is async — call with await in Route Handlers/Server Components
export async function getSessionFromCookies(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function getSessionFromToken(token: string): JWTPayload | null {
  return verifyToken(token)
}

export { COOKIE_NAME }
