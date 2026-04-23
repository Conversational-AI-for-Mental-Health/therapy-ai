import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

const formatZodErrors = (error: ZodError): string =>
  error.issues.map((issue) => issue.message).join('; ');

export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: formatZodErrors(error),
        });
      }
      return next(error);
    }
  };
};

export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: formatZodErrors(error),
        });
      }
      return next(error);
    }
  };
};
