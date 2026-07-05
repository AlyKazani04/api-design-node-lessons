import type { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

export const validateBody = <T extends ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: e.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        })
      }

      next(e);
    }
  }
}


export const validateParams = <T extends ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: 'Invalid params',
          details: e.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        })
      }
      next(e);
    }
  }
}

export const validateQuery = <T extends ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: 'Invalid Query params',
          details: e.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        })
      }
      next(e);
    }
  }
}
