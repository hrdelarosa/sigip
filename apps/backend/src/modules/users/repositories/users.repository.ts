import { UserModel, UserWithPasswordModel } from '../models/user.model';
import { CreateUserData, UpdateUserData } from '../types/user.types';

export abstract class UsersRepository {
  abstract findAll(): Promise<UserModel[]>;
  abstract findById(id: string): Promise<UserModel | null>;
  abstract findByIdWithPassword(
    id: string,
  ): Promise<UserWithPasswordModel | null>;
  abstract findByUsername(username: string): Promise<UserModel | null>;
  abstract findByUsernameWithPassword(
    username: string,
  ): Promise<UserWithPasswordModel | null>;
  abstract create(data: CreateUserData): Promise<UserModel>;
  abstract update(id: string, data: UpdateUserData): Promise<UserModel | null>;
  abstract updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
    actorId: string,
  ): Promise<UserModel | null>;
  abstract updatePassword(
    id: string,
    passwordHash: string,
    updatedAt: Date,
    actorId: string,
  ): Promise<UserModel | null>;
}
