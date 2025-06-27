import { model, Schema } from 'mongoose';

const NotificationSchema = new Schema({
  userId: { type: String },
  userName: { type: String },
  notificationType: { type: String },
  createdAt: { type: String },
  count: { type: Number, default: 0 }
},
{
  timestamps: false
});

const TeachersSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  emailId: { type: String, required: true },
  subjectExpertise: { type: [String], required: true },
  institution: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  password: { type: String, required: true },
  verificationStatus: { type: String, default: 'pending' },
  qualification: { type: String },
  assignments: { type: [String] },
  messages: { type: [String] },
  notifications: { type: [NotificationSchema] },
  role: { type: String, default: 'teacher' }

},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export const Teachers = model('Teachers', TeachersSchema);
