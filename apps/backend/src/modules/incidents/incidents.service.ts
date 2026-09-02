import { Injectable } from '@nestjs/common';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { DocumentStorageService } from '../documents/storage/document-storage.service';
import { CancelIncidentDto } from './dto/cancel-incident.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { ListIncidentsQueryDto } from './dto/list-incidents-query.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import {
  CancelledIncidentModificationError,
  CommissionAnnexNotAllowedError,
  CommissionAnnexTypeChangeError,
  CommissionDocumentTypeMissingError,
  DuplicateIncidentOccurrenceError,
  EmptyIncidentUpdateError,
  InactiveIncidentEmployeeError,
  IncidentAlreadyCancelledError,
  IncidentCreateTransactionError,
  IncidentEmployeeNotFoundError,
  IncidentFormDocumentTypeMissingError,
  IncidentFormRequiredError,
  IncidentNotFoundError,
  IncidentOutsideAssignmentPeriodError,
  IncidentPersistenceError,
  IncidentTypeNotAvailableError,
  IncidentVacationDayLimitError,
  IncidentVacationHireDateRequiredError,
  IncidentVacationNotEligibleError,
  IncidentVacationOutsidePeriodError,
  IncidentVacationPeriodNotAvailableError,
  InvalidIncidentAppointmentScopeError,
  InvalidIncidentAssignmentError,
  InvalidIncidentDateError,
  InvalidIncidentTemporalModeError,
} from './incidents.errors';

import { IncidentsRepository } from './repositories/incidents.repository';
import { getOfficeScope } from '../../common/authorization/office-scope';
import { DocumentsRepository } from '../documents/repositories/documents.repository';

import type { IncidentOccurrenceData } from './types/incidents.types';
import type { UploadedMemoryFile } from '../../common/types/uploaded-memory-file.type';
import {
  getVacationPeriodFromCode,
  getVacationPeriodDates,
  getCurrentVacationPeriod,
  institutionalCalendarDate,
  isDateInVacationPeriod,
  isVacationDateEligible,
} from '../../common/vacation/vacation-control';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly repository: IncidentsRepository,

    private readonly storage: DocumentStorageService,
    private readonly documentsRepository: DocumentsRepository,
  ) {}

  private parseDate(value: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new InvalidIncidentDateError();
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new InvalidIncidentDateError();
    }

    return date;
  }

  private parseNullableDate(value?: string | null): Date | null {
    return value ? this.parseDate(value) : null;
  }

  private parseDateTime(value: string): Date {
    const result = new Date(value);

    if (Number.isNaN(result.getTime())) {
      throw new InvalidIncidentDateError();
    }

    return result;
  }

  private normalizeOccurrences(
    occurrences: {
      startDate: string;
      endDate?: string | null;
    }[],
  ): IncidentOccurrenceData[] {
    const normalized = occurrences.map((occurrence) => {
      const startDate = this.parseDate(occurrence.startDate);
      const endDate = this.parseNullableDate(occurrence.endDate);

      if (endDate && endDate.getTime() < startDate.getTime()) {
        throw new InvalidIncidentDateError();
      }

      return {
        id: generateUuidV7(),
        startDate,
        endDate,
      };
    });

    const keys = normalized.map(
      (occurrence) =>
        `${occurrence.startDate.toISOString().slice(0, 10)}|${
          occurrence.endDate?.toISOString().slice(0, 10) ?? ''
        }`,
    );

    if (new Set(keys).size !== keys.length) {
      throw new DuplicateIncidentOccurrenceError();
    }

    const sorted = [...normalized].sort(
      (left, right) => left.startDate.getTime() - right.startDate.getTime(),
    );

    for (let index = 1; index < sorted.length; index += 1) {
      const previousEnd =
        sorted[index - 1].endDate ?? sorted[index - 1].startDate;

      if (sorted[index].startDate <= previousEnd) {
        throw new DuplicateIncidentOccurrenceError();
      }
    }

    return normalized;
  }

  private validateTemporalMode(
    temporalMode: 'SINGLE_DATE' | 'MULTIPLE_DATES' | 'DATE_RANGE',
    occurrences: IncidentOccurrenceData[],
  ): void {
    switch (temporalMode) {
      case 'SINGLE_DATE':
        if (occurrences.length !== 1 || occurrences[0].endDate !== null) {
          throw new InvalidIncidentTemporalModeError();
        }
        return;

      case 'MULTIPLE_DATES':
        if (occurrences.some((occurrence) => occurrence.endDate !== null)) {
          throw new InvalidIncidentTemporalModeError();
        }
        return;

      case 'DATE_RANGE':
        if (occurrences.length !== 1 || occurrences[0].endDate === null) {
          throw new InvalidIncidentTemporalModeError();
        }
        return;
    }
  }

  private validateVacationDayLimit(
    incidentTypeCode: string,
    occurrences: IncidentOccurrenceData[],
  ): void {
    const ordinaryVacationCodes = [
      'VACACIONES_PRIMER_PERIODO',
      'VACACIONES_SEGUNDO_PERIODO',
    ];

    if (
      ordinaryVacationCodes.includes(incidentTypeCode) &&
      occurrences.length > 10
    ) {
      throw new IncidentVacationDayLimitError();
    }
  }

  private validateOrdinaryVacationTemporalMode(
    incidentTypeCode: string,
    temporalMode: 'SINGLE_DATE' | 'MULTIPLE_DATES' | 'DATE_RANGE',
  ): void {
    if (
      getVacationPeriodFromCode(incidentTypeCode) &&
      temporalMode !== 'MULTIPLE_DATES'
    ) {
      throw new InvalidIncidentTemporalModeError();
    }
  }

  private validateVacationEligibility(
    incidentTypeCode: string,
    hireDate: Date | null,
    occurrences: IncidentOccurrenceData[],
  ): void {
    const period = getVacationPeriodFromCode(incidentTypeCode);
    if (!period) return;
    if (!hireDate) throw new IncidentVacationHireDateRequiredError();

    const years = new Set(
      occurrences.map((occurrence) => occurrence.startDate.getUTCFullYear()),
    );
    const currentPeriod = getCurrentVacationPeriod(institutionalCalendarDate());
    const selectedYear = occurrences[0]?.startDate.getUTCFullYear();
    if (
      years.size !== 1 ||
      occurrences.some(
        (occurrence) => !isDateInVacationPeriod(occurrence.startDate, period),
      )
    ) {
      throw new IncidentVacationOutsidePeriodError(
        period,
        selectedYear,
        currentPeriod.period,
        currentPeriod.year,
      );
    }

    const year = occurrences[0].startDate.getUTCFullYear();
    const { startDate } = getVacationPeriodDates(year, period);
    if (institutionalCalendarDate() < startDate) {
      throw new IncidentVacationPeriodNotAvailableError(year, period);
    }

    if (
      occurrences.some(
        (occurrence) => !isVacationDateEligible(hireDate, occurrence.startDate),
      )
    ) {
      throw new IncidentVacationNotEligibleError();
    }
  }

  private validateAppointmentScope(
    scope: 'ALL' | 'BASE' | 'CONFIANZA',
    appointmentType: string,
  ): void {
    if (scope === 'ALL') {
      return;
    }

    if (scope !== appointmentType) {
      throw new InvalidIncidentAppointmentScopeError();
    }
  }

  private validateAssignmentCoverage(
    effectiveFrom: Date,
    effectiveTo: Date | null,
    occurrences: IncidentOccurrenceData[],
  ): void {
    for (const occurrence of occurrences) {
      const end = occurrence.endDate ?? occurrence.startDate;

      if (occurrence.startDate < effectiveFrom) {
        throw new IncidentOutsideAssignmentPeriodError();
      }

      if (effectiveTo && end > effectiveTo) {
        throw new IncidentOutsideAssignmentPeriodError();
      }
    }
  }

  async findAll(query: ListIncidentsQueryDto, actor: AuthenticatedUserModel) {
    const scope = getOfficeScope(actor);
    const from = query.from ? this.parseDate(query.from) : undefined;
    const to = query.to ? this.parseDate(query.to) : undefined;

    if (from && to && from > to) {
      throw new InvalidIncidentDateError();
    }

    return this.repository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search?.trim(),
      status: query.status,
      employeeId: query.employeeId,
      incidentTypeId: query.incidentTypeId,
      organizationalUnitId: query.organizationalUnitId,
      from,
      to,
      officeId: scope.canAccessAllOffices ? undefined : scope.officeId,
    });
  }

  async findById(id: string, actor: AuthenticatedUserModel) {
    const scope = getOfficeScope(actor);
    const incident = await this.repository.findById(
      id,
      scope.canAccessAllOffices ? undefined : scope.officeId,
    );

    if (!incident) throw new IncidentNotFoundError(id);

    return incident;
  }

  async create(
    dto: CreateIncidentDto,
    file: UploadedMemoryFile | undefined,
    actor: AuthenticatedUserModel,
    commissionAnnex?: UploadedMemoryFile,
  ) {
    if (!file) {
      throw new IncidentFormRequiredError();
    }

    const scope = getOfficeScope(actor);
    const officeId = scope.canAccessAllOffices ? undefined : scope.officeId;
    const occurrences = this.normalizeOccurrences(dto.occurrences);
    const occurrenceFrom = new Date(
      Math.min(
        ...occurrences.map((occurrence) => occurrence.startDate.getTime()),
      ),
    );
    const occurrenceTo = new Date(
      Math.max(
        ...occurrences.map((occurrence) =>
          (occurrence.endDate ?? occurrence.startDate).getTime(),
        ),
      ),
    );
    const context = await this.repository.findCreationContext(
      dto.employeeId,
      dto.employeeAssignmentId,
      dto.incidentTypeId,
      occurrenceFrom,
      occurrenceTo,
      officeId,
    );

    if (!context.employee) {
      throw new IncidentEmployeeNotFoundError();
    }

    if (context.employee.status !== 'ACTIVE') {
      throw new InactiveIncidentEmployeeError();
    }

    const { hasApplicableAssignment } = context;

    if (hasApplicableAssignment && !context.assignment) {
      throw new InvalidIncidentAssignmentError();
    }

    if (
      context.assignment &&
      context.assignment.employeeId !== dto.employeeId
    ) {
      throw new InvalidIncidentAssignmentError();
    }

    if (!hasApplicableAssignment && dto.employeeAssignmentId) {
      throw new InvalidIncidentAssignmentError();
    }

    if (!context.incidentType || !context.incidentType.isActive) {
      throw new IncidentTypeNotAvailableError();
    }

    if (!context.formDocumentType) {
      throw new IncidentFormDocumentTypeMissingError();
    }

    if (commissionAnnex && context.incidentType.code !== 'COMISION') {
      throw new CommissionAnnexNotAllowedError();
    }

    if (commissionAnnex && !context.commissionDocumentType) {
      throw new CommissionDocumentTypeMissingError();
    }

    if (context.assignment) {
      this.validateAppointmentScope(
        context.incidentType.appointmentScope,
        context.assignment.appointmentType,
      );
    }

    this.validateOrdinaryVacationTemporalMode(
      context.incidentType.code,
      context.incidentType.temporalMode,
    );
    this.validateTemporalMode(context.incidentType.temporalMode, occurrences);
    this.validateVacationDayLimit(context.incidentType.code, occurrences);
    this.validateVacationEligibility(
      context.incidentType.code,
      context.employee.hireDate,
      occurrences,
    );

    if (context.assignment) {
      this.validateAssignmentCoverage(
        context.assignment.effectiveFrom,
        context.assignment.effectiveTo,
        occurrences,
      );
    }

    const incidentId = generateUuidV7();
    const storedPaths: string[] = [];

    try {
      const formDocumentId = generateUuidV7();
      const storedForm = await this.storage.storeIncidentDocument(
        incidentId,
        formDocumentId,
        file,
      );
      storedPaths.push(storedForm.storagePath);

      const documents = [
        {
          id: formDocumentId,
          documentTypeId: context.formDocumentType.id,
          originalName: file.originalname,
          storedName: storedForm.storedName,
          storagePath: storedForm.storagePath,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          contentHash: storedForm.contentHash,
          uploadedBy: actor.userId,
        },
      ];

      if (commissionAnnex && context.commissionDocumentType) {
        const annexDocumentId = generateUuidV7();
        const storedAnnex = await this.storage.storeIncidentDocument(
          incidentId,
          annexDocumentId,
          commissionAnnex,
        );
        storedPaths.push(storedAnnex.storagePath);
        documents.push({
          id: annexDocumentId,
          documentTypeId: context.commissionDocumentType.id,
          originalName: commissionAnnex.originalname,
          storedName: storedAnnex.storedName,
          storagePath: storedAnnex.storagePath,
          mimeType: commissionAnnex.mimetype,
          sizeBytes: commissionAnnex.size,
          contentHash: storedAnnex.contentHash,
          uploadedBy: actor.userId,
        });
      }

      return await this.repository.create({
        incident: {
          id: incidentId,
          employeeId: dto.employeeId,
          employeeAssignmentId: dto.employeeAssignmentId ?? null,
          incidentTypeId: dto.incidentTypeId,
          issuedDate: this.parseNullableDate(dto.issuedDate),
          receivedAt: this.parseDateTime(dto.receivedAt),
          referenceYear: dto.referenceYear ?? null,
          observations: dto.observations?.trim() || null,
          registeredBy: actor.userId,
        },
        occurrences,
        documents,
        audit: {
          userId: actor.userId,
          sessionId: actor.sessionId,
        },
        control: {
          incidentTypeCode: context.incidentType.code,
        },
        officeId,
      });
    } catch (error) {
      await Promise.all(
        storedPaths.map((path) =>
          this.storage.remove(path).catch(() => undefined),
        ),
      );

      if (!(error instanceof IncidentCreateTransactionError)) throw error;
      throw new IncidentPersistenceError();
    }
  }

  async update(
    id: string,
    dto: UpdateIncidentDto,
    actor: AuthenticatedUserModel,
  ) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new EmptyIncidentUpdateError();
    }

    const scope = getOfficeScope(actor);
    const officeId = scope.canAccessAllOffices ? undefined : scope.officeId;
    const current = await this.findById(id, actor);

    if (current.status === 'CANCELLED') {
      throw new CancelledIncidentModificationError();
    }

    const incidentTypeId = dto.incidentTypeId ?? current.incidentTypeId;
    const occurrences = dto.occurrences
      ? this.normalizeOccurrences(dto.occurrences)
      : current.occurrences.map((occurrence) => ({
          id: occurrence.id,
          startDate: occurrence.startDate,
          endDate: occurrence.endDate,
        }));
    const occurrenceFrom = new Date(
      Math.min(
        ...occurrences.map((occurrence) => occurrence.startDate.getTime()),
      ),
    );
    const occurrenceTo = new Date(
      Math.max(
        ...occurrences.map((occurrence) =>
          (occurrence.endDate ?? occurrence.startDate).getTime(),
        ),
      ),
    );
    const context = await this.repository.findCreationContext(
      current.employeeId,
      current.employeeAssignmentId,
      incidentTypeId,
      occurrenceFrom,
      occurrenceTo,
      officeId,
    );

    if (!context.incidentType || !context.incidentType.isActive) {
      throw new IncidentTypeNotAvailableError();
    }

    const { hasApplicableAssignment } = context;

    if (hasApplicableAssignment && !context.assignment) {
      throw new InvalidIncidentAssignmentError();
    }

    if (
      current.incidentType.code === 'COMISION' &&
      context.incidentType.code !== 'COMISION'
    ) {
      const incidentDocuments = await this.documentsRepository.findByIncidentId(
        id,
        scope.canAccessAllOffices ? undefined : scope.officeId,
      );
      if (
        incidentDocuments.some(
          (document) => document.documentType.code === 'OFICIO_COMISION',
        )
      ) {
        throw new CommissionAnnexTypeChangeError();
      }
    }

    if (context.assignment) {
      this.validateAppointmentScope(
        context.incidentType.appointmentScope,
        context.assignment.appointmentType,
      );
    }

    this.validateOrdinaryVacationTemporalMode(
      context.incidentType.code,
      context.incidentType.temporalMode,
    );
    this.validateTemporalMode(context.incidentType.temporalMode, occurrences);
    this.validateVacationDayLimit(context.incidentType.code, occurrences);
    this.validateVacationEligibility(
      context.incidentType.code,
      context.employee?.hireDate ?? null,
      occurrences,
    );

    if (context.assignment) {
      this.validateAssignmentCoverage(
        context.assignment.effectiveFrom,
        context.assignment.effectiveTo,
        occurrences,
      );
    }

    const result = await this.repository.update(
      id,
      {
        expectedUpdatedAt: current.updatedAt,
        incidentTypeId: dto.incidentTypeId,
        issuedDate:
          dto.issuedDate !== undefined
            ? this.parseNullableDate(dto.issuedDate)
            : undefined,
        receivedAt: dto.receivedAt
          ? this.parseDateTime(dto.receivedAt)
          : undefined,
        referenceYear: dto.referenceYear,
        observations:
          dto.observations !== undefined
            ? dto.observations?.trim() || null
            : undefined,
        occurrences: dto.occurrences ? occurrences : undefined,
        updatedBy: actor.userId,
        updatedAt: new Date(),
        sessionId: actor.sessionId,
        control: {
          employeeId: current.employeeId,
          incidentTypeCode: context.incidentType.code,
        },
        officeId,
      },
      officeId,
    );

    if (!result) throw new IncidentNotFoundError(id);

    return result;
  }

  async cancel(
    id: string,
    dto: CancelIncidentDto,
    actor: AuthenticatedUserModel,
  ) {
    const scope = getOfficeScope(actor);
    const officeId = scope.canAccessAllOffices ? undefined : scope.officeId;
    const current = await this.findById(id, actor);

    if (current.status === 'CANCELLED') {
      throw new IncidentAlreadyCancelledError();
    }

    const now = new Date();
    const result = await this.repository.cancel(
      id,
      {
        cancelledAt: now,
        cancelledBy: actor.userId,
        cancellationReason: dto.reason.trim(),
        updatedAt: now,
        sessionId: actor.sessionId,
        officeId,
      },
      officeId,
    );

    if (!result) throw new IncidentNotFoundError(id);

    return result;
  }
}
