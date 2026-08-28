import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';

import type { DrizzleDatabase } from '../../../database/database.types';
import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import { sessions, users } from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import { UserModel, UserWithPasswordModel } from '../models/user.model';
import { UsersRepository } from './users.repository';
import { CreateUserData, UpdateUserData } from '../types/user.types';
import type { UserAuditContext } from '../types/user.types';
import { AuditService } from '../../audit/audit.service';
import type { ListUsersQueryDto } from '../dto/list-users-query.dto';
import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';

const publicUserColumns = {
  id: users.id,
  roleId: users.roleId,
  username: users.username,
  fullName: users.fullName,
  isActive: users.isActive,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

type PublicUserRow = Omit<typeof users.$inferSelect, 'password'>;

@Injectable()
export class DrizzleUsersRepository implements UsersRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
    private readonly auditService: AuditService,
  ) {}

  private toModel(row: PublicUserRow): UserModel {
    return {
      id: bufferToUuid(row.id),
      roleId: bufferToUuid(row.roleId),
      username: row.username,
      fullName: row.fullName,
      isActive: row.isActive,
      lastLoginAt: row.lastLoginAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(query: ListUsersQueryDto): Promise<PaginatedResult<UserModel>> {
    const offset = (query.page - 1) * query.limit;
    const [rows, totalRows] = await Promise.all([
      this.db
        .select(publicUserColumns)
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(query.limit)
        .offset(offset),
      this.db.select({ total: count() }).from(users),
    ]);

    return {
      items: rows.map((row) => this.toModel(row)),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async findById(id: string): Promise<UserModel | null> {
    const [row] = await this.db
      .select(publicUserColumns)
      .from(users)
      .where(eq(users.id, uuidToBuffer(id)))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async findByIdWithPassword(
    id: string,
  ): Promise<UserWithPasswordModel | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, uuidToBuffer(id)))
      .limit(1);

    return row ? { ...this.toModel(row), passwordHash: row.password } : null;
  }

  async findByUsername(username: string): Promise<UserModel | null> {
    const [row] = await this.db
      .select(publicUserColumns)
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async findByUsernameWithPassword(
    username: string,
  ): Promise<UserWithPasswordModel | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return row ? { ...this.toModel(row), passwordHash: row.password } : null;
  }

  async create(
    data: CreateUserData,
    actor: UserAuditContext,
  ): Promise<UserModel> {
    const values = {
      id: uuidToBuffer(data.id),
      roleId: uuidToBuffer(data.roleId),
      username: data.username,
      fullName: data.fullName,
      password: data.passwordHash,
      isActive: true,
    } satisfies typeof users.$inferInsert;

    await this.db.transaction(async (tx) => {
      await tx.insert(users).values(values);
      await this.auditService.append(
        {
          ...actor,
          action: 'CREATED',
          entityType: 'USER',
          entityId: data.id,
          newValues: {
            roleId: data.roleId,
            username: data.username,
            fullName: data.fullName,
            isActive: true,
          },
        },
        tx,
      );
    });

    const user = await this.findById(data.id);

    if (!user) throw new Error('No fue posible recuperar el usuario creado');

    return user;
  }

  async update(
    id: string,
    data: UpdateUserData,
    actor: UserAuditContext,
  ): Promise<UserModel | null> {
    const values: Partial<typeof users.$inferInsert> = {
      updatedAt: data.updatedAt,
    };

    if (data.roleId !== undefined) values.roleId = uuidToBuffer(data.roleId);
    if (data.username !== undefined) values.username = data.username;
    if (data.fullName !== undefined) values.fullName = data.fullName;

    await this.db.transaction(async (tx) => {
      const [current] = await tx
        .select(publicUserColumns)
        .from(users)
        .where(eq(users.id, uuidToBuffer(id)))
        .for('update');

      if (!current) return;

      await tx
        .update(users)
        .set(values)
        .where(eq(users.id, uuidToBuffer(id)));

      const oldValues = {
        roleId: bufferToUuid(current.roleId),
        username: current.username,
        fullName: current.fullName,
      };
      const newValues = {
        roleId: data.roleId ?? oldValues.roleId,
        username: data.username ?? oldValues.username,
        fullName: data.fullName ?? oldValues.fullName,
      };

      await this.auditService.append(
        {
          ...actor,
          action:
            data.roleId !== undefined && data.roleId !== oldValues.roleId
              ? 'ROLE_CHANGED'
              : 'UPDATED',
          entityType: 'USER',
          entityId: id,
          oldValues,
          newValues,
          createdAt: data.updatedAt,
        },
        tx,
      );
    });

    return this.findById(id);
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
    actorId: string,
    actorSessionId: string,
  ): Promise<UserModel | null> {
    await this.db.transaction(async (tx) => {
      const [current] = await tx
        .select(publicUserColumns)
        .from(users)
        .where(eq(users.id, uuidToBuffer(id)))
        .for('update');

      if (!current || current.isActive === isActive) return;

      await tx
        .update(users)
        .set({ isActive, updatedAt })
        .where(eq(users.id, uuidToBuffer(id)));

      if (!isActive) {
        const [revoked] = await tx
          .update(sessions)
          .set({
            revokedAt: updatedAt,
            revokedBy: uuidToBuffer(actorId),
            revokedReason: 'USER_DEACTIVATED',
          })
          .where(
            and(
              eq(sessions.userId, uuidToBuffer(id)),
              isNull(sessions.revokedAt),
            ),
          );

        if (revoked.affectedRows > 0) {
          await this.auditService.append(
            {
              userId: actorId,
              sessionId: actorSessionId,
              action: 'SESSIONS_REVOKED',
              entityType: 'SESSION',
              entityId: id,
              newValues: {
                userId: id,
                revokedReason: 'USER_DEACTIVATED',
                revokedCount: revoked.affectedRows,
              },
              createdAt: updatedAt,
            },
            tx,
          );
        }
      }

      await this.auditService.append(
        {
          userId: actorId,
          sessionId: actorSessionId,
          action: 'STATUS_CHANGED',
          entityType: 'USER',
          entityId: id,
          oldValues: { isActive: current.isActive },
          newValues: { isActive },
          createdAt: updatedAt,
        },
        tx,
      );
    });

    return this.findById(id);
  }

  async updatePassword(
    id: string,
    passwordHash: string,
    updatedAt: Date,
    actorId: string,
    actorSessionId: string,
  ): Promise<UserModel | null> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ password: passwordHash, updatedAt })
        .where(eq(users.id, uuidToBuffer(id)));

      const [revoked] = await tx
        .update(sessions)
        .set({
          revokedAt: updatedAt,
          revokedBy: uuidToBuffer(actorId),
          revokedReason: 'PASSWORD_RESET',
        })
        .where(
          and(
            eq(sessions.userId, uuidToBuffer(id)),
            isNull(sessions.revokedAt),
          ),
        );

      await this.auditService.append(
        {
          userId: actorId,
          sessionId: actorSessionId,
          action: 'PASSWORD_CHANGED',
          entityType: 'USER',
          entityId: id,
          newValues: { credentialsUpdated: true },
          createdAt: updatedAt,
        },
        tx,
      );

      if (revoked.affectedRows > 0) {
        await this.auditService.append(
          {
            userId: actorId,
            sessionId: actorSessionId,
            action: 'SESSIONS_REVOKED',
            entityType: 'SESSION',
            entityId: id,
            newValues: {
              userId: id,
              revokedReason: 'PASSWORD_RESET',
              revokedCount: revoked.affectedRows,
            },
            createdAt: updatedAt,
          },
          tx,
        );
      }
    });

    return this.findById(id);
  }
}
