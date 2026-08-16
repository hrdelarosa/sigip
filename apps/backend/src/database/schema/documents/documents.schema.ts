import {
  bigint,
  char,
  datetime,
  foreignKey,
  index,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import { check } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import { users } from '../access';
import { incidents } from '../incidents';
import { uuidBinary } from '../columns/uuid.column';
import { createdAtColumn } from '../columns/timestamps.columns';
import { documentTypes } from './document-types.schema';

export const documents = mysqlTable(
  'documents',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    incidentId: uuidBinary('incident_id').notNull(),
    documentTypeId: uuidBinary('document_type_id').notNull(),
    originalName: varchar('original_name', {
      length: 255,
    }).notNull(),
    storedName: varchar('stored_name', {
      length: 255,
    }).notNull(),
    storagePath: varchar('storage_path', {
      length: 1000,
    }).notNull(),
    mimeType: varchar('mime_type', {
      length: 150,
    }).notNull(),
    sizeBytes: bigint('size_bytes', {
      mode: 'number',
      unsigned: true,
    }).notNull(),
    contentHash: char('content_hash', {
      length: 64,
    }),
    uploadedBy: uuidBinary('uploaded_by').notNull(),
    createdAt: createdAtColumn(),
    deletedAt: datetime('deleted_at', {
      mode: 'date',
      fsp: 6,
    }),
    deletedBy: uuidBinary('deleted_by'),
    deletionReason: varchar('deletion_reason', {
      length: 500,
    }),
  },
  (table) => [
    uniqueIndex('documents_stored_name_unique').on(table.storedName),
    index('documents_incident_deleted_index').on(
      table.incidentId,
      table.deletedAt,
    ),
    index('documents_document_type_index').on(table.documentTypeId),
    index('documents_uploaded_by_created_index').on(
      table.uploadedBy,
      table.createdAt,
    ),
    foreignKey({
      name: 'documents_incident_id_fk',
      columns: [table.incidentId],
      foreignColumns: [incidents.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'documents_document_type_id_fk',
      columns: [table.documentTypeId],
      foreignColumns: [documentTypes.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'documents_uploaded_by_fk',
      columns: [table.uploadedBy],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'documents_deleted_by_fk',
      columns: [table.deletedBy],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    check('documents_size_bytes_check', sql`${table.sizeBytes} >= 0`),
    check(
      'documents_deletion_fields_check',
      sql`
        (${table.deletedAt} IS NULL
          AND ${table.deletedBy} IS NULL
          AND ${table.deletionReason} IS NULL)
        OR
        (${table.deletedAt} IS NOT NULL
          AND ${table.deletedBy} IS NOT NULL
          AND ${table.deletionReason} IS NOT NULL)
      `,
    ),
  ],
);

export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;
