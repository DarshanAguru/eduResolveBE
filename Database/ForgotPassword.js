import { model, Schema } from 'mongoose'

const ForgotPasswordSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  emailId: { type: String, required: true },
  type: { type: String, required: true },
  otp: { type: String, required: true }
},
{
  timestamps: true
})

ForgotPasswordSchema.index({ createdAt: 1 }, { expireAfterSeconds: 200 })

export const ForgotPassword = model('ForgotPassword', ForgotPasswordSchema)
