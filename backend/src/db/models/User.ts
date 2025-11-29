import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  authId?: string;       // e.g., Firebase UID or external auth ID
  email?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    authId: { type: String, index: true },  // helpful for mapping to auth
    email: { type: String, index: true },
    name: { type: String },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);


export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
