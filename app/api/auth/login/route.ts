import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { signToken, COOKIE_NAME } from '@/lib/auth'
import Team from '@/models/Team'
import ClueProgress from '@/models/ClueProgress'

export async function POST(req: NextRequest) {
  try {
    const { teamName, password } = await req.json()

    if (!teamName || !password) {
      return NextResponse.json(
        { error: 'AUTHENTICATION_FAILED', message: 'Team name and password are required.' },
        { status: 400 }
      )
    }

    await connectDB()

    const team = await Team.findOne({ teamName: teamName.trim() })

    if (!team) {
      return NextResponse.json(
        { error: 'AUTHENTICATION_FAILED', message: 'Invalid team name or password.' },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, team.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'AUTHENTICATION_FAILED', message: 'Invalid team name or password.' },
        { status: 401 }
      )
    }

    // Update lastActive
    await Team.findByIdAndUpdate(team._id, { lastActive: new Date() })

    // Ensure clue 1 progress record exists (unlock it if not)
    const existing = await ClueProgress.findOne({ teamId: team._id, clueId: 1 })
    if (!existing) {
      await ClueProgress.create({ teamId: team._id, clueId: 1, unlockedAt: new Date() })
    }

    const token = signToken({
      teamId: team._id.toString(),
      teamName: team.teamName,
      currentLevel: team.currentLevel,
    })

    const response = NextResponse.json({
      success: true,
      teamName: team.teamName,
      currentLevel: team.currentLevel,
      solvedCount: team.solvedCount,
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[AUTH/LOGIN]', err)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'An internal error occurred.' },
      { status: 500 }
    )
  }
}
