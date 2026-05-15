import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Team from '@/models/Team'
import Clue from '@/models/Clue'

export async function GET() {
  const session = await getSessionFromCookies()

  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    await connectDB()

    const team = await Team.findById(session.teamId).select('currentLevel solvedCount')
    if (!team) {
      return NextResponse.json({ error: 'TEAM_NOT_FOUND' }, { status: 404 })
    }

    const currentClueId = team.currentLevel

    // All 5 clues solved — event complete
    if (currentClueId > 5) {
      return NextResponse.json({
        completed: true,
        solvedCount: team.solvedCount,
        message: 'All clues solved. Mission complete.',
      })
    }

    // Fetch ONLY hint and title — answer is NEVER returned
    const clue = await Clue.findOne({ clueId: currentClueId, isActive: true }).select(
      'clueId title hint difficulty order -_id'
    )

    if (!clue) {
      return NextResponse.json({ error: 'CLUE_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({
      completed: false,
      clue: {
        clueId: clue.clueId,
        title: clue.title,
        hint: clue.hint,
        difficulty: clue.difficulty,
        order: clue.order,
      },
      solvedCount: team.solvedCount,
      currentLevel: team.currentLevel,
    })
  } catch (err) {
    console.error('[CLUE/CURRENT]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
