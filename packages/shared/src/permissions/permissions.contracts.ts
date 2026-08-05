export interface PermissionResponse {
  id: string
  code: string
  description: string | null
  createdAt: string
}

export type PermissionsResponse = PermissionResponse[]

export interface PermissionRoleResponse {
  id: string
  code: string
  name: string
  isActive: boolean
}

export interface PermissionDetailsResponse extends PermissionResponse {
  assignmentCount: number
  roles: PermissionRoleResponse[]
}

export interface CreatePermissionRequest {
  code: string
  description?: string | null
}

export interface UpdatePermissionRequest {
  description?: string | null
}
