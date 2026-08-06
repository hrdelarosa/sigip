import { ConflictException, NotFoundException } from '@nestjs/common';

export class PositionNotFoundError extends NotFoundException {
  constructor() {
    super('El puesto solicitado no existe o no se encuentra disponible.');
  }
}

export class PositionCodeAlreadyExistsError extends ConflictException {
  constructor() {
    super(
      'El código del puesto ya existe. Por favor, elija un código diferente.',
    );
  }
}
