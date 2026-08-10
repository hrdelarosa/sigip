import type {
  CreateOrganizationalUnitRequest,
  OrganizationalUnitResponse,
  OrganizationalUnitsResponse,
  UpdateOrganizationalUnitRequest,
  UpdateOrganizationalUnitStatusRequest,
} from '@sigip/shared'

import { apiRequest } from '@/lib/api/api-client'

export function getOrganizationalUnits(): Promise<OrganizationalUnitsResponse> {
  return apiRequest<OrganizationalUnitsResponse>('/organizational-units')
}

export function getOrganizationalUnitById({
  id,
}: {
  id: string
}): Promise<OrganizationalUnitResponse> {
  return apiRequest<OrganizationalUnitResponse>(`/organizational-units/${id}`)
}

export function createOrganizationalUnit({
  input,
}: {
  input: CreateOrganizationalUnitRequest
}): Promise<OrganizationalUnitResponse> {
  return apiRequest<OrganizationalUnitResponse>('/organizational-units', {
    method: 'POST',
    body: input,
  })
}

export function updateOrganizationalUnit({
  id,
  input,
}: {
  id: string
  input: UpdateOrganizationalUnitRequest
}): Promise<OrganizationalUnitResponse> {
  return apiRequest<OrganizationalUnitResponse>(`/organizational-units/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function updateOrganizationalUnitStatus({
  id,
  input,
}: {
  id: string
  input: UpdateOrganizationalUnitStatusRequest
}): Promise<OrganizationalUnitResponse> {
  return apiRequest<OrganizationalUnitResponse>(
    `/organizational-units/${id}/status`,
    {
      method: 'PATCH',
      body: input,
    },
  )
}
