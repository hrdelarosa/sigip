import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import {
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
        roleId: roles.id,
        roleCode: roles.code,
        roleName: roles.name,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
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
        .select()
        .from(users)
        .where(eq(users.id, uuidToBuffer(data.userId)))
        .for('update');

      if (
        !user ||
        !user.isActive ||
        user.password !== data.expectedPasswordHash
      ) {
        return null;
      }

      const [role] = await tx
        .select()
        .from(roles)
        .where(eq(roles.id, user.roleId))
        .limit(1);

      if (!role?.isActive) return null;

      await tx.insert(sessions).values({
        id: uuidToBuffer(data.id),
        userId: user.id,
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
        .where(eq(users.id, user.id));

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
          username: user.username,
          fullName: user.fullName,
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
    const rows = await this.db
      .select(sessionColumns)
      .from(sessions)
      .where(eq(sessions.userId, uuidToBuffer(userId)))
      .orderBy(desc(sessions.createdAt));

    return rows.map((row) => this.toModel(row));
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
    const conditions = [
      eq(sessions.id, uuidToBuffer(data.sessionId)),
      isNull(sessions.revokedAt),
    ];

    if (data.userId) {
      conditions.push(eq(sessions.userId, uuidToBuffer(data.userId)));
    }

    const [result] = await this.db
      .update(sessions)
      .set({
        revokedAt: data.revokedAt,
        revokedBy: data.revokedBy ? uuidToBuffer(data.revokedBy) : null,
        revokedReason: data.revokedReason,
      })
      .where(and(...conditions));

    return result.affectedRows > 0;
  }

  async revokeAllForUser(data: RevokeUserSessionsData): Promise<boolean> {
    const [result] = await this.db
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

    return result.affectedRows > 0;
  }
}
