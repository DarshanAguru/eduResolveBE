import { model, Schema } from 'mongoose';

const VerificationTagSchema = new Schema(
  {
    userId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    userType: { 
      type: String, 
      required: true 
    },
    token: { 
      type: String, 
      required: true 
    }
  },
  {
    timestamps: true
  }
);

// TTL index: expires after 24 hours (86400 seconds)
VerificationTagSchema.index(
  { createdAt: 1 }, 
  { expireAfterSeconds: 86400 }
);

export const VerificationTag = model(
  'VerificationTag', 
  VerificationTagSchema
);
