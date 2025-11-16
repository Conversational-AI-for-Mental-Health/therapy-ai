import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IConversation extends Document {
  user: Types.ObjectId;     // Reference to a User
  title?: string;           // e.g., "Stress session" (optional)
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index: fast "all conversations for a user, newest first"
ConversationSchema.index({ user: 1, updatedAt: -1 });

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
