import { apiRequest } from '@/lib/api/api-client'
import type { UserSessions } from '../types/user.types'

export function getUserSessions({
  userId,
  signal,
}: {
  userId: string
  signal?: AbortSignal
}): Promise<UserSessions> {
  return apiRequest<UserSessions>(`/users/${userId}/sessions`, { signal })
}

export function revokeUserSession({
  userId,
  sessionId,
}: {
  userId: string
  sessionId: string
}): Promise<void> {
  return apiRequest<void>(`/users/${userId}/sessions/${sessionId}`, {
    method: 'DELETE',
  })
}
