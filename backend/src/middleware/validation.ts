import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

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

// Placeholder authentication - replace with JWT later
export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: Implement JWT verification
  // For now, mock authenticated user
  req.user = { userId: '507f1f77bcf86cd799439011' };
  next();
};
