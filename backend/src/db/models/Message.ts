import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type MessageRole = "user" | "bot" | "system";

export interface IMessage extends Document {
  conversation: Types.ObjectId;   // ref to Conversation
  user?: Types.ObjectId;          // ref to User (optional for bot/system)
  role: MessageRole;              // user | bot | system
  text: string;
  metadata?: Record<string, any>; // optional, for extra info (scores, tags, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      enum: ["user", "bot", "system"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast retrieval of a conversation's messages in time order
MessageSchema.index({ conversation: 1, createdAt: 1 });

// Optional: index for per-user message analytics
MessageSchema.index({ user: 1, createdAt: -1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
