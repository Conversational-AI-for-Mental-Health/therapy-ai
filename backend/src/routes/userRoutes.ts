import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import jwt from 'jsonwebtoken';
import config from '../config';
import { createManualRateLimiter } from '../middleware/rateLimit';
import { verifySocialToken } from '../services/socialAuthService';
import { authenticateUser, extractValidationError } from '../middleware/validation';
import { validateBody } from '../middleware/schemaValidation';
import { User } from '../models';
import { z } from 'zod';

const router = Router();

const authRateLimit = createManualRateLimiter({ windowMs: 60_000, maxRequests: 10 });
const forgotPasswordRateLimit = createManualRateLimiter({ windowMs: 60_000, maxRequests: 3 });
const refreshRateLimit = createManualRateLimiter({ windowMs: 60_000, maxRequests: 20 });

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const registerBodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(256),
});

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256),
});

const forgotPasswordBodySchema = z.object({
  email: z.string().email(),
});

const resetPasswordBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(256),
});

const socialLoginBodySchema = z.object({
  provider: z.enum(['google', 'apple']),
  idToken: z.string().min(1),
  profile: z.object({
    id: z.string().min(1),
    email: z.string().email(),
    name: z.string().optional(),
  }),
});

const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1),
  userId: z.string().min(1),
});

const logoutBodySchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .optional();

// Validation schemas for password and name updates
const changePasswordBodySchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required').max(256),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(256),
});
const changeNameBodySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').trim(),
});

const createAccessToken = (userId: unknown, email: string): string =>
  jwt.sign({ userId, email }, config.JWT_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRES_IN as any,
  });

const buildAuthData = async (user: any) => {
  const refreshTokenValue = UserService.createRefreshTokenValue();
  const refreshTokenResult = await UserService.storeRefreshToken(
    user._id,
    refreshTokenValue,
  );
  const accessToken = createAccessToken(user._id, user.email);
  return {
    user,
    token: accessToken,
    accessToken,
    refreshToken: refreshTokenResult.refreshToken,
    accessTokenExpiresIn: config.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresAt: refreshTokenResult.expiresAt.toISOString(),
  };
};

// User registration
router.post(
  '/register',
  authRateLimit,
  validateBody(registerBodySchema),
  async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const normalizedEmail = email?.toLowerCase().trim();

      if (
        !name ||
        typeof name !== 'string' ||
        !normalizedEmail ||
        typeof password !== 'string' ||
        password.length < 8 ||
        !isValidEmail(normalizedEmail)
      ) {
        return res.status(400).json({
          success: false,
          error: 'Invalid registration payload',
        });
      }

      const existingUser = await UserService.findUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
        });
      }

      const user = await UserService.createUser(name, normalizedEmail, password);

      res.status(201).json({
        success: true,
        data: await buildAuthData(user),
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      const validationMsg = extractValidationError(error);
      if (validationMsg) {
        return res.status(400).json({ success: false, error: validationMsg });
      }
      res.status(500).json({
        success: false,
        error: 'Registration failed',
      });
    }
  },
);

// User login
router.post(
  '/login',
  authRateLimit,
  validateBody(loginBodySchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email?.toLowerCase().trim();

      if (
        !normalizedEmail ||
        typeof password !== 'string' ||
        !isValidEmail(normalizedEmail)
      ) {
        return res.status(400).json({
          success: false,
          error: 'Invalid login payload',
        });
      }

      const user = await UserService.findUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      if (!user.password_hash) {
        return res.status(401).json({
          success: false,
          error: 'Please login with Google or Apple',
        });
      }

      const isMatch = await UserService.verifyPassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      const userObj = user.toObject();
      delete userObj.password_hash;

      res.json({
        success: true,
        data: await buildAuthData(userObj),
      });
    } catch (error: any) {
      console.error('Login error:', error);
      const validationMsg = extractValidationError(error);
      if (validationMsg) {
        return res.status(400).json({ success: false, error: validationMsg });
      }
      res.status(500).json({
        success: false,
        error: 'Login failed',
      });
    }
  },
);

// Forgot password - verify email exists
router.post(
  '/forgot-password',
  forgotPasswordRateLimit,
  validateBody(forgotPasswordBodySchema),
  async (req: Request, res: Response) => {
    try {
      const email = req.body?.email?.toLowerCase().trim();
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
        });
      }

      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'No account found with this email',
        });
      }

      return res.json({
        success: true,
        message: 'Email verified. Continue to reset password.',
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        error: 'Forgot password failed',
      });
    }
  },
);

// Reset password using email
router.post(
  '/reset-password',
  authRateLimit,
  validateBody(resetPasswordBodySchema),
  async (req: Request, res: Response) => {
    try {
      const email = req.body?.email?.toLowerCase().trim();
      const password = req.body?.password;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters',
        });
      }

      const didReset = await UserService.resetPasswordByEmail(email, password);
      if (!didReset) {
        return res.status(404).json({
          success: false,
          error: 'No account found with this email',
        });
      }

      return res.json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      return res.status(500).json({
        success: false,
        error: 'Reset password failed',
      });
    }
  },
);

// Social login (Google/Apple)
router.post(
  '/social-login',
  authRateLimit,
  validateBody(socialLoginBodySchema),
  async (req: Request, res: Response) => {
    try {
      const { provider, profile, idToken } = req.body;

      if (
        !provider ||
        !['google', 'apple'].includes(provider) ||
        !profile ||
        !profile.email ||
        !profile.id ||
        typeof idToken !== 'string'
      ) {
        return res.status(400).json({
          success: false,
          error: 'Invalid social login data',
        });
      }

      const verifiedClaims = await verifySocialToken(provider, idToken);
      if (!verifiedClaims) {
        return res.status(401).json({
          success: false,
          error: 'Invalid social identity token',
        });
      }

      if (
        verifiedClaims.sub !== profile.id ||
        (verifiedClaims.email &&
          verifiedClaims.email.toLowerCase() !== profile.email.toLowerCase())
      ) {
        return res.status(401).json({
          success: false,
          error: 'Social identity payload mismatch',
        });
      }

      const user = await UserService.findOrCreateSocialUser(provider, profile);

      res.json({
        success: true,
        data: await buildAuthData(user),
      });
    } catch (error: any) {
      console.error('Social login error:', error);
      res.status(500).json({
        success: false,
        error: 'Social login failed',
      });
    }
  },
);

// Get current user profile
router.get('/me', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = await UserService.findUserById(req.user!.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
});

// Change password
router.patch('/password', authenticateUser, validateBody(changePasswordBodySchema), async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'oldPassword and newPassword are required',
      });
    }

    const user = await User.findById(req.user!.userId).select('+password_hash');
    if (!user || !user.password_hash) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change password for social login accounts',
      });
    }

    const isMatch = await UserService.verifyPassword(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    await UserService.updatePasswordById(req.user!.userId, newPassword);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Password update error:', error);
    const validationMsg = extractValidationError(error);
    if (validationMsg) {
      return res.status(400).json({ success: false, error: validationMsg });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update password',
    });
  }
});

// Change user name
router.patch('/name', authenticateUser, validateBody(changeNameBodySchema), async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'name is required',
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.user!.userId,
      { $set: { name: name.trim() } },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: { name: updated.name } });
  } catch (error: any) {
    console.error('Name update error:', error);
    const validationMsg = extractValidationError(error);
    if (validationMsg) {
      return res.status(400).json({ success: false, error: validationMsg });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update name',
    });
  }
});

// Refresh JWT token
router.post(
  '/refresh-token',
  refreshRateLimit,
  validateBody(refreshTokenBodySchema),
  async (req: Request, res: Response) => {
    try {
      const refreshToken = req.body?.refreshToken;
      const userId = req.body?.userId;

      if (
        !refreshToken ||
        typeof refreshToken !== 'string' ||
        !userId ||
        typeof userId !== 'string'
      ) {
        return res.status(400).json({
          success: false,
          error: 'Invalid refresh token payload',
        });
      }

      const rotated = await UserService.rotateRefreshToken(userId, refreshToken);
      if (!rotated) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired refresh token',
        });
      }

      const user = await UserService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const accessToken = createAccessToken(user._id, user.email);

      return res.json({
        success: true,
        data: {
          token: accessToken,
          accessToken,
          refreshToken: rotated.refreshToken,
          accessTokenExpiresIn: config.ACCESS_TOKEN_EXPIRES_IN,
          refreshTokenExpiresAt: rotated.expiresAt.toISOString(),
        },
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return res.status(500).json({
        success: false,
        error: 'Refresh token failed',
      });
    }
  },
);

// Logout - revoke refresh token(s)
router.post(
  '/logout',
  authenticateUser,
  validateBody(logoutBodySchema),
  async (req: Request, res: Response) => {
    try {
      const refreshToken = req.body?.refreshToken;

      if (refreshToken && typeof refreshToken === 'string') {
        await UserService.revokeRefreshToken(req.user!.userId, refreshToken);
      } else {
        await UserService.revokeAllRefreshTokens(req.user!.userId);
      }

      return res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
  },
);

export default router;