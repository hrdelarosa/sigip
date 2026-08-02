import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import { permissions } from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import { PermissionModel } from '../models/permission.model';
import {
  CreatePermissionData,
  PermissionsRepository,
  UpdatePermissionData,
} from './permissions.repository';

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

    if (Object.keys(values).length === 0) {
      await this.db
        .update(permissions)
        .set(values)
        .where(eq(permissions.id, uuidToBuffer(id)));
    }

    return this.findById(id);
  }
}
