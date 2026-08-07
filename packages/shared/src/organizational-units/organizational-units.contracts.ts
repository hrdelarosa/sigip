export interface OrganizationalUnitResponse {
  id: string
  parentId: string | null
  code: string
  name: string
  description: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type OrganizationalUnitsResponse = OrganizationalUnitResponse[]

export interface CreateOrganizationalUnitRequest {
  parentId: string | null
  code: string
  name: string
  description?: string | null
  sortOrder?: number
}

export interface UpdateOrganizationalUnitRequest {
  parentId?: string | null
  name?: string
  description?: string | null
  sortOrder?: number
}

export interface UpdateOrganizationalUnitStatusRequest {
  isActive: boolean
}
