import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import {
  employeeAssignments,
  employees,
  positions,
} from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import type {
  PositionEmployeeModel,
  PositionModel,
} from '../models/position.model';
import { PositionsRepository } from './positions.repository';
import type {
  CreatePositionData,
  UpdatePositionData,
} from '../types/position.types';
import { PositionHasCurrentOrFutureAssignmentsError } from '../positions.error';

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

  private calendarToday(): Date {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
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

  async findEmployeesByPositionId(
    id: string,
  ): Promise<PositionEmployeeModel[]> {
    const today = this.calendarToday();
    const rows = await this.db
      .select({
        id: employees.id,
        employeeNumber: employees.employeeNumber,
        fullName: employees.fullName,
        status: employees.status,
      })
      .from(employeeAssignments)
      .innerJoin(employees, eq(employeeAssignments.employeeId, employees.id))
      .where(
        and(
          eq(employeeAssignments.positionId, uuidToBuffer(id)),
          lte(employeeAssignments.effectiveFrom, today),
          or(
            isNull(employeeAssignments.effectiveTo),
            gte(employeeAssignments.effectiveTo, today),
          ),
        ),
      )
      .orderBy(employees.fullName, employees.id);

    return rows.map((row) => ({
      id: bufferToUuid(row.id),
      employeeNumber: row.employeeNumber,
      fullName: row.fullName,
      status: row.status,
    }));
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
    updatedAt: Date,
  ): Promise<PositionModel | null> {
    return this.db.transaction(async (transaction) => {
      const positionId = uuidToBuffer(id);

      await transaction.execute(
        sql`SELECT ${positions.id} FROM ${positions} WHERE ${positions.id} = ${positionId} FOR UPDATE`,
      );

      const [current] = await transaction
        .select()
        .from(positions)
        .where(eq(positions.id, positionId))
        .limit(1);

      if (!current) return null;
      if (current.isActive === isActive) return this.toModel(current);

      if (!isActive) {
        const today = this.calendarToday();

        const [currentAssignment] = await transaction
          .select({ id: employeeAssignments.id })
          .from(employeeAssignments)
          .where(
            and(
              eq(employeeAssignments.positionId, positionId),
              or(
                isNull(employeeAssignments.effectiveTo),
                gte(employeeAssignments.effectiveTo, today),
              ),
            ),
          )
          .limit(1)
          .for('update');

        if (currentAssignment) {
          throw new PositionHasCurrentOrFutureAssignmentsError();
        }
      }

      await transaction
        .update(positions)
        .set({ isActive, updatedAt })
        .where(eq(positions.id, positionId));

      const [updated] = await transaction
        .select()
        .from(positions)
        .where(eq(positions.id, positionId))
        .limit(1);

      return updated ? this.toModel(updated) : null;
    });
  }
}
