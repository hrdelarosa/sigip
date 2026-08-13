export interface CreateUserData {
  id: string;
  roleId: string;
  username: string;
  fullName: string;
  passwordHash: string;
}

export interface UpdateUserData {
  roleId?: string;
  username?: string;
  fullName?: string;
  updatedAt?: Date;
}

export interface UserAuditContext {
  userId: string;
  sessionId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}
