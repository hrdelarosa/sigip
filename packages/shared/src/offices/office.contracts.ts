export interface OfficeSummaryResponse {
  id: string
  code: string
  name: string
}

export interface OfficeResponse extends OfficeSummaryResponse {
  description: string | null
  municipality: string | null
  address: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type OfficesResponse = OfficeResponse[]
