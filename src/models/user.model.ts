import bcrypt from 'bcrypt'
import config from 'config'
import mongoose from 'mongoose'

// Integrate mongoose with typescript (possible multiple methods to do this)
export interface UserDocument extends mongoose.Document {
  email: string
  name: string
  password: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

// Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre('save', async function (next: (err?: Error) => void) {
  // userSchema.pre('save', async function (next: mongoose.HookNextFunction) {
  let user = this as UserDocument

  // if save is not modifying password:
  if (!user.isModified('passowrd')) {
    return next()
  }

  // if password is being modified -> replace password (salt+ bcrypt hash = strong password hashing algo)
  const salt = await bcrypt.genSalt(config.get<number>('saltWorkFactor'))
  const hash = await bcrypt.hashSync(user.password, salt)
  user.password = hash
  return next()
})

userSchema.methods.comparePassowrd = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument
  return bcrypt.compare(candidatePassword, user.password).catch((error) => false) // true / throw -> false
}

// Model
const UserModel = mongoose.model('User', userSchema)

export default UserModel
