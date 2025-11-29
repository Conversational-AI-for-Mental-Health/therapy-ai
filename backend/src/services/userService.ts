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
