/**
 * Decode2Deploy — Seed Script
 * Run: npx tsx scripts/seed.ts
 *
 * Populates:
 *   - 5 placeholder clues
 *   - 3 test teams (for dev/testing only — delete before event)
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
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

// Safety: only allow seeding in development by default to avoid accidental
// insertion of test teams into production databases. To force-run in other
// environments set FORCE_SEED=true in the environment.
if (process.env.NODE_ENV !== 'development' && process.env.FORCE_SEED !== 'true') {
  console.error('❌  Refusing to run seed outside development. Set NODE_ENV=development or FORCE_SEED=true to override.')
  process.exit(1)
}

// ── Inline schemas (avoid Next.js module resolution issues in script) ──

const ClueSchema = new mongoose.Schema({
  clueId: Number, title: String, hint: String,
  answer: String, difficulty: String, order: Number, isActive: Boolean,
})
const TeamSchema = new mongoose.Schema({
  teamName: { type: String, unique: true }, passwordHash: String,
  solvedCount: { type: Number, default: 0 }, currentLevel: { type: Number, default: 1 },
  lastSolvedAt: { type: Date, default: null }, lastActive: Date,
}, { timestamps: true })
const ClueProgressSchema = new mongoose.Schema({
  teamId: mongoose.Schema.Types.ObjectId, clueId: Number,
  unlockedAt: Date, solvedAt: { type: Date, default: null },
})

const Clue = mongoose.models.Clue || mongoose.model('Clue', ClueSchema)
const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema)
const ClueProgress = mongoose.models.ClueProgress || mongoose.model('ClueProgress', ClueProgressSchema)

// ── Placeholder clues ────────────────────────────────────────────────
const PLACEHOLDER_CLUES = [
  {
    clueId: 1, order: 1, difficulty: 'easy', isActive: true,
    title: 'SIGNAL_ORIGIN',
    hint: 'The first trace always starts where you entered. Look around carefully — sometimes the answer is hiding in plain sight.',
    answer: 'PLACEHOLDER_1',
  },
  {
    clueId: 2, order: 2, difficulty: 'medium', isActive: true,
    title: 'COMMIT_GHOST',
    hint: 'The deleted line remembers what the living forgot. Git never truly forgets.',
    answer: 'PLACEHOLDER_2',
  },
  {
    clueId: 3, order: 3, difficulty: 'medium', isActive: true,
    title: 'ARRAY_TRUTH',
    hint: 'Where arrays never end, the pattern begins. The problem number is on the shirt.',
    answer: 'PLACEHOLDER_3',
  },
  {
    clueId: 4, order: 4, difficulty: 'hard', isActive: true,
    title: 'FRAME_ZERO',
    hint: 'Not every frame is meant to be seen. Replay slowly. The answer blinks.',
    answer: 'PLACEHOLDER_4',
  },
  {
    clueId: 5, order: 5, difficulty: 'hard', isActive: true,
    title: 'DEVTOOLS_FINAL',
    hint: 'Where do we lie? Coordinates of the invisible publisher. The marketplace knows.',
    answer: 'PLACEHOLDER_5',
  },
]

// ── Test teams (DEV ONLY — remove before event) ───────────────────────
const TEST_TEAMS = [
  { teamName: 'Team Alpha', password: 'alpha123' },
  { teamName: 'Team Beta',  password: 'beta456'  },
  { teamName: 'Team Gamma', password: 'gamma789' },
  { teamName: 'Team Delta', password: 'delta101' },
]

async function seed() {
  console.log('\n🔌  Connecting to MongoDB Atlas...')
  await mongoose.connect(MONGODB_URI!)
  console.log('✅  Connected.\n')

  // ── Clues ────────────────────────────────────────────────────────
  console.log('📋  Seeding clues...')
  await Clue.deleteMany({})
  await Clue.insertMany(PLACEHOLDER_CLUES)
  console.log(`   ✓ ${PLACEHOLDER_CLUES.length} placeholder clues inserted.\n`)

  // ── Test teams ────────────────────────────────────────────────────
  console.log('👥  Seeding test teams...')
  for (const t of TEST_TEAMS) {
    const exists = await Team.findOne({ teamName: t.teamName })
    if (exists) {
      console.log(`   ⚠  "${t.teamName}" already exists — skipping.`)
      continue
    }
    const passwordHash = await bcrypt.hash(t.password, 12)
    const team = await Team.create({
      teamName: t.teamName,
      passwordHash,
      currentLevel: 1,
      solvedCount: 0,
      lastActive: new Date(),
    })
    // Unlock clue 1 for each team
    await ClueProgress.create({ teamId: team._id, clueId: 1, unlockedAt: new Date() })
    console.log(`   ✓ Created "${t.teamName}" (password: ${t.password})`)
  }

  console.log('\n🎉  Seed complete!')
  console.log('\n⚠   REMINDER: Delete test teams before the live event.\n')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
