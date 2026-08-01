import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

export class RoleNotFoundError extends NotFoundException {
  constructor() {
    super('El rol solicitado no existe o no se encuentra disponible.');
  }
}

export class RoleCodeAlreadyExistsError extends ConflictException {
  constructor() {
    super('El código del rol ya existe. Por favor, elija un código diferente.');
  }
}

export class RoleHasAssignedUsersError extends ConflictException {
  constructor() {
    super(
      'El rol no puede desactivarse porque tiene usuarios asignados. Por favor, reasigne o desactivar los usuarios antes de desactivar el rol.',
    );
  }
}

export class InvalidPermissionError extends BadRequestException {
  constructor() {
    super(
      'Uno o más permisos proporcionados no son válidos o no existen en el sistema.',
    );
  }
}
