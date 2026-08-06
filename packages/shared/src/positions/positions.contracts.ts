export interface PositionResponse {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type PositionsResponse = PositionResponse[]

export interface CreatePositionRequest {
  code: string
  name: string
  description?: string
}

export interface UpdatePositionRequest {
  name?: string
  description?: string
}

export interface UpdatePositionStatusRequest {
  isActive: boolean
}
