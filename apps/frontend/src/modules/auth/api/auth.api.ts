import { apiRequest } from '@/lib/api/api-client'
import type {
  AuthenticatedUser,
  LoginInput,
  LoginResult,
} from '../types/auth.types'

export function login({ input }: { input: LoginInput }): Promise<LoginResult> {
  return apiRequest<LoginResult>('/auth/login', { method: 'POST', body: input })
}

export function logout(): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST' })
}

export function getCurrentUser({
  signal,
}: {
  signal?: AbortSignal
}): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>('/auth/me', { signal })
}
