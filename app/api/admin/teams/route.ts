import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Team from '@/models/Team'
import Submission from '@/models/Submission'

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

    const teams = await Team.find({})
      .select('teamName solvedCount currentLevel lastSolvedAt lastActive createdAt')
      .sort({ solvedCount: -1, lastSolvedAt: 1 })
      .lean()

    // Enrich with suspicious activity flag (>10 wrong in <5min)
    const enriched = await Promise.all(
      teams.map(async (team) => {
        const recentWrong = await Submission.countDocuments({
          teamId: team._id,
          isCorrect: false,
          submittedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
        })

        const totalWrong = await Submission.countDocuments({
          teamId: team._id,
          isCorrect: false,
        })

        return {
          teamId: team._id.toString(),
          teamName: team.teamName,
          solvedCount: team.solvedCount,
          currentLevel: team.currentLevel,
          lastSolvedAt: team.lastSolvedAt,
          lastActive: team.lastActive,
          createdAt: team.createdAt,
          suspicious: recentWrong >= 10,
          totalWrongAttempts: totalWrong,
        }
      })
    )

    return NextResponse.json({ teams: enriched, total: teams.length })
  } catch (err) {
    console.error('[ADMIN/TEAMS]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
