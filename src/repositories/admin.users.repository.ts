import { User, IUserDocument } from '../models/user.model';

export type AdminUserUpdatePayload = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  mobile?: string | null;
  gender?: 'male' | 'female' | '' | null;
  address?: string | null;
  avatarUrl?: string | null;
};

export class AdminUsersRepository {
  async findAllUsers(): Promise<IUserDocument[]> {
    return await User.find().sort({ createdAt: -1 });
  }

  async findUserById(id: string): Promise<IUserDocument | null> {
    return await User.findById(id);
  }

  async updateUserById(id: string, payload: AdminUserUpdatePayload): Promise<IUserDocument | null> {
    return await User.findByIdAndUpdate(id, payload, { new: true });
  }

  async deleteUserById(id: string): Promise<IUserDocument | null> {
    return await User.findByIdAndDelete(id);
  }
}

export const adminUsersRepository = new AdminUsersRepository();
