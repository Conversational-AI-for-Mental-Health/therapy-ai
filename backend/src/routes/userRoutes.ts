import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import jwt from 'jsonwebtoken';
import config from '../config';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    const existingUser = await UserService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
      });
    }

    const user = await UserService.createUser(name, email, password);

    // JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
});


router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = await UserService.findUserByEmail(email);
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

    // JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: '3d' }
    );

    //removing hash from password
    const userObj = user.toObject();
    delete userObj.password_hash;

    res.json({
      success: true,
      data: {
        user: userObj,
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
});

router.post('/social-login', async (req: Request, res: Response) => {
  try {
    const { provider, profile } = req.body;

    if (!provider || !['google', 'apple'].includes(provider) || !profile || !profile.email || !profile.id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid social login data',
      });
    }

    //need a social user google or apple token verification here
    
    const user = await UserService.findOrCreateSocialUser(provider, profile);

    // JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error: any) {
    console.error('Social login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Social login failed',
    });
  }
});

// current user
router.get('/me', async (req: Request, res: Response) => {
  // Check auth header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    const user = await UserService.findUserById(decoded.userId);

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
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
});

export default router;