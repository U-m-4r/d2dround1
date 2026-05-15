import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITeam extends Document {
  teamName: string
  passwordHash: string
  solvedCount: number
  currentLevel: number // 0 = no clues solved, 1 = on clue 1, etc.
  lastSolvedAt: Date | null
  createdAt: Date
  lastActive: Date
}

const TeamSchema = new Schema<ITeam>(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    solvedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentLevel: {
      type: Number,
      default: 1, // starts on clue 1
      min: 1,
    },
    lastSolvedAt: {
      type: Date,
      default: null,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// Prevent model overwrite on hot-reload
const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema)

export default Team
