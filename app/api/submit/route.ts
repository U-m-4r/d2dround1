import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { checkRateLimit } from '@/lib/rateLimit'
import Team from '@/models/Team'
import Clue from '@/models/Clue'
import Submission from '@/models/Submission'
import ClueProgress from '@/models/ClueProgress'

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  // Rate limiting by teamId
  const rateKey = `submit:${session.teamId}`
  const rate = checkRateLimit(rateKey)
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: 'RATE_LIMITED',
        message: `Too many attempts. Try again in ${Math.ceil(rate.resetInMs / 1000)}s.`,
        resetInMs: rate.resetInMs,
      },
      { status: 429 }
    )
  }

  let body: { clueId: number; answer: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  const { clueId, answer } = body

  if (!clueId || !answer) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
  }

  // Extract IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  try {
    await connectDB()

    const team = await Team.findById(session.teamId)
    if (!team) {
      return NextResponse.json({ error: 'TEAM_NOT_FOUND' }, { status: 404 })
    }

    // Anti-cheat: team must be on this clue
    if (team.currentLevel !== clueId) {
      await Submission.create({
        teamId: team._id,
        teamName: team.teamName,
        clueId,
        submittedAnswer: answer.trim(),
        isCorrect: false,
        ipAddress: ip,
      })
      return NextResponse.json(
        { error: 'INVALID_CLUE_LEVEL', message: 'This clue is not unlocked yet.' },
        { status: 403 }
      )
    }

    // Fetch answer from DB — never sent to frontend
    const clue = await Clue.findOne({ clueId, isActive: true })
    if (!clue) {
      return NextResponse.json({ error: 'CLUE_NOT_FOUND' }, { status: 404 })
    }

    const isCorrect =
      answer.trim().toLowerCase() === clue.answer.trim().toLowerCase()

    // Log every submission
    await Submission.create({
      teamId: team._id,
      teamName: team.teamName,
      clueId,
      submittedAnswer: answer.trim(),
      isCorrect,
      ipAddress: ip,
    })

    if (!isCorrect) {
      return NextResponse.json({
        correct: false,
        message: 'ACCESS DENIED. Incorrect token.',
        remaining: rate.remaining,
      })
    }

    // Correct — advance the team
    const now = new Date()
    const nextLevel = team.currentLevel + 1
    const isFinished = nextLevel > 5

    await Team.findByIdAndUpdate(team._id, {
      solvedCount: team.solvedCount + 1,
      currentLevel: isFinished ? 6 : nextLevel, // 6 = all done
      lastSolvedAt: now,
      lastActive: now,
    })

    // Mark this clue solved in progress
    await ClueProgress.findOneAndUpdate(
      { teamId: team._id, clueId },
      { solvedAt: now },
      { upsert: true }
    )

    // Unlock next clue progress record
    if (!isFinished) {
      const alreadyUnlocked = await ClueProgress.findOne({
        teamId: team._id,
        clueId: nextLevel,
      })
      if (!alreadyUnlocked) {
        await ClueProgress.create({
          teamId: team._id,
          clueId: nextLevel,
          unlockedAt: now,
        })
      }
    }

    return NextResponse.json({
      correct: true,
      message: isFinished
        ? 'ALL CLUES DECODED. Mission complete.'
        : `ACCESS GRANTED. Clue ${nextLevel} unlocked.`,
      newLevel: isFinished ? 6 : nextLevel,
      isFinished,
    })
  } catch (err) {
    console.error('[SUBMIT]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
