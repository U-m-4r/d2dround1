/**
 * Decode2Deploy — Seed Real Clues
 * Run: npx tsx scripts/seed-real-clues.ts
 */

import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not set in .env.local')
  process.exit(1)
}

const ClueSchema = new mongoose.Schema({
  clueId: Number, title: String, hint: String,
  answer: String, difficulty: String, order: Number, isActive: Boolean,
})
const Clue = mongoose.models.Clue || mongoose.model('Clue', ClueSchema)

const REAL_CLUES = [
  {
    clueId: 1, order: 1, difficulty: 'easy', isActive: true,
    title: 'SIGNAL_ORIGIN',
    hint: 'Real signals aren’t always in the interface—they’re in the behavior. This confidential lock leaks a signature when disturbed. Interact with it, trace the change, and identify the hidden token.',
    answer: 'LOCK-796',
  },
  {
    clueId: 2, order: 2, difficulty: 'medium', isActive: true,
    title: 'COMMIT_GHOST',
    hint: 'Questions may guide users. This one guides investigators. Start where answers are expected, follow the redirection, trace the project’s recorded history, identify the anomalous fragment, and decode what it conceals.',
    answer: 'COMMIT-45621',
  },
  {
    clueId: 3, order: 3, difficulty: 'medium', isActive: true,
    title: 'ARRAY_TRUTH',
    hint: 'Some numbers become legends before they become references. Think like a chaser — one of those numbers is being worn in this room. The platform trusted by millions of interviews holds the next step. Find the problem, solve it, and trust the data exactly as it appears.',
    answer: '294',
  },
  {
    clueId: 4, order: 4, difficulty: 'hard', isActive: true,
    title: 'FRAME_ZERO',
    hint: 'Marketing never leaves details untouched.\nPatterns repeat until only dominant signals remain.\nR. G. B. Y.\nMost of what you see is noise.',
    answer: '6478',
  },
  {
    clueId: 5, order: 5, difficulty: 'hard', isActive: true,
    title: 'DEVTOOLS_FINAL',
    hint: 'Every save resurrects the same unseen servant. Frontend apprentices memorize its doorway yet rarely question the garments it currently wears. Follow the marketplace trail, recover the servant’s semantic disguise, and render it directly into the native language of machines. Measure absence before presence, and let their tallies speak as one.',
    answer: '3224',
  },
]

async function seedClues() {
  console.log('\n🔌  Connecting to MongoDB Atlas...')
  await mongoose.connect(MONGODB_URI!)
  console.log('✅  Connected.\n')

  console.log('📋  Seeding real clues...')
  await Clue.deleteMany({})
  await Clue.insertMany(REAL_CLUES)
  console.log(`   ✓ ${REAL_CLUES.length} real clues inserted.\n`)

  console.log('\n🎉  Clues Seed complete!')
  await mongoose.disconnect()
  process.exit(0)
}

seedClues().catch((err) => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
