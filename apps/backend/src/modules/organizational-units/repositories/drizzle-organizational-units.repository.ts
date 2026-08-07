import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import {
  employeeAssignments,
  organizationalUnits,
} from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import {
  InvalidOrganizationalUnitParentError,
  OrganizationalUnitHasActiveChildrenError,
  OrganizationalUnitHasCurrentAssignmentsError,
  OrganizationalUnitHierarchyCycleError,
} from '../organizational-units.errors';
import { OrganizationalUnitsModel } from '../models/organizational-units.model';
import {
  CreateOrganizationalUnitData,
  UpdateOrganizationalUnitData,
} from '../types/organizational-units.types';
import { OrganizationalUnitsRepository } from './organizational-units.repository';

type OrganizationalUnitRow = typeof organizationalUnits.$inferSelect;

@Injectable()
export class DrizzleOrganizationalUnitsRepository implements OrganizationalUnitsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  private toModel(row: OrganizationalUnitRow): OrganizationalUnitsModel {
    return {
      id: bufferToUuid(row.id),
      parentId: row.parentId ? bufferToUuid(row.parentId) : null,
      code: row.code,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private createsCycle(
    rows: OrganizationalUnitRow[],
    id: string,
    parentId: string,
  ): boolean {
    const unitsById = new Map(
      rows.map((row) => [bufferToUuid(row.id), this.toModel(row)]),
    );
    const visited = new Set<string>();
    let currentId: string | null = parentId;

    while (currentId) {
      if (currentId === id || visited.has(currentId)) return true;

      visited.add(currentId);
      currentId = unitsById.get(currentId)?.parentId ?? null;
    }

    return false;
  }

  private orderAsHierarchy(
    rows: OrganizationalUnitRow[],
  ): OrganizationalUnitsModel[] {
    const orderedUnits = rows.map((row) => this.toModel(row));
    const childrenByParentId = new Map<
      string | null,
      OrganizationalUnitsModel[]
    >();

    for (const unit of orderedUnits) {
      const siblings = childrenByParentId.get(unit.parentId) ?? [];
      siblings.push(unit);
      childrenByParentId.set(unit.parentId, siblings);
    }

    const result: OrganizationalUnitsModel[] = [];
    const visited = new Set<string>();
    const appendBranch = (parentId: string | null): void => {
      for (const unit of childrenByParentId.get(parentId) ?? []) {
        if (visited.has(unit.id)) continue;

        visited.add(unit.id);
        result.push(unit);
        appendBranch(unit.id);
      }
    };

    appendBranch(null);
    for (const unit of orderedUnits) {
      if (!visited.has(unit.id)) {
        visited.add(unit.id);
        result.push(unit);
        appendBranch(unit.id);
      }
    }

    return result;
  }

  async findAll(): Promise<OrganizationalUnitsModel[]> {
    const rows = await this.db
      .select()
      .from(organizationalUnits)
      .orderBy(
        asc(organizationalUnits.sortOrder),
        asc(organizationalUnits.name),
        asc(organizationalUnits.id),
      );

    return this.orderAsHierarchy(rows);
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
    return this.db.transaction(async (transaction) => {
      await transaction.execute(
        sql`SELECT ${organizationalUnits.id} FROM ${organizationalUnits} ORDER BY ${organizationalUnits.id} FOR UPDATE`,
      );

      if (data.parentId) {
        const [parent] = await transaction
          .select()
          .from(organizationalUnits)
          .where(eq(organizationalUnits.id, uuidToBuffer(data.parentId)))
          .limit(1);

        if (!parent?.isActive) throw new InvalidOrganizationalUnitParentError();
      }

      await transaction.insert(organizationalUnits).values({
        id: uuidToBuffer(data.id),
        parentId: data.parentId ? uuidToBuffer(data.parentId) : null,
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        isActive: true,
        sortOrder: data.sortOrder,
      });

      const [created] = await transaction
        .select()
        .from(organizationalUnits)
        .where(eq(organizationalUnits.id, uuidToBuffer(data.id)))
        .limit(1);

      if (!created) {
        throw new Error(
          'No fue posible recuperar la unidad organizativa creada',
        );
      }

      return this.toModel(created);
    });
  }

  async update(
    id: string,
    data: UpdateOrganizationalUnitData,
  ): Promise<OrganizationalUnitsModel | null> {
    return this.db.transaction(async (transaction) => {
      await transaction.execute(
        sql`SELECT ${organizationalUnits.id} FROM ${organizationalUnits} ORDER BY ${organizationalUnits.id} FOR UPDATE`,
      );

      const rows = await transaction.select().from(organizationalUnits);
      const current = rows.find((row) => bufferToUuid(row.id) === id);

      if (!current) return null;

      if (data.parentId !== undefined && data.parentId !== null) {
        const parent = rows.find(
          (row) => bufferToUuid(row.id) === data.parentId,
        );

        if (!parent?.isActive) throw new InvalidOrganizationalUnitParentError();
        if (this.createsCycle(rows, id, data.parentId)) {
          throw new OrganizationalUnitHierarchyCycleError();
        }
      }

      const values: Partial<typeof organizationalUnits.$inferInsert> = {
        updatedAt: data.updatedAt,
      };

      if (data.parentId !== undefined) {
        values.parentId = data.parentId ? uuidToBuffer(data.parentId) : null;
      }
      if (data.name !== undefined) values.name = data.name;
      if (data.description !== undefined) values.description = data.description;
      if (data.sortOrder !== undefined) values.sortOrder = data.sortOrder;

      await transaction
        .update(organizationalUnits)
        .set(values)
        .where(eq(organizationalUnits.id, uuidToBuffer(id)));

      const [updated] = await transaction
        .select()
        .from(organizationalUnits)
        .where(eq(organizationalUnits.id, uuidToBuffer(id)))
        .limit(1);

      return updated ? this.toModel(updated) : null;
    });
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
  ): Promise<OrganizationalUnitsModel | null> {
    return this.db.transaction(async (transaction) => {
      await transaction.execute(
        sql`SELECT ${organizationalUnits.id} FROM ${organizationalUnits} ORDER BY ${organizationalUnits.id} FOR UPDATE`,
      );

      const rows = await transaction.select().from(organizationalUnits);
      const current = rows.find((row) => bufferToUuid(row.id) === id);

      if (!current) return null;
      if (current.isActive === isActive) return this.toModel(current);

      if (isActive && current.parentId) {
        const parent = rows.find((row) => row.id.equals(current.parentId!));

        if (!parent?.isActive) throw new InvalidOrganizationalUnitParentError();
      }

      if (!isActive) {
        const hasActiveChild = rows.some(
          (row) => row.parentId?.equals(current.id) && row.isActive,
        );

        if (hasActiveChild) {
          throw new OrganizationalUnitHasActiveChildrenError();
        }

        const today = new Date();
        const [currentAssignment] = await transaction
          .select({ id: employeeAssignments.id })
          .from(employeeAssignments)
          .where(
            and(
              eq(employeeAssignments.organizationalUnitId, current.id),
              lte(employeeAssignments.effectiveFrom, today),
              or(
                isNull(employeeAssignments.effectiveTo),
                gte(employeeAssignments.effectiveTo, today),
              ),
            ),
          )
          .limit(1)
          .for('update');

        if (currentAssignment) {
          throw new OrganizationalUnitHasCurrentAssignmentsError();
        }
      }

      await transaction
        .update(organizationalUnits)
        .set({ isActive, updatedAt })
        .where(eq(organizationalUnits.id, current.id));

      const [updated] = await transaction
        .select()
        .from(organizationalUnits)
        .where(eq(organizationalUnits.id, current.id))
        .limit(1);

      return updated ? this.toModel(updated) : null;
    });
  }
}
