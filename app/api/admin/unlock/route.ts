import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Team from '@/models/Team'
import ClueProgress from '@/models/ClueProgress'

function isAdminAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  let body: { teamId: string; clueId: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  const { teamId, clueId } = body

  if (!teamId || !clueId) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
  }

  try {
    await connectDB()

    const team = await Team.findById(teamId)
    if (!team) {
      return NextResponse.json({ error: 'TEAM_NOT_FOUND' }, { status: 404 })
    }

    const now = new Date()
    const nextLevel = clueId + 1

    // Update team state
    await Team.findByIdAndUpdate(teamId, {
      currentLevel: nextLevel > 5 ? 6 : nextLevel,
      solvedCount: Math.max(team.solvedCount, clueId),
      lastSolvedAt: now,
    })

    // Mark current clue as solved
    await ClueProgress.findOneAndUpdate(
      { teamId, clueId },
      { solvedAt: now },
      { upsert: true }
    )

    // Unlock next clue
    if (nextLevel <= 5) {
      await ClueProgress.findOneAndUpdate(
        { teamId, clueId: nextLevel },
        { unlockedAt: now },
        { upsert: true }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Team "${team.teamName}" manually advanced past clue ${clueId}.`,
      newLevel: nextLevel > 5 ? 6 : nextLevel,
    })
  } catch (err) {
    console.error('[ADMIN/UNLOCK]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
