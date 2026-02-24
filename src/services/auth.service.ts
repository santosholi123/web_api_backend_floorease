import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { RegisterDto, LoginDto, ResetPasswordDto, ForgotPasswordDto, VerifyResetOtpDto } from '../dtos/auth.dto';
import { BadRequestError, ConflictError, TooManyRequestsError, UnauthorizedError } from '../errors/http-error';
import { config } from '../config';
import { sendResetOtpEmail } from '../utils/mailer';

export class AuthService {
  private readonly saltRounds = 10;
  private readonly otpExpiresInMinutes = 10;
  private readonly otpMaxAttempts = 5;
  private readonly otpResendCooldownSeconds = 60;

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
      { userId, id: userId, email, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
      return { message: 'OTP sent to email' };
    }

    const now = new Date();

    if (user.resetOtpLastSentAt) {
      const elapsedMs = now.getTime() - user.resetOtpLastSentAt.getTime();
      if (elapsedMs < this.otpResendCooldownSeconds * 1000) {
        throw new TooManyRequestsError('Please wait before requesting another OTP');
      }
    }

    const otp = this.generateOtp();
    const resetOtpHash = await bcrypt.hash(otp, this.saltRounds);

    user.resetOtpHash = resetOtpHash;
    user.resetOtpExpires = new Date(now.getTime() + this.otpExpiresInMinutes * 60 * 1000);
    user.resetOtpVerified = false;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = now;

    await user.save();

    await sendResetOtpEmail(user.email, otp);

    return { message: 'OTP sent to email' };
  }

  async verifyResetOtp(data: VerifyResetOtpDto): Promise<{ message: string }> {
    const user = await userRepository.findByEmail(data.email);

    if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
      throw new BadRequestError('Invalid email or OTP');
    }

    if (user.resetOtpAttempts !== undefined && user.resetOtpAttempts >= this.otpMaxAttempts) {
      throw new TooManyRequestsError('Too many attempts. Please request a new OTP');
    }

    const now = new Date();
    if (user.resetOtpExpires.getTime() < now.getTime()) {
      throw new BadRequestError('OTP expired');
    }

    const isValid = await bcrypt.compare(data.otp, user.resetOtpHash);
    if (!isValid) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      throw new BadRequestError('Invalid email or OTP');
    }

    user.resetOtpVerified = true;
    await user.save();

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    if (data.newPassword !== data.confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    if (data.newPassword.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters');
    }

    const user = await userRepository.findByEmail(data.email);

    if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
      throw new BadRequestError('Invalid password reset request');
    }

    if (!user.resetOtpVerified) {
      throw new BadRequestError('OTP not verified');
    }

    const now = new Date();
    if (user.resetOtpExpires.getTime() < now.getTime()) {
      throw new BadRequestError('OTP expired');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, this.saltRounds);
    user.passwordHash = passwordHash;
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetOtpVerified = false;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = null;

    await user.save();

    return { message: 'Password reset successful' };
  }
}

export const authService = new AuthService();
