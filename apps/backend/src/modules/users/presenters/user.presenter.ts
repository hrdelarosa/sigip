import type { UserDetailsResponse, UserResponse } from '@sigip/shared';
import type { UserModel } from '../models/user.model';
import type {
  PermissionSummaryModel,
  RoleModel,
} from '../../roles/models/role.model';
import type { AuditLogModel } from '../../audit/models/audit-log.model';
import { toAuditLogResponse } from '../../audit/presenters/audit.presenter';

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

export function toUserDetailsResponse(details: {
  user: UserModel;
  role: RoleModel;
  permissions: PermissionSummaryModel[];
  sessionSummary: {
    activeCount: number;
    recentCount: number;
    currentSessionExpiresAt: Date | null;
  } | null;
  recentAudit: AuditLogModel[] | null;
  createdBy: AuditLogModel['actor'];
}): UserDetailsResponse {
  return {
    ...toUserResponse(details.user),
    role: {
      id: details.role.id,
      code: details.role.code,
      name: details.role.name,
      description: details.role.description,
      isActive: details.role.isActive,
    },
    permissions: details.permissions,
    sessionSummary: details.sessionSummary
      ? {
          ...details.sessionSummary,
          currentSessionExpiresAt:
            details.sessionSummary.currentSessionExpiresAt?.toISOString() ??
            null,
        }
      : null,
    recentAudit: details.recentAudit?.map(toAuditLogResponse) ?? null,
    createdBy: details.createdBy,
  };
}
