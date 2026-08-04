import { ConflictException, NotFoundException } from '@nestjs/common';

export class UserNotFoundError extends NotFoundException {
  constructor() {
    super('El usuario solicitado no existe o no se encuentra disponible.');
  }
}

export class UsernameAlreadyExistsError extends ConflictException {
  constructor() {
    super(
      'El nombre de usuario ya existe. Por favor, elija un nombre de usuario diferente.',
    );
  }
}

export class UserChangePasswordError extends ConflictException {
  constructor() {
    super(
      'No se puede cambiar la contraseña de un usuario inactivo. Por favor, active el usuario antes de cambiar la contraseña.',
    );
  }
}
