import { connectDB } from '@/lib/db'
import RoundState from '@/models/RoundState'

export async function getRoundState() {
  await connectDB()

  // Use simple findOne (read) instead of findOneAndUpdate (write/lock) to avoid lock contention
  const state = await RoundState.findOne({ name: 'global' }).lean()

  return state ?? { name: 'global', isStarted: false, isPaused: false, isEnded: false, startedAt: null }
}

export async function getRoundStatuses() {
  const state = await getRoundState()
  return {
    isStarted: Boolean(state.isStarted),
    isPaused: Boolean(state.isPaused),
    isEnded: Boolean(state.isEnded),
  }
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