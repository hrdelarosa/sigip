import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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

export class EmptyPositionUpdateError extends BadRequestException {
  constructor() {
    super('Debe proporcionar al menos un campo para actualizar el puesto.');
  }
}

export class PositionHasCurrentOrFutureAssignmentsError extends ConflictException {
  constructor() {
    super(
      'El puesto no puede desactivarse porque tiene asignaciones vigentes o futuras.',
    );
  }
}

export class PositionPersistenceError extends InternalServerErrorException {
  constructor() {
    super('No fue posible completar la operación del puesto.');
  }
}
