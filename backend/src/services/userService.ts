import { User, IUser } from '../models';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import config from '../config';

// Constants for password hashing and token management
const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_MS = 1000 * 60 * 15;
const REFRESH_TOKEN_SIZE_BYTES = 48;
const MAX_ACTIVE_REFRESH_TOKENS = 5;
const REFRESH_TOKEN_SELECT =
  '+refresh_tokens.token_hash +refresh_tokens.expires_at +refresh_tokens.created_at +refresh_tokens.revoked_at';

export class UserService {
  static async createUser(name: string, email: string, password: string): Promise<IUser> {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      name, email, password_hash,
      preferences: { darkMode: true, language: 'en' },
      conversations: [],
    });
    await user.save();
    return user;
  }

  static async findOrCreateSocialUser(
    provider: 'google' | 'apple',
    profile: { id: string; email: string; name?: string }
  ): Promise<IUser> {
    const query = {
      $or: [
        { email: profile.email },
        { [provider === 'google' ? 'googleId' : 'appleId']: profile.id }
      ]
    };
    let user = await User.findOne(query).select('+googleId +appleId');
    if (user) {
      if (provider === 'google' && !user.googleId) { user.googleId = profile.id; await user.save(); }
      else if (provider === 'apple' && !user.appleId) { user.appleId = profile.id; await user.save(); }
      return user;
    }
    user = new User({
      name: profile.name || 'User', email: profile.email,
      [provider === 'google' ? 'googleId' : 'appleId']: profile.id,
      preferences: { darkMode: true, language: 'en' },
      conversations: [],
    });
    await user.save();
    return user;
  }

  static async findUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password_hash');
  }

  static async findUserById(userId: string | Types.ObjectId): Promise<IUser | null> {
    return User.findById(userId);
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async addConversationToUser(
    userId: string | Types.ObjectId,
    conversationId: Types.ObjectId,
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, { $push: { conversations: conversationId } }, { new: true });
  }

  static async createPasswordResetToken(
    email: string,
  ): Promise<{ token: string | null; expiresAt?: Date }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+reset_password_token +reset_password_expires',
    );

    if (!user) return { token: null };

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    user.reset_password_token = hashedToken;
    user.reset_password_expires = expiresAt;
    await user.save();

    return { token: rawToken, expiresAt };
  }

  static async resetPasswordByEmail(email: string, newPassword: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail })
      .select('+password_hash +reset_password_token +reset_password_expires');
    if (!user) return false;
    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();
    return true;
  }

  static async resetPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<boolean> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      reset_password_token: hashedToken,
      reset_password_expires: { $gt: new Date() },
    }).select('+reset_password_token +reset_password_expires +password_hash');

    if (!user) return false;

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();
    return true;
  }

  static async updatePasswordById(userId: string | Types.ObjectId, newPassword: string): Promise<boolean> {
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const updated = await User.findByIdAndUpdate(userId, { $set: { password_hash } });
    return !!updated;
  }

  static createRefreshTokenValue(): string {
    return crypto.randomBytes(REFRESH_TOKEN_SIZE_BYTES).toString('hex');
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static async storeRefreshToken(
    userId: string | Types.ObjectId,
    refreshToken: string,
  ): Promise<{ refreshToken: string; expiresAt: Date }> {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + config.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    const user = await User.findById(userId).select(REFRESH_TOKEN_SELECT);
    if (!user) throw new Error('User not found');
    const now = new Date();
    user.refresh_tokens = (user.refresh_tokens || []).filter(
      (t) => !t.revoked_at && t.expires_at > now,
    );
    user.refresh_tokens.push({ token_hash: tokenHash, expires_at: expiresAt, created_at: now });
    if (user.refresh_tokens.length > MAX_ACTIVE_REFRESH_TOKENS) {
      user.refresh_tokens = user.refresh_tokens
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(-MAX_ACTIVE_REFRESH_TOKENS);
    }
    await user.save();
    return { refreshToken, expiresAt };
  }

  static async rotateRefreshToken(
    userId: string | Types.ObjectId,
    refreshToken: string,
  ): Promise<{ refreshToken: string; expiresAt: Date } | null> {
    const tokenHash = this.hashToken(refreshToken);
    const user = await User.findById(userId).select(REFRESH_TOKEN_SELECT);
    if (!user) return null;
    const now = new Date();
    const existing = user.refresh_tokens.find(
      (t) => t.token_hash === tokenHash && !t.revoked_at && t.expires_at > now,
    );
    if (!existing) return null;
    existing.revoked_at = now;
    const newToken = this.createRefreshTokenValue();
    const newExpiresAt = new Date(Date.now() + config.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    user.refresh_tokens.push({
      token_hash: this.hashToken(newToken), expires_at: newExpiresAt, created_at: now,
    });
    await user.save();
    return { refreshToken: newToken, expiresAt: newExpiresAt };
  }

  static async revokeRefreshToken(
    userId: string | Types.ObjectId,
    refreshToken: string,
  ): Promise<boolean> {
    const tokenHash = this.hashToken(refreshToken);
    const user = await User.findById(userId).select(REFRESH_TOKEN_SELECT);
    if (!user) return false;
    const entry = user.refresh_tokens.find((t) => t.token_hash === tokenHash && !t.revoked_at);
    if (!entry) return false;
    entry.revoked_at = new Date();
    await user.save();
    return true;
  }

  static async revokeAllRefreshTokens(userId: string | Types.ObjectId): Promise<void> {
    const user = await User.findById(userId).select(REFRESH_TOKEN_SELECT);
    if (!user) return;
    const now = new Date();
    user.refresh_tokens = (user.refresh_tokens || []).map((t) => ({
      ...t, revoked_at: t.revoked_at || now,
    }));
    await user.save();
  }
}