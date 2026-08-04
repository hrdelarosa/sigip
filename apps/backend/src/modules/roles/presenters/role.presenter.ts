import type { PermissionSummaryResponse, RoleResponse } from '@sigip/shared';
import type { PermissionSummaryModel, RoleModel } from '../models/role.model';

export function toRoleResponse(role: RoleModel): RoleResponse {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description ?? null,
    isActive: role.isActive,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}

export function toPermissionSummaryResponse(
  permission: PermissionSummaryModel,
): PermissionSummaryResponse {
  return {
    id: permission.id,
    code: permission.code,
    description: permission.description ?? null,
  };
}
