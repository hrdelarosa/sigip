import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import { organizationalUnits } from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import { OrganizationalUnitsModel } from '../models/organizational-units.model';
import { OrganizationalUnitsRepository } from './organizational-units.repository';
import {
  CreateOrganizationalUnitData,
  UpdateOrganizationalUnitData,
} from '../types/organizational-units.types';

@Injectable()
export class DrizzleOrganizationalUnitsRepository implements OrganizationalUnitsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  private toModel(
    row: typeof organizationalUnits.$inferSelect,
  ): OrganizationalUnitsModel {
    return {
      id: bufferToUuid(row.id),
      parentId: bufferToUuid(row.parentId),
      code: row.code,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<OrganizationalUnitsModel[]> {
    const row = await this.db
      .select()
      .from(organizationalUnits)
      .orderBy(desc(organizationalUnits.createdAt));

    return row.map((row) => this.toModel(row));
  }

  async findById(id: string): Promise<OrganizationalUnitsModel | null> {
    const [row] = await this.db
      .select()
      .from(organizationalUnits)
      .where(eq(organizationalUnits.id, uuidToBuffer(id)))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async findByCode(code: string): Promise<OrganizationalUnitsModel | null> {
    const [row] = await this.db
      .select()
      .from(organizationalUnits)
      .where(eq(organizationalUnits.code, code))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async create(
    data: CreateOrganizationalUnitData,
  ): Promise<OrganizationalUnitsModel> {
    const values: typeof organizationalUnits.$inferInsert = {
      id: uuidToBuffer(data.id),
      parentId: uuidToBuffer(data.parentId),
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      isActive: true,
      sortOrder: data.sortOrder,
    };

    await this.db.insert(organizationalUnits).values(values);

    const organizationalUnit = await this.findById(data.id);

    if (!organizationalUnit)
      throw new Error('No fue posible recuperar la unidad organizativa creada');

    return organizationalUnit;
  }

  async update(
    id: string,
    data: UpdateOrganizationalUnitData,
  ): Promise<OrganizationalUnitsModel | null> {
    const values: Partial<typeof organizationalUnits.$inferInsert> = {
      updatedAt: data.updatedAt,
    };

    if (data.parentId !== undefined)
      values.parentId = uuidToBuffer(data.parentId);

    if (data.name !== undefined) values.name = data.name;

    if (data.description !== undefined) values.description = data.description;

    if (data.sortOrder !== undefined) values.sortOrder = data.sortOrder;

    await this.db
      .update(organizationalUnits)
      .set(values)
      .where(eq(organizationalUnits.id, uuidToBuffer(id)));

    return this.findById(id);
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    updatedAt?: Date,
  ): Promise<OrganizationalUnitsModel | null> {
    await this.db
      .update(organizationalUnits)
      .set({ isActive, updatedAt })
      .where(eq(organizationalUnits.id, uuidToBuffer(id)));

    return this.findById(id);
  }
}
