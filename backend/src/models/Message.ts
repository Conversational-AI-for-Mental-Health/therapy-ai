import { Schema, Document, Types } from 'mongoose';

export interface IMessageMetadata {
  liked: boolean;
  copied: boolean;
  regenerated: boolean;
  edited: boolean;
  original_text?: string;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  metadata: IMessageMetadata;
}

// Message Sub-Schema (embedded in Conversation)
export const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: String,
      required: [true, 'Sender is required'],
      enum: {
        values: ['user', 'ai'],
        message: 'Sender must be either "user" or "ai"',
      },
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      minlength: [1, 'Message cannot be empty'],
      maxlength: [10000, 'Message cannot exceed 10000 characters'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    metadata: {
      liked: {
        type: Boolean,
        default: false,
      },
      copied: {
        type: Boolean,
        default: false,
      },
      regenerated: {
        type: Boolean,
        default: false,
      },
      edited: {
        type: Boolean,
        default: false,
      },
      original_text: {
        type: String,
        required: false,
      },
    },
  },
  { _id: true },
);
