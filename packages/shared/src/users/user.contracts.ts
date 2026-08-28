export interface UserResponse {
  id: string;
  roleId: string;
  username: string;
  fullName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UsersResponse = PaginatedResponse<UserResponse>;

export interface UserRoleDetailsResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface UserPermissionResponse {
  id: string;
  code: string;
  description: string | null;
}

export interface UserSessionSummaryResponse {
  activeCount: number;
  recentCount: number;
  currentSessionExpiresAt: string | null;
}

export interface UserDetailsResponse extends UserResponse {
  role: UserRoleDetailsResponse;
  permissions: UserPermissionResponse[];
  sessionSummary: UserSessionSummaryResponse | null;
  recentAudit: import('../audit').AuditLogResponse[] | null;
  createdBy: import('../audit').AuditActorResponse | null;
}

export interface CreateUserRequest {
  roleId: string;
  username: string;
  fullName: string;
  password: string;
}

export interface UpdateUserRequest {
  roleId?: string;
  username?: string;
  fullName?: string;
}

export interface ChangeUserStatusRequest {
  isActive: boolean;
}

export interface ChangeUserPasswordRequest {
  password: string;
}
import type { PaginatedResponse } from '../common/pagination.contracts'
