import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Team from '@/models/Team'

function isAdminAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  try {
    await connectDB()

    // Sorted: most solved first, then earliest lastSolvedAt
    const teams = await Team.find({})
      .select('teamName solvedCount currentLevel lastSolvedAt lastActive createdAt')
      .sort({ solvedCount: -1, lastSolvedAt: 1 })
      .lean()

    const leaderboard = teams.map((team, index) => ({
      rank: index + 1,
      teamName: team.teamName,
      solvedCount: team.solvedCount,
      currentLevel: team.currentLevel,
      lastSolvedAt: team.lastSolvedAt,
      lastActive: team.lastActive,
      createdAt: team.createdAt,
      teamId: team._id.toString(),
    }))

    return NextResponse.json({ leaderboard, total: teams.length })
  } catch (err) {
    console.error('[LEADERBOARD]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
