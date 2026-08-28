import type {
  ChangeUserPasswordRequest,
  ChangeUserStatusRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UserDetailsResponse,
  UsersResponse,
} from '@sigip/shared'
import { apiRequest } from '@/lib/api/api-client'

export function getUsers({ page, limit }: { page: number; limit: number }): Promise<UsersResponse> {
  return apiRequest<UsersResponse>(`/users?page=${page}&limit=${limit}`)
}

export function getUserById({ id }: { id: string }): Promise<UserDetailsResponse> {
  return apiRequest<UserDetailsResponse>(`/users/${id}`)
}

export function createUser({
  input,
}: {
  input: CreateUserRequest
}): Promise<UserResponse> {
  return apiRequest<UserResponse>('/users', {
    method: 'POST',
    body: input,
  })
}

export function updateUser({
  id,
  input,
}: {
  id: string
  input: UpdateUserRequest
}): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/users/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function updateUserStatus({
  id,
  input,
}: {
  id: string
  input: ChangeUserStatusRequest
}): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/users/${id}/status`, {
    method: 'PATCH',
    body: input,
  })
}

export function changeUserPassword({
  id,
  input,
}: {
  id: string
  input: ChangeUserPasswordRequest
}): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/users/${id}/password`, {
    method: 'PATCH',
    body: input,
  })
}
