import type { PaginatedResponse } from '../common/pagination.contracts'
import type { AuditActorResponse, AuditLogResponse } from '../audit'

export interface UserResponse {
  id: string
  roleId: string
  officeId: string
  username: string
  fullName: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export type UsersResponse = PaginatedResponse<UserResponse>

export interface UserRoleDetailsResponse {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
}

export interface UserPermissionResponse {
  id: string
  code: string
  description: string | null
}

export interface UserSessionSummaryResponse {
  activeCount: number
  recentCount: number
  currentSessionExpiresAt: string | null
}

export interface UserDetailsResponse extends UserResponse {
  role: UserRoleDetailsResponse
  permissions: UserPermissionResponse[]
  sessionSummary: UserSessionSummaryResponse | null
  recentAudit: AuditLogResponse[] | null
  createdBy: AuditActorResponse | null
}

export interface CreateUserRequest {
  roleId: string
  officeId?: string
  username: string
  fullName: string
  password: string
}

export interface UpdateUserRequest {
  roleId?: string
  officeId?: string
  username?: string
  fullName?: string
}

export interface ChangeUserStatusRequest {
  isActive: boolean
}

export interface ChangeUserPasswordRequest {
  password: string
}
