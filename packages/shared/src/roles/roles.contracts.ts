export interface RoleResponse {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type RolesResponse = RoleResponse[]

export interface CreateRoleRequest {
  code: string
  name: string
  description?: string
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
}

export interface UpdateRoleStatusRequest {
  isActive: boolean
}

export interface PermissionSummaryResponse {
  id: string
  code: string
  description: string | null
}

export type PermissionsSummaryResponse = PermissionSummaryResponse[]

export interface RolePermissionsResponse {
  role: RoleResponse
  permissions: PermissionsSummaryResponse
}

export interface ReplaceRolePermissionsRequest {
  permissionIds: string[]
}
