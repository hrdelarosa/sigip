import type { SessionResponse, SessionsResponse } from '@sigip/shared';

import type { SessionModel } from '../models/session.model';

export function toSessionResponse(
  session: SessionModel,
  currentSessionId: string,
): SessionResponse {
  return {
    id: session.id,
    createdAt: session.createdAt.toISOString(),
    lastActivityAt: session.lastActivityAt.toISOString(),
    idleExpiresAt: session.idleExpiresAt.toISOString(),
    absoluteExpiresAt: session.absoluteExpiresAt.toISOString(),
    revokedAt: session.revokedAt?.toISOString() ?? null,
    revokedReason: session.revokedReason,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    isCurrent: session.id === currentSessionId,
  };
}

export function toSessionsResponse(
  sessions: SessionModel[],
  currentSessionId: string,
): SessionsResponse {
  const response: SessionsResponse = [];

  for (const session of sessions) {
    response.push(toSessionResponse(session, currentSessionId));
  }

  return response;
}
