import {
  AuthenticatedSessionModel,
  SessionModel,
} from '../models/session.model';
import {
  CreateLoginSessionData,
  RevokeSessionData,
  RevokeUserSessionsData,
} from '../types/session.types';

export abstract class SessionsRepository {
  abstract createLoginSession(
    data: CreateLoginSessionData,
  ): Promise<AuthenticatedSessionModel | null>;
  abstract findAuthenticatedByTokenHash(
    tokenHash: string,
    now: Date,
  ): Promise<AuthenticatedSessionModel | null>;
  abstract findAllForUser(userId: string): Promise<SessionModel[]>;
  abstract findByIdForUser(
    sessionId: string,
    userId: string,
  ): Promise<SessionModel | null>;
  abstract touch(
    session: SessionModel,
    now: Date,
    idleMinutes: number,
  ): Promise<boolean>;
  abstract revoke(data: RevokeSessionData): Promise<boolean>;
  abstract revokeAllForUser(data: RevokeUserSessionsData): Promise<boolean>;
}
