import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  isNull,
  lte,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';

import type { EmployeeStatus } from '@sigip/shared';
import { EmployeeSort } from '../dto/list-employees-query.dto';
import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import {
  employeeAssignments,
  employees,
  organizationalUnits,
  positions,
} from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';
import type {
  EmployeeAssignmentDetailsModel,
  EmployeeAssignmentModel,
} from '../models/employee-assignment.model';
import type { EmployeeModel } from '../models/employee.model';
import type {
  CreateEmployeeAssignmentData,
  CreateEmployeeData,
  EmployeeAssignmentMutationResult,
  EmployeeFilters,
  UpdateEmployeeAssignmentData,
  UpdateEmployeeData,
} from '../types/employees.types';
import { EmployeesRepository } from './employees.repository';
import { EmployeeHasCurrentOrFutureAssignmentsError } from '../employees.errors';

type EmployeeAssignmentDetailsRow = {
  assignment: typeof employeeAssignments.$inferSelect;
  organizationalUnit: Pick<
    typeof organizationalUnits.$inferSelect,
    'id' | 'code' | 'name'
  >;
  position: Pick<typeof positions.$inferSelect, 'id' | 'code' | 'name'>;
};

type EmployeeRowWithOffice = typeof employees.$inferSelect;

@Injectable()
export class DrizzleEmployeesRepository implements EmployeesRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  private toEmployeeModel(row: EmployeeRowWithOffice): EmployeeModel {
    return {
      id: bufferToUuid(row.id),
      officeId: bufferToUuid(row.officeId),
      employeeNumber: row.employeeNumber,
      fullName: row.fullName,
      hireDate: row.hireDate,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toAssignmentModel(
    row: typeof employeeAssignments.$inferSelect,
  ): EmployeeAssignmentModel {
    return {
      id: bufferToUuid(row.id),
      employeeId: bufferToUuid(row.employeeId),

      organizationalUnitId: bufferToUuid(row.organizationalUnitId),

      positionId: bufferToUuid(row.positionId),

      appointmentType: row.appointmentType,

      schedule: row.schedule,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toAssignmentDetailsModel(
    row: EmployeeAssignmentDetailsRow,
  ): EmployeeAssignmentDetailsModel {
    return {
      ...this.toAssignmentModel(row.assignment),
      organizationalUnit: {
        id: bufferToUuid(row.organizationalUnit.id),
        code: row.organizationalUnit.code,
        name: row.organizationalUnit.name,
      },
      position: {
        id: bufferToUuid(row.position.id),
        code: row.position.code,
        name: row.position.name,
      },
    };
  }

  private calendarToday(): Date {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
  }

  async findAll(
    filters: EmployeeFilters,
  ): Promise<PaginatedResult<EmployeeModel>> {
    const {
      page,
      limit,
      search,
      sort,
      status,
      organizationalUnitId,
      positionId,
      officeId,
    } = filters;

    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search) {
      const escapedSearch = search
        .replaceAll('!', '!!')
        .replaceAll('%', '!%')
        .replaceAll('_', '!_');
      const searchPattern = `%${escapedSearch}%`;

      const searchCondition = or(
        sql`${employees.employeeNumber} LIKE ${searchPattern} ESCAPE '!'`,
        sql`${employees.fullName} LIKE ${searchPattern} ESCAPE '!'`,
      );

      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (status) {
      conditions.push(eq(employees.status, status));
    }

    if (officeId) {
      conditions.push(eq(employees.officeId, uuidToBuffer(officeId)));
    }

    if (organizationalUnitId || positionId) {
      const today = this.calendarToday();

      const assignmentConditions: SQL[] = [
        eq(employeeAssignments.employeeId, employees.id),

        lte(employeeAssignments.effectiveFrom, today),
      ];

      const assignmentStillActive = or(
        isNull(employeeAssignments.effectiveTo),

        gte(employeeAssignments.effectiveTo, today),
      );

      if (assignmentStillActive) {
        assignmentConditions.push(assignmentStillActive);
      }

      if (organizationalUnitId) {
        assignmentConditions.push(
          eq(
            employeeAssignments.organizationalUnitId,
            uuidToBuffer(organizationalUnitId),
          ),
        );
      }

      if (positionId) {
        assignmentConditions.push(
          eq(employeeAssignments.positionId, uuidToBuffer(positionId)),
        );
      }

      conditions.push(
        exists(
          this.db
            .select({
              id: employeeAssignments.id,
            })
            .from(employeeAssignments)
            .where(and(...assignmentConditions)),
        ),
      );
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy = this.getOrderBy(sort as EmployeeSort | undefined);
    const employeeColumns = {
      id: employees.id,
      employeeNumber: employees.employeeNumber,
      fullName: employees.fullName,
      hireDate: employees.hireDate,
      status: employees.status,
      createdAt: employees.createdAt,
      updatedAt: employees.updatedAt,
      officeId: employees.officeId,
    };

    const [rows, totalResult] = await Promise.all([
      this.db
        .select(employeeColumns)
        .from(employees)
        .where(whereCondition)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset),

      this.db
        .select({
          total: count(),
        })
        .from(employees)
        .where(whereCondition),
    ]);

    return {
      items: rows.map((row) => this.toEmployeeModel(row)),

      total: totalResult[0]?.total ?? 0,
    };
  }

  async findById(id: string, officeId?: string): Promise<EmployeeModel | null> {
    const employeeColumns = {
      id: employees.id,
      employeeNumber: employees.employeeNumber,
      fullName: employees.fullName,
      hireDate: employees.hireDate,
      status: employees.status,
      createdAt: employees.createdAt,
      updatedAt: employees.updatedAt,
      officeId: employees.officeId,
    };
    const [row] = await this.db
      .select(employeeColumns)
      .from(employees)
      .where(
        and(
          eq(employees.id, uuidToBuffer(id)),
          officeId ? eq(employees.officeId, uuidToBuffer(officeId)) : undefined,
        ),
      )
      .limit(1);

    return row ? this.toEmployeeModel(row) : null;
  }

  async findByEmployeeNumber(
    employeeNumber: string,
  ): Promise<EmployeeModel | null> {
    const [row] = await this.db
      .select()
      .from(employees)
      .where(eq(employees.employeeNumber, employeeNumber))
      .limit(1);

    return row ? this.toEmployeeModel(row) : null;
  }

  async create(data: CreateEmployeeData): Promise<EmployeeModel> {
    const values = {
      id: uuidToBuffer(data.id),
      officeId: uuidToBuffer(data.officeId),
      employeeNumber: data.employeeNumber,
      fullName: data.fullName,
      hireDate: data.hireDate,
      status: data.status,
    } satisfies typeof employees.$inferInsert;

    await this.db.insert(employees).values(values);

    const employee = await this.findById(data.id);

    if (!employee)
      throw new Error('No fue posible recuperar el empleado creado');

    return employee;
  }

  async update(
    id: string,
    data: UpdateEmployeeData,
    officeId?: string,
  ): Promise<EmployeeModel | null> {
    const values: Partial<typeof employees.$inferInsert> = {
      updatedAt: data.updatedAt,
    };

    if (data.employeeNumber !== undefined)
      values.employeeNumber = data.employeeNumber;

    if (data.fullName !== undefined) values.fullName = data.fullName;

    if (data.hireDate !== undefined) values.hireDate = data.hireDate;

    await this.db
      .update(employees)
      .set(values)
      .where(
        and(
          eq(employees.id, uuidToBuffer(id)),
          officeId ? eq(employees.officeId, uuidToBuffer(officeId)) : undefined,
        ),
      );

    return this.findById(id, officeId);
  }

  async updateStatus(
    id: string,
    status: EmployeeStatus,
    updatedAt: Date,
    officeId?: string,
  ): Promise<EmployeeModel | null> {
    return this.db.transaction(async (transaction) => {
      const employeeId = uuidToBuffer(id);
      const employeeScope = officeId
        ? eq(employees.officeId, uuidToBuffer(officeId))
        : undefined;

      await transaction.execute(
        sql`SELECT ${employees.id} FROM ${employees} WHERE ${employees.id} = ${employeeId} FOR UPDATE`,
      );
      const [current] = await transaction
        .select()
        .from(employees)
        .where(and(eq(employees.id, employeeId), employeeScope))
        .limit(1);

      if (!current) return null;
      if (current.status === status) return this.toEmployeeModel(current);

      if (status === 'INACTIVE') {
        const today = this.calendarToday();
        const [blockingAssignment] = await transaction
          .select({ id: employeeAssignments.id })
          .from(employeeAssignments)
          .where(
            and(
              eq(employeeAssignments.employeeId, employeeId),
              or(
                isNull(employeeAssignments.effectiveTo),
                gte(employeeAssignments.effectiveTo, today),
              ),
            ),
          )
          .limit(1)
          .for('update');

        if (blockingAssignment) {
          throw new EmployeeHasCurrentOrFutureAssignmentsError();
        }
      }

      await transaction
        .update(employees)
        .set({ status, updatedAt })
        .where(eq(employees.id, employeeId));

      const [updated] = await transaction
        .select()
        .from(employees)
        .where(eq(employees.id, employeeId))
        .limit(1);

      return updated ? this.toEmployeeModel(updated) : null;
    });
  }

  async findAssignmentsByEmployeeId(
    employeeId: string,
    officeId?: string,
  ): Promise<EmployeeAssignmentDetailsModel[]> {
    const rows = await this.db
      .select({
        assignment: employeeAssignments,
        organizationalUnit: {
          id: organizationalUnits.id,
          code: organizationalUnits.code,
          name: organizationalUnits.name,
        },
        position: {
          id: positions.id,
          code: positions.code,
          name: positions.name,
        },
      })
      .from(employeeAssignments)
      .innerJoin(
        organizationalUnits,
        and(
          eq(employeeAssignments.organizationalUnitId, organizationalUnits.id),
          eq(employeeAssignments.officeId, organizationalUnits.officeId),
        ),
      )
      .innerJoin(
        positions,
        and(
          eq(employeeAssignments.positionId, positions.id),
          eq(employeeAssignments.officeId, positions.officeId),
        ),
      )
      .where(
        and(
          eq(employeeAssignments.employeeId, uuidToBuffer(employeeId)),
          officeId
            ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
            : undefined,
        ),
      )
      .orderBy(
        desc(employeeAssignments.effectiveFrom),
        desc(employeeAssignments.id),
      );

    return rows.map((row) => this.toAssignmentDetailsModel(row));
  }

  async findAssignmentById(
    employeeId: string,
    assignmentId: string,
    officeId?: string,
  ): Promise<EmployeeAssignmentDetailsModel | null> {
    const [row] = await this.db
      .select({
        assignment: employeeAssignments,
        organizationalUnit: {
          id: organizationalUnits.id,
          code: organizationalUnits.code,
          name: organizationalUnits.name,
        },
        position: {
          id: positions.id,
          code: positions.code,
          name: positions.name,
        },
      })
      .from(employeeAssignments)
      .innerJoin(
        organizationalUnits,
        and(
          eq(employeeAssignments.organizationalUnitId, organizationalUnits.id),
          eq(employeeAssignments.officeId, organizationalUnits.officeId),
        ),
      )
      .innerJoin(
        positions,
        and(
          eq(employeeAssignments.positionId, positions.id),
          eq(employeeAssignments.officeId, positions.officeId),
        ),
      )
      .where(
        and(
          eq(employeeAssignments.id, uuidToBuffer(assignmentId)),
          eq(employeeAssignments.employeeId, uuidToBuffer(employeeId)),
          officeId
            ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
            : undefined,
        ),
      )
      .limit(1);

    return row ? this.toAssignmentDetailsModel(row) : null;
  }

  async createAssignment(
    data: CreateEmployeeAssignmentData,
  ): Promise<EmployeeAssignmentMutationResult> {
    return this.db.transaction(async (transaction) => {
      const employeeId = uuidToBuffer(data.employeeId);
      const organizationalUnitId = uuidToBuffer(data.organizationalUnitId);
      const positionId = uuidToBuffer(data.positionId);

      await transaction.execute(
        sql`SELECT ${employees.id} FROM ${employees} WHERE ${employees.id} = ${employeeId} FOR UPDATE`,
      );
      const [employee] = await transaction
        .select({ id: employees.id, status: employees.status })
        .from(employees)
        .where(eq(employees.id, employeeId))
        .limit(1);
      if (!employee) return { status: 'employee-not-found' };
      if (employee.status !== 'ACTIVE') return { status: 'employee-inactive' };

      await transaction.execute(
        sql`SELECT ${organizationalUnits.id} FROM ${organizationalUnits} WHERE ${organizationalUnits.id} = ${organizationalUnitId} FOR UPDATE`,
      );
      const [organizationalUnit] = await transaction
        .select({
          isActive: organizationalUnits.isActive,
          officeId: organizationalUnits.officeId,
        })
        .from(organizationalUnits)
        .where(eq(organizationalUnits.id, organizationalUnitId))
        .limit(1);
      if (!organizationalUnit?.isActive) {
        return { status: 'organizational-unit-not-available' };
      }
      if (
        data.officeId &&
        !organizationalUnit.officeId.equals(uuidToBuffer(data.officeId))
      ) {
        return { status: 'organizational-unit-not-available' };
      }

      await transaction.execute(
        sql`SELECT ${positions.id} FROM ${positions} WHERE ${positions.id} = ${positionId} FOR UPDATE`,
      );
      const [position] = await transaction
        .select({ isActive: positions.isActive, officeId: positions.officeId })
        .from(positions)
        .where(eq(positions.id, positionId))
        .limit(1);
      if (!position?.isActive) return { status: 'position-not-available' };
      if (!position.officeId.equals(organizationalUnit.officeId)) {
        return { status: 'position-not-available' };
      }

      const assignments = await this.lockEmployeeAssignments(
        transaction,
        employeeId,
      );
      if (data.effectiveTo && data.effectiveTo < data.effectiveFrom) {
        return { status: 'invalid-period' };
      }
      if (this.hasOverlap(assignments, data.effectiveFrom, data.effectiveTo)) {
        return { status: 'overlap' };
      }

      await transaction.insert(employeeAssignments).values({
        id: uuidToBuffer(data.id),
        employeeId,
        officeId: organizationalUnit.officeId,
        organizationalUnitId,
        positionId,
        appointmentType: data.appointmentType,
        schedule: data.schedule,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        notes: data.notes,
      });

      const [created] = await transaction
        .select({
          assignment: employeeAssignments,
          organizationalUnit: {
            id: organizationalUnits.id,
            code: organizationalUnits.code,
            name: organizationalUnits.name,
          },
          position: {
            id: positions.id,
            code: positions.code,
            name: positions.name,
          },
        })
        .from(employeeAssignments)
        .innerJoin(
          organizationalUnits,
          and(
            eq(
              employeeAssignments.organizationalUnitId,
              organizationalUnits.id,
            ),
            eq(employeeAssignments.officeId, organizationalUnits.officeId),
          ),
        )
        .innerJoin(
          positions,
          and(
            eq(employeeAssignments.positionId, positions.id),
            eq(employeeAssignments.officeId, positions.officeId),
          ),
        )
        .where(eq(employeeAssignments.id, uuidToBuffer(data.id)))
        .limit(1);
      if (!created)
        throw new Error('No fue posible recuperar la asignación creada');

      return {
        status: 'success',
        assignment: this.toAssignmentDetailsModel(created),
      };
    });
  }

  async updateAssignment(
    employeeId: string,
    assignmentId: string,
    data: UpdateEmployeeAssignmentData,
    officeId?: string,
  ): Promise<EmployeeAssignmentMutationResult> {
    return this.db.transaction(async (transaction) => {
      const employeeIdBuffer = uuidToBuffer(employeeId);
      const assignmentIdBuffer = uuidToBuffer(assignmentId);

      await transaction.execute(
        sql`SELECT ${employees.id} FROM ${employees} WHERE ${employees.id} = ${employeeIdBuffer} FOR UPDATE`,
      );
      const [employee] = await transaction
        .select({ id: employees.id, status: employees.status })
        .from(employees)
        .where(eq(employees.id, employeeIdBuffer))
        .limit(1);
      if (!employee) return { status: 'employee-not-found' };

      const [currentSnapshot] = await transaction
        .select()
        .from(employeeAssignments)
        .where(
          and(
            eq(employeeAssignments.id, assignmentIdBuffer),
            eq(employeeAssignments.employeeId, employeeIdBuffer),
            officeId
              ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
              : undefined,
          ),
        )
        .limit(1);
      if (!currentSnapshot) return { status: 'assignment-not-found' };

      const organizationalUnitId = data.organizationalUnitId
        ? uuidToBuffer(data.organizationalUnitId)
        : currentSnapshot.organizationalUnitId;
      const positionId = data.positionId
        ? uuidToBuffer(data.positionId)
        : currentSnapshot.positionId;

      const effectiveFrom = data.effectiveFrom ?? currentSnapshot.effectiveFrom;
      const effectiveTo =
        data.effectiveTo !== undefined
          ? data.effectiveTo
          : currentSnapshot.effectiveTo;
      const isCurrentOrFuture =
        !effectiveTo || effectiveTo >= this.calendarToday();

      if (employee.status !== 'ACTIVE' && isCurrentOrFuture) {
        return { status: 'employee-inactive' };
      }

      const organizationalUnitChanged =
        !currentSnapshot.organizationalUnitId.equals(organizationalUnitId);
      if (isCurrentOrFuture || organizationalUnitChanged) {
        await transaction.execute(
          sql`SELECT ${organizationalUnits.id} FROM ${organizationalUnits} WHERE ${organizationalUnits.id} = ${organizationalUnitId} FOR UPDATE`,
        );
        const [organizationalUnit] = await transaction
          .select({
            isActive: organizationalUnits.isActive,
            officeId: organizationalUnits.officeId,
          })
          .from(organizationalUnits)
          .where(eq(organizationalUnits.id, organizationalUnitId))
          .limit(1);
        if (!organizationalUnit?.isActive) {
          return { status: 'organizational-unit-not-available' };
        }
        if (!organizationalUnit.officeId.equals(currentSnapshot.officeId)) {
          return { status: 'organizational-unit-not-available' };
        }
      }

      const positionChanged = !currentSnapshot.positionId.equals(positionId);
      if (isCurrentOrFuture || positionChanged) {
        await transaction.execute(
          sql`SELECT ${positions.id} FROM ${positions} WHERE ${positions.id} = ${positionId} FOR UPDATE`,
        );
        const [position] = await transaction
          .select({
            isActive: positions.isActive,
            officeId: positions.officeId,
          })
          .from(positions)
          .where(eq(positions.id, positionId))
          .limit(1);
        if (!position?.isActive) return { status: 'position-not-available' };
        if (!position.officeId.equals(currentSnapshot.officeId)) {
          return { status: 'position-not-available' };
        }
      }

      const assignments = await this.lockEmployeeAssignments(
        transaction,
        employeeIdBuffer,
      );
      const current = assignments.find((row) =>
        row.id.equals(assignmentIdBuffer),
      );
      if (!current) return { status: 'assignment-not-found' };

      if (effectiveTo && effectiveTo < effectiveFrom) {
        return { status: 'invalid-period' };
      }
      if (
        this.hasOverlap(
          assignments,
          effectiveFrom,
          effectiveTo,
          assignmentIdBuffer,
        )
      ) {
        return { status: 'overlap' };
      }

      const values: Partial<typeof employeeAssignments.$inferInsert> = {
        updatedAt: data.updatedAt,
      };
      if (data.organizationalUnitId !== undefined) {
        values.organizationalUnitId = organizationalUnitId;
      }
      if (data.positionId !== undefined) values.positionId = positionId;
      if (data.appointmentType !== undefined)
        values.appointmentType = data.appointmentType;
      if (data.schedule !== undefined) values.schedule = data.schedule;
      if (data.effectiveFrom !== undefined)
        values.effectiveFrom = effectiveFrom;
      if (data.effectiveTo !== undefined) values.effectiveTo = effectiveTo;
      if (data.notes !== undefined) values.notes = data.notes;

      await transaction
        .update(employeeAssignments)
        .set(values)
        .where(
          and(
            eq(employeeAssignments.id, assignmentIdBuffer),
            eq(employeeAssignments.employeeId, employeeIdBuffer),
          ),
        );

      const [updated] = await transaction
        .select({
          assignment: employeeAssignments,
          organizationalUnit: {
            id: organizationalUnits.id,
            code: organizationalUnits.code,
            name: organizationalUnits.name,
          },
          position: {
            id: positions.id,
            code: positions.code,
            name: positions.name,
          },
        })
        .from(employeeAssignments)
        .innerJoin(
          organizationalUnits,
          and(
            eq(
              employeeAssignments.organizationalUnitId,
              organizationalUnits.id,
            ),
            eq(employeeAssignments.officeId, organizationalUnits.officeId),
          ),
        )
        .innerJoin(
          positions,
          and(
            eq(employeeAssignments.positionId, positions.id),
            eq(employeeAssignments.officeId, positions.officeId),
          ),
        )
        .where(eq(employeeAssignments.id, assignmentIdBuffer))
        .limit(1);
      if (!updated) return { status: 'assignment-not-found' };

      return {
        status: 'success',
        assignment: this.toAssignmentDetailsModel(updated),
      };
    });
  }

  private async lockEmployeeAssignments(
    transaction: Parameters<Parameters<DrizzleDatabase['transaction']>[0]>[0],
    employeeId: Buffer,
  ): Promise<(typeof employeeAssignments.$inferSelect)[]> {
    await transaction.execute(
      sql`SELECT ${employeeAssignments.id} FROM ${employeeAssignments} WHERE ${employeeAssignments.employeeId} = ${employeeId} ORDER BY ${employeeAssignments.id} FOR UPDATE`,
    );

    return transaction
      .select()
      .from(employeeAssignments)
      .where(eq(employeeAssignments.employeeId, employeeId));
  }

  private hasOverlap(
    assignments: (typeof employeeAssignments.$inferSelect)[],
    effectiveFrom: Date,
    effectiveTo: Date | null,
    excludeAssignmentId?: Buffer,
  ): boolean {
    return assignments.some(
      (assignment) =>
        (!excludeAssignmentId || !assignment.id.equals(excludeAssignmentId)) &&
        (!assignment.effectiveTo || assignment.effectiveTo >= effectiveFrom) &&
        (!effectiveTo || assignment.effectiveFrom <= effectiveTo),
    );
  }

  private getOrderBy(sort?: EmployeeSort): SQL[] {
    switch (sort) {
      case 'employeeNumber':
        return [asc(employees.employeeNumber), asc(employees.id)];

      case '-employeeNumber':
        return [desc(employees.employeeNumber), asc(employees.id)];

      case 'fullName':
        return [asc(employees.fullName), asc(employees.id)];

      case '-fullName':
        return [desc(employees.fullName), asc(employees.id)];

      case 'hireDate':
        return [asc(employees.hireDate), asc(employees.id)];

      case '-hireDate':
        return [desc(employees.hireDate), asc(employees.id)];

      case 'createdAt':
        return [asc(employees.createdAt), asc(employees.id)];

      case '-createdAt':
        return [desc(employees.createdAt), asc(employees.id)];

      default:
        return [asc(employees.fullName), asc(employees.id)];
    }
  }
}
