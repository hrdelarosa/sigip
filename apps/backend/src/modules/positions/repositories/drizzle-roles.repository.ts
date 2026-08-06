import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import { positions } from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import { PositionModel } from '../models/position.model';
import { PositionsRepository } from './positions.repository';
import {
  CreatePositionData,
  UpdatePositionData,
} from '../types/position.types';

@Injectable()
export class DrizzlePositionsRepository implements PositionsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  private toModel(row: typeof positions.$inferSelect): PositionModel {
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

  async findAll(): Promise<PositionModel[]> {
    const row = await this.db
      .select()
      .from(positions)
      .orderBy(desc(positions.createdAt));

    return row.map((row) => this.toModel(row));
  }

  async findById(id: string): Promise<PositionModel | null> {
    const [row] = await this.db
      .select()
      .from(positions)
      .where(eq(positions.id, uuidToBuffer(id)))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async findByCode(code: string): Promise<PositionModel | null> {
    const [row] = await this.db
      .select()
      .from(positions)
      .where(eq(positions.code, code))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async create(data: CreatePositionData): Promise<PositionModel> {
    const values: typeof positions.$inferInsert = {
      id: uuidToBuffer(data.id),
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      isActive: true,
    };

    await this.db.insert(positions).values(values);

    const position = await this.findById(data.id);

    if (!position) throw new Error('No fue posible recuperar el puesto creado');

    return position;
  }

  async update(
    id: string,
    data: UpdatePositionData,
  ): Promise<PositionModel | null> {
    const values: Partial<typeof positions.$inferInsert> = {
      updatedAt: data.updatedAt,
    };

    if (data.name !== undefined) values.name = data.name;

    if (data.description !== undefined) values.description = data.description;

    await this.db
      .update(positions)
      .set(values)
      .where(eq(positions.id, uuidToBuffer(id)));

    return this.findById(id);
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    updatedAt?: Date,
  ): Promise<PositionModel | null> {
    await this.db
      .update(positions)
      .set({ isActive, updatedAt })
      .where(eq(positions.id, uuidToBuffer(id)));

    return this.findById(id);
  }
}
