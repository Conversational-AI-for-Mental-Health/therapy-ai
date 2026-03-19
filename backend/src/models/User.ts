import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserPreferences {
  darkMode: boolean;
  language: 'en' | 'es' | 'fr';
}
// Define the RefreshToken interface
export interface IRefreshToken {
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at?: Date;
}
// Define the User interface extending Mongoose Document
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password_hash?: string;
  googleId?: string;
  appleId?: string;
  reset_password_token?: string;
  reset_password_expires?: Date;
  refresh_tokens: IRefreshToken[];
  preferences: IUserPreferences;
  conversations: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
// Define the User schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [1, 'Name must be at least 1 character'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, 
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    password_hash: {
      type: String,
      required: function (this: any) {
        return !this.googleId && !this.appleId;
      },
      minlength: [60, 'Password hash must be at least 60 characters (bcrypt)'],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    appleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    reset_password_token: { type: String, select: false },
    reset_password_expires: { type: Date, select: false },
    refresh_tokens: [
      {
        token_hash: { type: String, required: true, select: false },
        expires_at: { type: Date, required: true, select: false },
        created_at: { type: Date, default: Date.now, select: false },
        revoked_at: { type: Date, select: false },
      },
    ],
    preferences: {
      darkMode: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        enum: ['en', 'es', 'fr'],
        default: 'en',
      },
    },
    conversations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
UserSchema.index({ createdAt: -1, _id: 1 });

// Virtual property to exclude sensitive fields when converting to JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

export const User = mongoose.model<IUser>('User', UserSchema);
