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
    await connectDB()

    const state = await RoundState.findOneAndUpdate(
      { name: 'global' },
      {
        $set: {
          isStarted: false,
          isPaused: false,
          isEnded: false,
          startedAt: null,
        },
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      ok: true,
      isStarted: state.isStarted,
      isPaused: state.isPaused,
      isEnded: state.isEnded,
      startedAt: state.startedAt,
    })
  } catch (err) {
    console.error('[ROUND/RESET]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
