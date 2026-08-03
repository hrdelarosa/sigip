export interface Permission {
  id: string
  code: string
  description: string | null
  createdAt: string
}

export interface CreatePermissionInput {
  code: string
  description?: string
}

export interface PermissionRole {
  id: string
  code: string
  name: string
  isActive: boolean
}

export interface PermissionDetails extends Permission {
  assignmentCount: number
  roles: PermissionRole[]
}

export interface UpdatePermissionInput {
  description?: string
}
