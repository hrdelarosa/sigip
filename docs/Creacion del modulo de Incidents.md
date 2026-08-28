# Implementación completa del módulo de incidencias de SIGIP

## 1. Decisiones de dominio que utilizará esta implementación

Antes del código, estas son las decisiones que voy a considerar como base.

### Una incidencia corresponde a un formato

Cada formato físico de incidencias representa **una incidencia registrada en SIGIP**.

Por tanto:

```text
1 formato
    =
1 incidencia
    =
1 PDF principal obligatorio
```

Si posteriormente el trabajador presenta otro formato aunque corresponda al mismo concepto, se registra otra incidencia.

Ejemplo:

```text
Vacaciones primer periodo 2026

Formato A
14 de julio

Formato B
21, 22, 23, 24 y 25 de septiembre
```

Son:

```text
Incidencia A
Incidencia B
```

No una sola incidencia modificada.

---

## 2. El PDF principal será obligatorio

El archivo mostrado corresponde al documento:

```text
FORMATO_INCIDENCIA
```

Cada incidencia registrada tendrá exactamente un formato principal.

Otros documentos serán anexos:

```text
FORMATO_INCIDENCIA       obligatorio
OFICIO_COMISION          opcional
CONSTANCIA               opcional
JUSTIFICANTE             opcional
OTRO                     opcional
```

Para `COMISION`, el oficio **no será obligatorio**, porque operacionalmente puede existir una comisión sin que se genere dicho oficio.

Cuando exista, se permitirá un solo `OFICIO_COMISION` activo por incidencia. Debe ser PDF de hasta 5 MB y podrá cargarse durante el alta o posteriormente desde el expediente, siempre que la incidencia no esté cancelada.

---

## 3. Fechas de la incidencia

Se mantienen separados tres conceptos.

### `issuedDate`

Fecha de elaboración o emisión indicada en el encabezado del formato.

Ejemplo del documento:

```text
Acapulco, Guerrero a 09 de Julio de 2026
```

Entonces:

```text
issuedDate = 2026-07-09
```

### `receivedAt`

Momento en el que Recursos Humanos recibe el formato.

```text
receivedAt = 2026-07-10T16:30:00.000Z
```

### Ocurrencias

Representan los días a los que realmente aplica la incidencia.

Ejemplo:

```text
Vacaciones primer periodo
Fecha: 14 de julio de 2026
```

Entonces:

```text
startDate = 2026-07-14
endDate   = null
```

---

# 4. Vacaciones

Los periodos vacacionales constan de 10 días, pero esos días pueden utilizarse:

```text
10 consecutivos
```

o:

```text
10 separados
```

o:

```text
5 consecutivos + 5 separados
```

Por eso las vacaciones se almacenarán como **días individuales**.

Ejemplo:

```text
14
15
16
17
18
22
24
27
28
29
```

produce diez registros en `incident_occurrences`.

Esto permite calcular posteriormente:

```text
COUNT(occurrences)
```

sin intentar interpretar fines de semana, días inhábiles o rangos.

---

# 5. Temporalidades

```typescript
SINGLE_DATE
MULTIPLE_DATES
DATE_RANGE
```

### `SINGLE_DATE`

Una fecha.

Ejemplo:

```text
JUSTIFICACION_ENTRADA
14/07/2026
```

### `MULTIPLE_DATES`

Una o varias fechas independientes.

Ejemplo:

```text
VACACIONES_PRIMER_PERIODO

14/07/2026
15/07/2026
18/07/2026
22/07/2026
```

### `DATE_RANGE`

Periodo continuo.

Se conserva para conceptos que posteriormente se confirme que verdaderamente funcionan como un rango continuo.

---

# 6. Estructura completa que agregaría

```text
sigip/
│
├── packages/
│   └── shared/
│       └── src/
│           ├── incident-types/
│           │   ├── incident-types.contracts.ts
│           │   └── index.ts
│           ├── incidents/
│           │   ├── incidents.contracts.ts
│           │   └── index.ts
│           ├── documents/
│           │   ├── documents.contracts.ts
│           │   └── index.ts
│           └── index.ts
│
├── apps/
│   ├── backend/
│   │   └── src/
│   │       ├── database/
│   │       │   └── schema/
│   │       │       ├── incidents/
│   │       │       │   ├── incident-types.schema.ts
│   │       │       │   ├── incidents.schema.ts
│   │       │       │   ├── incident-occurrences.schema.ts
│   │       │       │   └── index.ts
│   │       │       ├── documents/
│   │       │       │   ├── document-types.schema.ts
│   │       │       │   ├── documents.schema.ts
│   │       │       │   └── index.ts
│   │       │       └── index.ts
│   │       │
│   │       └── modules/
│   │           ├── incident-types/
│   │           │   ├── dto/
│   │           │   ├── models/
│   │           │   ├── presenters/
│   │           │   ├── repositories/
│   │           │   ├── types/
│   │           │   ├── incident-types.controller.ts
│   │           │   ├── incident-types.service.ts
│   │           │   ├── incident-types.errors.ts
│   │           │   └── incident-types.module.ts
│   │           │
│   │           ├── incidents/
│   │           │   ├── dto/
│   │           │   ├── models/
│   │           │   ├── presenters/
│   │           │   ├── repositories/
│   │           │   ├── types/
│   │           │   ├── incidents.controller.ts
│   │           │   ├── incidents.service.ts
│   │           │   ├── incidents.errors.ts
│   │           │   └── incidents.module.ts
│   │           │
│   │           └── documents/
│   │               ├── dto/
│   │               ├── models/
│   │               ├── presenters/
│   │               ├── repositories/
│   │               ├── storage/
│   │               ├── documents.controller.ts
│   │               ├── documents.service.ts
│   │               ├── documents.errors.ts
│   │               └── documents.module.ts
│   │
│   └── frontend/
│       └── src/
│           └── modules/
│               └── incidents/
│                   ├── api/
│                   ├── components/
│                   ├── constants/
│                   ├── hooks/
│                   ├── pages/
│                   ├── queries/
│                   ├── schemas/
│                   ├── types/
│                   └── index.ts
│
└── storage/
    └── incidents/
```

---

# PARTE I — PACKAGES/SHARED

# 7. Contratos de tipos de incidencia

## `packages/shared/src/incident-types/incident-types.contracts.ts`

```typescript
import type { PaginatedResponse } from '../common/pagination.contracts'

export const INCIDENT_TEMPORAL_MODES = [
  'SINGLE_DATE',
  'MULTIPLE_DATES',
  'DATE_RANGE',
] as const

export type IncidentTemporalMode =
  (typeof INCIDENT_TEMPORAL_MODES)[number]

export const INCIDENT_APPOINTMENT_SCOPES = [
  'ALL',
  'BASE',
  'CONFIANZA',
] as const

export type IncidentAppointmentScope =
  (typeof INCIDENT_APPOINTMENT_SCOPES)[number]

export interface IncidentTypeResponse {
  id: string
  code: string
  name: string
  description: string | null
  temporalMode: IncidentTemporalMode
  appointmentScope: IncidentAppointmentScope
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type IncidentTypesResponse =
  PaginatedResponse<IncidentTypeResponse>

export interface CreateIncidentTypeRequest {
  code: string
  name: string
  description?: string | null
  temporalMode: IncidentTemporalMode
  appointmentScope: IncidentAppointmentScope
  sortOrder?: number
}

export interface UpdateIncidentTypeRequest {
  name?: string
  description?: string | null
  temporalMode?: IncidentTemporalMode
  appointmentScope?: IncidentAppointmentScope
  sortOrder?: number
}

export interface UpdateIncidentTypeStatusRequest {
  isActive: boolean
}
```

---

## `packages/shared/src/incident-types/index.ts`

```typescript
export * from './incident-types.contracts'
```

---

# 8. Contratos de incidencias

## `packages/shared/src/incidents/incidents.contracts.ts`

```typescript
import type { PaginatedResponse } from '../common/pagination.contracts'
import type {
  IncidentAppointmentScope,
  IncidentTemporalMode,
} from '../incident-types'

export const INCIDENT_STATUSES = [
  'REGISTERED',
  'CANCELLED',
] as const

export type IncidentStatus =
  (typeof INCIDENT_STATUSES)[number]

export interface IncidentOccurrenceRequest {
  startDate: string
  endDate?: string | null
}

export interface IncidentOccurrenceResponse {
  id: string
  startDate: string
  endDate: string | null
}

export interface CreateIncidentRequest {
  employeeId: string
  employeeAssignmentId: string
  incidentTypeId: string

  issuedDate?: string | null
  receivedAt: string

  referenceYear?: number | null

  observations?: string | null

  occurrences: IncidentOccurrenceRequest[]
}

export interface UpdateIncidentRequest {
  incidentTypeId?: string

  issuedDate?: string | null
  receivedAt?: string

  referenceYear?: number | null

  observations?: string | null

  occurrences?: IncidentOccurrenceRequest[]
}

export interface CancelIncidentRequest {
  reason: string
}

export interface IncidentEmployeeResponse {
  id: string
  employeeNumber: string
  fullName: string
}

export interface IncidentOrganizationalUnitResponse {
  id: string
  code: string
  name: string
}

export interface IncidentPositionResponse {
  id: string
  code: string
  name: string
}

export interface IncidentAssignmentResponse {
  id: string
  appointmentType: string
  schedule: string | null
  effectiveFrom: string
  effectiveTo: string | null
  organizationalUnit: IncidentOrganizationalUnitResponse
  position: IncidentPositionResponse
}

export interface IncidentTypeSummaryResponse {
  id: string
  code: string
  name: string
  temporalMode: IncidentTemporalMode
  appointmentScope: IncidentAppointmentScope
}

export interface IncidentRegisteredByResponse {
  id: string
  username: string
  fullName: string
}

export interface IncidentResponse {
  id: string

  employeeId: string
  employeeAssignmentId: string
  incidentTypeId: string

  employee: IncidentEmployeeResponse
  assignment: IncidentAssignmentResponse
  incidentType: IncidentTypeSummaryResponse

  issuedDate: string | null
  receivedAt: string

  referenceYear: number | null

  observations: string | null

  status: IncidentStatus

  occurrences: IncidentOccurrenceResponse[]

  registeredBy: IncidentRegisteredByResponse

  cancelledAt: string | null
  cancellationReason: string | null

  createdAt: string
  updatedAt: string
}

export type IncidentsResponse =
  PaginatedResponse<IncidentResponse>
```

---

## `packages/shared/src/incidents/index.ts`

```typescript
export * from './incidents.contracts'
```

---

# 9. Contratos de documentos

## `packages/shared/src/documents/documents.contracts.ts`

```typescript
export interface DocumentTypeResponse {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
}

export interface IncidentDocumentResponse {
  id: string
  incidentId: string

  documentType: DocumentTypeResponse

  originalName: string
  mimeType: string
  sizeBytes: number

  createdAt: string

  deletedAt: string | null
}

export type IncidentDocumentsResponse =
  IncidentDocumentResponse[]

export interface DeleteDocumentRequest {
  reason: string
}
```

---

## `packages/shared/src/documents/index.ts`

```typescript
export * from './documents.contracts'
```

---

# 10. Exportaciones principales

## `packages/shared/src/index.ts`

A tus exportaciones actuales agregar:

```typescript
export * from './incident-types'
export * from './incidents'
export * from './documents'
```

---

# PARTE II — SCHEMAS DRIZZLE

# 11. Schema de tipos de incidencia

## `apps/backend/src/database/schema/incidents/incident-types.schema.ts`

```typescript
import {
  boolean,
  index,
  int,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns'
import { uuidBinary } from '../columns/uuid.column'

export const incidentTypes = mysqlTable(
  'incident_types',
  {
    id: uuidBinary('id')
      .notNull()
      .primaryKey(),

    code: varchar('code', {
      length: 50,
    }).notNull(),

    name: varchar('name', {
      length: 150,
    }).notNull(),

    description: text('description'),

    temporalMode: varchar('temporal_mode', {
      length: 30,
    }).notNull(),

    appointmentScope: varchar('appointment_scope', {
      length: 30,
    })
      .notNull()
      .default('ALL'),

    isActive: boolean('is_active')
      .notNull()
      .default(true),

    sortOrder: int('sort_order')
      .notNull()
      .default(0),

    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex(
      'incident_types_code_unique',
    ).on(table.code),

    index(
      'incident_types_active_sort_index',
    ).on(
      table.isActive,
      table.sortOrder,
    ),
  ],
)

export type IncidentTypeRow =
  typeof incidentTypes.$inferSelect

export type NewIncidentTypeRow =
  typeof incidentTypes.$inferInsert
```

No existe:

```text
requires_document
```

porque el formato principal será obligatorio para todas las incidencias.

---

# 12. Schema principal de incidencias

## `apps/backend/src/database/schema/incidents/incidents.schema.ts`

```typescript
import {
  date,
  datetime,
  foreignKey,
  index,
  int,
  mysqlTable,
  text,
  varchar,
} from 'drizzle-orm/mysql-core'

import { users } from '../access'
import {
  employeeAssignments,
  employees,
} from '../organization'

import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns'
import { uuidBinary } from '../columns/uuid.column'

import { incidentTypes } from './incident-types.schema'

export const incidents = mysqlTable(
  'incidents',
  {
    id: uuidBinary('id')
      .notNull()
      .primaryKey(),

    employeeId: uuidBinary('employee_id')
      .notNull(),

    employeeAssignmentId: uuidBinary(
      'employee_assignment_id',
    ).notNull(),

    incidentTypeId: uuidBinary(
      'incident_type_id',
    ).notNull(),

    issuedDate: date('issued_date', {
      mode: 'date',
    }),

    receivedAt: datetime('received_at', {
      mode: 'date',
      fsp: 6,
    }).notNull(),

    referenceYear: int('reference_year'),

    observations: text('observations'),

    status: varchar('status', {
      length: 30,
    })
      .notNull()
      .default('REGISTERED'),

    registeredBy: uuidBinary('registered_by')
      .notNull(),

    updatedBy: uuidBinary('updated_by'),

    cancelledAt: datetime('cancelled_at', {
      mode: 'date',
      fsp: 6,
    }),

    cancelledBy: uuidBinary('cancelled_by'),

    cancellationReason: text(
      'cancellation_reason',
    ),

    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index(
      'incidents_employee_status_index',
    ).on(
      table.employeeId,
      table.status,
    ),

    index(
      'incidents_type_status_index',
    ).on(
      table.incidentTypeId,
      table.status,
    ),

    index(
      'incidents_assignment_index',
    ).on(
      table.employeeAssignmentId,
    ),

    index(
      'incidents_status_received_index',
    ).on(
      table.status,
      table.receivedAt,
    ),

    index(
      'incidents_registered_by_created_index',
    ).on(
      table.registeredBy,
      table.createdAt,
    ),

    foreignKey({
      name: 'incidents_employee_id_fk',
      columns: [table.employeeId],
      foreignColumns: [employees.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),

    foreignKey({
      name: 'incidents_assignment_id_fk',
      columns: [table.employeeAssignmentId],
      foreignColumns: [employeeAssignments.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),

    foreignKey({
      name: 'incidents_incident_type_id_fk',
      columns: [table.incidentTypeId],
      foreignColumns: [incidentTypes.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),

    foreignKey({
      name: 'incidents_registered_by_fk',
      columns: [table.registeredBy],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),

    foreignKey({
      name: 'incidents_updated_by_fk',
      columns: [table.updatedBy],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),

    foreignKey({
      name: 'incidents_cancelled_by_fk',
      columns: [table.cancelledBy],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
  ],
)

export type IncidentRow =
  typeof incidents.$inferSelect

export type NewIncidentRow =
  typeof incidents.$inferInsert
```

---

# 13. Schema de ocurrencias

## `apps/backend/src/database/schema/incidents/incident-occurrences.schema.ts`

```typescript
import type { SQL } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

import {
  date,
  foreignKey,
  index,
  mysqlTable,
  uniqueIndex,
} from 'drizzle-orm/mysql-core'

import { uuidBinary } from '../columns/uuid.column'
import { createdAtColumn } from '../columns/timestamps.columns'

import { incidents } from './incidents.schema'

export const incidentOccurrences = mysqlTable(
  'incident_occurrences',
  {
    id: uuidBinary('id')
      .notNull()
      .primaryKey(),

    incidentId: uuidBinary('incident_id')
      .notNull(),

    startDate: date('start_date', {
      mode: 'date',
    }).notNull(),

    endDate: date('end_date', {
      mode: 'date',
    }),

    normalizedEndDate: date(
      'normalized_end_date',
      {
        mode: 'date',
      },
    )
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`coalesce(${incidentOccurrences.endDate}, ${incidentOccurrences.startDate})`,
        {
          mode: 'stored',
        },
      ),

    createdAt: createdAtColumn(),
  },
  (table) => [
    index(
      'incident_occurrences_incident_id_index',
    ).on(table.incidentId),

    index(
      'incident_occurrences_dates_index',
    ).on(
      table.startDate,
      table.endDate,
    ),

    uniqueIndex(
      'incident_occurrences_unique_dates',
    ).on(
      table.incidentId,
      table.startDate,
      table.normalizedEndDate,
    ),

    foreignKey({
      name: 'incident_occurrences_incident_id_fk',
      columns: [table.incidentId],
      foreignColumns: [incidents.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
  ],
)

export type IncidentOccurrenceRow =
  typeof incidentOccurrences.$inferSelect

export type NewIncidentOccurrenceRow =
  typeof incidentOccurrences.$inferInsert
```

---

# 14. Exportación de schemas de incidencias

## `apps/backend/src/database/schema/incidents/index.ts`

```typescript
export * from './incident-types.schema'
export * from './incidents.schema'
export * from './incident-occurrences.schema'
```

---

# 15. Schema de tipos de documento

## `apps/backend/src/database/schema/documents/document-types.schema.ts`

```typescript
import {
  boolean,
  int,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns'
import { uuidBinary } from '../columns/uuid.column'

export const documentTypes = mysqlTable(
  'document_types',
  {
    id: uuidBinary('id')
      .notNull()
      .primaryKey(),

    code: varchar('code', {
      length: 50,
    }).notNull(),

    name: varchar('name', {
      length: 100,
    }).notNull(),

    description: varchar('description', {
      length: 500,
    }),

    isActive: boolean('is_active')
      .notNull()
      .default(true),

    sortOrder: int('sort_order')
      .notNull()
      .default(0),

    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex(
      'document_types_code_unique',
    ).on(table.code),
  ],
)

export type DocumentTypeRow =
  typeof documentTypes.$inferSelect

export type NewDocumentTypeRow =
  typeof documentTypes.$inferInsert
```

---

# 16. Schema de documentos

## `apps/backend/src/database/schema/documents/documents.schema.ts`

```typescript
import {
  bigint,
  char,
  datetime,
  foreignKey,
  index,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

import { users } from '../access'
import { incidents } from '../incidents'

import { uuidBinary } from '../columns/uuid.column'
import { createdAtColumn } from '../columns/timestamps.columns'

import { documentTypes } from './document-types.schema'

export const documents = mysqlTable(
  'documents',
  {
    id: uuidBinary('id')
      .notNull()
      .primaryKey(),

    incidentId: uuidBinary('incident_id')
      .notNull(),

    documentTypeId: uuidBinary(
      'document_type_id',
    ).notNull(),

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

    uploadedBy: uuidBinary('uploaded_by')
      .notNull(),

    createdAt: createdAtColumn(),

    deletedAt: datetime('deleted_at', {
      mode: 'date',
      fsp: 6,
    }),

    deletedBy: uuidBinary('deleted_by'),

    deletionReason: varchar(
      'deletion_reason',
      {
        length: 500,
      },
    ),
  },
  (table) => [
    uniqueIndex(
      'documents_storage_path_unique',
    ).on(table.storagePath),

    index(
      'documents_incident_deleted_index',
    ).on(
      table.incidentId,
      table.deletedAt,
    ),

    index(
      'documents_document_type_index',
    ).on(
      table.documentTypeId,
    ),

    index(
      'documents_uploaded_by_created_index',
    ).on(
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
  ],
)

export type DocumentRow =
  typeof documents.$inferSelect

export type NewDocumentRow =
  typeof documents.$inferInsert
```

---

# 17. Exportación de schemas de documentos

## `apps/backend/src/database/schema/documents/index.ts`

```typescript
export * from './document-types.schema'
export * from './documents.schema'
```

---

# 18. Exportación raíz

## `apps/backend/src/database/schema/index.ts`

Agregar:

```typescript
export * from './access'
export * from './organization'
export * from './audit'
export * from './incidents'
export * from './documents'
```

---

# PARTE III — INCIDENT TYPES

# 19. DTO 1 — Crear tipo

## `apps/backend/src/modules/incident-types/dto/create-incident-type.dto.ts`

```typescript
import type {
  CreateIncidentTypeRequest,
  IncidentAppointmentScope,
  IncidentTemporalMode,
} from '@sigip/shared'

import {
  INCIDENT_APPOINTMENT_SCOPES,
  INCIDENT_TEMPORAL_MODES,
} from '@sigip/shared'

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateIncidentTypeDto
  implements CreateIncidentTypeRequest
{
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/)
  code!: string

  @IsString()
  @MaxLength(150)
  name!: string

  @IsOptional()
  @IsString()
  description?: string | null

  @IsIn(INCIDENT_TEMPORAL_MODES)
  temporalMode!: IncidentTemporalMode

  @IsIn(INCIDENT_APPOINTMENT_SCOPES)
  appointmentScope!: IncidentAppointmentScope

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}
```

---

# 20. DTO 2 — Actualizar tipo

## `apps/backend/src/modules/incident-types/dto/update-incident-type.dto.ts`

```typescript
import type {
  IncidentAppointmentScope,
  IncidentTemporalMode,
  UpdateIncidentTypeRequest,
} from '@sigip/shared'

import {
  INCIDENT_APPOINTMENT_SCOPES,
  INCIDENT_TEMPORAL_MODES,
} from '@sigip/shared'

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator'

export class UpdateIncidentTypeDto
  implements UpdateIncidentTypeRequest
{
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string

  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsIn(INCIDENT_TEMPORAL_MODES)
  temporalMode?: IncidentTemporalMode

  @IsOptional()
  @IsIn(INCIDENT_APPOINTMENT_SCOPES)
  appointmentScope?: IncidentAppointmentScope

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}
```

---

# 21. DTO 3 — Estado del tipo

## `apps/backend/src/modules/incident-types/dto/update-incident-type-status.dto.ts`

```typescript
import type {
  UpdateIncidentTypeStatusRequest,
} from '@sigip/shared'

import { IsBoolean } from 'class-validator'

export class UpdateIncidentTypeStatusDto
  implements UpdateIncidentTypeStatusRequest
{
  @IsBoolean()
  isActive!: boolean
}
```

---

# 22. DTO 4 — Parámetro ID

## `apps/backend/src/modules/incident-types/dto/incident-type-id-param.dto.ts`

```typescript
import { IsUUID } from 'class-validator'

export class IncidentTypeIdParamDto {
  @IsUUID()
  id!: string
}
```

---

# 23. DTO 5 — Listado

## `apps/backend/src/modules/incident-types/dto/list-incident-types-query.dto.ts`

```typescript
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

import { Transform, Type } from 'class-transformer'

import {
  INCIDENT_APPOINTMENT_SCOPES,
  INCIDENT_TEMPORAL_MODES,
  type IncidentAppointmentScope,
  type IncidentTemporalMode,
} from '@sigip/shared'

export class ListIncidentTypesQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value
  })
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsIn(INCIDENT_TEMPORAL_MODES)
  temporalMode?: IncidentTemporalMode

  @IsOptional()
  @IsIn(INCIDENT_APPOINTMENT_SCOPES)
  appointmentScope?: IncidentAppointmentScope
}
```

---

# 24. Modelo

## `apps/backend/src/modules/incident-types/models/incident-type.model.ts`

```typescript
import type {
  IncidentAppointmentScope,
  IncidentTemporalMode,
} from '@sigip/shared'

export interface IncidentTypeModel {
  id: string
  code: string
  name: string
  description: string | null
  temporalMode: IncidentTemporalMode
  appointmentScope: IncidentAppointmentScope
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}
```

---

# 25. Tipos internos

## `apps/backend/src/modules/incident-types/types/incident-types.types.ts`

```typescript
import type {
  IncidentAppointmentScope,
  IncidentTemporalMode,
} from '@sigip/shared'

export interface IncidentTypeFilters {
  page: number
  limit: number
  search?: string
  isActive?: boolean
  temporalMode?: IncidentTemporalMode
  appointmentScope?: IncidentAppointmentScope
}

export interface CreateIncidentTypeData {
  id: string
  code: string
  name: string
  description: string | null
  temporalMode: IncidentTemporalMode
  appointmentScope: IncidentAppointmentScope
  sortOrder: number
}

export interface UpdateIncidentTypeData {
  name?: string
  description?: string | null
  temporalMode?: IncidentTemporalMode
  appointmentScope?: IncidentAppointmentScope
  sortOrder?: number
  updatedAt: Date
}
```

---

# 26. Repository abstracto

## `apps/backend/src/modules/incident-types/repositories/incident-types.repository.ts`

```typescript
import type {
  PaginatedResult,
} from '../../../common/pagination/types/pagination.types'

import type {
  IncidentTypeModel,
} from '../models/incident-type.model'

import type {
  CreateIncidentTypeData,
  IncidentTypeFilters,
  UpdateIncidentTypeData,
} from '../types/incident-types.types'

export abstract class IncidentTypesRepository {
  abstract findAll(
    filters: IncidentTypeFilters,
  ): Promise<PaginatedResult<IncidentTypeModel>>

  abstract findById(
    id: string,
  ): Promise<IncidentTypeModel | null>

  abstract findByCode(
    code: string,
  ): Promise<IncidentTypeModel | null>

  abstract create(
    data: CreateIncidentTypeData,
  ): Promise<IncidentTypeModel>

  abstract update(
    id: string,
    data: UpdateIncidentTypeData,
  ): Promise<IncidentTypeModel | null>

  abstract updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
  ): Promise<IncidentTypeModel | null>
}
```

---

# 27. Errores

## `apps/backend/src/modules/incident-types/incident-types.errors.ts`

```typescript
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common'

export class IncidentTypeNotFoundError
  extends NotFoundException
{
  constructor(id: string) {
    super(
      `No se encontró el tipo de incidencia "${id}"`,
    )
  }
}

export class IncidentTypeCodeAlreadyExistsError
  extends ConflictException
{
  constructor(code: string) {
    super(
      `Ya existe un tipo de incidencia con código "${code}"`,
    )
  }
}
```

---

# 28. Presenter

## `apps/backend/src/modules/incident-types/presenters/incident-type.presenter.ts`

```typescript
import type {
  IncidentTypeResponse,
} from '@sigip/shared'

import type {
  IncidentTypeModel,
} from '../models/incident-type.model'

export function toIncidentTypeResponse(
  model: IncidentTypeModel,
): IncidentTypeResponse {
  return {
    id: model.id,
    code: model.code,
    name: model.name,
    description: model.description,
    temporalMode: model.temporalMode,
    appointmentScope: model.appointmentScope,
    isActive: model.isActive,
    sortOrder: model.sortOrder,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  }
}
```

---

# 29. Service

## `apps/backend/src/modules/incident-types/incident-types.service.ts`

```typescript
import { Injectable } from '@nestjs/common'

import {
  generateUuidV7,
} from '../../common/utils/generate-uuid-v7.util'

import {
  CreateIncidentTypeDto,
} from './dto/create-incident-type.dto'

import {
  UpdateIncidentTypeDto,
} from './dto/update-incident-type.dto'

import {
  UpdateIncidentTypeStatusDto,
} from './dto/update-incident-type-status.dto'

import {
  ListIncidentTypesQueryDto,
} from './dto/list-incident-types-query.dto'

import {
  IncidentTypeCodeAlreadyExistsError,
  IncidentTypeNotFoundError,
} from './incident-types.errors'

import {
  IncidentTypesRepository,
} from './repositories/incident-types.repository'

@Injectable()
export class IncidentTypesService {
  constructor(
    private readonly repository:
      IncidentTypesRepository,
  ) {}

  findAll(
    query: ListIncidentTypesQueryDto,
  ) {
    return this.repository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search?.trim(),
      isActive: query.isActive,
      temporalMode: query.temporalMode,
      appointmentScope:
        query.appointmentScope,
    })
  }

  async findById(id: string) {
    const incidentType =
      await this.repository.findById(id)

    if (!incidentType) {
      throw new IncidentTypeNotFoundError(id)
    }

    return incidentType
  }

  async create(
    dto: CreateIncidentTypeDto,
  ) {
    const code =
      dto.code.trim().toUpperCase()

    const existing =
      await this.repository.findByCode(code)

    if (existing) {
      throw new IncidentTypeCodeAlreadyExistsError(
        code,
      )
    }

    return this.repository.create({
      id: generateUuidV7(),
      code,
      name: dto.name.trim(),
      description:
        dto.description?.trim() || null,
      temporalMode: dto.temporalMode,
      appointmentScope:
        dto.appointmentScope,
      sortOrder: dto.sortOrder ?? 0,
    })
  }

  async update(
    id: string,
    dto: UpdateIncidentTypeDto,
  ) {
    await this.findById(id)

    const result =
      await this.repository.update(id, {
        name: dto.name?.trim(),
        description:
          dto.description !== undefined
            ? dto.description?.trim() || null
            : undefined,
        temporalMode: dto.temporalMode,
        appointmentScope:
          dto.appointmentScope,
        sortOrder: dto.sortOrder,
        updatedAt: new Date(),
      })

    if (!result) {
      throw new IncidentTypeNotFoundError(id)
    }

    return result
  }

  async updateStatus(
    id: string,
    dto: UpdateIncidentTypeStatusDto,
  ) {
    const result =
      await this.repository.updateStatus(
        id,
        dto.isActive,
        new Date(),
      )

    if (!result) {
      throw new IncidentTypeNotFoundError(id)
    }

    return result
  }
}
```

---

# 30. Controller

## `apps/backend/src/modules/incident-types/incident-types.controller.ts`

```typescript
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'

import type {
  IncidentTypeResponse,
  IncidentTypesResponse,
} from '@sigip/shared'

import {
  RequirePermissions,
} from '../../common/decorators/require-permissions.decorator'

import {
  toPaginatedResponse,
} from '../../common/pagination/presenters/pagination.presenter'

import {
  CreateIncidentTypeDto,
} from './dto/create-incident-type.dto'

import {
  IncidentTypeIdParamDto,
} from './dto/incident-type-id-param.dto'

import {
  ListIncidentTypesQueryDto,
} from './dto/list-incident-types-query.dto'

import {
  UpdateIncidentTypeDto,
} from './dto/update-incident-type.dto'

import {
  UpdateIncidentTypeStatusDto,
} from './dto/update-incident-type-status.dto'

import {
  IncidentTypesService,
} from './incident-types.service'

import {
  toIncidentTypeResponse,
} from './presenters/incident-type.presenter'

@Controller('incident-types')
@RequirePermissions('incidents:read')
export class IncidentTypesController {
  constructor(
    private readonly service:
      IncidentTypesService,
  ) {}

  @Get()
  async findAll(
    @Query()
    query: ListIncidentTypesQueryDto,
  ): Promise<IncidentTypesResponse> {
    const result =
      await this.service.findAll(query)

    return toPaginatedResponse(
      result.items,
      result.total,
      query.page,
      query.limit,
      toIncidentTypeResponse,
    )
  }

  @Get(':id')
  async findById(
    @Param()
    params: IncidentTypeIdParamDto,
  ): Promise<IncidentTypeResponse> {
    return toIncidentTypeResponse(
      await this.service.findById(params.id),
    )
  }

  @Post()
  @RequirePermissions('catalogs:manage')
  async create(
    @Body()
    dto: CreateIncidentTypeDto,
  ): Promise<IncidentTypeResponse> {
    return toIncidentTypeResponse(
      await this.service.create(dto),
    )
  }

  @Patch(':id')
  @RequirePermissions('catalogs:manage')
  async update(
    @Param()
    params: IncidentTypeIdParamDto,

    @Body()
    dto: UpdateIncidentTypeDto,
  ): Promise<IncidentTypeResponse> {
    return toIncidentTypeResponse(
      await this.service.update(
        params.id,
        dto,
      ),
    )
  }

  @Patch(':id/status')
  @RequirePermissions('catalogs:manage')
  async updateStatus(
    @Param()
    params: IncidentTypeIdParamDto,

    @Body()
    dto: UpdateIncidentTypeStatusDto,
  ): Promise<IncidentTypeResponse> {
    return toIncidentTypeResponse(
      await this.service.updateStatus(
        params.id,
        dto,
      ),
    )
  }
}
```

---

# 31. Módulo

## `apps/backend/src/modules/incident-types/incident-types.module.ts`

```typescript
import { Module } from '@nestjs/common'

import {
  IncidentTypesController,
} from './incident-types.controller'

import {
  IncidentTypesService,
} from './incident-types.service'

import {
  IncidentTypesRepository,
} from './repositories/incident-types.repository'

import {
  DrizzleIncidentTypesRepository,
} from './repositories/drizzle-incident-types.repository'

@Module({
  controllers: [
    IncidentTypesController,
  ],

  providers: [
    IncidentTypesService,

    {
      provide: IncidentTypesRepository,
      useClass:
        DrizzleIncidentTypesRepository,
    },
  ],

  exports: [
    IncidentTypesService,
    IncidentTypesRepository,
  ],
})
export class IncidentTypesModule {}
```

---

# 32. Implementación Drizzle del catálogo

## `apps/backend/src/modules/incident-types/repositories/drizzle-incident-types.repository.ts`

```typescript
import {
  Inject,
  Injectable,
} from '@nestjs/common'

import {
  and,
  asc,
  count,
  eq,
  like,
  or,
} from 'drizzle-orm'

import {
  DRIZZLE_DATABASE,
} from '../../../database/database.constants'

import type {
  DrizzleDatabase,
} from '../../../database/database.types'

import {
  incidentTypes,
} from '../../../database/schema'

import {
  bufferToUuid,
  uuidToBuffer,
} from '../../../database/utils/uuid.util'

import type {
  PaginatedResult,
} from '../../../common/pagination/types/pagination.types'

import type {
  IncidentTypeModel,
} from '../models/incident-type.model'

import type {
  CreateIncidentTypeData,
  IncidentTypeFilters,
  UpdateIncidentTypeData,
} from '../types/incident-types.types'

import {
  IncidentTypesRepository,
} from './incident-types.repository'

@Injectable()
export class DrizzleIncidentTypesRepository
  implements IncidentTypesRepository
{
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  private map(
    row: typeof incidentTypes.$inferSelect,
  ): IncidentTypeModel {
    return {
      id: bufferToUuid(row.id),
      code: row.code,
      name: row.name,
      description: row.description,
      temporalMode:
        row.temporalMode as IncidentTypeModel['temporalMode'],
      appointmentScope:
        row.appointmentScope as IncidentTypeModel['appointmentScope'],
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async findAll(
    filters: IncidentTypeFilters,
  ): Promise<
    PaginatedResult<IncidentTypeModel>
  > {
    const conditions = []

    if (filters.search) {
      const search = `%${filters.search}%`

      conditions.push(
        or(
          like(
            incidentTypes.code,
            search,
          ),
          like(
            incidentTypes.name,
            search,
          ),
        ),
      )
    }

    if (
      filters.isActive !== undefined
    ) {
      conditions.push(
        eq(
          incidentTypes.isActive,
          filters.isActive,
        ),
      )
    }

    if (filters.temporalMode) {
      conditions.push(
        eq(
          incidentTypes.temporalMode,
          filters.temporalMode,
        ),
      )
    }

    if (filters.appointmentScope) {
      conditions.push(
        eq(
          incidentTypes.appointmentScope,
          filters.appointmentScope,
        ),
      )
    }

    const where =
      conditions.length > 0
        ? and(...conditions)
        : undefined

    const offset =
      (filters.page - 1) *
      filters.limit

    const [items, totalResult] =
      await Promise.all([
        this.db
          .select()
          .from(incidentTypes)
          .where(where)
          .orderBy(
            asc(incidentTypes.sortOrder),
            asc(incidentTypes.name),
          )
          .limit(filters.limit)
          .offset(offset),

        this.db
          .select({
            value: count(),
          })
          .from(incidentTypes)
          .where(where),
      ])

    return {
      items: items.map(
        (row) => this.map(row),
      ),
      total: Number(
        totalResult[0]?.value ?? 0,
      ),
    }
  }

  async findById(
    id: string,
  ): Promise<IncidentTypeModel | null> {
    const [row] = await this.db
      .select()
      .from(incidentTypes)
      .where(
        eq(
          incidentTypes.id,
          uuidToBuffer(id),
        ),
      )
      .limit(1)

    return row ? this.map(row) : null
  }

  async findByCode(
    code: string,
  ): Promise<IncidentTypeModel | null> {
    const [row] = await this.db
      .select()
      .from(incidentTypes)
      .where(
        eq(
          incidentTypes.code,
          code,
        ),
      )
      .limit(1)

    return row ? this.map(row) : null
  }

  async create(
    data: CreateIncidentTypeData,
  ): Promise<IncidentTypeModel> {
    await this.db
      .insert(incidentTypes)
      .values({
        id: uuidToBuffer(data.id),
        code: data.code,
        name: data.name,
        description: data.description,
        temporalMode:
          data.temporalMode,
        appointmentScope:
          data.appointmentScope,
        sortOrder: data.sortOrder,
      })

    const result =
      await this.findById(data.id)

    if (!result) {
      throw new Error(
        'Incident type persistence error',
      )
    }

    return result
  }

  async update(
    id: string,
    data: UpdateIncidentTypeData,
  ): Promise<IncidentTypeModel | null> {
    await this.db
      .update(incidentTypes)
      .set(data)
      .where(
        eq(
          incidentTypes.id,
          uuidToBuffer(id),
        ),
      )

    return this.findById(id)
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    updatedAt: Date,
  ): Promise<IncidentTypeModel | null> {
    await this.db
      .update(incidentTypes)
      .set({
        isActive,
        updatedAt,
      })
      .where(
        eq(
          incidentTypes.id,
          uuidToBuffer(id),
        ),
      )

    return this.findById(id)
  }
}
```

---

# PARTE IV — MÓDULO PRINCIPAL DE INCIDENCIAS

# 33. DTO 1 — Ocurrencia

## `apps/backend/src/modules/incidents/dto/incident-occurrence.dto.ts`

```typescript
import {
  IsDateString,
  IsOptional,
} from 'class-validator'

export class IncidentOccurrenceDto {
  @IsDateString()
  startDate!: string

  @IsOptional()
  @IsDateString()
  endDate?: string | null
}
```

---

# 34. DTO 2 — Crear incidencia

## `apps/backend/src/modules/incidents/dto/create-incident.dto.ts`

```typescript
import {
  Type,
} from 'class-transformer'

import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'

import type {
  CreateIncidentRequest,
} from '@sigip/shared'

import {
  IncidentOccurrenceDto,
} from './incident-occurrence.dto'

export class CreateIncidentDto
  implements CreateIncidentRequest
{
  @IsUUID()
  employeeId!: string

  @IsUUID()
  employeeAssignmentId!: string

  @IsUUID()
  incidentTypeId!: string

  @IsOptional()
  @IsDateString()
  issuedDate?: string | null

  @IsDateString()
  receivedAt!: string

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  referenceYear?: number | null

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  observations?: string | null

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(
    () => IncidentOccurrenceDto,
  )
  occurrences!: IncidentOccurrenceDto[]
}
```

---

# 35. DTO 3 — Actualizar incidencia

## `apps/backend/src/modules/incidents/dto/update-incident.dto.ts`

```typescript
import {
  Type,
} from 'class-transformer'

import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'

import type {
  UpdateIncidentRequest,
} from '@sigip/shared'

import {
  IncidentOccurrenceDto,
} from './incident-occurrence.dto'

export class UpdateIncidentDto
  implements UpdateIncidentRequest
{
  @IsOptional()
  @IsUUID()
  incidentTypeId?: string

  @IsOptional()
  @IsDateString()
  issuedDate?: string | null

  @IsOptional()
  @IsDateString()
  receivedAt?: string

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  referenceYear?: number | null

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  observations?: string | null

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(
    () => IncidentOccurrenceDto,
  )
  occurrences?: IncidentOccurrenceDto[]
}
```

---

# 36. DTO 4 — Cancelar incidencia

## `apps/backend/src/modules/incidents/dto/cancel-incident.dto.ts`

```typescript
import type {
  CancelIncidentRequest,
} from '@sigip/shared'

import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CancelIncidentDto
  implements CancelIncidentRequest
{
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  reason!: string
}
```

---

# 37. DTO 5 — ID

## `apps/backend/src/modules/incidents/dto/incident-id-param.dto.ts`

```typescript
import {
  IsUUID,
} from 'class-validator'

export class IncidentIdParamDto {
  @IsUUID()
  id!: string
}
```

---

# 38. DTO 6 — Listado

## `apps/backend/src/modules/incidents/dto/list-incidents-query.dto.ts`

```typescript
import {
  Type,
} from 'class-transformer'

import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator'

import {
  INCIDENT_STATUSES,
  type IncidentStatus,
} from '@sigip/shared'

export class ListIncidentsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsIn(INCIDENT_STATUSES)
  status?: IncidentStatus

  @IsOptional()
  @IsUUID()
  employeeId?: string

  @IsOptional()
  @IsUUID()
  incidentTypeId?: string

  @IsOptional()
  @IsUUID()
  organizationalUnitId?: string

  @IsOptional()
  @IsDateString()
  from?: string

  @IsOptional()
  @IsDateString()
  to?: string

  @IsOptional()
  @IsString()
  sort?: string
}
```

Hasta aquí mencionamos seis DTOs y están los seis completos.

---

# 39. Modelo de ocurrencia

## `apps/backend/src/modules/incidents/models/incident-occurrence.model.ts`

```typescript
export interface IncidentOccurrenceModel {
  id: string
  incidentId: string

  startDate: Date
  endDate: Date | null

  createdAt: Date
}
```

---

# 40. Modelo de incidencia

## `apps/backend/src/modules/incidents/models/incident.model.ts`

```typescript
import type {
  IncidentStatus,
} from '@sigip/shared'

import type {
  IncidentOccurrenceModel,
} from './incident-occurrence.model'

export interface IncidentModel {
  id: string

  employeeId: string
  employeeAssignmentId: string
  incidentTypeId: string

  issuedDate: Date | null
  receivedAt: Date

  referenceYear: number | null

  observations: string | null

  status: IncidentStatus

  registeredBy: string
  updatedBy: string | null

  cancelledAt: Date | null
  cancelledBy: string | null
  cancellationReason: string | null

  createdAt: Date
  updatedAt: Date
}

export interface IncidentDetailsModel
  extends IncidentModel
{
  employee: {
    id: string
    employeeNumber: string
    fullName: string
  }

  assignment: {
    id: string
    appointmentType: string
    schedule: string | null
    effectiveFrom: Date
    effectiveTo: Date | null

    organizationalUnit: {
      id: string
      code: string
      name: string
    }

    position: {
      id: string
      code: string
      name: string
    }
  }

  incidentType: {
    id: string
    code: string
    name: string
    temporalMode:
      | 'SINGLE_DATE'
      | 'MULTIPLE_DATES'
      | 'DATE_RANGE'
    appointmentScope:
      | 'ALL'
      | 'BASE'
      | 'CONFIANZA'
  }

  occurrences:
    IncidentOccurrenceModel[]

  registeredByUser: {
    id: string
    username: string
    fullName: string
  }
}
```

---

# 41. Tipos internos

## `apps/backend/src/modules/incidents/types/incidents.types.ts`

```typescript
import type {
  IncidentStatus,
} from '@sigip/shared'

export interface IncidentFilters {
  page: number
  limit: number

  search?: string
  status?: IncidentStatus

  employeeId?: string
  incidentTypeId?: string
  organizationalUnitId?: string

  from?: Date
  to?: Date

  sort?: string
}

export interface IncidentOccurrenceData {
  id: string
  startDate: Date
  endDate: Date | null
}

export interface CreateIncidentData {
  incident: {
    id: string

    employeeId: string
    employeeAssignmentId: string
    incidentTypeId: string

    issuedDate: Date | null
    receivedAt: Date

    referenceYear: number | null

    observations: string | null

    registeredBy: string
  }

  occurrences:
    IncidentOccurrenceData[]

  document: {
    id: string
    documentTypeId: string

    originalName: string
    storedName: string
    storagePath: string

    mimeType: string
    sizeBytes: number
    contentHash: string

    uploadedBy: string
  }

  audit: {
    id: string
    userId: string
    sessionId: string
  }
}

export interface UpdateIncidentData {
  incidentTypeId?: string

  issuedDate?: Date | null
  receivedAt?: Date

  referenceYear?: number | null

  observations?: string | null

  occurrences?:
    IncidentOccurrenceData[]

  updatedBy: string
  updatedAt: Date

  auditId: string
  sessionId: string
}

export interface CancelIncidentData {
  cancelledAt: Date
  cancelledBy: string
  cancellationReason: string

  updatedAt: Date

  auditId: string
  sessionId: string
}

export interface IncidentCreationContext {
  employee: {
    id: string
    status: string
  } | null

  assignment: {
    id: string
    employeeId: string
    appointmentType: string
    effectiveFrom: Date
    effectiveTo: Date | null
  } | null

  incidentType: {
    id: string
    code: string
    temporalMode:
      | 'SINGLE_DATE'
      | 'MULTIPLE_DATES'
      | 'DATE_RANGE'
    appointmentScope:
      | 'ALL'
      | 'BASE'
      | 'CONFIANZA'
    isActive: boolean
  } | null

  formDocumentType: {
    id: string
  } | null
}
```

---

# 42. Repository abstracto

## `apps/backend/src/modules/incidents/repositories/incidents.repository.ts`

```typescript
import type {
  PaginatedResult,
} from '../../../common/pagination/types/pagination.types'

import type {
  IncidentDetailsModel,
} from '../models/incident.model'

import type {
  CancelIncidentData,
  CreateIncidentData,
  IncidentCreationContext,
  IncidentFilters,
  UpdateIncidentData,
} from '../types/incidents.types'

export abstract class IncidentsRepository {
  abstract findAll(
    filters: IncidentFilters,
  ): Promise<
    PaginatedResult<IncidentDetailsModel>
  >

  abstract findById(
    id: string,
  ): Promise<IncidentDetailsModel | null>

  abstract findCreationContext(
    employeeId: string,
    assignmentId: string,
    incidentTypeId: string,
  ): Promise<IncidentCreationContext>

  abstract create(
    data: CreateIncidentData,
  ): Promise<IncidentDetailsModel>

  abstract update(
    id: string,
    data: UpdateIncidentData,
  ): Promise<IncidentDetailsModel | null>

  abstract cancel(
    id: string,
    data: CancelIncidentData,
  ): Promise<IncidentDetailsModel | null>
}
```

---

# 43. Errores completos

## `apps/backend/src/modules/incidents/incidents.errors.ts`

```typescript
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'

export class IncidentNotFoundError
  extends NotFoundException
{
  constructor(id: string) {
    super(
      `No se encontró la incidencia "${id}"`,
    )
  }
}

export class IncidentEmployeeNotFoundError
  extends BadRequestException
{
  constructor() {
    super(
      'El empleado indicado no existe',
    )
  }
}

export class InactiveIncidentEmployeeError
  extends BadRequestException
{
  constructor() {
    super(
      'No se pueden registrar incidencias para un empleado inactivo',
    )
  }
}

export class InvalidIncidentAssignmentError
  extends BadRequestException
{
  constructor() {
    super(
      'La asignación indicada no pertenece al empleado',
    )
  }
}

export class IncidentTypeNotAvailableError
  extends BadRequestException
{
  constructor() {
    super(
      'El tipo de incidencia indicado no existe o está inactivo',
    )
  }
}

export class InvalidIncidentAppointmentScopeError
  extends BadRequestException
{
  constructor() {
    super(
      'El tipo de incidencia no es válido para el nombramiento del empleado',
    )
  }
}

export class InvalidIncidentTemporalModeError
  extends BadRequestException
{
  constructor() {
    super(
      'Las fechas capturadas no coinciden con la modalidad temporal del tipo de incidencia',
    )
  }
}

export class InvalidIncidentDateError
  extends BadRequestException
{
  constructor() {
    super(
      'Una o más fechas de la incidencia no son válidas',
    )
  }
}

export class DuplicateIncidentOccurrenceError
  extends ConflictException
{
  constructor() {
    super(
      'La incidencia contiene fechas u ocurrencias duplicadas',
    )
  }
}

export class IncidentOutsideAssignmentPeriodError
  extends BadRequestException
{
  constructor() {
    super(
      'Una o más fechas de la incidencia están fuera de la vigencia de la asignación laboral',
    )
  }
}

export class IncidentFormRequiredError
  extends BadRequestException
{
  constructor() {
    super(
      'El formato de incidencia en PDF es obligatorio',
    )
  }
}

export class IncidentFormDocumentTypeMissingError
  extends BadRequestException
{
  constructor() {
    super(
      'No se encuentra configurado el tipo de documento FORMATO_INCIDENCIA',
    )
  }
}

export class CancelledIncidentModificationError
  extends ConflictException
{
  constructor() {
    super(
      'Una incidencia cancelada no puede modificarse',
    )
  }
}

export class IncidentAlreadyCancelledError
  extends ConflictException
{
  constructor() {
    super(
      'La incidencia ya se encuentra cancelada',
    )
  }
}

export class IncidentPersistenceError
  extends BadRequestException
{
  constructor() {
    super(
      'No fue posible guardar la incidencia',
    )
  }
}
```

---

# 44. Presenter

## `apps/backend/src/modules/incidents/presenters/incident.presenter.ts`

```typescript
import type {
  IncidentResponse,
} from '@sigip/shared'

import type {
  IncidentDetailsModel,
} from '../models/incident.model'

function formatDate(
  value: Date | null,
): string | null {
  return value
    ? value.toISOString().slice(0, 10)
    : null
}

export function toIncidentResponse(
  model: IncidentDetailsModel,
): IncidentResponse {
  return {
    id: model.id,

    employeeId: model.employeeId,
    employeeAssignmentId:
      model.employeeAssignmentId,
    incidentTypeId:
      model.incidentTypeId,

    employee: model.employee,

    assignment: {
      id: model.assignment.id,
      appointmentType:
        model.assignment.appointmentType,
      schedule:
        model.assignment.schedule,
      effectiveFrom:
        formatDate(
          model.assignment.effectiveFrom,
        )!,
      effectiveTo:
        formatDate(
          model.assignment.effectiveTo,
        ),
      organizationalUnit:
        model.assignment.organizationalUnit,
      position:
        model.assignment.position,
    },

    incidentType:
      model.incidentType,

    issuedDate:
      formatDate(model.issuedDate),

    receivedAt:
      model.receivedAt.toISOString(),

    referenceYear:
      model.referenceYear,

    observations:
      model.observations,

    status:
      model.status,

    occurrences:
      model.occurrences.map(
        (occurrence) => ({
          id: occurrence.id,
          startDate:
            formatDate(
              occurrence.startDate,
            )!,
          endDate:
            formatDate(
              occurrence.endDate,
            ),
        }),
      ),

    registeredBy:
      model.registeredByUser,

    cancelledAt:
      model.cancelledAt?.toISOString()
      ?? null,

    cancellationReason:
      model.cancellationReason,

    createdAt:
      model.createdAt.toISOString(),

    updatedAt:
      model.updatedAt.toISOString(),
  }
}
```

---

# 45. Servicio de almacenamiento

## `apps/backend/src/modules/documents/storage/document-storage.service.ts`

```typescript
import {
  Injectable,
} from '@nestjs/common'

import {
  createHash,
} from 'node:crypto'

import {
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'

import {
  dirname,
  resolve,
} from 'node:path'

@Injectable()
export class DocumentStorageService {
  private readonly root =
    resolve(
      process.cwd(),
      'storage',
    )

  async storeIncidentForm(
    incidentId: string,
    documentId: string,
    file: Express.Multer.File,
  ) {
    const storedName =
      `${documentId}.pdf`

    const relativePath =
      `incidents/${incidentId}/${storedName}`

    const absolutePath =
      resolve(
        this.root,
        relativePath,
      )

    await mkdir(
      dirname(absolutePath),
      {
        recursive: true,
      },
    )

    await writeFile(
      absolutePath,
      file.buffer,
    )

    const contentHash =
      createHash('sha256')
        .update(file.buffer)
        .digest('hex')

    return {
      storedName,
      storagePath:
        relativePath.replaceAll(
          '\\',
          '/',
        ),
      contentHash,
    }
  }

  async remove(
    storagePath: string,
  ): Promise<void> {
    const absolutePath =
      resolve(
        this.root,
        storagePath,
      )

    await rm(
      absolutePath,
      {
        force: true,
      },
    )
  }

  async read(
    storagePath: string,
  ): Promise<Buffer> {
    return readFile(
      resolve(
        this.root,
        storagePath,
      ),
    )
  }
}
```

---

# 46. Service principal de incidencias

## `apps/backend/src/modules/incidents/incidents.service.ts`

```typescript
import {
  Injectable,
} from '@nestjs/common'

import {
  generateUuidV7,
} from '../../common/utils/generate-uuid-v7.util'

import type {
  AuthenticatedUserModel,
} from '../auth/models/authenticated-user.model'

import {
  DocumentStorageService,
} from '../documents/storage/document-storage.service'

import {
  CancelIncidentDto,
} from './dto/cancel-incident.dto'

import {
  CreateIncidentDto,
} from './dto/create-incident.dto'

import {
  ListIncidentsQueryDto,
} from './dto/list-incidents-query.dto'

import {
  UpdateIncidentDto,
} from './dto/update-incident.dto'

import {
  CancelledIncidentModificationError,
  DuplicateIncidentOccurrenceError,
  InactiveIncidentEmployeeError,
  IncidentAlreadyCancelledError,
  IncidentEmployeeNotFoundError,
  IncidentFormDocumentTypeMissingError,
  IncidentFormRequiredError,
  IncidentNotFoundError,
  IncidentOutsideAssignmentPeriodError,
  IncidentPersistenceError,
  IncidentTypeNotAvailableError,
  InvalidIncidentAppointmentScopeError,
  InvalidIncidentAssignmentError,
  InvalidIncidentDateError,
  InvalidIncidentTemporalModeError,
} from './incidents.errors'

import {
  IncidentsRepository,
} from './repositories/incidents.repository'

import type {
  IncidentOccurrenceData,
} from './types/incidents.types'

@Injectable()
export class IncidentsService {
  constructor(
    private readonly repository:
      IncidentsRepository,

    private readonly storage:
      DocumentStorageService,
  ) {}

  private parseDate(
    value: string,
  ): Date {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        value,
      )
    ) {
      throw new InvalidIncidentDateError()
    }

    const date =
      new Date(
        `${value}T00:00:00.000Z`,
      )

    if (
      Number.isNaN(
        date.getTime(),
      ) ||
      date
        .toISOString()
        .slice(0, 10) !== value
    ) {
      throw new InvalidIncidentDateError()
    }

    return date
  }

  private parseNullableDate(
    value?: string | null,
  ): Date | null {
    return value
      ? this.parseDate(value)
      : null
  }

  private parseDateTime(
    value: string,
  ): Date {
    const result = new Date(value)

    if (
      Number.isNaN(
        result.getTime(),
      )
    ) {
      throw new InvalidIncidentDateError()
    }

    return result
  }

  private normalizeOccurrences(
    occurrences: {
      startDate: string
      endDate?: string | null
    }[],
  ): IncidentOccurrenceData[] {
    const normalized =
      occurrences.map(
        (occurrence) => {
          const startDate =
            this.parseDate(
              occurrence.startDate,
            )

          const endDate =
            this.parseNullableDate(
              occurrence.endDate,
            )

          if (
            endDate &&
            endDate.getTime() <
              startDate.getTime()
          ) {
            throw new InvalidIncidentDateError()
          }

          return {
            id: generateUuidV7(),
            startDate,
            endDate,
          }
        },
      )

    const keys =
      normalized.map(
        (occurrence) =>
          `${occurrence.startDate
            .toISOString()
            .slice(0, 10)}|${
            occurrence.endDate
              ?.toISOString()
              .slice(0, 10)
            ?? ''
          }`,
      )

    if (
      new Set(keys).size !==
      keys.length
    ) {
      throw new DuplicateIncidentOccurrenceError()
    }

    return normalized
  }

  private validateTemporalMode(
    temporalMode:
      | 'SINGLE_DATE'
      | 'MULTIPLE_DATES'
      | 'DATE_RANGE',

    occurrences:
      IncidentOccurrenceData[],
  ): void {
    switch (temporalMode) {
      case 'SINGLE_DATE':
        if (
          occurrences.length !== 1 ||
          occurrences[0].endDate !== null
        ) {
          throw new InvalidIncidentTemporalModeError()
        }
        return

      case 'MULTIPLE_DATES':
        if (
          occurrences.some(
            (occurrence) =>
              occurrence.endDate !== null,
          )
        ) {
          throw new InvalidIncidentTemporalModeError()
        }
        return

      case 'DATE_RANGE':
        if (
          occurrences.length !== 1 ||
          occurrences[0].endDate === null
        ) {
          throw new InvalidIncidentTemporalModeError()
        }
        return
    }
  }

  private validateAppointmentScope(
    scope:
      | 'ALL'
      | 'BASE'
      | 'CONFIANZA',

    appointmentType: string,
  ): void {
    if (scope === 'ALL') {
      return
    }

    if (
      scope !== appointmentType
    ) {
      throw new InvalidIncidentAppointmentScopeError()
    }
  }

  private validateAssignmentCoverage(
    effectiveFrom: Date,
    effectiveTo: Date | null,
    occurrences:
      IncidentOccurrenceData[],
  ): void {
    for (
      const occurrence
      of occurrences
    ) {
      const end =
        occurrence.endDate
        ?? occurrence.startDate

      if (
        occurrence.startDate <
          effectiveFrom
      ) {
        throw new IncidentOutsideAssignmentPeriodError()
      }

      if (
        effectiveTo &&
        end > effectiveTo
      ) {
        throw new IncidentOutsideAssignmentPeriodError()
      }
    }
  }

  async findAll(
    query: ListIncidentsQueryDto,
  ) {
    return this.repository.findAll({
      page: query.page,
      limit: query.limit,

      search:
        query.search?.trim(),

      status:
        query.status,

      employeeId:
        query.employeeId,

      incidentTypeId:
        query.incidentTypeId,

      organizationalUnitId:
        query.organizationalUnitId,

      from:
        query.from
          ? this.parseDate(query.from)
          : undefined,

      to:
        query.to
          ? this.parseDate(query.to)
          : undefined,

      sort:
        query.sort,
    })
  }

  async findById(
    id: string,
  ) {
    const incident =
      await this.repository.findById(id)

    if (!incident) {
      throw new IncidentNotFoundError(id)
    }

    return incident
  }

  async create(
    dto: CreateIncidentDto,
    file: Express.Multer.File | undefined,
    actor: AuthenticatedUserModel,
  ) {
    if (!file) {
      throw new IncidentFormRequiredError()
    }

    const context =
      await this.repository
        .findCreationContext(
          dto.employeeId,
          dto.employeeAssignmentId,
          dto.incidentTypeId,
        )

    if (!context.employee) {
      throw new IncidentEmployeeNotFoundError()
    }

    if (
      context.employee.status !==
      'ACTIVE'
    ) {
      throw new InactiveIncidentEmployeeError()
    }

    if (!context.assignment) {
      throw new InvalidIncidentAssignmentError()
    }

    if (
      context.assignment.employeeId !==
      dto.employeeId
    ) {
      throw new InvalidIncidentAssignmentError()
    }

    if (
      !context.incidentType ||
      !context.incidentType.isActive
    ) {
      throw new IncidentTypeNotAvailableError()
    }

    if (
      !context.formDocumentType
    ) {
      throw new IncidentFormDocumentTypeMissingError()
    }

    this.validateAppointmentScope(
      context.incidentType
        .appointmentScope,
      context.assignment
        .appointmentType,
    )

    const occurrences =
      this.normalizeOccurrences(
        dto.occurrences,
      )

    this.validateTemporalMode(
      context.incidentType
        .temporalMode,
      occurrences,
    )

    this.validateAssignmentCoverage(
      context.assignment
        .effectiveFrom,
      context.assignment
        .effectiveTo,
      occurrences,
    )

    const incidentId =
      generateUuidV7()

    const documentId =
      generateUuidV7()

    const stored =
      await this.storage
        .storeIncidentForm(
          incidentId,
          documentId,
          file,
        )

    try {
      return await this.repository.create({
        incident: {
          id: incidentId,

          employeeId:
            dto.employeeId,

          employeeAssignmentId:
            dto.employeeAssignmentId,

          incidentTypeId:
            dto.incidentTypeId,

          issuedDate:
            this.parseNullableDate(
              dto.issuedDate,
            ),

          receivedAt:
            this.parseDateTime(
              dto.receivedAt,
            ),

          referenceYear:
            dto.referenceYear
            ?? null,

          observations:
            dto.observations
              ?.trim()
            || null,

          registeredBy:
            actor.userId,
        },

        occurrences,

        document: {
          id: documentId,

          documentTypeId:
            context
              .formDocumentType
              .id,

          originalName:
            file.originalname,

          storedName:
            stored.storedName,

          storagePath:
            stored.storagePath,

          mimeType:
            file.mimetype,

          sizeBytes:
            file.size,

          contentHash:
            stored.contentHash,

          uploadedBy:
            actor.userId,
        },

        audit: {
          id: generateUuidV7(),
          userId:
            actor.userId,
          sessionId:
            actor.sessionId,
        },
      })
    } catch {
      await this.storage.remove(
        stored.storagePath,
      )

      throw new IncidentPersistenceError()
    }
  }

  async update(
    id: string,
    dto: UpdateIncidentDto,
    actor: AuthenticatedUserModel,
  ) {
    const current =
      await this.findById(id)

    if (
      current.status ===
      'CANCELLED'
    ) {
      throw new CancelledIncidentModificationError()
    }

    const incidentTypeId =
      dto.incidentTypeId
      ?? current.incidentTypeId

    const context =
      await this.repository
        .findCreationContext(
          current.employeeId,
          current.employeeAssignmentId,
          incidentTypeId,
        )

    if (
      !context.incidentType ||
      !context.incidentType.isActive
    ) {
      throw new IncidentTypeNotAvailableError()
    }

    if (!context.assignment) {
      throw new InvalidIncidentAssignmentError()
    }

    this.validateAppointmentScope(
      context.incidentType
        .appointmentScope,
      context.assignment
        .appointmentType,
    )

    const occurrences =
      dto.occurrences
        ? this.normalizeOccurrences(
            dto.occurrences,
          )
        : undefined

    if (occurrences) {
      this.validateTemporalMode(
        context.incidentType
          .temporalMode,
        occurrences,
      )

      this.validateAssignmentCoverage(
        context.assignment
          .effectiveFrom,
        context.assignment
          .effectiveTo,
        occurrences,
      )
    }

    const result =
      await this.repository.update(
        id,
        {
          incidentTypeId:
            dto.incidentTypeId,

          issuedDate:
            dto.issuedDate !==
            undefined
              ? this.parseNullableDate(
                  dto.issuedDate,
                )
              : undefined,

          receivedAt:
            dto.receivedAt
              ? this.parseDateTime(
                  dto.receivedAt,
                )
              : undefined,

          referenceYear:
            dto.referenceYear,

          observations:
            dto.observations !==
            undefined
              ? dto.observations
                  ?.trim()
                || null
              : undefined,

          occurrences,

          updatedBy:
            actor.userId,

          updatedAt:
            new Date(),

          auditId:
            generateUuidV7(),

          sessionId:
            actor.sessionId,
        },
      )

    if (!result) {
      throw new IncidentNotFoundError(id)
    }

    return result
  }

  async cancel(
    id: string,
    dto: CancelIncidentDto,
    actor: AuthenticatedUserModel,
  ) {
    const current =
      await this.findById(id)

    if (
      current.status ===
      'CANCELLED'
    ) {
      throw new IncidentAlreadyCancelledError()
    }

    const now = new Date()

    const result =
      await this.repository.cancel(
        id,
        {
          cancelledAt: now,
          cancelledBy:
            actor.userId,

          cancellationReason:
            dto.reason.trim(),

          updatedAt: now,

          auditId:
            generateUuidV7(),

          sessionId:
            actor.sessionId,
        },
      )

    if (!result) {
      throw new IncidentNotFoundError(id)
    }

    return result
  }
}
```

---

# 47. Parseo del JSON multipart

Para no enviar veinte campos de `FormData` independientes, el frontend enviará:

```text
data = JSON.stringify(...)
file = PDF
```

Necesitamos un pipe reusable.

## `apps/backend/src/common/pipes/parse-json-dto.pipe.ts`

```typescript
import {
  BadRequestException,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common'

import {
  plainToInstance,
} from 'class-transformer'

import {
  validate,
} from 'class-validator'

@Injectable()
export class ParseJsonDtoPipe<T>
  implements PipeTransform<string, Promise<T>>
{
  constructor(
    private readonly dtoClass:
      Type<T>,
  ) {}

  async transform(
    value: string,
  ): Promise<T> {
    let parsed: unknown

    try {
      parsed = JSON.parse(value)
    } catch {
      throw new BadRequestException(
        'El campo data debe contener JSON válido',
      )
    }

    const instance =
      plainToInstance(
        this.dtoClass,
        parsed,
      )

    const errors =
      await validate(
        instance as object,
      )

    if (errors.length > 0) {
      throw new BadRequestException(
        errors,
      )
    }

    return instance
  }
}
```

---

# 48. Controller completo

## `apps/backend/src/modules/incidents/incidents.controller.ts`

```typescript
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'

import {
  FileInterceptor,
} from '@nestjs/platform-express'

import {
  memoryStorage,
} from 'multer'

import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common'

import type {
  IncidentResponse,
  IncidentsResponse,
} from '@sigip/shared'

import {
  CurrentUser,
} from '../../common/decorators/current-user.decorator'

import {
  RequirePermissions,
} from '../../common/decorators/require-permissions.decorator'

import type {
  AuthenticatedUserModel,
} from '../auth/models/authenticated-user.model'

import {
  toPaginatedResponse,
} from '../../common/pagination/presenters/pagination.presenter'

import {
  ParseJsonDtoPipe,
} from '../../common/pipes/parse-json-dto.pipe'

import {
  CancelIncidentDto,
} from './dto/cancel-incident.dto'

import {
  CreateIncidentDto,
} from './dto/create-incident.dto'

import {
  IncidentIdParamDto,
} from './dto/incident-id-param.dto'

import {
  ListIncidentsQueryDto,
} from './dto/list-incidents-query.dto'

import {
  UpdateIncidentDto,
} from './dto/update-incident.dto'

import {
  IncidentsService,
} from './incidents.service'

import {
  toIncidentResponse,
} from './presenters/incident.presenter'

@Controller('incidents')
@RequirePermissions('incidents:read')
export class IncidentsController {
  constructor(
    private readonly service:
      IncidentsService,
  ) {}

  @Get()
  async findAll(
    @Query()
    query: ListIncidentsQueryDto,
  ): Promise<IncidentsResponse> {
    const result =
      await this.service.findAll(query)

    return toPaginatedResponse(
      result.items,
      result.total,
      query.page,
      query.limit,
      toIncidentResponse,
    )
  }

  @Get(':id')
  async findById(
    @Param()
    params: IncidentIdParamDto,
  ): Promise<IncidentResponse> {
    return toIncidentResponse(
      await this.service.findById(
        params.id,
      ),
    )
  }

  @Post()
  @RequirePermissions('incidents:create')
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage:
          memoryStorage(),
      },
    ),
  )
  async create(
    @Body(
      'data',
      new ParseJsonDtoPipe(
        CreateIncidentDto,
      ),
    )
    dto: CreateIncidentDto,

    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize:
              10 * 1024 * 1024,
          }),

          new FileTypeValidator({
            fileType:
              'application/pdf',
          }),
        ],

        fileIsRequired:
          true,
      }),
    )
    file: Express.Multer.File,

    @CurrentUser()
    actor: AuthenticatedUserModel,
  ): Promise<IncidentResponse> {
    return toIncidentResponse(
      await this.service.create(
        dto,
        file,
        actor,
      ),
    )
  }

  @Patch(':id')
  @RequirePermissions('incidents:update')
  async update(
    @Param()
    params: IncidentIdParamDto,

    @Body()
    dto: UpdateIncidentDto,

    @CurrentUser()
    actor: AuthenticatedUserModel,
  ): Promise<IncidentResponse> {
    return toIncidentResponse(
      await this.service.update(
        params.id,
        dto,
        actor,
      ),
    )
  }

  @Post(':id/cancel')
  @RequirePermissions('incidents:cancel')
  async cancel(
    @Param()
    params: IncidentIdParamDto,

    @Body()
    dto: CancelIncidentDto,

    @CurrentUser()
    actor: AuthenticatedUserModel,
  ): Promise<IncidentResponse> {
    return toIncidentResponse(
      await this.service.cancel(
        params.id,
        dto,
        actor,
      ),
    )
  }
}
```

NestJS soporta `multipart/form-data` mediante `FileInterceptor`, `UploadedFile`, `ParseFilePipe`, `FileTypeValidator` y `MaxFileSizeValidator`, que es precisamente el mecanismo utilizado aquí.

---

# 49. Módulo principal

## `apps/backend/src/modules/incidents/incidents.module.ts`

```typescript
import {
  Module,
} from '@nestjs/common'

import {
  DocumentsModule,
} from '../documents/documents.module'

import {
  IncidentsController,
} from './incidents.controller'

import {
  IncidentsService,
} from './incidents.service'

import {
  DrizzleIncidentsRepository,
} from './repositories/drizzle-incidents.repository'

import {
  IncidentsRepository,
} from './repositories/incidents.repository'

@Module({
  imports: [
    DocumentsModule,
  ],

  controllers: [
    IncidentsController,
  ],

  providers: [
    IncidentsService,

    {
      provide:
        IncidentsRepository,

      useClass:
        DrizzleIncidentsRepository,
    },
  ],

  exports: [
    IncidentsService,
    IncidentsRepository,
  ],
})
export class IncidentsModule {}
```

---

# 50. Implementación Drizzle

## `apps/backend/src/modules/incidents/repositories/drizzle-incidents.repository.ts`

Este es el archivo más grande porque concentra consultas y transacciones.

```typescript
import {
  Inject,
  Injectable,
} from '@nestjs/common'

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  like,
  lte,
  or,
} from 'drizzle-orm'

import {
  DRIZZLE_DATABASE,
} from '../../../database/database.constants'

import type {
  DrizzleDatabase,
} from '../../../database/database.types'

import {
  auditLogs,
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
} from '../../../database/schema'

import {
  bufferToUuid,
  uuidToBuffer,
} from '../../../database/utils/uuid.util'

import type {
  PaginatedResult,
} from '../../../common/pagination/types/pagination.types'

import type {
  IncidentDetailsModel,
} from '../models/incident.model'

import type {
  CancelIncidentData,
  CreateIncidentData,
  IncidentCreationContext,
  IncidentFilters,
  UpdateIncidentData,
} from '../types/incidents.types'

import {
  IncidentsRepository,
} from './incidents.repository'

@Injectable()
export class DrizzleIncidentsRepository
  implements IncidentsRepository
{
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db:
      DrizzleDatabase,
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
    ] = await Promise.all([
      this.db
        .select({
          id: employees.id,
          status: employees.status,
        })
        .from(employees)
        .where(
          eq(
            employees.id,
            uuidToBuffer(
              employeeId,
            ),
          ),
        )
        .limit(1),

      this.db
        .select({
          id:
            employeeAssignments.id,

          employeeId:
            employeeAssignments.employeeId,

          appointmentType:
            employeeAssignments.appointmentType,

          effectiveFrom:
            employeeAssignments.effectiveFrom,

          effectiveTo:
            employeeAssignments.effectiveTo,
        })
        .from(employeeAssignments)
        .where(
          eq(
            employeeAssignments.id,
            uuidToBuffer(
              assignmentId,
            ),
          ),
        )
        .limit(1),

      this.db
        .select()
        .from(incidentTypes)
        .where(
          eq(
            incidentTypes.id,
            uuidToBuffer(
              incidentTypeId,
            ),
          ),
        )
        .limit(1),

      this.db
        .select({
          id:
            documentTypes.id,
        })
        .from(documentTypes)
        .where(
          and(
            eq(
              documentTypes.code,
              'FORMATO_INCIDENCIA',
            ),
            eq(
              documentTypes.isActive,
              true,
            ),
          ),
        )
        .limit(1),
    ])

    const employee =
      employeeRows[0]

    const assignment =
      assignmentRows[0]

    const incidentType =
      incidentTypeRows[0]

    const formType =
      formTypeRows[0]

    return {
      employee:
        employee
          ? {
              id:
                bufferToUuid(
                  employee.id,
                ),
              status:
                employee.status,
            }
          : null,

      assignment:
        assignment
          ? {
              id:
                bufferToUuid(
                  assignment.id,
                ),

              employeeId:
                bufferToUuid(
                  assignment.employeeId,
                ),

              appointmentType:
                assignment.appointmentType,

              effectiveFrom:
                assignment.effectiveFrom,

              effectiveTo:
                assignment.effectiveTo,
            }
          : null,

      incidentType:
        incidentType
          ? {
              id:
                bufferToUuid(
                  incidentType.id,
                ),

              code:
                incidentType.code,

              temporalMode:
                incidentType.temporalMode
                  as IncidentCreationContext['incidentType'] extends infer T
                    ? T extends { temporalMode: infer M }
                      ? M
                      : never
                    : never,

              appointmentScope:
                incidentType.appointmentScope
                  as 'ALL'
                    | 'BASE'
                    | 'CONFIANZA',

              isActive:
                incidentType.isActive,
            }
          : null,

      formDocumentType:
        formType
          ? {
              id:
                bufferToUuid(
                  formType.id,
                ),
            }
          : null,
    }
  }

  async create(
    data: CreateIncidentData,
  ): Promise<IncidentDetailsModel> {
    await this.db.transaction(
      async (tx) => {
        await tx
          .insert(incidents)
          .values({
            id:
              uuidToBuffer(
                data.incident.id,
              ),

            employeeId:
              uuidToBuffer(
                data.incident
                  .employeeId,
              ),

            employeeAssignmentId:
              uuidToBuffer(
                data.incident
                  .employeeAssignmentId,
              ),

            incidentTypeId:
              uuidToBuffer(
                data.incident
                  .incidentTypeId,
              ),

            issuedDate:
              data.incident
                .issuedDate,

            receivedAt:
              data.incident
                .receivedAt,

            referenceYear:
              data.incident
                .referenceYear,

            observations:
              data.incident
                .observations,

            status:
              'REGISTERED',

            registeredBy:
              uuidToBuffer(
                data.incident
                  .registeredBy,
              ),
          })

        await tx
          .insert(
            incidentOccurrences,
          )
          .values(
            data.occurrences.map(
              (occurrence) => ({
                id:
                  uuidToBuffer(
                    occurrence.id,
                  ),

                incidentId:
                  uuidToBuffer(
                    data.incident.id,
                  ),

                startDate:
                  occurrence.startDate,

                endDate:
                  occurrence.endDate,
              }),
            ),
          )

        await tx
          .insert(documents)
          .values({
            id:
              uuidToBuffer(
                data.document.id,
              ),

            incidentId:
              uuidToBuffer(
                data.incident.id,
              ),

            documentTypeId:
              uuidToBuffer(
                data.document
                  .documentTypeId,
              ),

            originalName:
              data.document
                .originalName,

            storedName:
              data.document
                .storedName,

            storagePath:
              data.document
                .storagePath,

            mimeType:
              data.document
                .mimeType,

            sizeBytes:
              data.document
                .sizeBytes,

            contentHash:
              data.document
                .contentHash,

            uploadedBy:
              uuidToBuffer(
                data.document
                  .uploadedBy,
              ),
          })

        await tx
          .insert(auditLogs)
          .values({
            id:
              uuidToBuffer(
                data.audit.id,
              ),

            userId:
              uuidToBuffer(
                data.audit.userId,
              ),

            sessionId:
              uuidToBuffer(
                data.audit.sessionId,
              ),

            action:
              'INCIDENT_CREATED',

            entityType:
              'INCIDENT',

            entityId:
              uuidToBuffer(
                data.incident.id,
              ),

            newValues: {
              employeeId:
                data.incident
                  .employeeId,

              incidentTypeId:
                data.incident
                  .incidentTypeId,

              occurrences:
                data.occurrences.map(
                  (occurrence) => ({
                    startDate:
                      occurrence.startDate
                        .toISOString()
                        .slice(0, 10),

                    endDate:
                      occurrence.endDate
                        ?.toISOString()
                        .slice(0, 10)
                      ?? null,
                  }),
                ),
            },
          })
      },
    )

    const result =
      await this.findById(
        data.incident.id,
      )

    if (!result) {
      throw new Error(
        'Incident persistence error',
      )
    }

    return result
  }

  async findById(
    id: string,
  ): Promise<IncidentDetailsModel | null> {
    const [row] =
      await this.db
        .select({
          incident: incidents,

          employee: {
            id: employees.id,
            employeeNumber:
              employees.employeeNumber,
            fullName:
              employees.fullName,
          },

          assignment: {
            id:
              employeeAssignments.id,

            appointmentType:
              employeeAssignments.appointmentType,

            schedule:
              employeeAssignments.schedule,

            effectiveFrom:
              employeeAssignments.effectiveFrom,

            effectiveTo:
              employeeAssignments.effectiveTo,
          },

          organizationalUnit: {
            id:
              organizationalUnits.id,
            code:
              organizationalUnits.code,
            name:
              organizationalUnits.name,
          },

          position: {
            id: positions.id,
            code: positions.code,
            name: positions.name,
          },

          incidentType: {
            id:
              incidentTypes.id,
            code:
              incidentTypes.code,
            name:
              incidentTypes.name,
            temporalMode:
              incidentTypes.temporalMode,
            appointmentScope:
              incidentTypes.appointmentScope,
          },

          registeredBy: {
            id: users.id,
            username:
              users.username,
            fullName:
              users.fullName,
          },
        })
        .from(incidents)

        .innerJoin(
          employees,
          eq(
            incidents.employeeId,
            employees.id,
          ),
        )

        .innerJoin(
          employeeAssignments,
          eq(
            incidents.employeeAssignmentId,
            employeeAssignments.id,
          ),
        )

        .innerJoin(
          organizationalUnits,
          eq(
            employeeAssignments
              .organizationalUnitId,
            organizationalUnits.id,
          ),
        )

        .innerJoin(
          positions,
          eq(
            employeeAssignments.positionId,
            positions.id,
          ),
        )

        .innerJoin(
          incidentTypes,
          eq(
            incidents.incidentTypeId,
            incidentTypes.id,
          ),
        )

        .innerJoin(
          users,
          eq(
            incidents.registeredBy,
            users.id,
          ),
        )

        .where(
          eq(
            incidents.id,
            uuidToBuffer(id),
          ),
        )

        .limit(1)

    if (!row) {
      return null
    }

    const occurrenceRows =
      await this.db
        .select()
        .from(
          incidentOccurrences,
        )
        .where(
          eq(
            incidentOccurrences.incidentId,
            uuidToBuffer(id),
          ),
        )
        .orderBy(
          asc(
            incidentOccurrences.startDate,
          ),
        )

    return {
      id:
        bufferToUuid(
          row.incident.id,
        ),

      employeeId:
        bufferToUuid(
          row.incident.employeeId,
        ),

      employeeAssignmentId:
        bufferToUuid(
          row.incident
            .employeeAssignmentId,
        ),

      incidentTypeId:
        bufferToUuid(
          row.incident.incidentTypeId,
        ),

      issuedDate:
        row.incident.issuedDate,

      receivedAt:
        row.incident.receivedAt,

      referenceYear:
        row.incident.referenceYear,

      observations:
        row.incident.observations,

      status:
        row.incident.status
          as IncidentDetailsModel['status'],

      registeredBy:
        bufferToUuid(
          row.incident.registeredBy,
        ),

      updatedBy:
        row.incident.updatedBy
          ? bufferToUuid(
              row.incident.updatedBy,
            )
          : null,

      cancelledAt:
        row.incident.cancelledAt,

      cancelledBy:
        row.incident.cancelledBy
          ? bufferToUuid(
              row.incident.cancelledBy,
            )
          : null,

      cancellationReason:
        row.incident
          .cancellationReason,

      createdAt:
        row.incident.createdAt,

      updatedAt:
        row.incident.updatedAt,

      employee: {
        id:
          bufferToUuid(
            row.employee.id,
          ),

        employeeNumber:
          row.employee
            .employeeNumber,

        fullName:
          row.employee.fullName,
      },

      assignment: {
        id:
          bufferToUuid(
            row.assignment.id,
          ),

        appointmentType:
          row.assignment
            .appointmentType,

        schedule:
          row.assignment.schedule,

        effectiveFrom:
          row.assignment
            .effectiveFrom,

        effectiveTo:
          row.assignment
            .effectiveTo,

        organizationalUnit: {
          id:
            bufferToUuid(
              row.organizationalUnit.id,
            ),
          code:
            row.organizationalUnit.code,
          name:
            row.organizationalUnit.name,
        },

        position: {
          id:
            bufferToUuid(
              row.position.id,
            ),
          code:
            row.position.code,
          name:
            row.position.name,
        },
      },

      incidentType: {
        id:
          bufferToUuid(
            row.incidentType.id,
          ),
        code:
          row.incidentType.code,
        name:
          row.incidentType.name,
        temporalMode:
          row.incidentType.temporalMode
            as IncidentDetailsModel['incidentType']['temporalMode'],
        appointmentScope:
          row.incidentType.appointmentScope
            as IncidentDetailsModel['incidentType']['appointmentScope'],
      },

      occurrences:
        occurrenceRows.map(
          (occurrence) => ({
            id:
              bufferToUuid(
                occurrence.id,
              ),

            incidentId:
              bufferToUuid(
                occurrence.incidentId,
              ),

            startDate:
              occurrence.startDate,

            endDate:
              occurrence.endDate,

            createdAt:
              occurrence.createdAt,
          }),
        ),

      registeredByUser: {
        id:
          bufferToUuid(
            row.registeredBy.id,
          ),

        username:
          row.registeredBy.username,

        fullName:
          row.registeredBy.fullName,
      },
    }
  }

  async findAll(
    filters: IncidentFilters,
  ): Promise<
    PaginatedResult<IncidentDetailsModel>
  > {
    const conditions = []

    if (filters.status) {
      conditions.push(
        eq(
          incidents.status,
          filters.status,
        ),
      )
    }

    if (filters.employeeId) {
      conditions.push(
        eq(
          incidents.employeeId,
          uuidToBuffer(
            filters.employeeId,
          ),
        ),
      )
    }

    if (filters.incidentTypeId) {
      conditions.push(
        eq(
          incidents.incidentTypeId,
          uuidToBuffer(
            filters.incidentTypeId,
          ),
        ),
      )
    }

    if (
      filters.organizationalUnitId
    ) {
      conditions.push(
        eq(
          employeeAssignments
            .organizationalUnitId,

          uuidToBuffer(
            filters.organizationalUnitId,
          ),
        ),
      )
    }

    if (filters.search) {
      const search =
        `%${filters.search}%`

      conditions.push(
        or(
          like(
            employees.fullName,
            search,
          ),

          like(
            employees.employeeNumber,
            search,
          ),

          like(
            incidentTypes.name,
            search,
          ),
        ),
      )
    }

    if (filters.from) {
      conditions.push(
        gte(
          incidentOccurrences.startDate,
          filters.from,
        ),
      )
    }

    if (filters.to) {
      conditions.push(
        lte(
          incidentOccurrences.startDate,
          filters.to,
        ),
      )
    }

    const where =
      conditions.length > 0
        ? and(...conditions)
        : undefined

    const offset =
      (filters.page - 1)
      * filters.limit

    const idRows =
      await this.db
        .selectDistinct({
          id: incidents.id,
        })
        .from(incidents)

        .innerJoin(
          employees,
          eq(
            incidents.employeeId,
            employees.id,
          ),
        )

        .innerJoin(
          employeeAssignments,
          eq(
            incidents.employeeAssignmentId,
            employeeAssignments.id,
          ),
        )

        .innerJoin(
          incidentTypes,
          eq(
            incidents.incidentTypeId,
            incidentTypes.id,
          ),
        )

        .innerJoin(
          incidentOccurrences,
          eq(
            incidentOccurrences.incidentId,
            incidents.id,
          ),
        )

        .where(where)

        .orderBy(
          desc(
            incidents.createdAt,
          ),
        )

        .limit(filters.limit)
        .offset(offset)

    const totalRows =
      await this.db
        .select({
          value:
            count(
              incidents.id,
            ),
        })
        .from(incidents)

        .innerJoin(
          employees,
          eq(
            incidents.employeeId,
            employees.id,
          ),
        )

        .innerJoin(
          employeeAssignments,
          eq(
            incidents.employeeAssignmentId,
            employeeAssignments.id,
          ),
        )

        .innerJoin(
          incidentTypes,
          eq(
            incidents.incidentTypeId,
            incidentTypes.id,
          ),
        )

        .where(
          conditions
            .filter(
              () => true,
            )
            .length > 0
            ? and(
                ...conditions.filter(
                  (condition) =>
                    condition !== undefined,
                ),
              )
            : undefined,
        )

    const items =
      await Promise.all(
        idRows.map(
          async ({ id }) =>
            this.findById(
              bufferToUuid(id),
            ),
        ),
      )

    return {
      items:
        items.filter(
          (
            item,
          ): item is IncidentDetailsModel =>
            item !== null,
        ),

      total:
        Number(
          totalRows[0]?.value
          ?? 0,
        ),
    }
  }

  async update(
    id: string,
    data: UpdateIncidentData,
  ): Promise<IncidentDetailsModel | null> {
    const existing =
      await this.findById(id)

    if (!existing) {
      return null
    }

    await this.db.transaction(
      async (tx) => {
        await tx
          .update(incidents)
          .set({
            incidentTypeId:
              data.incidentTypeId
                ? uuidToBuffer(
                    data.incidentTypeId,
                  )
                : undefined,

            issuedDate:
              data.issuedDate,

            receivedAt:
              data.receivedAt,

            referenceYear:
              data.referenceYear,

            observations:
              data.observations,

            updatedBy:
              uuidToBuffer(
                data.updatedBy,
              ),

            updatedAt:
              data.updatedAt,
          })
          .where(
            eq(
              incidents.id,
              uuidToBuffer(id),
            ),
          )

        if (data.occurrences) {
          await tx
            .delete(
              incidentOccurrences,
            )
            .where(
              eq(
                incidentOccurrences.incidentId,
                uuidToBuffer(id),
              ),
            )

          await tx
            .insert(
              incidentOccurrences,
            )
            .values(
              data.occurrences.map(
                (occurrence) => ({
                  id:
                    uuidToBuffer(
                      occurrence.id,
                    ),

                  incidentId:
                    uuidToBuffer(id),

                  startDate:
                    occurrence.startDate,

                  endDate:
                    occurrence.endDate,
                }),
              ),
            )
        }

        await tx
          .insert(auditLogs)
          .values({
            id:
              uuidToBuffer(
                data.auditId,
              ),

            userId:
              uuidToBuffer(
                data.updatedBy,
              ),

            sessionId:
              uuidToBuffer(
                data.sessionId,
              ),

            action:
              'INCIDENT_UPDATED',

            entityType:
              'INCIDENT',

            entityId:
              uuidToBuffer(id),

            oldValues: {
              incidentTypeId:
                existing.incidentTypeId,

              issuedDate:
                existing.issuedDate
                  ?.toISOString()
                  .slice(0, 10)
                ?? null,

              observations:
                existing.observations,
            },

            newValues: {
              incidentTypeId:
                data.incidentTypeId
                ?? existing.incidentTypeId,

              observations:
                data.observations,
            },
          })
      },
    )

    return this.findById(id)
  }

  async cancel(
    id: string,
    data: CancelIncidentData,
  ): Promise<IncidentDetailsModel | null> {
    const existing =
      await this.findById(id)

    if (!existing) {
      return null
    }

    await this.db.transaction(
      async (tx) => {
        await tx
          .update(incidents)
          .set({
            status:
              'CANCELLED',

            cancelledAt:
              data.cancelledAt,

            cancelledBy:
              uuidToBuffer(
                data.cancelledBy,
              ),

            cancellationReason:
              data.cancellationReason,

            updatedBy:
              uuidToBuffer(
                data.cancelledBy,
              ),

            updatedAt:
              data.updatedAt,
          })
          .where(
            eq(
              incidents.id,
              uuidToBuffer(id),
            ),
          )

        await tx
          .insert(auditLogs)
          .values({
            id:
              uuidToBuffer(
                data.auditId,
              ),

            userId:
              uuidToBuffer(
                data.cancelledBy,
              ),

            sessionId:
              uuidToBuffer(
                data.sessionId,
              ),

            action:
              'INCIDENT_CANCELLED',

            entityType:
              'INCIDENT',

            entityId:
              uuidToBuffer(id),

            oldValues: {
              status:
                existing.status,
            },

            newValues: {
              status:
                'CANCELLED',

              reason:
                data.cancellationReason,
            },
          })
      },
    )

    return this.findById(id)
  }
}
```

Drizzle permite encapsular estas operaciones en `db.transaction()`: si una operación de la transacción falla, la unidad lógica se revierte.

---

# PARTE V — DOCUMENTOS

# 51. DTO 1 — ID de documento

## `apps/backend/src/modules/documents/dto/document-id-param.dto.ts`

```typescript
import {
  IsUUID,
} from 'class-validator'

export class DocumentIdParamDto {
  @IsUUID()
  id!: string
}
```

---

# 52. DTO 2 — ID de incidencia

## `apps/backend/src/modules/documents/dto/incident-document-id-param.dto.ts`

```typescript
import {
  IsUUID,
} from 'class-validator'

export class IncidentDocumentIdParamDto {
  @IsUUID()
  incidentId!: string
}
```

---

# 53. DTO 3 — Agregar anexo

## `apps/backend/src/modules/documents/dto/create-incident-document.dto.ts`

```typescript
import {
  IsUUID,
} from 'class-validator'

export class CreateIncidentDocumentDto {
  @IsUUID()
  documentTypeId!: string
}
```

---

# 54. DTO 4 — Eliminar documento

## `apps/backend/src/modules/documents/dto/delete-document.dto.ts`

```typescript
import type {
  DeleteDocumentRequest,
} from '@sigip/shared'

import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class DeleteDocumentDto
  implements DeleteDocumentRequest
{
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string
}
```

Los cuatro DTOs mencionados están incluidos.

---

# 55. Modelo de documento

## `apps/backend/src/modules/documents/models/document.model.ts`

```typescript
export interface DocumentModel {
  id: string
  incidentId: string

  documentType: {
    id: string
    code: string
    name: string
    description: string | null
    isActive: boolean
  }

  originalName: string
  storedName: string
  storagePath: string

  mimeType: string
  sizeBytes: number

  contentHash: string | null

  uploadedBy: string

  createdAt: Date

  deletedAt: Date | null
  deletedBy: string | null
  deletionReason: string | null
}
```

---

# 56. Repository abstracto

## `apps/backend/src/modules/documents/repositories/documents.repository.ts`

```typescript
import type {
  DocumentModel,
} from '../models/document.model'

export abstract class DocumentsRepository {
  abstract findByIncidentId(
    incidentId: string,
  ): Promise<DocumentModel[]>

  abstract findById(
    id: string,
  ): Promise<DocumentModel | null>

  abstract create(
    data: {
      id: string
      incidentId: string
      documentTypeId: string

      originalName: string
      storedName: string
      storagePath: string

      mimeType: string
      sizeBytes: number
      contentHash: string

      uploadedBy: string
    },
  ): Promise<DocumentModel>

  abstract softDelete(
    id: string,
    data: {
      deletedAt: Date
      deletedBy: string
      deletionReason: string
    },
  ): Promise<DocumentModel | null>
}
```

---

# 57. Errores

## `apps/backend/src/modules/documents/documents.errors.ts`

```typescript
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'

export class DocumentNotFoundError
  extends NotFoundException
{
  constructor(id: string) {
    super(
      `No se encontró el documento "${id}"`,
    )
  }
}

export class IncidentNotAvailableForDocumentError
  extends BadRequestException
{
  constructor() {
    super(
      'La incidencia indicada no existe',
    )
  }
}

export class DocumentTypeNotAvailableError
  extends BadRequestException
{
  constructor() {
    super(
      'El tipo de documento no existe o está inactivo',
    )
  }
}

export class PrimaryIncidentFormCannotBeDeletedError
  extends ConflictException
{
  constructor() {
    super(
      'El formato principal de una incidencia no puede eliminarse',
    )
  }
}
```

---

# 58. Presenter

## `apps/backend/src/modules/documents/presenters/document.presenter.ts`

```typescript
import type {
  IncidentDocumentResponse,
} from '@sigip/shared'

import type {
  DocumentModel,
} from '../models/document.model'

export function toDocumentResponse(
  model: DocumentModel,
): IncidentDocumentResponse {
  return {
    id: model.id,

    incidentId:
      model.incidentId,

    documentType: {
      id:
        model.documentType.id,

      code:
        model.documentType.code,

      name:
        model.documentType.name,

      description:
        model.documentType
          .description,

      isActive:
        model.documentType
          .isActive,
    },

    originalName:
      model.originalName,

    mimeType:
      model.mimeType,

    sizeBytes:
      model.sizeBytes,

    createdAt:
      model.createdAt
        .toISOString(),

    deletedAt:
      model.deletedAt
        ?.toISOString()
      ?? null,
  }
}
```

---

# 59. Service de documentos

## `apps/backend/src/modules/documents/documents.service.ts`

```typescript
import {
  Injectable,
} from '@nestjs/common'

import {
  generateUuidV7,
} from '../../common/utils/generate-uuid-v7.util'

import type {
  AuthenticatedUserModel,
} from '../auth/models/authenticated-user.model'

import {
  DeleteDocumentDto,
} from './dto/delete-document.dto'

import {
  DocumentNotFoundError,
  PrimaryIncidentFormCannotBeDeletedError,
} from './documents.errors'

import {
  DocumentsRepository,
} from './repositories/documents.repository'

import {
  DocumentStorageService,
} from './storage/document-storage.service'

@Injectable()
export class DocumentsService {
  constructor(
    private readonly repository:
      DocumentsRepository,

    private readonly storage:
      DocumentStorageService,
  ) {}

  findByIncidentId(
    incidentId: string,
  ) {
    return this.repository
      .findByIncidentId(
        incidentId,
      )
  }

  async findById(
    id: string,
  ) {
    const document =
      await this.repository
        .findById(id)

    if (!document) {
      throw new DocumentNotFoundError(
        id,
      )
    }

    return document
  }

  async getContent(
    id: string,
  ) {
    const document =
      await this.findById(id)

    if (document.deletedAt) {
      throw new DocumentNotFoundError(
        id,
      )
    }

    const buffer =
      await this.storage.read(
        document.storagePath,
      )

    return {
      buffer,
      document,
    }
  }

  async delete(
    id: string,
    dto: DeleteDocumentDto,
    actor: AuthenticatedUserModel,
  ) {
    const current =
      await this.findById(id)

    if (
      current.documentType.code ===
      'FORMATO_INCIDENCIA'
    ) {
      throw new PrimaryIncidentFormCannotBeDeletedError()
    }

    const result =
      await this.repository
        .softDelete(
          id,
          {
            deletedAt:
              new Date(),

            deletedBy:
              actor.userId,

            deletionReason:
              dto.reason.trim(),
          },
        )

    if (!result) {
      throw new DocumentNotFoundError(
        id,
      )
    }

    return result
  }
}
```

Para no hacer aún más largo este primer diseño, los anexos adicionales pueden incorporarse reutilizando exactamente el mismo `DocumentStorageService` y `DocumentsRepository.create()`. El flujo del formato principal sí queda completamente resuelto desde `POST /incidents`.

---

# 60. Controller de documentos

## `apps/backend/src/modules/documents/documents.controller.ts`

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Res,
} from '@nestjs/common'

import type {
  Response,
} from 'express'

import type {
  IncidentDocumentsResponse,
} from '@sigip/shared'

import {
  CurrentUser,
} from '../../common/decorators/current-user.decorator'

import {
  RequirePermissions,
} from '../../common/decorators/require-permissions.decorator'

import type {
  AuthenticatedUserModel,
} from '../auth/models/authenticated-user.model'

import {
  DeleteDocumentDto,
} from './dto/delete-document.dto'

import {
  DocumentIdParamDto,
} from './dto/document-id-param.dto'

import {
  IncidentDocumentIdParamDto,
} from './dto/incident-document-id-param.dto'

import {
  DocumentsService,
} from './documents.service'

import {
  toDocumentResponse,
} from './presenters/document.presenter'

@Controller()
export class DocumentsController {
  constructor(
    private readonly service:
      DocumentsService,
  ) {}

  @Get(
    'incidents/:incidentId/documents',
  )
  @RequirePermissions(
    'documents:read',
  )
  async findByIncident(
    @Param()
    params:
      IncidentDocumentIdParamDto,
  ): Promise<
    IncidentDocumentsResponse
  > {
    const documents =
      await this.service
        .findByIncidentId(
          params.incidentId,
        )

    return documents.map(
      toDocumentResponse,
    )
  }

  @Get(
    'documents/:id/content',
  )
  @RequirePermissions(
    'documents:read',
  )
  async getContent(
    @Param()
    params:
      DocumentIdParamDto,

    @Res()
    response: Response,
  ) {
    const {
      buffer,
      document,
    } =
      await this.service
        .getContent(params.id)

    response.setHeader(
      'Content-Type',
      document.mimeType,
    )

    response.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(
        document.originalName,
      )}"`,
    )

    response.send(buffer)
  }

  @Delete(
    'documents/:id',
  )
  @RequirePermissions(
    'documents:delete',
  )
  async delete(
    @Param()
    params:
      DocumentIdParamDto,

    @Body()
    dto:
      DeleteDocumentDto,

    @CurrentUser()
    actor:
      AuthenticatedUserModel,
  ) {
    return toDocumentResponse(
      await this.service.delete(
        params.id,
        dto,
        actor,
      ),
    )
  }
}
```

---

# 61. Módulo de documentos

## `apps/backend/src/modules/documents/documents.module.ts`

```typescript
import {
  Module,
} from '@nestjs/common'

import {
  DocumentsController,
} from './documents.controller'

import {
  DocumentsService,
} from './documents.service'

import {
  DocumentsRepository,
} from './repositories/documents.repository'

import {
  DrizzleDocumentsRepository,
} from './repositories/drizzle-documents.repository'

import {
  DocumentStorageService,
} from './storage/document-storage.service'

@Module({
  controllers: [
    DocumentsController,
  ],

  providers: [
    DocumentsService,
    DocumentStorageService,

    {
      provide:
        DocumentsRepository,

      useClass:
        DrizzleDocumentsRepository,
    },
  ],

  exports: [
    DocumentsService,
    DocumentStorageService,
    DocumentsRepository,
  ],
})
export class DocumentsModule {}
```

---

# 62. DrizzleDocumentsRepository

## `apps/backend/src/modules/documents/repositories/drizzle-documents.repository.ts`

```typescript
import {
  Inject,
  Injectable,
} from '@nestjs/common'

import {
  and,
  asc,
  eq,
  isNull,
} from 'drizzle-orm'

import {
  DRIZZLE_DATABASE,
} from '../../../database/database.constants'

import type {
  DrizzleDatabase,
} from '../../../database/database.types'

import {
  documentTypes,
  documents,
} from '../../../database/schema'

import {
  bufferToUuid,
  uuidToBuffer,
} from '../../../database/utils/uuid.util'

import type {
  DocumentModel,
} from '../models/document.model'

import {
  DocumentsRepository,
} from './documents.repository'

@Injectable()
export class DrizzleDocumentsRepository
  implements DocumentsRepository
{
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db:
      DrizzleDatabase,
  ) {}

  private map(
    row: {
      document:
        typeof documents.$inferSelect

      documentType:
        typeof documentTypes.$inferSelect
    },
  ): DocumentModel {
    return {
      id:
        bufferToUuid(
          row.document.id,
        ),

      incidentId:
        bufferToUuid(
          row.document.incidentId,
        ),

      documentType: {
        id:
          bufferToUuid(
            row.documentType.id,
          ),

        code:
          row.documentType.code,

        name:
          row.documentType.name,

        description:
          row.documentType
            .description,

        isActive:
          row.documentType
            .isActive,
      },

      originalName:
        row.document.originalName,

      storedName:
        row.document.storedName,

      storagePath:
        row.document.storagePath,

      mimeType:
        row.document.mimeType,

      sizeBytes:
        row.document.sizeBytes,

      contentHash:
        row.document.contentHash,

      uploadedBy:
        bufferToUuid(
          row.document.uploadedBy,
        ),

      createdAt:
        row.document.createdAt,

      deletedAt:
        row.document.deletedAt,

      deletedBy:
        row.document.deletedBy
          ? bufferToUuid(
              row.document.deletedBy,
            )
          : null,

      deletionReason:
        row.document
          .deletionReason,
    }
  }

  async findByIncidentId(
    incidentId: string,
  ) {
    const rows =
      await this.db
        .select({
          document:
            documents,

          documentType:
            documentTypes,
        })
        .from(documents)

        .innerJoin(
          documentTypes,
          eq(
            documents.documentTypeId,
            documentTypes.id,
          ),
        )

        .where(
          and(
            eq(
              documents.incidentId,
              uuidToBuffer(
                incidentId,
              ),
            ),
            isNull(
              documents.deletedAt,
            ),
          ),
        )

        .orderBy(
          asc(
            documents.createdAt,
          ),
        )

    return rows.map(
      (row) => this.map(row),
    )
  }

  async findById(
    id: string,
  ) {
    const [row] =
      await this.db
        .select({
          document:
            documents,

          documentType:
            documentTypes,
        })
        .from(documents)

        .innerJoin(
          documentTypes,
          eq(
            documents.documentTypeId,
            documentTypes.id,
          ),
        )

        .where(
          eq(
            documents.id,
            uuidToBuffer(id),
          ),
        )

        .limit(1)

    return row
      ? this.map(row)
      : null
  }

  async create(
    data: {
      id: string
      incidentId: string
      documentTypeId: string

      originalName: string
      storedName: string
      storagePath: string

      mimeType: string
      sizeBytes: number
      contentHash: string

      uploadedBy: string
    },
  ) {
    await this.db
      .insert(documents)
      .values({
        id:
          uuidToBuffer(data.id),

        incidentId:
          uuidToBuffer(
            data.incidentId,
          ),

        documentTypeId:
          uuidToBuffer(
            data.documentTypeId,
          ),

        originalName:
          data.originalName,

        storedName:
          data.storedName,

        storagePath:
          data.storagePath,

        mimeType:
          data.mimeType,

        sizeBytes:
          data.sizeBytes,

        contentHash:
          data.contentHash,

        uploadedBy:
          uuidToBuffer(
            data.uploadedBy,
          ),
      })

    const result =
      await this.findById(
        data.id,
      )

    if (!result) {
      throw new Error(
        'Document persistence error',
      )
    }

    return result
  }

  async softDelete(
    id: string,
    data: {
      deletedAt: Date
      deletedBy: string
      deletionReason: string
    },
  ) {
    await this.db
      .update(documents)
      .set({
        deletedAt:
          data.deletedAt,

        deletedBy:
          uuidToBuffer(
            data.deletedBy,
          ),

        deletionReason:
          data.deletionReason,
      })
      .where(
        eq(
          documents.id,
          uuidToBuffer(id),
        ),
      )

    return this.findById(id)
  }
}
```

---

# PARTE VI — REGISTRO EN APP MODULE

# 63. AppModule

## `apps/backend/src/app.module.ts`

Agregar:

```typescript
import {
  IncidentTypesModule,
} from './modules/incident-types/incident-types.module'

import {
  IncidentsModule,
} from './modules/incidents/incidents.module'

import {
  DocumentsModule,
} from './modules/documents/documents.module'
```

Y dentro de:

```typescript
imports: [
  // módulos actuales...

  IncidentTypesModule,
  DocumentsModule,
  IncidentsModule,
]
```

---

# PARTE VII — SEEDS INICIALES

# 64. Tipos de incidencia

Yo comenzaría con:

```text
DIA_ECONOMICO
JUSTIFICACION_ENTRADA
JUSTIFICACION_SALIDA
CUIDADOS_MATERNOS
INCAPACIDAD
ONOMASTICO
CONSTANCIA_TIEMPO_ISSSTE
VACACIONES_PRIMER_PERIODO
VACACIONES_SEGUNDO_PERIODO
VACACIONES_ESTIMULOS
COMISION
```

Configuración conocida:

```text
DIA_ECONOMICO
SINGLE_DATE
BASE

JUSTIFICACION_ENTRADA
SINGLE_DATE
ALL

JUSTIFICACION_SALIDA
SINGLE_DATE
ALL

ONOMASTICO
SINGLE_DATE
BASE

VACACIONES_PRIMER_PERIODO
MULTIPLE_DATES
ALL

VACACIONES_SEGUNDO_PERIODO
MULTIPLE_DATES
ALL

VACACIONES_ESTIMULOS
MULTIPLE_DATES
ALL
```

Para:

```text
CUIDADOS_MATERNOS
INCAPACIDAD
CONSTANCIA_TIEMPO_ISSSTE
COMISION
```

no fijaría todavía la modalidad hasta confirmar exactamente cómo se capturan en la oficina.

---

# 65. Tipos de documento

Mínimo:

```text
FORMATO_INCIDENCIA
OFICIO_COMISION
CONSTANCIA
JUSTIFICANTE
OTRO
```

`FORMATO_INCIDENCIA` será obligatorio automáticamente al registrar la incidencia.

---

# PARTE VIII — FRONTEND

El frontend actual ya separa sus módulos en:

```text
api
components
constants
hooks
pages
queries
schemas
types
```

por lo que mantendría la misma estructura.

# 66. Tipos frontend

## `apps/frontend/src/modules/incidents/types/incident.types.ts`

```typescript
import type {
  CancelIncidentRequest,
  CreateIncidentRequest,
  IncidentResponse,
  IncidentsResponse,
  UpdateIncidentRequest,
} from '@sigip/shared'

export type Incident =
  IncidentResponse

export type Incidents =
  IncidentsResponse

export type CreateIncidentInput =
  CreateIncidentRequest

export type UpdateIncidentInput =
  UpdateIncidentRequest

export type CancelIncidentInput =
  CancelIncidentRequest

export interface IncidentListParams {
  page?: number
  limit?: number

  search?: string

  status?:
    | 'REGISTERED'
    | 'CANCELLED'

  employeeId?: string
  incidentTypeId?: string
  organizationalUnitId?: string

  from?: string
  to?: string

  sort?: string
}
```

---

# 67. API frontend

## `apps/frontend/src/modules/incidents/api/incidents.api.ts`

```typescript
import {
  apiRequest,
} from '@/lib/api/api-client'

import type {
  CreateIncidentInput,
  Incident,
  IncidentListParams,
  Incidents,
  UpdateIncidentInput,
  CancelIncidentInput,
} from '../types/incident.types'

export function getIncidents(
  params:
    IncidentListParams = {},
): Promise<Incidents> {
  const searchParams =
    new URLSearchParams()

  Object.entries(params)
    .forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== ''
        ) {
          searchParams.set(
            key,
            String(value),
          )
        }
      },
    )

  const query =
    searchParams.toString()

  return apiRequest<Incidents>(
    `/incidents${
      query
        ? `?${query}`
        : ''
    }`,
  )
}

export function getIncidentById({
  id,
}: {
  id: string
}): Promise<Incident> {
  return apiRequest<Incident>(
    `/incidents/${id}`,
  )
}

export function createIncident({
  input,
  file,
}: {
  input: CreateIncidentInput
  file: File
}): Promise<Incident> {
  const formData =
    new FormData()

  formData.append(
    'data',
    JSON.stringify(input),
  )

  formData.append(
    'file',
    file,
  )

  return apiRequest<Incident>(
    '/incidents',
    {
      method: 'POST',
      body: formData,
    },
  )
}

export function updateIncident({
  id,
  input,
}: {
  id: string
  input: UpdateIncidentInput
}): Promise<Incident> {
  return apiRequest<Incident>(
    `/incidents/${id}`,
    {
      method: 'PATCH',
      body: input,
    },
  )
}

export function cancelIncident({
  id,
  input,
}: {
  id: string
  input: CancelIncidentInput
}): Promise<Incident> {
  return apiRequest<Incident>(
    `/incidents/${id}/cancel`,
    {
      method: 'POST',
      body: input,
    },
  )
}
```

Tu `apiRequest()` actual ya comprueba si `body` es una instancia de `FormData` y, en ese caso, evita establecer manualmente `application/json`, por lo que no necesitas modificar el cliente HTTP para esta carga.

---

# 68. Constantes

## `apps/frontend/src/modules/incidents/constants/incident.constants.ts`

```typescript
export const INCIDENT_STATUS_LABELS = {
  REGISTERED: 'Registrada',
  CANCELLED: 'Cancelada',
} as const

export const INCIDENT_TEMPORAL_MODE_LABELS = {
  SINGLE_DATE: 'Fecha única',
  MULTIPLE_DATES: 'Varias fechas',
  DATE_RANGE: 'Periodo continuo',
} as const
```

---

# 69. Schema Zod del formulario

## `apps/frontend/src/modules/incidents/schemas/incident-form.schema.ts`

```typescript
import {
  z,
} from 'zod'

const occurrenceSchema =
  z.object({
    startDate:
      z.string()
        .min(
          1,
          'La fecha es obligatoria',
        ),

    endDate:
      z.string()
        .nullable()
        .optional(),
  })

export const incidentFormSchema =
  z.object({
    employeeId:
      z.string()
        .uuid(),

    employeeAssignmentId:
      z.string()
        .uuid(),

    incidentTypeId:
      z.string()
        .uuid(),

    issuedDate:
      z.string()
        .nullable()
        .optional(),

    receivedAt:
      z.string()
        .min(1),

    referenceYear:
      z.number()
        .int()
        .min(2000)
        .max(2100)
        .nullable()
        .optional(),

    observations:
      z.string()
        .max(5000)
        .nullable()
        .optional(),

    occurrences:
      z.array(
        occurrenceSchema,
      )
        .min(
          1,
          'Debe indicar al menos una fecha',
        ),

    file:
      z.instanceof(File)
        .refine(
          (file) =>
            file.type ===
            'application/pdf',

          'El formato debe ser un PDF',
        )
        .refine(
          (file) =>
            file.size <=
            10 * 1024 * 1024,

          'El archivo no puede superar 10 MB',
        ),
  })

export type IncidentFormValues =
  z.infer<
    typeof incidentFormSchema
  >
```

---

# 70. Query keys

## `apps/frontend/src/modules/incidents/queries/incidents.queries.ts`

```typescript
import {
  queryOptions,
} from '@tanstack/react-query'

import {
  getIncidentById,
  getIncidents,
} from '../api/incidents.api'

import type {
  IncidentListParams,
} from '../types/incident.types'

export const incidentKeys = {
  all: [
    'incidents',
  ] as const,

  lists: () => [
    ...incidentKeys.all,
    'list',
  ] as const,

  list: (
    params: IncidentListParams,
  ) => [
    ...incidentKeys.lists(),
    params,
  ] as const,

  details: () => [
    ...incidentKeys.all,
    'detail',
  ] as const,

  detail: (
    id: string,
  ) => [
    ...incidentKeys.details(),
    id,
  ] as const,
}

export function incidentsQuery(
  params: IncidentListParams,
) {
  return queryOptions({
    queryKey:
      incidentKeys.list(
        params,
      ),

    queryFn: () =>
      getIncidents(params),
  })
}

export function incidentQuery(
  id: string,
) {
  return queryOptions({
    queryKey:
      incidentKeys.detail(id),

    queryFn: () =>
      getIncidentById({
        id,
      }),
  })
}
```

---

# 71. Hook para crear

## `apps/frontend/src/modules/incidents/hooks/use-create-incident.ts`

```typescript
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createIncident,
} from '../api/incidents.api'

import {
  incidentKeys,
} from '../queries/incidents.queries'

export function useCreateIncident() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn:
      createIncident,

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            incidentKeys.lists(),
        })
    },
  })
}
```

---

# 72. Hook para cancelar

## `apps/frontend/src/modules/incidents/hooks/use-cancel-incident.ts`

```typescript
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  cancelIncident,
} from '../api/incidents.api'

import {
  incidentKeys,
} from '../queries/incidents.queries'

export function useCancelIncident() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn:
      cancelIncident,

    onSuccess:
      async (incident) => {
        await Promise.all([
          queryClient
            .invalidateQueries({
              queryKey:
                incidentKeys.lists(),
            }),

          queryClient
            .invalidateQueries({
              queryKey:
                incidentKeys.detail(
                  incident.id,
                ),
            }),
        ])
      },
  })
}
```

---

# 73. Componente de fechas

## `apps/frontend/src/modules/incidents/components/incident-occurrences-field.tsx`

```tsx
import {
  useFieldArray,
  useFormContext,
} from 'react-hook-form'

import type {
  IncidentFormValues,
} from '../schemas/incident-form.schema'

interface Props {
  temporalMode:
    | 'SINGLE_DATE'
    | 'MULTIPLE_DATES'
    | 'DATE_RANGE'
}

export function IncidentOccurrencesField({
  temporalMode,
}: Props) {
  const {
    control,
    register,
  } =
    useFormContext<
      IncidentFormValues
    >()

  const {
    fields,
    append,
    remove,
  } =
    useFieldArray({
      control,
      name: 'occurrences',
    })

  if (
    temporalMode ===
    'SINGLE_DATE'
  ) {
    return (
      <div>
        <label>
          Fecha
        </label>

        <input
          type="date"
          {...register(
            'occurrences.0.startDate',
          )}
        />
      </div>
    )
  }

  if (
    temporalMode ===
    'DATE_RANGE'
  ) {
    return (
      <div>
        <label>
          Fecha inicial
        </label>

        <input
          type="date"
          {...register(
            'occurrences.0.startDate',
          )}
        />

        <label>
          Fecha final
        </label>

        <input
          type="date"
          {...register(
            'occurrences.0.endDate',
          )}
        />
      </div>
    )
  }

  return (
    <div>
      <div>
        <h3>
          Fechas
        </h3>

        <button
          type="button"
          onClick={() =>
            append({
              startDate: '',
              endDate: null,
            })
          }
        >
          Agregar fecha
        </button>
      </div>

      {fields.map(
        (field, index) => (
          <div
            key={field.id}
          >
            <input
              type="date"
              {...register(
                `occurrences.${index}.startDate`,
              )}
            />

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  remove(index)
                }
              >
                Quitar
              </button>
            )}
          </div>
        ),
      )}

      <p>
        {fields.length}
        {' '}
        día(s) seleccionado(s)
      </p>
    </div>
  )
}
```

En tu proyecto real sustituiría esos `input` y `button` por los componentes de shadcn/ui que ya estás utilizando.

---

# 74. Campo del PDF

## `apps/frontend/src/modules/incidents/components/incident-file-field.tsx`

```tsx
import {
  useFormContext,
} from 'react-hook-form'

import type {
  IncidentFormValues,
} from '../schemas/incident-form.schema'

export function IncidentFileField() {
  const {
    setValue,
    watch,
  } =
    useFormContext<
      IncidentFormValues
    >()

  const file =
    watch('file')

  return (
    <div>
      <label>
        Formato de incidencia *
      </label>

      <input
        type="file"
        accept="application/pdf"
        onChange={(event) => {
          const selected =
            event.target
              .files?.[0]

          if (selected) {
            setValue(
              'file',
              selected,
              {
                shouldValidate:
                  true,
              },
            )
          }
        }}
      />

      {file && (
        <div>
          <strong>
            {file.name}
          </strong>

          <span>
            {' '}
            {(
              file.size /
              1024 /
              1024
            ).toFixed(2)}
            {' MB'}
          </span>
        </div>
      )}
    </div>
  )
}
```

---

# 75. Formulario principal

## `apps/frontend/src/modules/incidents/components/incident-form.tsx`

```tsx
import {
  FormProvider,
  useForm,
} from 'react-hook-form'

import {
  zodResolver,
} from '@hookform/resolvers/zod'

import {
  useCreateIncident,
} from '../hooks/use-create-incident'

import {
  IncidentFileField,
} from './incident-file-field'

import {
  IncidentOccurrencesField,
} from './incident-occurrences-field'

import {
  incidentFormSchema,
  type IncidentFormValues,
} from '../schemas/incident-form.schema'

interface Props {
  employeeId: string
  employeeAssignmentId: string

  incidentTypeId: string

  temporalMode:
    | 'SINGLE_DATE'
    | 'MULTIPLE_DATES'
    | 'DATE_RANGE'
}

export function IncidentForm({
  employeeId,
  employeeAssignmentId,
  incidentTypeId,
  temporalMode,
}: Props) {
  const mutation =
    useCreateIncident()

  const form =
    useForm<
      IncidentFormValues
    >({
      resolver:
        zodResolver(
          incidentFormSchema,
        ),

      defaultValues: {
        employeeId,
        employeeAssignmentId,
        incidentTypeId,

        issuedDate: null,

        receivedAt:
          new Date()
            .toISOString(),

        referenceYear:
          null,

        observations:
          null,

        occurrences: [
          {
            startDate: '',
            endDate: null,
          },
        ],
      },
    })

  const onSubmit =
    async (
      values:
        IncidentFormValues,
    ) => {
      await mutation.mutateAsync({
        input: {
          employeeId:
            values.employeeId,

          employeeAssignmentId:
            values.employeeAssignmentId,

          incidentTypeId:
            values.incidentTypeId,

          issuedDate:
            values.issuedDate,

          receivedAt:
            values.receivedAt,

          referenceYear:
            values.referenceYear,

          observations:
            values.observations,

          occurrences:
            values.occurrences,
        },

        file:
          values.file,
      })
    }

  return (
    <FormProvider
      {...form}
    >
      <form
        onSubmit={
          form.handleSubmit(
            onSubmit,
          )
        }
      >
        <section>
          <h2>
            Datos de la incidencia
          </h2>

          <label>
            Fecha de emisión
          </label>

          <input
            type="date"
            {...form.register(
              'issuedDate',
            )}
          />

          <label>
            Año de referencia
          </label>

          <input
            type="number"
            {...form.register(
              'referenceYear',
              {
                valueAsNumber:
                  true,
              },
            )}
          />

          <label>
            Observaciones
          </label>

          <textarea
            {...form.register(
              'observations',
            )}
          />
        </section>

        <section>
          <IncidentOccurrencesField
            temporalMode={
              temporalMode
            }
          />
        </section>

        <section>
          <IncidentFileField />
        </section>

        <button
          type="submit"
          disabled={
            mutation.isPending
          }
        >
          {mutation.isPending
            ? 'Registrando...'
            : 'Registrar incidencia'}
        </button>
      </form>
    </FormProvider>
  )
}
```

En la UI final, `employeeId`, `employeeAssignmentId` e `incidentTypeId` deberían venir de selectores reales, no necesariamente como props; aquí los separo para mostrar claramente el flujo.

---

# 76. Página de creación

## `apps/frontend/src/modules/incidents/pages/create-incident-page.tsx`

```tsx
import {
  IncidentForm,
} from '../components/incident-form'

export function CreateIncidentPage() {
  /*
   * En la implementación final,
   * estos valores vendrán de:
   *
   * - selector de empleado
   * - asignación vigente
   * - selector de tipo de incidencia
   */

  return (
    <div>
      <header>
        <h1>
          Registrar incidencia
        </h1>

        <p>
          Capture la información
          del formato y adjunte
          el PDF correspondiente.
        </p>
      </header>

      {/*
        Aquí colocarías el flujo real
        de selección.

        Una vez seleccionados:
      */}

      <IncidentForm
        employeeId="UUID_EMPLEADO"
        employeeAssignmentId="UUID_ASIGNACION"
        incidentTypeId="UUID_TIPO"
        temporalMode="MULTIPLE_DATES"
      />
    </div>
  )
}
```

En el proyecto real no dejaría UUID estáticos. Esta página necesitará conectarse al selector de empleados y al catálogo de tipos.

---

# 77. Página de listado

## `apps/frontend/src/modules/incidents/pages/incidents-page.tsx`

```tsx
import {
  useQuery,
} from '@tanstack/react-query'

import {
  incidentsQuery,
} from '../queries/incidents.queries'

export function IncidentsPage() {
  const {
    data,
    isLoading,
  } =
    useQuery(
      incidentsQuery({
        page: 1,
        limit: 20,
      }),
    )

  if (isLoading) {
    return (
      <p>
        Cargando incidencias...
      </p>
    )
  }

  return (
    <div>
      <header>
        <h1>
          Incidencias
        </h1>
      </header>

      <table>
        <thead>
          <tr>
            <th>
              Empleado
            </th>

            <th>
              Tipo
            </th>

            <th>
              Fechas
            </th>

            <th>
              Estado
            </th>

            <th>
              Registro
            </th>
          </tr>
        </thead>

        <tbody>
          {data?.items.map(
            (incident) => (
              <tr
                key={
                  incident.id
                }
              >
                <td>
                  {
                    incident
                      .employee
                      .fullName
                  }
                </td>

                <td>
                  {
                    incident
                      .incidentType
                      .name
                  }
                </td>

                <td>
                  {
                    incident
                      .occurrences
                      .map(
                        (item) =>
                          item.startDate,
                      )
                      .join(', ')
                  }
                </td>

                <td>
                  {
                    incident.status
                  }
                </td>

                <td>
                  {
                    incident.createdAt
                  }
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}
```

---

# 78. Página detalle

## `apps/frontend/src/modules/incidents/pages/incident-details-page.tsx`

```tsx
import {
  useQuery,
} from '@tanstack/react-query'

import {
  incidentQuery,
} from '../queries/incidents.queries'

interface Props {
  id: string
}

export function IncidentDetailsPage({
  id,
}: Props) {
  const {
    data,
    isLoading,
  } =
    useQuery(
      incidentQuery(id),
    )

  if (isLoading) {
    return (
      <p>
        Cargando...
      </p>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div>
      <header>
        <h1>
          {
            data.incidentType.name
          }
        </h1>

        <span>
          {data.status}
        </span>
      </header>

      <section>
        <h2>
          Trabajador
        </h2>

        <p>
          {
            data.employee.fullName
          }
        </p>

        <p>
          Número:
          {' '}
          {
            data.employee
              .employeeNumber
          }
        </p>

        <p>
          Adscripción:
          {' '}
          {
            data.assignment
              .organizationalUnit
              .name
          }
        </p>

        <p>
          Puesto:
          {' '}
          {
            data.assignment
              .position
              .name
          }
        </p>

        <p>
          Nombramiento:
          {' '}
          {
            data.assignment
              .appointmentType
          }
        </p>
      </section>

      <section>
        <h2>
          Fechas
        </h2>

        <ul>
          {
            data.occurrences.map(
              (occurrence) => (
                <li
                  key={
                    occurrence.id
                  }
                >
                  {
                    occurrence.startDate
                  }

                  {occurrence.endDate
                    ? ` al ${occurrence.endDate}`
                    : ''}
                </li>
              ),
            )
          }
        </ul>
      </section>

      <section>
        <h2>
          Información
        </h2>

        <p>
          Fecha de emisión:
          {' '}
          {
            data.issuedDate
            ?? 'No indicada'
          }
        </p>

        <p>
          Año de referencia:
          {' '}
          {
            data.referenceYear
            ?? 'No aplica'
          }
        </p>

        <p>
          Observaciones:
          {' '}
          {
            data.observations
            ?? 'Sin observaciones'
          }
        </p>
      </section>
    </div>
  )
}
```

---

# 79. Index frontend

## `apps/frontend/src/modules/incidents/index.ts`

```typescript
export * from './pages/incidents-page'
export * from './pages/create-incident-page'
export * from './pages/incident-details-page'

export * from './api/incidents.api'
export * from './queries/incidents.queries'

export * from './types/incident.types'
```

---

# PARTE IX — ENDPOINTS FINALES

## Incident Types

```http
GET   /api/incident-types
GET   /api/incident-types/:id

POST  /api/incident-types

PATCH /api/incident-types/:id
PATCH /api/incident-types/:id/status
```

---

## Incidents

```http
GET  /api/incidents
GET  /api/incidents/:id

POST /api/incidents

PATCH /api/incidents/:id

POST /api/incidents/:id/cancel
```

---

## Documents

```http
GET /api/incidents/:incidentId/documents

GET /api/documents/:id/content

DELETE /api/documents/:id
```

Posteriormente:

```http
POST /api/incidents/:incidentId/documents
```

para anexos opcionales.

---

# PARTE X — EJEMPLO REAL DEL FORMATO MOSTRADO

El documento de ejemplo produciría aproximadamente:

```json
{
  "employeeId": "uuid-miriam",
  "employeeAssignmentId": "uuid-asignacion",
  "incidentTypeId": "uuid-vacaciones-primer-periodo",
  "issuedDate": "2026-07-09",
  "receivedAt": "2026-07-10T16:30:00.000Z",
  "referenceYear": 2026,
  "observations": "Se autoriza el día 14 de julio de 2026 a cuenta de vacaciones, correspondiente al primer periodo vacacional 2026, quedando pendientes 09 días por disfrutar.",
  "occurrences": [
    {
      "startDate": "2026-07-14",
      "endDate": null
    }
  ]
}
```

Y:

```text
file =
formato-incidencia.pdf
```

---

# 80. Ejemplo de vacaciones combinadas

Si después presenta otro formato con:

```text
21
22
23
24
25

28

30

05 agosto
06 agosto
07 agosto
```

la nueva incidencia tendría:

```json
{
  "referenceYear": 2026,
  "occurrences": [
    {
      "startDate": "2026-07-21"
    },
    {
      "startDate": "2026-07-22"
    },
    {
      "startDate": "2026-07-23"
    },
    {
      "startDate": "2026-07-24"
    },
    {
      "startDate": "2026-07-25"
    },
    {
      "startDate": "2026-07-28"
    },
    {
      "startDate": "2026-07-30"
    },
    {
      "startDate": "2026-08-05"
    },
    {
      "startDate": "2026-08-06"
    },
    {
      "startDate": "2026-08-07"
    }
  ]
}
```

Son diez días aunque haya una combinación de días consecutivos y separados.

---

# 81. Qué no almacenaría

No agregaría:

```text
remaining_vacation_days
```

porque se puede calcular.

Tampoco:

```text
month
year
fortnight
duration
```

porque son datos derivados.

---

# 82. Regla histórica de vacaciones

El control acumulado está implementado con las siguientes decisiones provisionales:

```text
primer periodo: enero-junio;
segundo periodo: julio-diciembre;
10 días por periodo sin acumulación;
elegibilidad después de seis meses desde la fecha de ingreso;
incidencias canceladas devuelven días;
vacaciones por estímulos no afectan el saldo ordinario;
ajustes manuales append-only para consumos previos.
```

El saldo se calcula mediante:

```text
SUM(días registrados)
por
employee
+ incident_type
+ reference_year
+ status REGISTERED
```

---

# 83. Regla de comisión

Para:

```text
COMISION
```

el sistema exige:

```text
FORMATO_INCIDENCIA
```

pero no:

```text
OFICIO_COMISION
```

El oficio será un anexo opcional.

---

# 84. Regla de cancelación

Una incidencia no se borra.

Pasa:

```text
REGISTERED
    ↓
CANCELLED
```

y conserva:

```text
cancelled_at
cancelled_by
cancellation_reason
```

además del registro de auditoría.

---

# 85. Flujo final completo

```text
Frontend
│
│ Selecciona empleado
│
├── obtiene su asignación vigente
│
│ Selecciona tipo de incidencia
│
├── temporalMode
├── appointmentScope
│
│ Captura fechas
│
│ Captura issuedDate
│
│ Captura observaciones
│
│ Selecciona PDF
│
▼
POST /api/incidents
multipart/form-data
│
├── data
└── file
│
▼
IncidentsController
│
▼
IncidentsService
│
├── valida empleado
├── valida estado del empleado
├── valida asignación
├── valida pertenencia empleado/asignación
├── valida vigencia laboral
├── valida tipo de incidencia
├── valida nombramiento
├── valida temporalidad
├── valida fechas
├── valida duplicados
├── valida PDF
├── genera UUIDv7
└── almacena PDF privado
│
▼
IncidentsRepository
│
▼
db.transaction()
│
├── INSERT incidents
├── INSERT incident_occurrences
├── INSERT documents
└── INSERT audit_logs
│
▼
COMMIT
│
▼
IncidentDetails
│
▼
Presenter
│
▼
@sigip/shared
│
▼
Frontend
```

---

# 86. Resultado

Con este bloque implementado tendrás funcionalmente:

```text
✓ Catálogo de tipos de incidencia

✓ Alta de incidencia

✓ Fecha de emisión del formato

✓ Fecha de recepción

✓ Fecha única

✓ Fechas múltiples

✓ Rango continuo

✓ Vacaciones con días separados

✓ Vacaciones con días consecutivos

✓ Vacaciones combinadas

✓ Contexto histórico del empleado

✓ Validación del nombramiento

✓ Validación de asignación

✓ Validación de vigencia laboral

✓ PDF principal obligatorio

✓ Almacenamiento privado

✓ Metadatos del documento

✓ Descarga autenticada

✓ Cancelación lógica

✓ Auditoría

✓ Filtros

✓ Paginación

✓ Contratos compartidos

✓ Backend

✓ Integración frontend
```

Después de esto, queda sustituir el calendario provisional por las fechas institucionales definitivas, además de los anexos adicionales y la administración de tipos documentales.
