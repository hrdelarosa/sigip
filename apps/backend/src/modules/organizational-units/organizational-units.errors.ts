import { ConflictException, NotFoundException } from '@nestjs/common';

export class OrganizationalUnitsNotFoundError extends NotFoundException {
  constructor() {
    super(
      'La unidad organizacional solicitada no existe o no se encuentra disponible.',
    );
  }
}

export class OrganizationalUnitCodeAlreadyExistsError extends ConflictException {
  constructor() {
    super(
      'El código de la unidad organizacional ya existe. Por favor, elija un código diferente.',
    );
  }
}
