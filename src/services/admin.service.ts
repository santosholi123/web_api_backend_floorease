import jwt from 'jsonwebtoken';
import { config } from '../config';

export class AdminService {
  private readonly adminEmail = 'santosholi@gmail.com';
  private readonly adminPassword = 'admin@123';

  login(email: string, password: string): { token: string; role: 'admin' } | null {
    if (email !== this.adminEmail || password !== this.adminPassword) {
      return null;
    }

    const token = this.generateToken(email);

    return {
      token,
      role: 'admin',
    };
  }

  private generateToken(email: string): string {
    // @ts-ignore - jsonwebtoken types issue with expiresIn
    return jwt.sign(
      { userId: email, role: 'admin' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

export const adminService = new AdminService();
