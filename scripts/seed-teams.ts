import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set')
  process.exit(1)
}

const TeamSchema = new mongoose.Schema({
  teamName: { type: String, unique: true }, passwordHash: String,
  solvedCount: { type: Number, default: 0 }, currentLevel: { type: Number, default: 1 },
  lastSolvedAt: { type: Date, default: null }, lastActive: Date,
}, { timestamps: true })

const ClueProgressSchema = new mongoose.Schema({
  teamId: mongoose.Schema.Types.ObjectId, clueId: Number,
  unlockedAt: Date, solvedAt: { type: Date, default: null },
})

const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema)
const ClueProgress = mongoose.models.ClueProgress || mongoose.model('ClueProgress', ClueProgressSchema)

async function seedTeams() {
  console.log('🔌 Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI!)
  console.log('✅ Connected.')

  const csvPath = path.resolve(__dirname, '../Team_Passwords.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Team_Passwords.csv not found')
    process.exit(1)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(l => l.trim().length > 0)
  
  const teams = lines.slice(1).map(line => {
    const parts = line.split(',')
    const password = parts.pop()?.trim() || ''
    const teamName = parts.join(',').trim()
    return { teamName, password }
  }).filter(t => t.teamName && t.password)

  console.log(`👥 Found ${teams.length} teams in CSV. Seeding...`)

  let newTeamsCount = 0;
  for (const t of teams) {
    const exists = await Team.findOne({ teamName: t.teamName })
    if (exists) {
      // Update password hash just in case
      const passwordHash = await bcrypt.hash(t.password, 12)
      await Team.updateOne({ _id: exists._id }, { passwordHash })
      console.log(`   ⚠ "${t.teamName}" already exists — updated password.`)
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
    
    await ClueProgress.create({ teamId: team._id, clueId: 1, unlockedAt: new Date() })
    console.log(`   ✓ Created "${t.teamName}"`)
    newTeamsCount++;
  }

  console.log(`\n🎉 Done! Added ${newTeamsCount} new teams.`)
  await mongoose.disconnect()
  process.exit(0)
}

seedTeams().catch(err => {
    console.error(err)
    process.exit(1)
})
