import type { UserResponse } from '@sigip/shared';
import type { UserModel } from '../models/user.model';

export function toUserResponse(user: UserModel): UserResponse {
  return {
    id: user.id,
    roleId: user.roleId,
    username: user.username,
    fullName: user.fullName,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
