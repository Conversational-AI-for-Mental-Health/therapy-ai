import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserPreferences {
  darkMode: boolean;
  language: 'en' | 'es' | 'fr';
}

export interface IRefreshToken {
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at?: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password_hash?: string;
  reset_password_token?: string;
  reset_password_expires?: Date;
  googleId?: string;
  appleId?: string;
  preferences: IUserPreferences;
  conversations: Types.ObjectId[];
  refresh_tokens: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

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
      unique: true, // Keep this, but remove UserSchema.index() below
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
    reset_password_token: {
      type: String,
      select: false,
    },
    reset_password_expires: {
      type: Date,
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
    refresh_tokens: [
      {
        token_hash: {
          type: String,
          required: true,
          select: false,
        },
        expires_at: {
          type: Date,
          required: true,
          select: false,
        },
        created_at: {
          type: Date,
          default: Date.now,
          select: false,
        },
        revoked_at: {
          type: Date,
          select: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
UserSchema.index({ createdAt: -1, _id: 1 });

// Methods
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

export const User = mongoose.model<IUser>('User', UserSchema);
