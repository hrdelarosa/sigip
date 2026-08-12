import type { SessionsResponse } from '@sigip/shared'

import { apiRequest } from '@/lib/api/api-client'

export function getSessions(): Promise<SessionsResponse> {
  return apiRequest('/sessions')
}

export function revokeSession(sessionId: string): Promise<void> {
  return apiRequest(`/sessions/${sessionId}`, { method: 'DELETE' })
}
