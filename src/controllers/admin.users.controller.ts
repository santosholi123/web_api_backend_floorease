import { Request, Response, NextFunction } from 'express';
import { adminUsersService } from '../services/admin.users.service';
import { BadRequestError } from '../errors/http-error';
import { AdminUserUpdatePayload } from '../repositories/admin.users.repository';

export class AdminUsersController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await adminUsersService.findAllUsers();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const data = users.map((user) => {
        const avatarValue =
          (user.avatarUrl as string | null | undefined) ??
          (user.avatar as string | null | undefined) ??
          (user.avatarPath as string | null | undefined) ??
          (user.image as string | null | undefined);

        const mobileValue =
          (user.mobileNumber as string | null | undefined) ??
          (user.phoneNumber as string | null | undefined) ??
          (user.phone as string | null | undefined) ??
          (user.mobile as string | null | undefined);

        const avatarUrl = avatarValue
          ? `${baseUrl}/${avatarValue.replace(/^\/+/, '')}`
          : null;

        return {
          id: user.id as string,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          email: user.email ?? null,
          createdAt: user.createdAt ?? null,
          avatarUrl,
          mobileNumber: mobileValue ?? null,
        };
      });
      res.status(200).json({
        success: true,
        data,
        message: 'Users fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        throw new BadRequestError('Invalid user id');
      }

      const user = await adminUsersService.findUserById(id);
      const mobileValue =
        (user.mobileNumber as string | null | undefined) ??
        (user.phoneNumber as string | null | undefined) ??
        (user.phone as string | null | undefined) ??
        (user.mobile as string | null | undefined);
      res.status(200).json({
        success: true,
        data: {
          ...user,
          mobileNumber: mobileValue ?? null,
        },
        message: 'User fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        throw new BadRequestError('Invalid user id');
      }

      const body = req.body as Record<string, unknown>;
      const payload: AdminUserUpdatePayload = {};

      if (body.firstName !== undefined) payload.firstName = body.firstName as string | null;
      if (body.lastName !== undefined) payload.lastName = body.lastName as string | null;
      if (body.email !== undefined) payload.email = body.email as string;
      if (body.mobileNumber !== undefined) payload.mobile = body.mobileNumber as string | null;
      if (body.mobile !== undefined && body.mobileNumber === undefined) {
        payload.mobile = body.mobile as string | null;
      }
      if (body.gender !== undefined) payload.gender = body.gender as 'male' | 'female' | '' | null;
      if (body.address !== undefined) payload.address = body.address as string | null;
      if (body.avatar !== undefined) payload.avatarUrl = body.avatar as string | null;
      if (body.avatarUrl !== undefined && body.avatar === undefined) {
        payload.avatarUrl = body.avatarUrl as string | null;
      }

      const updated = await adminUsersService.updateUserById(id, payload);

      res.status(200).json({
        success: true,
        data: updated,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        throw new BadRequestError('Invalid user id');
      }

      const deleted = await adminUsersService.deleteUserById(id);
      res.status(200).json({
        success: true,
        data: deleted,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminUsersController = new AdminUsersController();
