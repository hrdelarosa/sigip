import { Inject, Injectable } from '@nestjs/common';
import { OfficesRepository } from './offices.repository';
import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import { offices } from '../../../database/schema';
import { OfficeModel } from '../models/office.model';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import { asc, eq } from 'drizzle-orm';

@Injectable()
export class DrizzleOfficesRepository implements OfficesRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  private toModel(row: typeof offices.$inferSelect): OfficeModel {
    return {
      id: bufferToUuid(row.id),
      code: row.code,
      name: row.name,
      description: row.description,
      municipality: row.municipality,
      address: row.address,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<OfficeModel[]> {
    const rows = await this.db
      .select()
      .from(offices)
      .orderBy(asc(offices.sortOrder), asc(offices.name));

    return rows.map((row) => this.toModel(row));
  }

  async findById(id: string): Promise<OfficeModel | null> {
    const [row] = await this.db
      .select()
      .from(offices)
      .where(eq(offices.id, uuidToBuffer(id)))
      .limit(1);

    return row ? this.toModel(row) : null;
  }
}
