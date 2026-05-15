import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Team from '@/models/Team'

export async function GET() {
  const session = await getSessionFromCookies()

  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    await connectDB()
    const team = await Team.findById(session.teamId).select(
      'teamName currentLevel solvedCount lastSolvedAt'
    )

    if (!team) {
      return NextResponse.json({ error: 'TEAM_NOT_FOUND' }, { status: 404 })
    }

    // Update lastActive silently
    await Team.findByIdAndUpdate(session.teamId, { lastActive: new Date() })

    return NextResponse.json({
      teamName: team.teamName,
      currentLevel: team.currentLevel,
      solvedCount: team.solvedCount,
      lastSolvedAt: team.lastSolvedAt,
    })
  } catch (err) {
    console.error('[AUTH/ME]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
