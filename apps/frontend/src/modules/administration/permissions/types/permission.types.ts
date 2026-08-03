export interface Permission {
  id: string
  code: string
  description: string | null
  createdAt: string
}

export interface CreatePermissionInput {
  code: string
  description: string | null
}

export interface UpdatePermissionInput {
  description: string | null
}
