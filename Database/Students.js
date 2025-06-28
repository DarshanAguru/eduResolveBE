import { model, Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    userId: { type: String },
    userName: { type: String },
    notificationType: { type: String },
    createdAt: { type: String },
    count: { type: Number, default: 0 }
  },
  {
    timestamps: false
  }
);

const StudentSchema = new Schema(
  {
    phoneNumber: { 
      type: String, 
      required: true, 
      unique: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    emailId: { 
      type: String 
    },
    grade: { 
      type: String, 
      required: true 
    },
    school: { 
      type: String, 
      required: true 
    },
    age: { 
      type: String 
    },
    gender: { 
      type: String 
    },
    password: { 
      type: String, 
      required: true 
    },
    assignments: { 
      type: [String] 
    },
    messages: { 
      type: [String] 
    },
    notifications: { 
      type: [NotificationSchema] 
    },
    role: { 
      type: String, 
      default: 'student' 
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

export const Students = model('Students', StudentSchema);
