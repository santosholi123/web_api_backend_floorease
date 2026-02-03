import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../dtos/auth.dto';
import { BadRequestError } from '../errors/http-error';
import { ZodError } from 'zod';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Call service
      const result = await authService.register(validatedData);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        next(new BadRequestError(error.issues[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);

      // Call service
      const result = await authService.login(validatedData);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        next(new BadRequestError(error.issues[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }
}

export const authController = new AuthController();
