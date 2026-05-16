import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRoundState extends Document {
  name: string
  isStarted: boolean
  isPaused: boolean
  isEnded: boolean
  startedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const RoundStateSchema = new Schema<IRoundState>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
    },
    isStarted: {
      type: Boolean,
      default: false,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    isEnded: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

const RoundState: Model<IRoundState> =
  mongoose.models.RoundState || mongoose.model<IRoundState>('RoundState', RoundStateSchema)

export default RoundState