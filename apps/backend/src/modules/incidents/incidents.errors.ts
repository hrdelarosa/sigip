import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

export class IncidentNotFoundError extends NotFoundException {
  constructor(id: string) {
    super(`No se encontró la incidencia "${id}"`);
  }
}

export class IncidentEmployeeNotFoundError extends BadRequestException {
  constructor() {
    super('El empleado indicado no existe');
  }
}

export class InactiveIncidentEmployeeError extends BadRequestException {
  constructor() {
    super('No se pueden registrar incidencias para un empleado inactivo');
  }
}

export class InvalidIncidentAssignmentError extends BadRequestException {
  constructor() {
    super('La asignación indicada no pertenece al empleado');
  }
}

export class IncidentTypeNotAvailableError extends BadRequestException {
  constructor() {
    super('El tipo de incidencia indicado no existe o está inactivo');
  }
}

export class InvalidIncidentAppointmentScopeError extends BadRequestException {
  constructor() {
    super(
      'El tipo de incidencia no es válido para el nombramiento del empleado',
    );
  }
}

export class InvalidIncidentTemporalModeError extends BadRequestException {
  constructor() {
    super(
      'Las fechas capturadas no coinciden con la modalidad temporal del tipo de incidencia',
    );
  }
}

export class InvalidIncidentDateError extends BadRequestException {
  constructor() {
    super('Una o más fechas de la incidencia no son válidas');
  }
}

export class DuplicateIncidentOccurrenceError extends ConflictException {
  constructor() {
    super('La incidencia contiene fechas u ocurrencias duplicadas');
  }
}

export class IncidentOutsideAssignmentPeriodError extends BadRequestException {
  constructor() {
    super(
      'Una o más fechas de la incidencia están fuera de la vigencia de la asignación laboral',
    );
  }
}

export class IncidentFormRequiredError extends BadRequestException {
  constructor() {
    super('El formato de incidencia en PDF es obligatorio');
  }
}

export class IncidentFormDocumentTypeMissingError extends BadRequestException {
  constructor() {
    super(
      'No se encuentra configurado el tipo de documento FORMATO_INCIDENCIA',
    );
  }
}

export class CommissionAnnexNotAllowedError extends BadRequestException {
  constructor() {
    super(
      'El oficio anexo solo puede adjuntarse a incidencias de tipo Comisión',
    );
  }
}

export class CommissionDocumentTypeMissingError extends BadRequestException {
  constructor() {
    super('No se encuentra configurado el tipo de documento OFICIO_COMISION');
  }
}

export class CommissionAnnexTypeChangeError extends ConflictException {
  constructor() {
    super(
      'Elimine el oficio de comisión antes de cambiar el tipo de incidencia',
    );
  }
}

export class CancelledIncidentModificationError extends ConflictException {
  constructor() {
    super('Una incidencia cancelada no puede modificarse');
  }
}

export class IncidentAlreadyCancelledError extends ConflictException {
  constructor() {
    super('La incidencia ya se encuentra cancelada');
  }
}

export class IncidentPersistenceError extends BadRequestException {
  constructor() {
    super('No fue posible guardar la incidencia');
  }
}

export class EmptyIncidentUpdateError extends BadRequestException {
  constructor() {
    super('Debe indicar al menos un campo para actualizar');
  }
}

export class IncidentConcurrentModificationError extends ConflictException {
  constructor() {
    super(
      'La incidencia fue modificada por otra operación; vuelva a intentarlo',
    );
  }
}

export class IncidentCreateTransactionError extends Error {
  constructor(options?: ErrorOptions) {
    super('No fue posible confirmar la incidencia', options);
  }
}
