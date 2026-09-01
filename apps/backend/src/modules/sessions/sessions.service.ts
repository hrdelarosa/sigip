import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  generateSessionToken,
  hashSessionToken,
  isValidSessionTokenFormat,
} from '../../common/crypto/session-token.util';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import type { UserWithPasswordModel } from '../users/models/user.model';
import type { LoginMetadata } from '../auth/auth.service';
import type {
  AuthenticatedSessionModel,
  SessionModel,
} from './models/session.model';
import { SessionsRepository } from './repositories/sessions.repository';

@Injectable()
export class SessionsService {
  private readonly idleMinutes: number;
  private readonly absoluteMinutes: number;

  constructor(
    private readonly sessionsRepository: SessionsRepository,
    configService: ConfigService,
  ) {
    this.idleMinutes = configService.getOrThrow<number>(
      'auth.sessionIdleMinutes',
    );
    this.absoluteMinutes = configService.getOrThrow<number>(
      'auth.sessionAbsoluteMinutes',
    );
  }

  async createLoginSession(
    user: UserWithPasswordModel,
    metadata: LoginMetadata,
  ): Promise<{
    token: string;
    absoluteExpiresAt: Date;
    user: AuthenticatedUserModel;
  } | null> {
    const now = new Date();
    const token = generateSessionToken();
    const absoluteExpiresAt = new Date(
      now.getTime() + this.absoluteMinutes * 60_000,
    );
    const session = await this.sessionsRepository.createLoginSession({
      id: generateUuidV7(),
      userId: user.id,
      expectedPasswordHash: user.passwordHash,
      tokenHash: hashSessionToken(token),
      createdAt: now,
      idleExpiresAt: new Date(now.getTime() + this.idleMinutes * 60_000),
      absoluteExpiresAt,
      ...metadata,
    });

    if (!session) return null;

    return {
      token,
      absoluteExpiresAt,
      user: this.toAuthenticatedUser(session),
    };
  }

  async authenticateToken(token: unknown): Promise<AuthenticatedUserModel> {
    if (typeof token !== 'string' || !isValidSessionTokenFormat(token)) {
      throw new UnauthorizedException('No autenticado');
    }

    const now = new Date();
    const session = await this.sessionsRepository.findAuthenticatedByTokenHash(
      hashSessionToken(token),
      now,
    );

    if (!session) throw new UnauthorizedException('No autenticado');

    const isStillValid = await this.sessionsRepository.touch(
      session,
      new Date(),
      this.idleMinutes,
    );

    if (!isStillValid) throw new UnauthorizedException('No autenticado');

    return this.toAuthenticatedUser(session);
  }

  findAllForUser(userId: string): Promise<SessionModel[]> {
    return this.sessionsRepository.findAllForUser(userId);
  }

  async findByIdForUser(
    sessionId: string,
    userId: string,
  ): Promise<SessionModel> {
    const session = await this.sessionsRepository.findByIdForUser(
      sessionId,
      userId,
    );

    if (!session) throw new NotFoundException('Sesión no encontrada');

    return session;
  }

  async revokeCurrent(user: AuthenticatedUserModel): Promise<void> {
    await this.sessionsRepository.revoke({
      sessionId: user.sessionId,
      userId: user.userId,
      revokedAt: new Date(),
      revokedBy: user.userId,
      revokedReason: 'LOGOUT',
      actorSessionId: user.sessionId,
    });
  }

  async revokeForUser(
    sessionId: string,
    userId: string,
    actorId: string,
    actorSessionId?: string,
  ): Promise<void> {
    const session = await this.findByIdForUser(sessionId, userId);

    if (session.revokedAt) return;

    await this.sessionsRepository.revoke({
      sessionId,
      userId,
      revokedAt: new Date(),
      revokedBy: actorId,
      revokedReason: actorId === userId ? 'LOGOUT' : 'ADMIN_REVOKED',
      actorSessionId,
    });
  }

  async revokeAllForUser(
    userId: string,
    actorId: string,
    actorSessionId?: string,
  ): Promise<void> {
    const revokedReason = actorId === userId ? 'LOGOUT_ALL' : 'ADMIN_REVOKED';
    await this.sessionsRepository.revokeAllForUser({
      userId,
      revokedAt: new Date(),
      revokedBy: actorId,
      revokedReason,
      actorSessionId,
    });
  }

  private toAuthenticatedUser(
    session: AuthenticatedSessionModel,
  ): AuthenticatedUserModel {
    return {
      userId: session.user.id,
      sessionId: session.id,
      username: session.user.username,
      fullName: session.user.fullName,
      office: session.office,
      role: session.role,
      permissions: session.permissions,
    };
  }
}
