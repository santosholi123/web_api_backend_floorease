import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types/user.type';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  mobile?: string | null;
  gender?: 'male' | 'female' | '' | null;
  address?: string | null;
  resetOtpHash?: string | null;
  resetOtpExpires?: Date | null;
  resetOtpVerified?: boolean;
  resetOtpAttempts?: number;
  resetOtpLastSentAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    firstName: {
      type: String,
      default: null,
    },
    lastName: {
      type: String,
      default: null,
    },
    mobile: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', ''],
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    resetOtpHash: {
      type: String,
      default: null,
    },
    resetOtpExpires: {
      type: Date,
      default: null,
    },
    resetOtpVerified: {
      type: Boolean,
      default: false,
    },
    resetOtpAttempts: {
      type: Number,
      default: 0,
    },
    resetOtpLastSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
