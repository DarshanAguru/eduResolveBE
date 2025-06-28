import { model, Schema } from 'mongoose';

const ReplyMessages = new Schema({
  senderId: { type: String },
  senderGender: { type: String },
  senderType: { type: String },
  senderName: { type: String },
  message: { type: String },
  imageLink: { type: String }
},
{
  timestamps: {
    createdAt: 'created_at'
  }
});

const MessagesSchema = new Schema(
  {
    messageId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // conversation ID (e.g., student + nonce)

    messageSenderName: { 
      type: String 
    },
    messageSenderGender: { 
      type: String 
    },
    messageData: { 
      type: String 
    },
    imageLink: { 
      type: String 
    },
    tags: { 
      type: [String] 
    },
    school: { 
      type: String 
    },
    replies: { 
      type: [ReplyMessages] 
    },
    reports: { 
      type: [String] 
    },
    upvote: { 
      type: [String] 
    },
    downvote: { 
      type: [String] 
    }
  },
  {
    timestamps: {
      createdAt: 'created_at'
    }
  }
);

export const Messages = model('Messages', MessagesSchema);
