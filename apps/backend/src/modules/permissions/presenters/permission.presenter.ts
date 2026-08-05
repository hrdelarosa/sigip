import type {
  PermissionDetailsResponse,
  PermissionResponse,
  PermissionRoleResponse,
} from '@sigip/shared';
import type {
  PermissionDetailsModel,
  PermissionModel,
  PermissionRoleModel,
} from '../models/permission.model';

export function toPermissionResponse(
  permission: PermissionModel,
): PermissionResponse {
  return {
    id: permission.id,
    code: permission.code,
    description: permission.description ?? null,
    createdAt: permission.createdAt.toISOString(),
  };
}

export function toPermissionRoleResponse(
  role: PermissionRoleModel,
): PermissionRoleResponse {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    isActive: role.isActive,
  };
}

export function toPermissionDetailsResponse(
  permission: PermissionDetailsModel,
): PermissionDetailsResponse {
  return {
    ...toPermissionResponse(permission),
    assignmentCount: permission.assignmentCount,
    roles: permission.roles.map(toPermissionRoleResponse),
  };
}
