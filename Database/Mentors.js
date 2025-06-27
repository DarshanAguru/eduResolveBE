import { model, Schema } from 'mongoose';

const MentorsSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  emailId: { type: String, required: true },
  qualification: { type: String, required: true },
  subjectExpertise: { type: [String], required: true },
  resumeLink: { type: String, required: true },
  institution: { type: String },
  age: { type: Number },
  gender: { type: String },
  password: { type: String, required: true },
  verificationStatus: { type: String, default: 'pending' },
  description: { type: String },
  messages: { type: [String] },
  role: { type: String, default: 'mentor' }
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export const Mentors = model('Mentors', MentorsSchema);
