import { NotFoundException } from '@nestjs/common';

export class OfficeNotFoundError extends NotFoundException {
  constructor() {
    super('Oficina no encontrada');
  }
}
