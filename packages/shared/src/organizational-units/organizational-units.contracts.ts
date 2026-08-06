export interface OrganizationalUnitResponse {
  id: string
  parentId: string
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
  parentId: string
  code: string
  name: string
  description?: string
  sortOrder?: number
}

export interface UpdateOrganizationalUnitRequest {
  parentId?: string
  name?: string
  description?: string
  sortOrder?: number
}

export interface UpdateOrganizationalUnitStatusRequest {
  isActive: boolean
}
