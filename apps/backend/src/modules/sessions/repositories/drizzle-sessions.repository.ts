import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gt, gte, isNull } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import {
  offices,
  permissions,
  rolePermissions,
  roles,
  sessions,
  users,
} from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import {
  AuthenticatedSessionModel,
  SessionModel,
} from '../models/session.model';
import {
  CreateLoginSessionData,
  RevokeSessionData,
  RevokeUserSessionsData,
} from '../types/session.types';
import { SessionsRepository } from './sessions.repository';
import { AuditService } from '../../audit/audit.service';

const sessionColumns = {
  id: sessions.id,
  userId: sessions.userId,
  createdAt: sessions.createdAt,
  lastActivityAt: sessions.lastActivityAt,
  idleExpiresAt: sessions.idleExpiresAt,
  absoluteExpiresAt: sessions.absoluteExpiresAt,
  revokedAt: sessions.revokedAt,
  revokedBy: sessions.revokedBy,
  revokedReason: sessions.revokedReason,
  ipAddress: sessions.ipAddress,
  userAgent: sessions.userAgent,
};

type SessionRow = Pick<
  typeof sessions.$inferSelect,
  keyof typeof sessionColumns
>;

@Injectable()
export class DrizzleSessionsRepository implements SessionsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
    private readonly auditService: AuditService,
  ) {}

  private toModel(row: SessionRow): SessionModel {
    return {
      ...row,
      id: bufferToUuid(row.id),
      userId: bufferToUuid(row.userId),
      revokedBy: row.revokedBy ? bufferToUuid(row.revokedBy) : null,
    };
  }

  async findAuthenticatedByTokenHash(
    tokenHash: string,
    now: Date,
  ): Promise<AuthenticatedSessionModel | null> {
    const [row] = await this.db
      .select({
        session: sessionColumns,
        userId: users.id,
        username: users.username,
        fullName: users.fullName,
        officeId: offices.id,
        officeCode: offices.code,
        officeName: offices.name,
        roleId: roles.id,
        roleCode: roles.code,
        roleName: roles.name,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .innerJoin(offices, eq(users.officeId, offices.id))
      .innerJoin(roles, eq(roles.id, users.roleId))
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          isNull(sessions.revokedAt),
          gt(sessions.idleExpiresAt, now),
          gt(sessions.absoluteExpiresAt, now),
          eq(users.isActive, true),
          eq(roles.isActive, true),
        ),
      )
      .limit(1);

    if (!row) return null;

    const permissionRows = await this.db
      .select({ code: permissions.code })
      .from(rolePermissions)
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(eq(rolePermissions.roleId, row.roleId));

    return {
      ...this.toModel(row.session),
      user: {
        id: bufferToUuid(row.userId),
        username: row.username,
        fullName: row.fullName,
      },
      office: {
        id: bufferToUuid(row.officeId),
        code: row.officeCode,
        name: row.officeName,
      },
      role: {
        id: bufferToUuid(row.roleId),
        code: row.roleCode,
        name: row.roleName,
      },
      permissions: permissionRows.map(({ code }) => code),
    };
  }

  async createLoginSession(
    data: CreateLoginSessionData,
  ): Promise<AuthenticatedSessionModel | null> {
    return this.db.transaction(async (tx) => {
      const [user] = await tx
        .select({
          user: users,
          officeCode: offices.code,
          officeName: offices.name,
        })
        .from(users)
        .innerJoin(offices, eq(users.officeId, offices.id))
        .where(eq(users.id, uuidToBuffer(data.userId)))
        .for('update');

      if (
        !user ||
        !user.user.isActive ||
        user.user.password !== data.expectedPasswordHash
      ) {
        return null;
      }

      const [role] = await tx
        .select()
        .from(roles)
        .where(eq(roles.id, user.user.roleId))
        .limit(1);

      if (!role?.isActive) return null;

      await tx.insert(sessions).values({
        id: uuidToBuffer(data.id),
        userId: user.user.id,
        tokenHash: data.tokenHash,
        createdAt: data.createdAt,
        lastActivityAt: data.createdAt,
        idleExpiresAt: data.idleExpiresAt,
        absoluteExpiresAt: data.absoluteExpiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      await tx
        .update(users)
        .set({ lastLoginAt: data.createdAt, updatedAt: data.createdAt })
        .where(eq(users.id, user.user.id));

      await this.auditService.append(
        {
          userId: data.userId,
          sessionId: data.id,
          action: 'LOGIN_SUCCEEDED',
          entityType: 'AUTH',
          entityId: data.userId,
          newValues: { username: user.user.username },
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          createdAt: data.createdAt,
        },
        tx,
      );

      const permissionRows = await tx
        .select({ code: permissions.code })
        .from(rolePermissions)
        .innerJoin(
          permissions,
          eq(permissions.id, rolePermissions.permissionId),
        )
        .where(eq(rolePermissions.roleId, role.id));

      return {
        id: data.id,
        userId: data.userId,
        createdAt: data.createdAt,
        lastActivityAt: data.createdAt,
        idleExpiresAt: data.idleExpiresAt,
        absoluteExpiresAt: data.absoluteExpiresAt,
        revokedAt: null,
        revokedBy: null,
        revokedReason: null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        user: {
          id: data.userId,
          username: user.user.username,
          fullName: user.user.fullName,
        },
        office: {
          id: bufferToUuid(user.user.officeId),
          code: user.officeCode,
          name: user.officeName,
        },
        role: {
          id: bufferToUuid(role.id),
          code: role.code,
          name: role.name,
        },
        permissions: permissionRows.map(({ code }) => code),
      };
    });
  }

  async findAllForUser(userId: string): Promise<SessionModel[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rows = await this.db
      .select(sessionColumns)
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, uuidToBuffer(userId)),
          gte(sessions.createdAt, sevenDaysAgo),
        ),
      )
      .orderBy(desc(sessions.createdAt));

    return rows.map((row) => this.toModel(row));
  }

  async findSessionSummaryForUser(
    userId: string,
    currentSessionId: string,
    now: Date,
    recentFrom: Date,
  ) {
    const userIdBuffer = uuidToBuffer(userId);
    const [activeResult, recentResult, currentSession] = await Promise.all([
      this.db
        .select({ activeCount: count() })
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, userIdBuffer),
            isNull(sessions.revokedAt),
            gt(sessions.idleExpiresAt, now),
            gt(sessions.absoluteExpiresAt, now),
          ),
        ),
      this.db
        .select({ recentCount: count() })
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, userIdBuffer),
            gte(sessions.createdAt, recentFrom),
          ),
        ),
      this.db
        .select({ absoluteExpiresAt: sessions.absoluteExpiresAt })
        .from(sessions)
        .where(
          and(
            eq(sessions.id, uuidToBuffer(currentSessionId)),
            eq(sessions.userId, userIdBuffer),
          ),
        )
        .limit(1),
    ]);

    return {
      activeCount: activeResult[0]?.activeCount ?? 0,
      recentCount: recentResult[0]?.recentCount ?? 0,
      currentSessionExpiresAt: currentSession[0]?.absoluteExpiresAt ?? null,
    };
  }

  async findByIdForUser(
    sessionId: string,
    userId: string,
  ): Promise<SessionModel | null> {
    const [row] = await this.db
      .select(sessionColumns)
      .from(sessions)
      .where(
        and(
          eq(sessions.id, uuidToBuffer(sessionId)),
          eq(sessions.userId, uuidToBuffer(userId)),
        ),
      )
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async touch(
    session: SessionModel,
    now: Date,
    idleMinutes: number,
  ): Promise<boolean> {
    const requestedExpiration = new Date(now.getTime() + idleMinutes * 60_000);
    const idleExpiresAt =
      requestedExpiration < session.absoluteExpiresAt
        ? requestedExpiration
        : session.absoluteExpiresAt;

    const [result] = await this.db
      .update(sessions)
      .set({ lastActivityAt: now, idleExpiresAt })
      .where(
        and(
          eq(sessions.id, uuidToBuffer(session.id)),
          isNull(sessions.revokedAt),
          gt(sessions.idleExpiresAt, now),
          gt(sessions.absoluteExpiresAt, now),
          eq(sessions.lastActivityAt, session.lastActivityAt),
        ),
      );

    if (result.affectedRows > 0) return true;

    const [activeSession] = await this.db
      .select({ id: sessions.id })
      .from(sessions)
      .where(
        and(
          eq(sessions.id, uuidToBuffer(session.id)),
          isNull(sessions.revokedAt),
          gt(sessions.idleExpiresAt, now),
          gt(sessions.absoluteExpiresAt, now),
        ),
      )
      .limit(1);

    return Boolean(activeSession);
  }

  async revoke(data: RevokeSessionData): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const conditions = [
        eq(sessions.id, uuidToBuffer(data.sessionId)),
        isNull(sessions.revokedAt),
      ];

      if (data.userId) {
        conditions.push(eq(sessions.userId, uuidToBuffer(data.userId)));
      }

      const [result] = await tx
        .update(sessions)
        .set({
          revokedAt: data.revokedAt,
          revokedBy: data.revokedBy ? uuidToBuffer(data.revokedBy) : null,
          revokedReason: data.revokedReason,
        })
        .where(and(...conditions));

      if (result.affectedRows === 0) return false;

      await this.auditService.append(
        {
          userId: data.revokedBy,
          sessionId: data.actorSessionId,
          action:
            data.revokedReason === 'LOGOUT' ? 'LOGOUT' : 'SESSION_REVOKED',
          entityType: 'SESSION',
          entityId: data.sessionId,
          newValues: {
            revokedReason: data.revokedReason,
            ...(data.userId ? { userId: data.userId } : {}),
          },
          createdAt: data.revokedAt,
        },
        tx,
      );

      return true;
    });
  }

  async revokeAllForUser(data: RevokeUserSessionsData): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const [result] = await tx
        .update(sessions)
        .set({
          revokedAt: data.revokedAt,
          revokedBy: data.revokedBy ? uuidToBuffer(data.revokedBy) : null,
          revokedReason: data.revokedReason,
        })
        .where(
          and(
            eq(sessions.userId, uuidToBuffer(data.userId)),
            isNull(sessions.revokedAt),
          ),
        );

      if (result.affectedRows === 0) return false;

      await this.auditService.append(
        {
          userId: data.revokedBy,
          sessionId: data.actorSessionId,
          action: 'SESSIONS_REVOKED',
          entityType: 'SESSION',
          entityId: data.userId,
          newValues: {
            userId: data.userId,
            revokedReason: data.revokedReason,
            revokedCount: result.affectedRows,
          },
          createdAt: data.revokedAt,
        },
        tx,
      );

      return true;
    });
  }
}
