import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import Team from '@/models/Team'
import ClueProgress from '@/models/ClueProgress'
import { ADMIN_SECRET } from '@/lib/env'

function isAdminAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === ADMIN_SECRET
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  let body: { teamName: string; password: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  const { teamName, password } = body
  if (!teamName || !password) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
  }

  const name = String(teamName).trim()
  if (name.length < 3) {
    return NextResponse.json({ error: 'INVALID_TEAM_NAME', message: 'Team name too short' }, { status: 400 })
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: 'INVALID_PASSWORD', message: 'Password too short' }, { status: 400 })
  }

  try {
    await connectDB()

    const existing = await Team.findOne({ teamName: name })
    if (existing) {
      return NextResponse.json({ error: 'ALREADY_EXISTS', message: 'Team name already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const team = await Team.create({
      teamName: name,
      passwordHash,
      currentLevel: 1,
      solvedCount: 0,
      lastActive: new Date(),
    })

    // Unlock clue 1 progress
    await ClueProgress.findOneAndUpdate(
      { teamId: team._id, clueId: 1 },
      { unlockedAt: new Date() },
      { upsert: true }
    )

    return NextResponse.json({ success: true, teamId: team._id.toString(), teamName: team.teamName }, { status: 201 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[ADMIN/REGISTER]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
