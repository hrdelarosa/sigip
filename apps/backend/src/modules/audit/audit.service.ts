import { BadRequestException, Injectable } from '@nestjs/common';

import type { PaginatedResult } from '../../common/pagination/types/pagination.types';
import { AuditLogNotFoundError } from './audit.errors';
import type { AuditLogModel } from './models/audit-log.model';
import { AuditRepository } from './repositories/audit.repository';
import type { AuditFilters } from './types/audit.types';
import type { AppendAuditLogData } from './types/audit.types';
import type { DrizzleTransaction } from '../../database/database.types';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  findAll(filters: AuditFilters): Promise<PaginatedResult<AuditLogModel>> {
    if (
      filters.createdFrom &&
      filters.createdTo &&
      filters.createdFrom > filters.createdTo
    ) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    return this.auditRepository.findAll(filters);
  }

  async findById(id: string): Promise<AuditLogModel> {
    const auditLog = await this.auditRepository.findById(id);

    if (!auditLog) throw new AuditLogNotFoundError();

    return auditLog;
  }

  append(
    data: AppendAuditLogData,
    transaction?: DrizzleTransaction,
  ): Promise<void> {
    this.assertSafeSnapshot(data.oldValues);
    this.assertSafeSnapshot(data.newValues);

    return this.auditRepository.append(data, transaction);
  }

  private assertSafeSnapshot(value: AppendAuditLogData['oldValues']): void {
    if (!value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      value.forEach((item) => this.assertSafeSnapshot(item));
      return;
    }

    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.replaceAll(/[_-]/g, '').toLowerCase();
      if (
        normalizedKey.includes('password') ||
        normalizedKey.includes('token') ||
        normalizedKey.includes('secret') ||
        normalizedKey.includes('authorization') ||
        normalizedKey.includes('cookie') ||
        normalizedKey.includes('apikey') ||
        normalizedKey.includes('binarycontent')
      ) {
        throw new Error(`El campo sensible ${key} no puede auditarse.`);
      }

      this.assertSafeSnapshot(nestedValue);
    }
  }
}
