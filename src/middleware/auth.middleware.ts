import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../errors/http-error';

interface JwtPayload {
  id?: string;
  userId?: string;
  email?: string;
  role?: string;
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    const token = cookieToken || headerToken;
    if (!token) {
      throw new UnauthorizedError('Authorization token missing');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload | jwt.JwtPayload;
    const payload = typeof decoded === 'object' ? (decoded as JwtPayload) : undefined;
    const userId = payload?.userId ?? payload?.id;
    const userRole = payload?.role;

    if (!userId) {
      throw new UnauthorizedError('Invalid token');
    }

    req.userId = userId;
    req.userRole = userRole;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};
