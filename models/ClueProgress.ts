import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IClueProgress extends Document {
  teamId: mongoose.Types.ObjectId
  clueId: number
  unlockedAt: Date
  solvedAt: Date | null
}

const ClueProgressSchema = new Schema<IClueProgress>({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  clueId: {
    type: Number,
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
  solvedAt: {
    type: Date,
    default: null,
  },
})

ClueProgressSchema.index({ teamId: 1, clueId: 1 }, { unique: true })

const ClueProgress: Model<IClueProgress> =
  mongoose.models.ClueProgress ||
  mongoose.model<IClueProgress>('ClueProgress', ClueProgressSchema)

export default ClueProgress
