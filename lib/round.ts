import { connectDB } from '@/lib/db'
import RoundState from '@/models/RoundState'

export async function getRoundState() {
  await connectDB()

  const state = await RoundState.findOneAndUpdate(
    { name: 'global' },
    { $setOnInsert: { name: 'global', isStarted: false, isPaused: false, isEnded: false, startedAt: null } },
    { upsert: true, new: true }
  ).lean()

  return state ?? { name: 'global', isStarted: false, isPaused: false, isEnded: false, startedAt: null }
}

export async function isRoundStarted() {
  const state = await getRoundState()
  return Boolean(state.isStarted)
}

export async function isRoundPaused() {
  const state = await getRoundState()
  return Boolean(state.isPaused)
}

export async function isRoundEnded() {
  const state = await getRoundState()
  return Boolean(state.isEnded)
}