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

    const now = new Date()
    const state = await RoundState.findOneAndUpdate(
      { name: 'global' },
      {
        $set: {
          name: 'global',
          isStarted: true,
          isPaused: false,
          isEnded: false,
          startedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      ok: true,
      isStarted: state.isStarted,
      startedAt: state.startedAt,
    })
  } catch (err) {
    console.error('[ROUND/START]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}