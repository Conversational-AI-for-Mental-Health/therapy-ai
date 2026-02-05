import { User, IUser } from '../models';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class UserService {
  static async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<IUser> {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      name,
      email,
      password_hash,
      preferences: {
        darkMode: true,
        language: 'en',
      },
      conversations: [],
    });

    await user.save();
    return user;
  }
  //from google api
  static async findOrCreateSocialUser(
    provider: 'google' | 'apple',
    profile: {
      id: string;
      email: string;
      name?: string;
    }
  ): Promise<IUser> {
    const query = {
      $or: [
        { email: profile.email },
        { [provider === 'google' ? 'googleId' : 'appleId']: profile.id }
      ]
    };

    let user = await User.findOne(query).select('+googleId +appleId');
    //find the ids if not create
    if (user) {
      if (provider === 'google' && !user.googleId) {
        user.googleId = profile.id;
        await user.save();
      } else if (provider === 'apple' && !user.appleId) {
        user.appleId = profile.id;
        await user.save();
      }
      return user;
    }

    user = new User({
      name: profile.name || 'User',
      email: profile.email,
      [provider === 'google' ? 'googleId' : 'appleId']: profile.id,
      preferences: {
        darkMode: true,
        language: 'en',
      },
      conversations: [],
    });

    await user.save();
    return user;
  }

  static async findUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password_hash');
  }

  static async findUserById(
    userId: string | Types.ObjectId,
  ): Promise<IUser | null> {
    return User.findById(userId);
  }

  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async addConversationToUser(
    userId: string | Types.ObjectId,
    conversationId: Types.ObjectId,
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { $push: { conversations: conversationId } },
      { new: true },
    );
  }
}
