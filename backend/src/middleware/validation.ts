import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import config from '../config';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

// Middleware to validate MongoDB ObjectId in route parameters
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format`,
      });
    }

    next();
  };
};
// Middleware to authenticate user using JWT
export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: No token provided',
    });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  // Verify the token and extract user information
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      email: string;
    };
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid token',
    });
  }
};

// Utility function to extract validation error messages from Mongoose errors
export function extractValidationError(error: any): string | null {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e: any) => e.message);
    return messages.join(', ');
  }
  return null;
}
