import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export class IncidentTypeNotFoundError extends NotFoundException {
  constructor(id: string) {
    super(`No se encontró el tipo de incidencia "${id}"`);
  }
}

export class IncidentTypeCodeAlreadyExistsError extends ConflictException {
  constructor(code: string) {
    super(`Ya existe un tipo de incidencia con código "${code}"`);
  }
}

export class EmptyIncidentTypeUpdateError extends BadRequestException {
  constructor() {
    super('Debe indicar al menos un campo para actualizar');
  }
}

export class IncidentTypePersistenceError extends InternalServerErrorException {
  constructor() {
    super('No fue posible guardar el tipo de incidencia');
  }
}

export class IncidentTypeInUseError extends ConflictException {
  constructor() {
    super(
      'No puede cambiar la modalidad o el nombramiento de un tipo con incidencias registradas',
    );
  }
}
