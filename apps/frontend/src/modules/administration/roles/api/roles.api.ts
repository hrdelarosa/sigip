import { apiRequest } from '@/lib/api/api-client'
import type {
  CreateRoleInput,
  PermissionSummary,
  ReplaceRolePermissionsInput,
  Role,
  RolePermissionsResponse,
  UpdateRoleInput,
  UpdateRoleStatusInput,
} from '../types/roles.types'

export function getRoles(): Promise<Role[]> {
  return apiRequest<Role[]>('/roles')
}

export function getRoleById({ id }: { id: string }): Promise<Role> {
  return apiRequest<Role>(`/roles/${id}`)
}

export function createRole({
  input,
}: {
  input: CreateRoleInput
}): Promise<Role> {
  return apiRequest<Role>('/roles', {
    method: 'POST',
    body: input,
  })
}

export function updateRole({
  id,
  input,
}: {
  id: string
  input: UpdateRoleInput
}): Promise<Role> {
  return apiRequest<Role>(`/roles/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function updateRoleStatus({
  id,
  input,
}: {
  id: string
  input: UpdateRoleStatusInput
}): Promise<Role> {
  return apiRequest<Role>(`/roles/${id}/status`, {
    method: 'PATCH',
    body: input,
  })
}

export function getRolePermissions({
  id,
}: {
  id: string
}): Promise<RolePermissionsResponse> {
  return apiRequest<RolePermissionsResponse>(`/roles/${id}/permissions`)
}

export function replaceRolePermissions({
  id,
  input,
}: {
  id: string
  input: ReplaceRolePermissionsInput
}): Promise<PermissionSummary[]> {
  return apiRequest<PermissionSummary[]>(`/roles/${id}/permissions`, {
    method: 'PUT',
    body: input,
  })
}
