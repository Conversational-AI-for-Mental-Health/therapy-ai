import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserPreferences {
  darkMode: boolean;
  language: 'en' | 'es' | 'fr';
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password_hash: string;
  preferences: IUserPreferences;
  conversations: Types.ObjectId[];
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
      required: [true, 'Password hash is required'],
      minlength: [60, 'Password hash must be at least 60 characters (bcrypt)'],
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
