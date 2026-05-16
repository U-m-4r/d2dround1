import { NextResponse } from 'next/server'
import { getRoundState } from '@/lib/round'

export async function GET() {
  try {
    const state = await getRoundState()
    return NextResponse.json({
      isStarted: Boolean(state.isStarted),
      isPaused: Boolean(state.isPaused),
      isEnded: Boolean(state.isEnded),
      startedAt: state.startedAt,
    })
  } catch (err) {
    console.error('[ROUND/STATUS]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}