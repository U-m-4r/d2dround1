import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import RoundState from '@/models/RoundState'

function isAdminAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const action = body.action || 'pause'

    await connectDB()

    const update: any = {}
    if (action === 'end') {
      update.isEnded = true
      update.isPaused = false
    } else {
      update.isPaused = true
      update.isEnded = false
    }

    const state = await RoundState.findOneAndUpdate(
      { name: 'global' },
      { $set: update },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      ok: true,
      isPaused: state.isPaused,
      isEnded: state.isEnded,
    })
  } catch (err) {
    console.error('[ROUND/STOP]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
