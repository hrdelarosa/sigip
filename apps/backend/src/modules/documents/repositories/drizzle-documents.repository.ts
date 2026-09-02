import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import {
  documentTypes,
  documents,
  employees,
  incidents,
  incidentTypes,
} from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import type { DocumentModel } from '../models/document.model';
import { DocumentsRepository } from './documents.repository';
import { AuditService } from '../../audit/audit.service';
import {
  CancelledIncidentDocumentError,
  CommissionAnnexAlreadyExistsError,
  CommissionAnnexNotAllowedError,
  DocumentNotFoundError,
  DocumentTypeNotAvailableError,
  IncidentNotAvailableForDocumentError,
} from '../documents.errors';

@Injectable()
export class DrizzleDocumentsRepository implements DocumentsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
    private readonly auditService: AuditService,
  ) {}

  private map(row: {
    document: typeof documents.$inferSelect;

    documentType: typeof documentTypes.$inferSelect;
  }): DocumentModel {
    return {
      id: bufferToUuid(row.document.id),
      incidentId: bufferToUuid(row.document.incidentId),
      documentType: {
        id: bufferToUuid(row.documentType.id),
        code: row.documentType.code,
        name: row.documentType.name,
        description: row.documentType.description,
        isActive: row.documentType.isActive,
      },
      originalName: row.document.originalName,
      storedName: row.document.storedName,
      storagePath: row.document.storagePath,
      mimeType: row.document.mimeType,
      sizeBytes: row.document.sizeBytes,
      contentHash: row.document.contentHash,
      uploadedBy: bufferToUuid(row.document.uploadedBy),
      createdAt: row.document.createdAt,
      deletedAt: row.document.deletedAt,
      deletedBy: row.document.deletedBy
        ? bufferToUuid(row.document.deletedBy)
        : null,
      deletionReason: row.document.deletionReason,
    };
  }

  async findByIncidentId(incidentId: string, officeId?: string) {
    const rows = await this.db
      .select({
        document: documents,

        documentType: documentTypes,
      })
      .from(documents)

      .innerJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .innerJoin(incidents, eq(documents.incidentId, incidents.id))
      .innerJoin(employees, eq(incidents.employeeId, employees.id))

      .where(
        and(
          eq(documents.incidentId, uuidToBuffer(incidentId)),
          isNull(documents.deletedAt),
          officeId ? eq(employees.officeId, uuidToBuffer(officeId)) : undefined,
        ),
      )

      .orderBy(asc(documents.createdAt));

    return rows.map((row) => this.map(row));
  }

  async findById(id: string, officeId?: string) {
    const [row] = await this.db
      .select({
        document: documents,

        documentType: documentTypes,
      })
      .from(documents)

      .innerJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .innerJoin(incidents, eq(documents.incidentId, incidents.id))
      .innerJoin(employees, eq(incidents.employeeId, employees.id))

      .where(
        and(
          eq(documents.id, uuidToBuffer(id)),
          officeId ? eq(employees.officeId, uuidToBuffer(officeId)) : undefined,
        ),
      )

      .limit(1);

    return row ? this.map(row) : null;
  }

  async create(data: {
    id: string;
    incidentId: string;
    documentTypeId: string;
    originalName: string;
    storedName: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
    contentHash: string;
    uploadedBy: string;
  }) {
    await this.db.insert(documents).values({
      id: uuidToBuffer(data.id),
      incidentId: uuidToBuffer(data.incidentId),
      documentTypeId: uuidToBuffer(data.documentTypeId),
      originalName: data.originalName,
      storedName: data.storedName,
      storagePath: data.storagePath,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      contentHash: data.contentHash,
      uploadedBy: uuidToBuffer(data.uploadedBy),
    });

    const result = await this.findById(data.id);

    if (!result) {
      throw new Error('Document persistence error');
    }

    return result;
  }

  async createCommissionAnnex(data: {
    id: string;
    incidentId: string;
    originalName: string;
    storedName: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
    contentHash: string;
    uploadedBy: string;
    sessionId: string;
    officeId?: string;
  }) {
    await this.db.transaction(async (tx) => {
      const [incident] = await tx
        .select({ status: incidents.status, typeCode: incidentTypes.code })
        .from(incidents)
        .innerJoin(
          incidentTypes,
          eq(incidents.incidentTypeId, incidentTypes.id),
        )
        .innerJoin(employees, eq(incidents.employeeId, employees.id))
        .where(
          and(
            eq(incidents.id, uuidToBuffer(data.incidentId)),
            data.officeId
              ? eq(employees.officeId, uuidToBuffer(data.officeId))
              : undefined,
          ),
        )
        .for('update');

      if (!incident) throw new IncidentNotAvailableForDocumentError();
      if (incident.status === 'CANCELLED') {
        throw new CancelledIncidentDocumentError();
      }
      if (incident.typeCode !== 'COMISION') {
        throw new CommissionAnnexNotAllowedError();
      }

      const [documentType] = await tx
        .select({ id: documentTypes.id })
        .from(documentTypes)
        .where(
          and(
            eq(documentTypes.code, 'OFICIO_COMISION'),
            eq(documentTypes.isActive, true),
          ),
        )
        .limit(1);
      if (!documentType) throw new DocumentTypeNotAvailableError();

      const [existing] = await tx
        .select({ id: documents.id })
        .from(documents)
        .innerJoin(
          documentTypes,
          eq(documents.documentTypeId, documentTypes.id),
        )
        .where(
          and(
            eq(documents.incidentId, uuidToBuffer(data.incidentId)),
            eq(documentTypes.code, 'OFICIO_COMISION'),
            isNull(documents.deletedAt),
          ),
        )
        .limit(1);
      if (existing) throw new CommissionAnnexAlreadyExistsError();

      await tx.insert(documents).values({
        id: uuidToBuffer(data.id),
        incidentId: uuidToBuffer(data.incidentId),
        documentTypeId: documentType.id,
        originalName: data.originalName,
        storedName: data.storedName,
        storagePath: data.storagePath,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        contentHash: data.contentHash,
        uploadedBy: uuidToBuffer(data.uploadedBy),
      });

      await this.auditService.append(
        {
          userId: data.uploadedBy,
          sessionId: data.sessionId,
          action: 'UPLOADED',
          entityType: 'DOCUMENT',
          entityId: data.id,
          newValues: {
            incidentId: data.incidentId,
            documentTypeId: bufferToUuid(documentType.id),
            originalName: data.originalName,
            mimeType: data.mimeType,
            sizeBytes: data.sizeBytes,
          },
        },
        tx,
      );
    });

    const result = await this.findById(data.id);
    if (!result) throw new Error('Document persistence error');
    return result;
  }

  async softDelete(
    id: string,
    data: {
      deletedAt: Date;
      deletedBy: string;
      deletionReason: string;
      sessionId: string;
      officeId?: string;
    },
  ) {
    const deleted = await this.db.transaction(async (tx) => {
      const [current] = await tx
        .select({ deletedAt: documents.deletedAt })
        .from(documents)
        .innerJoin(incidents, eq(documents.incidentId, incidents.id))
        .innerJoin(employees, eq(incidents.employeeId, employees.id))
        .where(
          and(
            eq(documents.id, uuidToBuffer(id)),
            data.officeId
              ? eq(employees.officeId, uuidToBuffer(data.officeId))
              : undefined,
          ),
        )
        .for('update');

      if (!current) return false;
      if (current.deletedAt) throw new DocumentNotFoundError(id);

      await tx
        .update(documents)
        .set({
          deletedAt: data.deletedAt,
          deletedBy: uuidToBuffer(data.deletedBy),
          deletionReason: data.deletionReason,
        })
        .where(
          and(eq(documents.id, uuidToBuffer(id)), isNull(documents.deletedAt)),
        );

      await this.auditService.append(
        {
          userId: data.deletedBy,
          sessionId: data.sessionId,
          action: 'DELETED',
          entityType: 'DOCUMENT',
          entityId: id,
          oldValues: { deletedAt: null },
          newValues: {
            deletedAt: data.deletedAt.toISOString(),
            deletionReason: data.deletionReason,
          },
          createdAt: data.deletedAt,
        },
        tx,
      );

      return true;
    });

    if (!deleted) return null;

    return this.findById(id, data.officeId);
  }
}
