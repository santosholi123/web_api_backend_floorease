import { User, IUserDocument } from '../models/user.model';
import { UserRole } from '../types/user.type';

export class UserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return await User.findById(id);
  }

  async create(data: {
    email: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<IUserDocument> {
    const user = new User(data);
    return await user.save();
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email });
    return count > 0;
  }
}

export const userRepository = new UserRepository();
//