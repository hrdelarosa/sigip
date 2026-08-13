import { NotFoundException } from '@nestjs/common';

export class AuditLogNotFoundError extends NotFoundException {
  constructor() {
    super('El registro de auditoría solicitado no existe.');
  }
}
