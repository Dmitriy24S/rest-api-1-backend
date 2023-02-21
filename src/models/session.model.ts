import bcrypt from 'bcrypt'
import config from 'config'
import mongoose from 'mongoose'
import { UserDocument } from './user.model'

// Integrate mongoose with typescript (possible multiple methods to do this)
export interface SessionDocument extends mongoose.Document {
  user: UserDocument['_id']
  valid: boolean
  userAgent: string
  createdAt: Date
  updatedAt: Date
}

// Schema
const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    valid: {
      type: Boolean,
      default: true,
    },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
)

// Model
// const SessionModel = mongoose.model('Session', sessionSchema)
const SessionModel = mongoose.model<SessionDocument>('Session', sessionSchema)

export default SessionModel
