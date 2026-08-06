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
  like,
  lte,
  ne,
  or,
  type SQL,
} from 'drizzle-orm';

import type { EmployeeStatus } from '@sigip/shared';
import { EmployeeSort } from '../dto/list-employees-query.dto';
import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import { employeeAssignments, employees } from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';
import type { EmployeeAssignmentModel } from '../models/employee-assignment.model';
import type { EmployeeModel } from '../models/employee.model';
import type {
  CreateEmployeeAssignmentData,
  CreateEmployeeData,
  EmployeeFilters,
  UpdateEmployeeAssignmentData,
  UpdateEmployeeData,
} from '../types/employees.types';
import { EmployeesRepository } from './employees.repository';

@Injectable()
export class DrizzleEmployeesRepository implements EmployeesRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  private toEmployeeModel(row: typeof employees.$inferSelect): EmployeeModel {
    return {
      id: bufferToUuid(row.id),
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
    } = filters;

    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search) {
      const searchPattern = `%${search}%`;

      const searchCondition = or(
        like(employees.employeeNumber, searchPattern),
        like(employees.fullName, searchPattern),
      );

      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (status) {
      conditions.push(eq(employees.status, status));
    }

    if (organizationalUnitId || positionId) {
      const today = new Date();

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

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(employees)
        .where(whereCondition)
        .orderBy(orderBy)
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

  async findById(id: string): Promise<EmployeeModel | null> {
    const [row] = await this.db
      .select()
      .from(employees)
      .where(eq(employees.id, uuidToBuffer(id)))
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
      .where(eq(employees.id, uuidToBuffer(id)));

    return this.findById(id);
  }

  async updateStatus(
    id: string,
    status: EmployeeStatus,
    updatedAt: Date,
  ): Promise<EmployeeModel | null> {
    await this.db
      .update(employees)
      .set({ status, updatedAt })
      .where(eq(employees.id, uuidToBuffer(id)));

    return this.findById(id);
  }

  async findAssignmentsByEmployeeId(
    employeeId: string,
  ): Promise<EmployeeAssignmentModel[]> {
    const rows = await this.db
      .select()
      .from(employeeAssignments)
      .where(eq(employeeAssignments.employeeId, uuidToBuffer(employeeId)))
      .orderBy(desc(employeeAssignments.effectiveFrom));

    return rows.map((row) => this.toAssignmentModel(row));
  }

  async findAssignmentById(
    employeeId: string,
    assignmentId: string,
  ): Promise<EmployeeAssignmentModel | null> {
    const [row] = await this.db
      .select()
      .from(employeeAssignments)
      .where(
        and(
          eq(employeeAssignments.id, uuidToBuffer(assignmentId)),
          eq(employeeAssignments.employeeId, uuidToBuffer(employeeId)),
        ),
      )
      .limit(1);

    return row ? this.toAssignmentModel(row) : null;
  }

  async createAssignment(
    data: CreateEmployeeAssignmentData,
  ): Promise<EmployeeAssignmentModel> {
    const values = {
      id: uuidToBuffer(data.id),
      employeeId: uuidToBuffer(data.employeeId),
      organizationalUnitId: uuidToBuffer(data.organizationalUnitId),
      positionId: uuidToBuffer(data.positionId),
      appointmentType: data.appointmentType,
      schedule: data.schedule,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,
      notes: data.notes,
    } satisfies typeof employeeAssignments.$inferInsert;

    await this.db.insert(employeeAssignments).values(values);

    const assignment = await this.findAssignmentById(data.employeeId, data.id);

    if (!assignment)
      throw new Error('No fue posible recuperar la asignación creada');

    return assignment;
  }

  async updateAssignment(
    employeeId: string,
    assignmentId: string,
    data: UpdateEmployeeAssignmentData,
  ): Promise<EmployeeAssignmentModel | null> {
    const values: Partial<typeof employeeAssignments.$inferInsert> = {
      updatedAt: data.updatedAt,
    };

    if (data.organizationalUnitId !== undefined) {
      values.organizationalUnitId = uuidToBuffer(data.organizationalUnitId);
    }
    if (data.positionId !== undefined)
      values.positionId = uuidToBuffer(data.positionId);
    if (data.appointmentType !== undefined)
      values.appointmentType = data.appointmentType;
    if (data.schedule !== undefined) values.schedule = data.schedule;
    if (data.effectiveFrom !== undefined)
      values.effectiveFrom = data.effectiveFrom;
    if (data.effectiveTo !== undefined) values.effectiveTo = data.effectiveTo;
    if (data.notes !== undefined) values.notes = data.notes;

    await this.db
      .update(employeeAssignments)
      .set(values)
      .where(
        and(
          eq(employeeAssignments.id, uuidToBuffer(assignmentId)),
          eq(employeeAssignments.employeeId, uuidToBuffer(employeeId)),
        ),
      );

    return this.findAssignmentById(employeeId, assignmentId);
  }

  async hasOverlappingAssignment(
    employeeId: string,
    effectiveFrom: Date,
    effectiveTo: Date | null,
    excludeAssignmentId?: string,
  ): Promise<boolean> {
    const conditions: SQL[] = [
      eq(employeeAssignments.employeeId, uuidToBuffer(employeeId)),
      or(
        isNull(employeeAssignments.effectiveTo),
        gte(employeeAssignments.effectiveTo, effectiveFrom),
      )!,
    ];

    if (effectiveTo) {
      conditions.push(lte(employeeAssignments.effectiveFrom, effectiveTo));
    }

    if (excludeAssignmentId) {
      conditions.push(
        ne(employeeAssignments.id, uuidToBuffer(excludeAssignmentId)),
      );
    }

    const [row] = await this.db
      .select({
        id: employeeAssignments.id,
      })
      .from(employeeAssignments)
      .where(and(...conditions))
      .limit(1);

    return Boolean(row);
  }

  private getOrderBy(sort?: EmployeeSort): SQL {
    switch (sort) {
      case 'employeeNumber':
        return asc(employees.employeeNumber);

      case '-employeeNumber':
        return desc(employees.employeeNumber);

      case 'fullName':
        return asc(employees.fullName);

      case '-fullName':
        return desc(employees.fullName);

      case 'hireDate':
        return asc(employees.hireDate);

      case '-hireDate':
        return desc(employees.hireDate);

      case 'createdAt':
        return asc(employees.createdAt);

      case '-createdAt':
        return desc(employees.createdAt);

      default:
        return asc(employees.fullName);
    }
  }
}
