import { model, Schema } from 'mongoose';

const AssignmentSubmissions = new Schema(
  {
    senderId: { type: String },
    senderName: { type: String },
    assignmentAnswers: { type: Array },
    points: { type: String, default: '0' }
  },
  {
    timestamps: {
      createdAt: 'created_at'
    }
  }
);

const AssignmentsSchema = new Schema(
  {
    assignmentId: { 
      type: String, 
      required: true 
    }, // conversation ID – teacher + nonce
    assignmentTitle: { type: String },
    questions: { type: Array },
    publishDate: { type: String },
    deadline: { type: String },
    school: { type: String },
    grade: { type: String },
    subject: { type: String },
    submissions: { type: [AssignmentSubmissions] }
  },
  {
    timestamps: {
      createdAt: 'created_at'
    }
  }
);

export const Assignments = model('Assignments', AssignmentsSchema);
