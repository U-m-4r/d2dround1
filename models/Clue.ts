import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IClue extends Document {
  clueId: number       // 1–5
  title: string        // Display title, e.g. "SIGNAL_ORIGIN"
  hint: string         // The clue text shown to participants
  answer: string       // Plaintext answer — NEVER sent to frontend
  difficulty: 'easy' | 'medium' | 'hard'
  order: number        // Same as clueId, for sorting
  isActive: boolean
}

const ClueSchema = new Schema<IClue>({
  clueId: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  hint: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
    // Stored as plaintext; compared case-insensitively + trimmed on validation
    // NEVER returned in any API response
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  order: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
})

const Clue: Model<IClue> =
  mongoose.models.Clue || mongoose.model<IClue>('Clue', ClueSchema)

export default Clue
