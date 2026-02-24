import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema, updateMeSchema, forgotPasswordSchema, verifyResetOtpSchema, resetPasswordSchema } from '../dtos/auth.dto';
import { BadRequestError, UnauthorizedError } from '../errors/http-error';
import { ZodError } from 'zod';
import { userRepository } from '../repositories/user.repository';

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

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const user = await userRepository.findById(req.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const userData = user.toObject();
      delete (userData as { passwordHash?: string }).passwordHash;

      res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          email: userData.email,
          role: userData.role,
          avatarUrl: userData.avatarUrl ?? null,
          firstName: userData.firstName ?? null,
          lastName: userData.lastName ?? null,
          mobile: userData.mobile ?? null,
          mobileNumber: userData.mobile ?? null,
          gender: userData.gender ?? null,
          address: userData.address ?? null,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      if (!req.file) {
        throw new BadRequestError('Avatar file is required');
      }

      const user = await userRepository.findById(req.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await user.save();

      const userData = user.toObject();
      delete (userData as { passwordHash?: string }).passwordHash;

      res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          email: userData.email,
          role: userData.role,
          avatarUrl: userData.avatarUrl ?? user.avatarUrl,
          firstName: userData.firstName ?? null,
          lastName: userData.lastName ?? null,
          mobile: userData.mobile ?? null,
          mobileNumber: userData.mobile ?? null,
          gender: userData.gender ?? null,
          address: userData.address ?? null,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const user = await userRepository.findById(req.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (user.avatarUrl) {
        const filePath = path.resolve(process.cwd(), `.${user.avatarUrl}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        user.avatarUrl = null;
        await user.save();
      }

      const userData = user.toObject();
      delete (userData as { passwordHash?: string }).passwordHash;

      res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          email: userData.email,
          role: userData.role,
          avatarUrl: userData.avatarUrl ?? null,
          firstName: userData.firstName ?? null,
          lastName: userData.lastName ?? null,
          mobile: userData.mobile ?? null,
          mobileNumber: userData.mobile ?? null,
          gender: userData.gender ?? null,
          address: userData.address ?? null,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const validatedData = updateMeSchema.parse(req.body);

      const user = await userRepository.findById(req.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (validatedData.firstName !== undefined) user.firstName = validatedData.firstName;
      if (validatedData.lastName !== undefined) user.lastName = validatedData.lastName;
      if (validatedData.mobileNumber !== undefined) user.mobile = validatedData.mobileNumber;
      if (validatedData.mobile !== undefined && validatedData.mobileNumber === undefined) {
        user.mobile = validatedData.mobile;
      }
      if (validatedData.gender !== undefined) user.gender = validatedData.gender;
      if (validatedData.address !== undefined) user.address = validatedData.address;

      await user.save();

      const userData = user.toObject();
      delete (userData as { passwordHash?: string }).passwordHash;

      res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          email: userData.email,
          role: userData.role,
          avatarUrl: userData.avatarUrl ?? null,
          firstName: userData.firstName ?? null,
          lastName: userData.lastName ?? null,
          mobile: userData.mobile ?? null,
          mobileNumber: userData.mobile ?? null,
          gender: userData.gender ?? null,
          address: userData.address ?? null,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        next(new BadRequestError(error.issues[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);

      const result = await authService.forgotPassword(validatedData);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        next(new BadRequestError(error.issues[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }

  async verifyResetOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = verifyResetOtpSchema.parse(req.body);

      const result = await authService.verifyResetOtp(validatedData);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        next(new BadRequestError(error.issues[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);

      const result = await authService.resetPassword(validatedData);

      res.status(200).json({
        success: true,
        message: result.message,
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
