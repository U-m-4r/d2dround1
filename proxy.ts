import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

const ADMIN_SECRET = process.env.ADMIN_SECRET

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Protect /dashboard ─────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/login?reason=session_expired', req.url))
    }
  }

  // ── Protect /leaderboard (admin-only) ──────────────────────────────
  if (pathname.startsWith('/leaderboard')) {
    const adminCookie = req.cookies.get('d2d_admin')?.value
    if (adminCookie !== ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin?reason=auth_required', req.url))
    }
  }

  // ── Block logged-in users from /login ──────────────────────────────
  if (pathname === '/login') {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/leaderboard/:path*', '/login'],
}
