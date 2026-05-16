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
          isPaused: false,
          isEnded: false,
        },
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      ok: true,
      isPaused: state.isPaused,
      isEnded: state.isEnded,
    })
  } catch (err) {
    console.error('[ROUND/RESUME]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
