export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  mobile?: string | null;
  gender?: 'male' | 'female' | '' | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'user' | 'admin';
