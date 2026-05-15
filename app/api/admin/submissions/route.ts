import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Submission from '@/models/Submission'

function isAdminAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get('teamId')
  const clueId = searchParams.get('clueId')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200)

  try {
    await connectDB()

    const filter: Record<string, unknown> = {}
    if (teamId) filter.teamId = teamId
    if (clueId) filter.clueId = parseInt(clueId)

    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        id: s._id.toString(),
        teamName: s.teamName,
        clueId: s.clueId,
        submittedAnswer: s.submittedAnswer,
        isCorrect: s.isCorrect,
        submittedAt: s.submittedAt,
        ipAddress: s.ipAddress,
      })),
      total: submissions.length,
    })
  } catch (err) {
    console.error('[ADMIN/SUBMISSIONS]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
