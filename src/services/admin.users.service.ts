import mongoose from 'mongoose';
import { adminUsersRepository, AdminUserUpdatePayload } from '../repositories/admin.users.repository';
import { BadRequestError, NotFoundError } from '../errors/http-error';
import { IUserDocument } from '../models/user.model';

export class AdminUsersService {
  async findAllUsers(): Promise<Record<string, unknown>[]> {
    const users = await adminUsersRepository.findAllUsers();
    return users.map((user) => this.sanitizeUser(user));
  }

  async findUserById(id: string): Promise<Record<string, unknown>> {
    this.ensureValidId(id);

    const user = await adminUsersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateUserById(id: string, payload: AdminUserUpdatePayload): Promise<Record<string, unknown>> {
    this.ensureValidId(id);

    const updated = await adminUsersRepository.updateUserById(id, payload);
    if (!updated) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(updated);
  }

  async deleteUserById(id: string): Promise<Record<string, unknown>> {
    this.ensureValidId(id);

    const deleted = await adminUsersRepository.deleteUserById(id);
    if (!deleted) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(deleted);
  }

  private ensureValidId(id: string): void {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid user id');
    }
  }

  private sanitizeUser(user: IUserDocument): Record<string, unknown> {
    const data = user.toObject();
    delete (data as { passwordHash?: string }).passwordHash;
    data.id = user._id.toString();
    delete (data as { _id?: string })._id;
    return data as Record<string, unknown>;
  }
}

export const adminUsersService = new AdminUsersService();
