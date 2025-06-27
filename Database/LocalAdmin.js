import { model, Schema } from 'mongoose';

const LocalAdminsSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  emailId: { type: String, required: true },
  designation: { type: String, required: true },
  institution: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  password: { type: String, required: true },
  verificationStatus: { type: String, default: 'pending' },
  description: { type: String },
  role: { type: String, default: 'organization' },
  address: { type: String }
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export const LocalAdmins = model('LocalAdmins', LocalAdminsSchema);
