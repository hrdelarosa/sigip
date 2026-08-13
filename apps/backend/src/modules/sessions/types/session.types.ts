export type SessionRevocationReason =
  | 'LOGOUT'
  | 'LOGOUT_ALL'
  | 'ADMIN_REVOKED'
  | 'USER_DEACTIVATED'
  | 'PASSWORD_RESET';

export interface CreateLoginSessionData {
  id: string;
  userId: string;
  expectedPasswordHash: string;
  tokenHash: string;
  createdAt: Date;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface RevokeSessionData {
  sessionId: string;
  userId?: string;
  revokedAt: Date;
  revokedBy: string | null;
  revokedReason: SessionRevocationReason;
  actorSessionId?: string;
}

export interface RevokeUserSessionsData {
  userId: string;
  revokedAt: Date;
  revokedBy: string | null;
  revokedReason: SessionRevocationReason;
  actorSessionId?: string;
}
