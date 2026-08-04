import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import { permissions, rolePermissions, roles } from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import {
  PermissionModel,
  PermissionRoleModel,
} from '../models/permission.model';
import { PermissionsRepository } from './permissions.repository';
import {
  CreatePermissionData,
  DeletePermissionResult,
  UpdatePermissionData,
} from '../types/permission.types';

@Injectable()
export class DrizzlePermissionsRepository implements PermissionsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  private toModel(row: typeof permissions.$inferSelect): PermissionModel {
    return {
      id: bufferToUuid(row.id),
      code: row.code,
      description: row.description,
      createdAt: row.createdAt,
    };
  }

  async findAll(): Promise<PermissionModel[]> {
    const row = await this.db
      .select()
      .from(permissions)
      .orderBy(desc(permissions.createdAt));

    return row.map((row) => this.toModel(row));
  }

  async findById(id: string): Promise<PermissionModel | null> {
    const [row] = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.id, uuidToBuffer(id)))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async findRolesByPermissionId(id: string): Promise<PermissionRoleModel[]> {
    const rows = await this.db
      .select({
        id: roles.id,
        code: roles.code,
        name: roles.name,
        isActive: roles.isActive,
      })
      .from(rolePermissions)
      .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
      .where(eq(rolePermissions.permissionId, uuidToBuffer(id)))
      .orderBy(roles.name);

    return rows.map((row) => ({
      id: bufferToUuid(row.id),
      code: row.code,
      name: row.name,
      isActive: row.isActive,
    }));
  }

  async findByCode(code: string): Promise<PermissionModel | null> {
    const [row] = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.code, code))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async create(data: CreatePermissionData): Promise<PermissionModel> {
    const values: typeof permissions.$inferInsert = {
      id: uuidToBuffer(data.id),
      code: data.code,
      description: data.description ?? null,
    };

    await this.db.insert(permissions).values(values);

    const permission = await this.findById(data.id);

    if (!permission)
      throw new Error('No fue posible recuperar el permiso creado');

    return permission;
  }

  async update(
    id: string,
    data: UpdatePermissionData,
  ): Promise<PermissionModel | null> {
    const values: Partial<typeof permissions.$inferInsert> = {};

    if (data.description !== undefined) values.description = data.description;

    if (Object.keys(values).length > 0) {
      await this.db
        .update(permissions)
        .set(values)
        .where(eq(permissions.id, uuidToBuffer(id)));
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<DeletePermissionResult> {
    try {
      const [result] = await this.db
        .delete(permissions)
        .where(eq(permissions.id, uuidToBuffer(id)));

      return result.affectedRows > 0 ? 'deleted' : 'not-found';
    } catch (error) {
      if (isForeignKeyConstraintError(error)) return 'has-assigned-roles';

      throw error;
    }
  }
}

export function isForeignKeyConstraintError(error: unknown): boolean {
  let currentError = error;
  const visitedErrors = new Set<object>();

  while (typeof currentError === 'object' && currentError !== null) {
    if (visitedErrors.has(currentError)) return false;
    visitedErrors.add(currentError);

    if (
      'code' in currentError &&
      currentError.code === 'ER_ROW_IS_REFERENCED_2'
    ) {
      return true;
    }

    if (!('cause' in currentError)) return false;
    currentError = currentError.cause;
  }

  return false;
}
