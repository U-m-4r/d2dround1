import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISubmission extends Document {
  teamId: mongoose.Types.ObjectId
  teamName: string  // Denormalized for admin queries
  clueId: number
  submittedAnswer: string
  isCorrect: boolean
  submittedAt: Date
  ipAddress: string
}

const SubmissionSchema = new Schema<ISubmission>({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  teamName: {
    type: String,
    required: true,
  },
  clueId: {
    type: Number,
    required: true,
  },
  submittedAnswer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    default: 'unknown',
  },
})

// Indexes for admin dashboard queries
SubmissionSchema.index({ teamId: 1, clueId: 1 })
SubmissionSchema.index({ submittedAt: -1 })
SubmissionSchema.index({ isCorrect: 1 })

const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>('Submission', SubmissionSchema)

export default Submission
