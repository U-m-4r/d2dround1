import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Team from '@/models/Team'
import Submission from '@/models/Submission'

// Suspicious detection configuration (tunable via env)
const SUSPICIOUS_THRESHOLD = parseInt(process.env.SUSPICIOUS_THRESHOLD || '10', 10)
const SUSPICIOUS_WINDOW_MINUTES = parseInt(process.env.SUSPICIOUS_WINDOW_MINUTES || '5', 10)

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

    // Enrich leaderboard entries with suspicious/totalWrongAttempts (same logic as admin/teams)
    const leaderboard = await Promise.all(
      teams.map(async (team, index) => {
        const recentWrong = await Submission.countDocuments({
          teamId: team._id,
          isCorrect: false,
          submittedAt: { $gte: new Date(Date.now() - SUSPICIOUS_WINDOW_MINUTES * 60 * 1000) },
        })

        const totalWrong = await Submission.countDocuments({
          teamId: team._id,
          isCorrect: false,
        })

        return {
          rank: index + 1,
          teamName: team.teamName,
          solvedCount: team.solvedCount,
          currentLevel: team.currentLevel,
          lastSolvedAt: team.lastSolvedAt,
          lastActive: team.lastActive,
          createdAt: team.createdAt,
          teamId: team._id.toString(),
          suspicious: recentWrong >= SUSPICIOUS_THRESHOLD,
          totalWrongAttempts: totalWrong,
        }
      })
    )

    return NextResponse.json({ leaderboard, total: teams.length })
  } catch (err) {
    console.error('[LEADERBOARD]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
