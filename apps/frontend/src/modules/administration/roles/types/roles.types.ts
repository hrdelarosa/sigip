export interface Role {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PermissionSummary {
  id: string
  code: string
  description: string | null
}

export interface RolePermissionsResponse {
  role: Role
  permissions: PermissionSummary[]
}

export interface CreateRoleInput {
  code: string
  name: string
  description?: string
}

export interface UpdateRoleInput {
  name?: string
  description?: string
}

export interface UpdateRoleStatusInput {
  isActive: boolean
}

export interface ReplaceRolePermissionsInput {
  permissionIds: string[]
}
