import { BadRequestException } from '@nestjs/common';

export class ReportLimitExceededError extends BadRequestException {
  constructor(limit: number) {
    super(`El reporte excede el límite de ${limit} registros.`);
  }
}
