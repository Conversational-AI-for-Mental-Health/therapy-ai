import mongoose, { Schema, Document, Types } from 'mongoose';
import { MessageSchema, IMessage } from './Message';

// Define instance methods interface
interface IConversationMethods {
  addMessage(sender: 'user' | 'ai', text: string): IMessage;
  getRecentMessages(limit?: number): IMessage[];
}

// Combine Document with our interface and methods
export interface IConversation extends Document, IConversationMethods {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  title: string;
  started_at: Date;
  last_message_at?: Date;
  ended_at?: Date;
  archived: boolean;
  deleted: boolean;
  messages: Types.DocumentArray<IMessage>;
  message_count: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create model type with methods
type ConversationModel = mongoose.Model<
  IConversation,
  {},
  IConversationMethods
>;

const ConversationSchema = new Schema<
  IConversation,
  ConversationModel,
  IConversationMethods
>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      default: 'New Conversation',
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    started_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    last_message_at: {
      type: Date,
    },
    ended_at: {
      type: Date,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    messages: [MessageSchema],
    message_count: {
      type: Number,
      default: 0,
      min: [0, 'Message count cannot be negative'],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
ConversationSchema.index({ user_id: 1, last_message_at: -1 });
ConversationSchema.index({ user_id: 1, archived: 1, last_message_at: -1 });
ConversationSchema.index({ user_id: 1, deleted: 1, last_message_at: -1 });

// Middleware: Update last_message_at and message_count when messages are added
ConversationSchema.pre('save', function () {
  if (this.messages && this.messages.length > 0) {
    this.message_count = this.messages.length;
    const lastMessage = this.messages[this.messages.length - 1];
    this.last_message_at = lastMessage.timestamp;
  }
});

// Instance Methods
ConversationSchema.methods.addMessage = function (
  sender: 'user' | 'ai',
  text: string,
): IMessage {
  const message = {
    sender,
    text,
    timestamp: new Date(),
    metadata: {
      liked: false,
      copied: false,
      regenerated: false,
      edited: false,
    },
  };
  this.messages.push(message);
  return this.messages[this.messages.length - 1];
};

ConversationSchema.methods.getRecentMessages = function (
  limit: number = 20,
): IMessage[] {
  return this.messages.slice(-limit);
};

export const Conversation = mongoose.model<IConversation, ConversationModel>(
  'Conversation',
  ConversationSchema,
);
