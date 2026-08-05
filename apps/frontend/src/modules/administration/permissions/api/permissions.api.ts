import type {
  CreatePermissionRequest,
  PermissionDetailsResponse,
  PermissionResponse,
  PermissionsResponse,
  UpdatePermissionRequest,
} from '@sigip/shared'
import { apiRequest } from '@/lib/api/api-client'

export function getPermissions(): Promise<PermissionsResponse> {
  return apiRequest<PermissionsResponse>('/permissions')
}

export function getPermissionById({
  id,
}: {
  id: string
}): Promise<PermissionDetailsResponse> {
  return apiRequest<PermissionDetailsResponse>(`/permissions/${id}`)
}

export function createPermission({
  input,
}: {
  input: CreatePermissionRequest
}): Promise<PermissionResponse> {
  return apiRequest<PermissionResponse>('/permissions', {
    method: 'POST',
    body: input,
  })
}

export function updatePermission({
  id,
  input,
}: {
  id: string
  input: UpdatePermissionRequest
}): Promise<PermissionResponse> {
  return apiRequest<PermissionResponse>(`/permissions/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deletePermission({ id }: { id: string }): Promise<void> {
  return apiRequest<void>(`/permissions/${id}`, {
    method: 'DELETE',
  })
}
