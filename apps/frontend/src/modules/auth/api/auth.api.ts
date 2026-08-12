import type { AuthMeResponse, LoginRequest, LoginResponse } from '@sigip/shared'

import { apiRequest } from '@/lib/api/api-client'

export function login(input: LoginRequest): Promise<LoginResponse> {
  return apiRequest('/auth/login', { method: 'POST', body: input })
}

export function logout(): Promise<void> {
  return apiRequest('/auth/logout', { method: 'POST' })
}

export function getCurrentUser(signal?: AbortSignal): Promise<AuthMeResponse> {
  return apiRequest('/auth/me', { signal })
}
