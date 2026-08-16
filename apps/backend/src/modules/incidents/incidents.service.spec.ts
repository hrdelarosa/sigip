import { Test } from '@nestjs/testing';

import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { DocumentStorageService } from '../documents/storage/document-storage.service';
import { DocumentsRepository } from '../documents/repositories/documents.repository';
import {
  CommissionAnnexNotAllowedError,
  DuplicateIncidentOccurrenceError,
  InvalidIncidentTemporalModeError,
} from './incidents.errors';
import { IncidentsService } from './incidents.service';
import type { IncidentDetailsModel } from './models/incident.model';
import type { CreateIncidentData } from './types/incidents.types';
import { IncidentsRepository } from './repositories/incidents.repository';

describe('IncidentsService', () => {
  const repository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findCreationContext: jest.fn(),
    create: jest.fn<Promise<IncidentDetailsModel>, [CreateIncidentData]>(),
    update: jest.fn(),
    cancel: jest.fn(),
  };
  const storage = {
    storeIncidentDocument: jest.fn(),
    remove: jest.fn(),
  };
  const documentsRepository = { findByIncidentId: jest.fn() };
  const actor: AuthenticatedUserModel = {
    userId: 'user-id',
    sessionId: 'session-id',
    username: 'admin',
    fullName: 'Administrador',
    role: { id: 'role-id', code: 'ADMIN', name: 'Administrador' },
    permissions: [],
  };

  let service: IncidentsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: IncidentsRepository, useValue: repository },
        { provide: DocumentStorageService, useValue: storage },
        { provide: DocumentsRepository, useValue: documentsRepository },
      ],
    }).compile();

    service = module.get(IncidentsService);
  });

  it('rejects overlapping occurrence periods', async () => {
    repository.findCreationContext.mockResolvedValue({
      employee: { id: 'employee-id', status: 'ACTIVE' },
      assignment: {
        id: 'assignment-id',
        employeeId: 'employee-id',
        appointmentType: 'BASE',
        effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
        effectiveTo: null,
      },
      incidentType: {
        id: 'type-id',
        code: 'PERMISO',
        temporalMode: 'MULTIPLE_DATES',
        appointmentScope: 'ALL',
        isActive: true,
      },
      formDocumentType: { id: 'document-type-id' },
    });

    await expect(
      service.create(
        {
          employeeId: 'employee-id',
          employeeAssignmentId: 'assignment-id',
          incidentTypeId: 'type-id',
          receivedAt: '2026-08-14T12:00:00.000Z',
          occurrences: [
            { startDate: '2026-08-10', endDate: '2026-08-12' },
            { startDate: '2026-08-11' },
          ],
        },
        {
          originalname: 'formato.pdf',
          mimetype: 'application/pdf',
          size: 100,
          buffer: Buffer.from('%PDF'),
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(DuplicateIncidentOccurrenceError);

    expect(storage.storeIncidentDocument).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('validates existing occurrences when changing the incident type', async () => {
    repository.findById.mockResolvedValue(buildIncident());
    repository.findCreationContext.mockResolvedValue({
      employee: { id: 'employee-id', status: 'ACTIVE' },
      assignment: {
        id: 'assignment-id',
        employeeId: 'employee-id',
        appointmentType: 'BASE',
        effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
        effectiveTo: null,
      },
      incidentType: {
        id: 'range-type-id',
        code: 'RANGO',
        temporalMode: 'DATE_RANGE',
        appointmentScope: 'ALL',
        isActive: true,
      },
      formDocumentType: { id: 'document-type-id' },
    });

    await expect(
      service.update('incident-id', { incidentTypeId: 'range-type-id' }, actor),
    ).rejects.toBeInstanceOf(InvalidIncidentTemporalModeError);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('stores the optional commission annex with the principal form', async () => {
    repository.findCreationContext.mockResolvedValue(
      buildCreationContext('COMISION'),
    );
    storage.storeIncidentDocument
      .mockResolvedValueOnce({
        storedName: 'form.pdf',
        storagePath: 'incidents/id/form.pdf',
        contentHash: 'form-hash',
      })
      .mockResolvedValueOnce({
        storedName: 'annex.pdf',
        storagePath: 'incidents/id/annex.pdf',
        contentHash: 'annex-hash',
      });
    repository.create.mockResolvedValue(buildIncident());

    await service.create(
      buildCreateDto(),
      buildFile('formato.pdf', 100),
      actor,
      buildFile('oficio.pdf', 200),
    );

    expect(repository.create).toHaveBeenCalled();
    const createData = repository.create.mock.calls[0]?.[0];
    expect(createData).toBeDefined();
    if (!createData) throw new Error('Expected incident creation data');
    expect(createData.documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          documentTypeId: 'form-document-type-id',
          originalName: 'formato.pdf',
        }),
        expect.objectContaining({
          documentTypeId: 'commission-document-type-id',
          originalName: 'oficio.pdf',
        }),
      ]),
    );
  });

  it('rejects a commission annex for another incident type', async () => {
    repository.findCreationContext.mockResolvedValue(
      buildCreationContext('PERMISO'),
    );

    await expect(
      service.create(
        buildCreateDto(),
        buildFile('formato.pdf', 100),
        actor,
        buildFile('oficio.pdf', 200),
      ),
    ).rejects.toBeInstanceOf(CommissionAnnexNotAllowedError);

    expect(storage.storeIncidentDocument).not.toHaveBeenCalled();
  });
});

function buildCreateDto() {
  return {
    employeeId: 'employee-id',
    employeeAssignmentId: 'assignment-id',
    incidentTypeId: 'type-id',
    receivedAt: '2026-08-14T12:00:00.000Z',
    occurrences: [{ startDate: '2026-08-14' }],
  };
}

function buildFile(originalname: string, size: number) {
  return {
    originalname,
    mimetype: 'application/pdf',
    size,
    buffer: Buffer.from('%PDF'),
  };
}

function buildCreationContext(code: string) {
  return {
    employee: { id: 'employee-id', status: 'ACTIVE' },
    assignment: {
      id: 'assignment-id',
      employeeId: 'employee-id',
      appointmentType: 'BASE',
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      effectiveTo: null,
    },
    incidentType: {
      id: 'type-id',
      code,
      temporalMode: 'SINGLE_DATE',
      appointmentScope: 'ALL',
      isActive: true,
    },
    formDocumentType: { id: 'form-document-type-id' },
    commissionDocumentType: { id: 'commission-document-type-id' },
  };
}

function buildIncident(): IncidentDetailsModel {
  const now = new Date('2026-08-14T12:00:00.000Z');

  return {
    id: 'incident-id',
    employeeId: 'employee-id',
    employeeAssignmentId: 'assignment-id',
    incidentTypeId: 'type-id',
    issuedDate: null,
    receivedAt: now,
    referenceYear: null,
    observations: null,
    status: 'REGISTERED',
    registeredBy: 'user-id',
    updatedBy: null,
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    createdAt: now,
    updatedAt: now,
    employee: {
      id: 'employee-id',
      employeeNumber: '001',
      fullName: 'Persona de prueba',
    },
    assignment: {
      id: 'assignment-id',
      appointmentType: 'BASE',
      schedule: null,
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      effectiveTo: null,
      organizationalUnit: { id: 'unit-id', code: 'U1', name: 'Unidad' },
      position: { id: 'position-id', code: 'P1', name: 'Puesto' },
    },
    incidentType: {
      id: 'type-id',
      code: 'PERMISO',
      name: 'Permiso',
      temporalMode: 'MULTIPLE_DATES',
      appointmentScope: 'ALL',
    },
    occurrences: [
      {
        id: 'occurrence-1',
        incidentId: 'incident-id',
        startDate: new Date('2026-08-10T00:00:00.000Z'),
        endDate: null,
        createdAt: now,
      },
      {
        id: 'occurrence-2',
        incidentId: 'incident-id',
        startDate: new Date('2026-08-11T00:00:00.000Z'),
        endDate: null,
        createdAt: now,
      },
    ],
    registeredByUser: {
      id: 'user-id',
      username: 'admin',
      fullName: 'Administrador',
    },
  };
}
