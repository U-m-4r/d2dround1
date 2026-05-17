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

    // 1. Fetch aggregation stats for all teams in ONE single database query
    const now = new Date()
    const fiveMinsAgo = new Date(now.getTime() - SUSPICIOUS_WINDOW_MINUTES * 60 * 1000)

    const stats = await Submission.aggregate([
      {
        $match: {
          isCorrect: false,
        },
      },
      {
        $group: {
          _id: '$teamId',
          totalWrong: { $sum: 1 },
          recentWrong: {
            $sum: {
              $cond: [
                { $gte: ['$submittedAt', fiveMinsAgo] },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    // Convert stats array to a quick O(1) lookup Map
    const statsMap = new Map<string, { totalWrong: number; recentWrong: number }>()
    stats.forEach((item) => {
      if (item._id) {
        statsMap.set(item._id.toString(), {
          totalWrong: item.totalWrong || 0,
          recentWrong: item.recentWrong || 0,
        })
      }
    })

    // 2. Map and enrich team objects quickly without any nested database queries
    const leaderboard = teams.map((team, index) => {
      const teamStats = statsMap.get(team._id.toString()) ?? { totalWrong: 0, recentWrong: 0 }

      return {
        rank: index + 1,
        teamName: team.teamName,
        solvedCount: team.solvedCount,
        currentLevel: team.currentLevel,
        lastSolvedAt: team.lastSolvedAt,
        lastActive: team.lastActive,
        createdAt: team.createdAt,
        teamId: team._id.toString(),
        suspicious: teamStats.recentWrong >= SUSPICIOUS_THRESHOLD,
        totalWrongAttempts: teamStats.totalWrong,
      }
    })

    return NextResponse.json({ leaderboard, total: teams.length })
  } catch (err) {
    console.error('[LEADERBOARD]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
