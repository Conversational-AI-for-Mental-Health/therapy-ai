import { model, Schema, Document, Types } from 'mongoose';
import { IMessage, MessageSchema } from './Message';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  title: string;
  started_at: Date;
  ended_at?: Date;
  archived: boolean;
  messages: IMessage[];
  message_count: number;
  last_message_at?: Date;
  addMessage: (sender: 'user' | 'ai', text: string) => void;
  getRecentMessages: (limit?: number) => IMessage[];
}

const ConversationSchema = new Schema<IConversation>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
      default: 'New Conversation',
    },
    started_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    ended_at: {
      type: Date,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    messages: [MessageSchema],
    message_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    last_message_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

ConversationSchema.methods.addMessage = function (
  sender: 'user' | 'ai',
  text: string,
) {
  const timestamp = new Date();
  this.messages.push({
    sender,
    text,
    timestamp,
    metadata: {
      liked: false,
      copied: false,
      regenerated: false,
      edited: false,
    },
  } as any);
  this.message_count = this.messages.length;
  this.last_message_at = timestamp;
};

ConversationSchema.methods.getRecentMessages = function (limit: number = 50) {
  return this.messages.slice(-limit);
};

ConversationSchema.index({ user_id: 1, archived: 1 });
ConversationSchema.index({ last_message_at: -1 });

export const Conversation = model<IConversation>(
  'Conversation',
  ConversationSchema,
);
