import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { ConflictError, UnauthorizedError } from '../errors/http-error';
import { config } from '../config';

export class AuthService {
  private readonly saltRounds = 10;

  async register(data: RegisterDto): Promise<{
    token: string;
    user: { id: string; email: string; role: string };
  }> {
    // Check if email already exists
    const emailExists = await userRepository.emailExists(data.email);
    if (emailExists) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.saltRounds);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      role: data.role || 'user',
    });

    // Generate JWT token
    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(data: LoginDto): Promise<{
    token: string;
    user: { id: string; email: string; role: string };
  }> {
    // Find user by email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    };
  }

  private generateToken(userId: string, email: string, role: string): string {
    // @ts-ignore - jsonwebtoken types issue with expiresIn
    return jwt.sign(
      { id: userId, email, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

export const authService = new AuthService();
