import { apiRequest } from '@/lib/api/api-client'
import type {
  CreatePermissionInput,
  Permission,
  PermissionDetails,
  UpdatePermissionInput,
} from '../types/permission.types'

export function getPermissions(): Promise<Permission[]> {
  return apiRequest<Permission[]>('/permissions')
}

export function getPermissionById({
  id,
}: {
  id: string
}): Promise<PermissionDetails> {
  return apiRequest<PermissionDetails>(`/permissions/${id}`)
}

export function createPermission({
  input,
}: {
  input: CreatePermissionInput
}): Promise<Permission> {
  return apiRequest<Permission>('/permissions', {
    method: 'POST',
    body: input,
  })
}

export function updatePermission({
  id,
  input,
}: {
  id: string
  input: UpdatePermissionInput
}): Promise<Permission> {
  return apiRequest<Permission>(`/permissions/${id}`, {
    method: 'PATCH',
    body: input,
  })
}
