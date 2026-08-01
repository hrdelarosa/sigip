import { Inject, Injectable } from '@nestjs/common';
import { count, desc, eq, inArray } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import {
  permissions,
  rolePermissions,
  roles,
  users,
} from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import type { PermissionSummaryModel, RoleModel } from '../models/role.model';
import {
  type CreateRoleData,
  RolesRepository,
  type UpdateRoleData,
} from './roles.repository';

@Injectable()
export class DrizzleRolesRepository implements RolesRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  private toModel(row: typeof roles.$inferSelect): RoleModel {
    return {
      id: bufferToUuid(row.id),
      code: row.code,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<RoleModel[]> {
    const row = await this.db
      .select()
      .from(roles)
      .orderBy(desc(roles.createdAt));

    return row.map((row) => this.toModel(row));
  }

  async findById(id: string): Promise<RoleModel | null> {
    const [row] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, uuidToBuffer(id)))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async findByCode(code: string): Promise<RoleModel | null> {
    const [row] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.code, code))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async create(data: CreateRoleData): Promise<RoleModel> {
    const values: typeof roles.$inferInsert = {
      id: uuidToBuffer(data.id),
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      isActive: true,
    };

    await this.db.insert(roles).values(values);

    const role = await this.findById(data.id);

    if (!role) throw new Error('No fue posible recuperar el rol creado');

    return role;
  }

  async update(id: string, data: UpdateRoleData): Promise<RoleModel | null> {
    const values: Partial<typeof roles.$inferInsert> = {
      updatedAt: data.updatedAt,
    };

    if (data.name !== undefined) values.name = data.name;

    if (data.description !== undefined) values.description = data.description;

    await this.db
      .update(roles)
      .set(values)
      .where(eq(roles.id, uuidToBuffer(id)));

    return this.findById(id);
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    updatedAt?: Date,
  ): Promise<RoleModel | null> {
    await this.db
      .update(roles)
      .set({ isActive, updatedAt })
      .where(eq(roles.id, uuidToBuffer(id)));

    return this.findById(id);
  }

  async countUsersByRoleId(roleId: string): Promise<number> {
    const [result] = await this.db
      .select({
        count: count(),
      })
      .from(users)
      .where(eq(users.roleId, uuidToBuffer(roleId)));

    return Number(result?.count ?? 0);
  }

  async findPermissions(roleId: string): Promise<PermissionSummaryModel[]> {
    const rows = await this.db
      .select({
        id: permissions.id,
        code: permissions.code,
        description: permissions.description,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, uuidToBuffer(roleId)))
      .orderBy(permissions.code);

    return rows.map((row) => ({
      id: bufferToUuid(row.id),
      code: row.code,
      description: row.description,
    }));
  }

  async countExistingPermissions(permissionIds: string[]): Promise<number> {
    if (permissionIds.length === 0) return 0;

    const ids = permissionIds.map(uuidToBuffer);
    const [result] = await this.db
      .select({
        count: count(),
      })
      .from(permissions)
      .where(inArray(permissions.id, ids));

    return Number(result?.count ?? 0);
  }

  async replacePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    const binaryRoleId = uuidToBuffer(roleId);

    await this.db.transaction(async (transaction) => {
      await transaction
        .delete(rolePermissions)
        .where(eq(rolePermissions.roleId, binaryRoleId));

      if (permissionIds.length === 0) {
        return;
      }

      await transaction.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({
          roleId: binaryRoleId,
          permissionId: uuidToBuffer(permissionId),
        })),
      );
    });
  }
}
