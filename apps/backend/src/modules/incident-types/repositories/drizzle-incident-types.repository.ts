import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, eq, like, or } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';
import { incidents, incidentTypes } from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import type { IncidentTypeModel } from '../models/incident-type.model';
import type {
  CreateIncidentTypeData,
  IncidentTypeFilters,
  UpdateIncidentTypeData,
} from '../types/incident-types.types';
import type { AuditActorContext } from '../../audit/types/audit.types';
import { IncidentTypesRepository } from './incident-types.repository';
import { AuditService } from '../../audit/audit.service';
import { IncidentTypeInUseError } from '../incident-types.errors';

@Injectable()
export class DrizzleIncidentTypesRepository implements IncidentTypesRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
    private readonly auditService: AuditService,
  ) {}

  private map(row: typeof incidentTypes.$inferSelect): IncidentTypeModel {
    return {
      id: bufferToUuid(row.id),
      code: row.code,
      name: row.name,
      description: row.description,
      temporalMode: row.temporalMode,
      appointmentScope: row.appointmentScope,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(
    filters: IncidentTypeFilters,
  ): Promise<PaginatedResult<IncidentTypeModel>> {
    const conditions: SQL[] = [];

    if (filters.search) {
      const search = `%${filters.search}%`;

      conditions.push(
        or(like(incidentTypes.code, search), like(incidentTypes.name, search))!,
      );
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(incidentTypes.isActive, filters.isActive));
    }

    if (filters.temporalMode) {
      conditions.push(eq(incidentTypes.temporalMode, filters.temporalMode));
    }

    if (filters.appointmentScope) {
      conditions.push(
        eq(incidentTypes.appointmentScope, filters.appointmentScope),
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const offset = (filters.page - 1) * filters.limit;

    const [items, totalResult] = await Promise.all([
      this.db
        .select()
        .from(incidentTypes)
        .where(where)
        .orderBy(
          asc(incidentTypes.sortOrder),
          asc(incidentTypes.name),
          asc(incidentTypes.id),
        )
        .limit(filters.limit)
        .offset(offset),

      this.db
        .select({
          value: count(),
        })
        .from(incidentTypes)
        .where(where),
    ]);

    return {
      items: items.map((row) => this.map(row)),
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async findById(id: string): Promise<IncidentTypeModel | null> {
    const [row] = await this.db
      .select()
      .from(incidentTypes)
      .where(eq(incidentTypes.id, uuidToBuffer(id)))
      .limit(1);

    return row ? this.map(row) : null;
  }

  async findByCode(code: string): Promise<IncidentTypeModel | null> {
    const [row] = await this.db
      .select()
      .from(incidentTypes)
      .where(eq(incidentTypes.code, code))
      .limit(1);

    return row ? this.map(row) : null;
  }

  async create(
    data: CreateIncidentTypeData,
    actor: AuditActorContext,
  ): Promise<IncidentTypeModel> {
    await this.db.transaction(async (tx) => {
      await tx.insert(incidentTypes).values({
        id: uuidToBuffer(data.id),
        code: data.code,
        name: data.name,
        description: data.description,
        temporalMode: data.temporalMode,
        appointmentScope: data.appointmentScope,
        sortOrder: data.sortOrder,
      });

      await this.auditService.append(
        {
          ...actor,
          action: 'CREATED',
          entityType: 'INCIDENT_TYPE',
          entityId: data.id,
          newValues: { ...data },
        },
        tx,
      );
    });

    const result = await this.findById(data.id);

    if (!result) {
      throw new Error('Incident type persistence error');
    }

    return result;
  }

  async update(
    id: string,
    data: UpdateIncidentTypeData,
    actor: AuditActorContext,
  ): Promise<IncidentTypeModel | null> {
    const updated = await this.db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(incidentTypes)
        .where(eq(incidentTypes.id, uuidToBuffer(id)))
        .for('update');

      if (!current) return false;

      const changesRules =
        (data.temporalMode !== undefined &&
          data.temporalMode !== current.temporalMode) ||
        (data.appointmentScope !== undefined &&
          data.appointmentScope !== current.appointmentScope);

      if (changesRules) {
        const [incident] = await tx
          .select({ id: incidents.id })
          .from(incidents)
          .where(eq(incidents.incidentTypeId, current.id))
          .limit(1)
          .for('update');

        if (incident) throw new IncidentTypeInUseError();
      }

      await tx
        .update(incidentTypes)
        .set(data)
        .where(eq(incidentTypes.id, uuidToBuffer(id)));

      await this.auditService.append(
        {
          ...actor,
          action: 'UPDATED',
          entityType: 'INCIDENT_TYPE',
          entityId: id,
          oldValues: {
            name: current.name,
            description: current.description,
            temporalMode: current.temporalMode,
            appointmentScope: current.appointmentScope,
            sortOrder: current.sortOrder,
          },
          newValues: {
            name: data.name ?? current.name,
            description:
              data.description !== undefined
                ? data.description
                : current.description,
            temporalMode: data.temporalMode ?? current.temporalMode,
            appointmentScope: data.appointmentScope ?? current.appointmentScope,
            sortOrder: data.sortOrder ?? current.sortOrder,
          },
          createdAt: data.updatedAt,
        },
        tx,
      );

      return true;
    });

    if (!updated) return null;

    return this.findById(id);
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
    actor: AuditActorContext,
  ): Promise<IncidentTypeModel | null> {
    const updated = await this.db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(incidentTypes)
        .where(eq(incidentTypes.id, uuidToBuffer(id)))
        .for('update');

      if (!current) return false;
      if (current.isActive === isActive) return true;

      await tx
        .update(incidentTypes)
        .set({ isActive, updatedAt })
        .where(eq(incidentTypes.id, uuidToBuffer(id)));

      await this.auditService.append(
        {
          ...actor,
          action: 'STATUS_CHANGED',
          entityType: 'INCIDENT_TYPE',
          entityId: id,
          oldValues: { isActive: current.isActive },
          newValues: { isActive },
          createdAt: updatedAt,
        },
        tx,
      );

      return true;
    });

    if (!updated) return null;

    return this.findById(id);
  }
}
