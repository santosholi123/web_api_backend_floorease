import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';

export class AdminController {
  async login(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { email, password } = req.body as { email?: string; password?: string };

    const result = adminService.login(email ?? '', password ?? '');

    if (!result) {
      res.status(401).json({ message: 'Invalid admin credentials' });
      return;
    }

    res.status(200).json({
      token: result.token,
      role: result.role,
      message: 'Admin login successful',
    });
  }
}

export const adminController = new AdminController();
