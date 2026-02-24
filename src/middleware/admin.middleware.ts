import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/http-error';

export const adminOnlyMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.userRole !== 'admin') {
    next(new ForbiddenError('Forbidden'));
    return;
  }

  next();
};
