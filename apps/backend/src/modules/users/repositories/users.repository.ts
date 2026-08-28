import { UserModel, UserWithPasswordModel } from '../models/user.model';
import { CreateUserData, UpdateUserData } from '../types/user.types';
import type { UserAuditContext } from '../types/user.types';
import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';
import type { ListUsersQueryDto } from '../dto/list-users-query.dto';

export abstract class UsersRepository {
  abstract findAll(
    query: ListUsersQueryDto,
  ): Promise<PaginatedResult<UserModel>>;
  abstract findById(id: string): Promise<UserModel | null>;
  abstract findByIdWithPassword(
    id: string,
  ): Promise<UserWithPasswordModel | null>;
  abstract findByUsername(username: string): Promise<UserModel | null>;
  abstract findByUsernameWithPassword(
    username: string,
  ): Promise<UserWithPasswordModel | null>;
  abstract create(
    data: CreateUserData,
    actor: UserAuditContext,
  ): Promise<UserModel>;
  abstract update(
    id: string,
    data: UpdateUserData,
    actor: UserAuditContext,
  ): Promise<UserModel | null>;
  abstract updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
    actorId: string,
    actorSessionId: string,
  ): Promise<UserModel | null>;
  abstract updatePassword(
    id: string,
    passwordHash: string,
    updatedAt: Date,
    actorId: string,
    actorSessionId: string,
  ): Promise<UserModel | null>;
}
