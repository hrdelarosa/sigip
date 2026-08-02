import { ConflictException, NotFoundException } from '@nestjs/common';

export class PermissionNotFoundError extends NotFoundException {
  constructor() {
    super('El permiso solicitado no existe o no se encuentra disponible.');
  }
}

export class PermissionCodeAlreadyExistsError extends ConflictException {
  constructor() {
    super(
      'El código del permiso ya existe. Por favor, elija un código diferente.',
    );
  }
}
