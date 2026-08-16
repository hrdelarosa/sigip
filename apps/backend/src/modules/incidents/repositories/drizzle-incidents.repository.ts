import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  gte,
  like,
  lte,
  or,
} from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import {
  documentTypes,
  documents,
  employeeAssignments,
  employees,
  incidentOccurrences,
  incidents,
  incidentTypes,
  organizationalUnits,
  positions,
  users,
} from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';
import type { IncidentDetailsModel } from '../models/incident.model';
import type {
  CancelIncidentData,
  CreateIncidentData,
  IncidentCreationContext,
  IncidentFilters,
  UpdateIncidentData,
} from '../types/incidents.types';
import { IncidentsRepository } from './incidents.repository';
import { AuditService } from '../../audit/audit.service';
import {
  CancelledIncidentModificationError,
  IncidentConcurrentModificationError,
  IncidentCreateTransactionError,
  IncidentAlreadyCancelledError,
} from '../incidents.errors';

@Injectable()
export class DrizzleIncidentsRepository implements IncidentsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
    private readonly auditService: AuditService,
  ) {}

  async findCreationContext(
    employeeId: string,
    assignmentId: string,
    incidentTypeId: string,
  ): Promise<IncidentCreationContext> {
    const [
      employeeRows,
      assignmentRows,
      incidentTypeRows,
      formTypeRows,
      commissionTypeRows,
    ] = await Promise.all([
      this.db
        .select({
          id: employees.id,
          status: employees.status,
        })
        .from(employees)
        .where(eq(employees.id, uuidToBuffer(employeeId)))
        .limit(1),

      this.db
        .select({
          id: employeeAssignments.id,
          employeeId: employeeAssignments.employeeId,
          appointmentType: employeeAssignments.appointmentType,
          effectiveFrom: employeeAssignments.effectiveFrom,
          effectiveTo: employeeAssignments.effectiveTo,
        })
        .from(employeeAssignments)
        .where(eq(employeeAssignments.id, uuidToBuffer(assignmentId)))
        .limit(1),

      this.db
        .select()
        .from(incidentTypes)
        .where(eq(incidentTypes.id, uuidToBuffer(incidentTypeId)))
        .limit(1),

      this.db
        .select({
          id: documentTypes.id,
        })
        .from(documentTypes)
        .where(
          and(
            eq(documentTypes.code, 'FORMATO_INCIDENCIA'),
            eq(documentTypes.isActive, true),
          ),
        )
        .limit(1),
      this.db
        .select({ id: documentTypes.id })
        .from(documentTypes)
        .where(
          and(
            eq(documentTypes.code, 'OFICIO_COMISION'),
            eq(documentTypes.isActive, true),
          ),
        )
        .limit(1),
    ]);

    const employee = employeeRows[0];
    const assignment = assignmentRows[0];
    const incidentType = incidentTypeRows[0];
    const formType = formTypeRows[0];
    const commissionType = commissionTypeRows[0];

    return {
      employee: employee
        ? {
            id: bufferToUuid(employee.id),
            status: employee.status,
          }
        : null,

      assignment: assignment
        ? {
            id: bufferToUuid(assignment.id),
            employeeId: bufferToUuid(assignment.employeeId),
            appointmentType: assignment.appointmentType,
            effectiveFrom: assignment.effectiveFrom,
            effectiveTo: assignment.effectiveTo,
          }
        : null,

      incidentType: incidentType
        ? {
            id: bufferToUuid(incidentType.id),
            code: incidentType.code,
            temporalMode: incidentType.temporalMode,
            appointmentScope: incidentType.appointmentScope,
            isActive: incidentType.isActive,
          }
        : null,

      formDocumentType: formType
        ? {
            id: bufferToUuid(formType.id),
          }
        : null,
      commissionDocumentType: commissionType
        ? { id: bufferToUuid(commissionType.id) }
        : null,
    };
  }

  async create(data: CreateIncidentData): Promise<IncidentDetailsModel> {
    try {
      await this.db.transaction(async (tx) => {
        await tx.insert(incidents).values({
          id: uuidToBuffer(data.incident.id),
          employeeId: uuidToBuffer(data.incident.employeeId),
          employeeAssignmentId: uuidToBuffer(
            data.incident.employeeAssignmentId,
          ),
          incidentTypeId: uuidToBuffer(data.incident.incidentTypeId),
          issuedDate: data.incident.issuedDate,
          receivedAt: data.incident.receivedAt,
          referenceYear: data.incident.referenceYear,
          observations: data.incident.observations,
          status: 'REGISTERED',
          registeredBy: uuidToBuffer(data.incident.registeredBy),
        });

        await tx.insert(incidentOccurrences).values(
          data.occurrences.map((occurrence) => ({
            id: uuidToBuffer(occurrence.id),
            incidentId: uuidToBuffer(data.incident.id),
            startDate: occurrence.startDate,
            endDate: occurrence.endDate,
          })),
        );

        await tx.insert(documents).values(
          data.documents.map((document) => ({
            id: uuidToBuffer(document.id),
            incidentId: uuidToBuffer(data.incident.id),
            documentTypeId: uuidToBuffer(document.documentTypeId),
            originalName: document.originalName,
            storedName: document.storedName,
            storagePath: document.storagePath,
            mimeType: document.mimeType,
            sizeBytes: document.sizeBytes,
            contentHash: document.contentHash,
            uploadedBy: uuidToBuffer(document.uploadedBy),
          })),
        );

        await this.auditService.append(
          {
            userId: data.audit.userId,
            sessionId: data.audit.sessionId,
            action: 'CREATED',
            entityType: 'INCIDENT',
            entityId: data.incident.id,
            newValues: {
              employeeId: data.incident.employeeId,
              incidentTypeId: data.incident.incidentTypeId,
              occurrences: data.occurrences.map((occurrence) => ({
                startDate: occurrence.startDate.toISOString().slice(0, 10),
                endDate: occurrence.endDate?.toISOString().slice(0, 10) ?? null,
              })),
            },
          },
          tx,
        );

        for (const document of data.documents) {
          await this.auditService.append(
            {
              userId: data.audit.userId,
              sessionId: data.audit.sessionId,
              action: 'UPLOADED',
              entityType: 'DOCUMENT',
              entityId: document.id,
              newValues: {
                incidentId: data.incident.id,
                documentTypeId: document.documentTypeId,
                originalName: document.originalName,
                mimeType: document.mimeType,
                sizeBytes: document.sizeBytes,
              },
            },
            tx,
          );
        }
      });
    } catch (error) {
      throw new IncidentCreateTransactionError({ cause: error });
    }

    const result = await this.findById(data.incident.id);

    if (!result) throw new Error('Incident persistence error');

    return result;
  }

  async findById(id: string): Promise<IncidentDetailsModel | null> {
    const [row] = await this.db
      .select({
        incident: incidents,
        employee: {
          id: employees.id,
          employeeNumber: employees.employeeNumber,
          fullName: employees.fullName,
        },
        assignment: {
          id: employeeAssignments.id,
          appointmentType: employeeAssignments.appointmentType,
          schedule: employeeAssignments.schedule,
          effectiveFrom: employeeAssignments.effectiveFrom,
          effectiveTo: employeeAssignments.effectiveTo,
        },
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
        incidentType: {
          id: incidentTypes.id,
          code: incidentTypes.code,
          name: incidentTypes.name,
          temporalMode: incidentTypes.temporalMode,
          appointmentScope: incidentTypes.appointmentScope,
        },
        registeredBy: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
        },
      })
      .from(incidents)
      .innerJoin(employees, eq(incidents.employeeId, employees.id))
      .innerJoin(
        employeeAssignments,
        eq(incidents.employeeAssignmentId, employeeAssignments.id),
      )
      .innerJoin(
        organizationalUnits,
        eq(employeeAssignments.organizationalUnitId, organizationalUnits.id),
      )
      .innerJoin(positions, eq(employeeAssignments.positionId, positions.id))
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .innerJoin(users, eq(incidents.registeredBy, users.id))
      .where(eq(incidents.id, uuidToBuffer(id)))
      .limit(1);

    if (!row) return null;

    const occurrenceRows = await this.db
      .select()
      .from(incidentOccurrences)
      .where(eq(incidentOccurrences.incidentId, uuidToBuffer(id)))
      .orderBy(asc(incidentOccurrences.startDate));

    return {
      id: bufferToUuid(row.incident.id),
      employeeId: bufferToUuid(row.incident.employeeId),
      employeeAssignmentId: bufferToUuid(row.incident.employeeAssignmentId),
      incidentTypeId: bufferToUuid(row.incident.incidentTypeId),
      issuedDate: row.incident.issuedDate,
      receivedAt: row.incident.receivedAt,
      referenceYear: row.incident.referenceYear,
      observations: row.incident.observations,
      status: row.incident.status,
      registeredBy: bufferToUuid(row.incident.registeredBy),
      updatedBy: row.incident.updatedBy
        ? bufferToUuid(row.incident.updatedBy)
        : null,
      cancelledAt: row.incident.cancelledAt,
      cancelledBy: row.incident.cancelledBy
        ? bufferToUuid(row.incident.cancelledBy)
        : null,
      cancellationReason: row.incident.cancellationReason,
      createdAt: row.incident.createdAt,
      updatedAt: row.incident.updatedAt,
      employee: {
        id: bufferToUuid(row.employee.id),
        employeeNumber: row.employee.employeeNumber,
        fullName: row.employee.fullName,
      },
      assignment: {
        id: bufferToUuid(row.assignment.id),
        appointmentType: row.assignment.appointmentType,
        schedule: row.assignment.schedule,
        effectiveFrom: row.assignment.effectiveFrom,
        effectiveTo: row.assignment.effectiveTo,
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
      },
      incidentType: {
        id: bufferToUuid(row.incidentType.id),
        code: row.incidentType.code,
        name: row.incidentType.name,
        temporalMode: row.incidentType.temporalMode,
        appointmentScope: row.incidentType.appointmentScope,
      },
      occurrences: occurrenceRows.map((occurrence) => ({
        id: bufferToUuid(occurrence.id),
        incidentId: bufferToUuid(occurrence.incidentId),
        startDate: occurrence.startDate,
        endDate: occurrence.endDate,
        createdAt: occurrence.createdAt,
      })),
      registeredByUser: {
        id: bufferToUuid(row.registeredBy.id),
        username: row.registeredBy.username,
        fullName: row.registeredBy.fullName,
      },
    };
  }

  async findAll(
    filters: IncidentFilters,
  ): Promise<PaginatedResult<IncidentDetailsModel>> {
    const conditions: SQL[] = [];

    if (filters.status) {
      conditions.push(eq(incidents.status, filters.status));
    }

    if (filters.employeeId) {
      conditions.push(
        eq(incidents.employeeId, uuidToBuffer(filters.employeeId)),
      );
    }

    if (filters.incidentTypeId) {
      conditions.push(
        eq(incidents.incidentTypeId, uuidToBuffer(filters.incidentTypeId)),
      );
    }

    if (filters.organizationalUnitId) {
      conditions.push(
        eq(
          employeeAssignments.organizationalUnitId,
          uuidToBuffer(filters.organizationalUnitId),
        ),
      );
    }

    if (filters.search) {
      const search = `%${filters.search}%`;

      conditions.push(
        or(
          like(employees.fullName, search),
          like(employees.employeeNumber, search),
          like(incidentTypes.name, search),
        )!,
      );
    }

    if (filters.from) {
      conditions.push(gte(incidentOccurrences.normalizedEndDate, filters.from));
    }

    if (filters.to) {
      conditions.push(lte(incidentOccurrences.startDate, filters.to));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (filters.page - 1) * filters.limit;
    const idRows = await this.db
      .selectDistinct({
        id: incidents.id,
        createdAt: incidents.createdAt,
      })
      .from(incidents)
      .innerJoin(employees, eq(incidents.employeeId, employees.id))
      .innerJoin(
        employeeAssignments,
        eq(incidents.employeeAssignmentId, employeeAssignments.id),
      )
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .innerJoin(
        incidentOccurrences,
        eq(incidentOccurrences.incidentId, incidents.id),
      )
      .where(where)
      .orderBy(desc(incidents.createdAt), desc(incidents.id))
      .limit(filters.limit)
      .offset(offset);

    const totalRows = await this.db
      .select({
        value: countDistinct(incidents.id),
      })
      .from(incidents)
      .innerJoin(employees, eq(incidents.employeeId, employees.id))
      .innerJoin(
        employeeAssignments,
        eq(incidents.employeeAssignmentId, employeeAssignments.id),
      )
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .innerJoin(
        incidentOccurrences,
        eq(incidentOccurrences.incidentId, incidents.id),
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const items = await Promise.all(
      idRows.map(async ({ id }) => this.findById(bufferToUuid(id))),
    );

    return {
      items: items.filter(
        (item): item is IncidentDetailsModel => item !== null,
      ),
      total: Number(totalRows[0]?.value ?? 0),
    };
  }

  async update(
    id: string,
    data: UpdateIncidentData,
  ): Promise<IncidentDetailsModel | null> {
    const existing = await this.findById(id);

    if (!existing) return null;

    const updated = await this.db.transaction(async (tx) => {
      const [locked] = await tx
        .select({
          status: incidents.status,
          updatedAt: incidents.updatedAt,
        })
        .from(incidents)
        .where(eq(incidents.id, uuidToBuffer(id)))
        .for('update');

      if (!locked) return false;
      if (locked.status === 'CANCELLED') {
        throw new CancelledIncidentModificationError();
      }
      if (locked.updatedAt.getTime() !== data.expectedUpdatedAt.getTime()) {
        throw new IncidentConcurrentModificationError();
      }

      await tx
        .update(incidents)
        .set({
          incidentTypeId: data.incidentTypeId
            ? uuidToBuffer(data.incidentTypeId)
            : undefined,
          issuedDate: data.issuedDate,
          receivedAt: data.receivedAt,
          referenceYear: data.referenceYear,
          observations: data.observations,
          updatedBy: uuidToBuffer(data.updatedBy),
          updatedAt: data.updatedAt,
        })
        .where(eq(incidents.id, uuidToBuffer(id)));

      if (data.occurrences) {
        await tx
          .delete(incidentOccurrences)
          .where(eq(incidentOccurrences.incidentId, uuidToBuffer(id)));

        await tx.insert(incidentOccurrences).values(
          data.occurrences.map((occurrence) => ({
            id: uuidToBuffer(occurrence.id),
            incidentId: uuidToBuffer(id),
            startDate: occurrence.startDate,
            endDate: occurrence.endDate,
          })),
        );
      }

      await this.auditService.append(
        {
          userId: data.updatedBy,
          sessionId: data.sessionId,
          action: 'UPDATED',
          entityType: 'INCIDENT',
          entityId: id,
          oldValues: {
            incidentTypeId: existing.incidentTypeId,
            issuedDate: existing.issuedDate?.toISOString().slice(0, 10) ?? null,
            receivedAt: existing.receivedAt.toISOString(),
            referenceYear: existing.referenceYear,
            observations: existing.observations,
            occurrences: existing.occurrences.map((occurrence) => ({
              startDate: occurrence.startDate.toISOString().slice(0, 10),
              endDate: occurrence.endDate?.toISOString().slice(0, 10) ?? null,
            })),
          },
          newValues: {
            incidentTypeId: data.incidentTypeId ?? existing.incidentTypeId,
            issuedDate:
              data.issuedDate !== undefined
                ? (data.issuedDate?.toISOString().slice(0, 10) ?? null)
                : (existing.issuedDate?.toISOString().slice(0, 10) ?? null),
            receivedAt: (data.receivedAt ?? existing.receivedAt).toISOString(),
            referenceYear:
              data.referenceYear !== undefined
                ? data.referenceYear
                : existing.referenceYear,
            observations:
              data.observations !== undefined
                ? data.observations
                : existing.observations,
            occurrences: (data.occurrences ?? existing.occurrences).map(
              (occurrence) => ({
                startDate: occurrence.startDate.toISOString().slice(0, 10),
                endDate: occurrence.endDate?.toISOString().slice(0, 10) ?? null,
              }),
            ),
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

  async cancel(
    id: string,
    data: CancelIncidentData,
  ): Promise<IncidentDetailsModel | null> {
    const existing = await this.findById(id);

    if (!existing) return null;

    const cancelled = await this.db.transaction(async (tx) => {
      const [locked] = await tx
        .select({ status: incidents.status })
        .from(incidents)
        .where(eq(incidents.id, uuidToBuffer(id)))
        .for('update');

      if (!locked) return false;
      if (locked.status === 'CANCELLED') {
        throw new IncidentAlreadyCancelledError();
      }

      await tx
        .update(incidents)
        .set({
          status: 'CANCELLED',
          cancelledAt: data.cancelledAt,
          cancelledBy: uuidToBuffer(data.cancelledBy),
          cancellationReason: data.cancellationReason,
          updatedBy: uuidToBuffer(data.cancelledBy),
          updatedAt: data.updatedAt,
        })
        .where(eq(incidents.id, uuidToBuffer(id)));

      await this.auditService.append(
        {
          userId: data.cancelledBy,
          sessionId: data.sessionId,
          action: 'CANCELLED',
          entityType: 'INCIDENT',
          entityId: id,
          oldValues: {
            status: existing.status,
          },
          newValues: {
            status: 'CANCELLED',
            reason: data.cancellationReason,
          },
          createdAt: data.cancelledAt,
        },
        tx,
      );

      return true;
    });

    if (!cancelled) return null;

    return this.findById(id);
  }
}
