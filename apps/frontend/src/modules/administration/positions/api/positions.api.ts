import type {
  CreatePositionRequest,
  PositionDetailsResponse,
  PositionResponse,
  PositionsResponse,
  UpdatePositionRequest,
  UpdatePositionStatusRequest,
} from '@sigip/shared'

import { apiRequest } from '@/lib/api/api-client'

export function getPositions(): Promise<PositionsResponse> {
  return apiRequest<PositionsResponse>('/positions')
}

export function getPositionById({
  id,
}: {
  id: string
}): Promise<PositionDetailsResponse> {
  return apiRequest<PositionDetailsResponse>(`/positions/${id}`)
}

export function createPosition({
  input,
}: {
  input: CreatePositionRequest
}): Promise<PositionResponse> {
  return apiRequest<PositionResponse>('/positions', {
    method: 'POST',
    body: input,
  })
}

export function updatePosition({
  id,
  input,
}: {
  id: string
  input: UpdatePositionRequest
}): Promise<PositionResponse> {
  return apiRequest<PositionResponse>(`/positions/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function updatePositionStatus({
  id,
  input,
}: {
  id: string
  input: UpdatePositionStatusRequest
}): Promise<PositionResponse> {
  return apiRequest<PositionResponse>(`/positions/${id}/status`, {
    method: 'PATCH',
    body: input,
  })
}
