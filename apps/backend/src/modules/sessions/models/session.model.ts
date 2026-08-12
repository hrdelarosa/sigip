export interface SessionModel {
  id: string;
  userId: string;
  createdAt: Date;
  lastActivityAt: Date;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
  revokedAt: Date | null;
  revokedBy: string | null;
  revokedReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AuthenticatedSessionModel extends SessionModel {
  user: {
    id: string;
    username: string;
    fullName: string;
  };
  role: {
    id: string;
    code: string;
    name: string;
  };
  permissions: string[];
}
