import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

export class DocumentNotFoundError extends NotFoundException {
  constructor(id: string) {
    super(`No se encontró el documento "${id}"`);
  }
}

export class IncidentNotAvailableForDocumentError extends BadRequestException {
  constructor() {
    super('La incidencia indicada no existe');
  }
}

export class DocumentTypeNotAvailableError extends BadRequestException {
  constructor() {
    super('El tipo de documento no existe o está inactivo');
  }
}

export class PrimaryIncidentFormCannotBeDeletedError extends ConflictException {
  constructor() {
    super('El formato principal de una incidencia no puede eliminarse');
  }
}

export class CommissionAnnexNotAllowedError extends BadRequestException {
  constructor() {
    super(
      'El oficio anexo solo está permitido para incidencias de tipo Comisión',
    );
  }
}

export class CommissionAnnexAlreadyExistsError extends ConflictException {
  constructor() {
    super('La incidencia ya cuenta con un oficio de comisión activo');
  }
}

export class CancelledIncidentDocumentError extends ConflictException {
  constructor() {
    super('No se pueden agregar documentos a una incidencia cancelada');
  }
}
