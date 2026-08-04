import type {
  CreateRoleRequest,
  PermissionsSummaryResponse,
  ReplaceRolePermissionsRequest,
  RolePermissionsResponse,
  RoleResponse,
  RolesResponse,
  UpdateRoleRequest,
  UpdateRoleStatusRequest,
} from '@sigip/shared'
import { apiRequest } from '@/lib/api/api-client'

export function getRoles(): Promise<RolesResponse> {
  return apiRequest<RolesResponse>('/roles')
}

export function getRoleById({ id }: { id: string }): Promise<RoleResponse> {
  return apiRequest<RoleResponse>(`/roles/${id}`)
}

export function createRole({
  input,
}: {
  input: CreateRoleRequest
}): Promise<RoleResponse> {
  return apiRequest<RoleResponse>('/roles', {
    method: 'POST',
    body: input,
  })
}

export function updateRole({
  id,
  input,
}: {
  id: string
  input: UpdateRoleRequest
}): Promise<RoleResponse> {
  return apiRequest<RoleResponse>(`/roles/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function updateRoleStatus({
  id,
  input,
}: {
  id: string
  input: UpdateRoleStatusRequest
}): Promise<RoleResponse> {
  return apiRequest<RoleResponse>(`/roles/${id}/status`, {
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
  input: ReplaceRolePermissionsRequest
}): Promise<PermissionsSummaryResponse> {
  return apiRequest<PermissionsSummaryResponse>(`/roles/${id}/permissions`, {
    method: 'PUT',
    body: input,
  })
}
