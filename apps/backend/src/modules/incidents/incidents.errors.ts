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

export class IncidentVacationDayLimitError extends BadRequestException {
  constructor() {
    super('Solo se pueden registrar hasta 10 días de vacaciones por periodo');
  }
}

export class IncidentVacationHireDateRequiredError extends BadRequestException {
  constructor() {
    super(
      'El empleado debe tener una fecha de ingreso para registrar vacaciones',
    );
  }
}

export class IncidentVacationOutsidePeriodError extends BadRequestException {
  constructor(
    selectedPeriod?: 'FIRST' | 'SECOND',
    selectedYear?: number,
    currentPeriod?: 'FIRST' | 'SECOND',
    currentYear?: number,
  ) {
    if (
      selectedPeriod &&
      selectedYear &&
      currentPeriod &&
      currentYear &&
      selectedYear === currentYear &&
      selectedPeriod !== currentPeriod
    ) {
      const selectedLabel =
        selectedPeriod === 'FIRST'
          ? 'primer periodo (enero a junio)'
          : 'segundo periodo (julio a diciembre)';
      const currentLabel =
        currentPeriod === 'FIRST'
          ? 'primer periodo (enero a junio)'
          : 'segundo periodo (julio a diciembre)';
      super(
        `No es posible registrar vacaciones del ${selectedLabel} de ${selectedYear}, porque actualmente nos encontramos en el ${currentLabel} de ${currentYear}.`,
      );
      return;
    }

    super('Las fechas de vacaciones deben pertenecer al periodo seleccionado');
  }
}

export class IncidentVacationNotEligibleError extends ConflictException {
  constructor() {
    super('El empleado aún no cumple seis meses desde su fecha de ingreso');
  }
}

export class IncidentVacationPeriodNotAvailableError extends ConflictException {
  constructor(year: number, period: 'FIRST' | 'SECOND') {
    const periodLabel =
      period === 'FIRST' ? 'enero a junio' : 'julio a diciembre';
    super(
      `El periodo vacacional de ${periodLabel} de ${year} aún no está disponible. Seleccione el periodo vacacional vigente.`,
    );
  }
}

export class IncidentVacationBalanceExceededError extends ConflictException {
  constructor(availableDays: number) {
    super(
      `El empleado solo tiene ${availableDays} ${availableDays === 1 ? 'día disponible' : 'días disponibles'} en el periodo vacacional seleccionado.`,
    );
  }
}

export class DuplicateActiveVacationDateError extends ConflictException {
  constructor() {
    super('Una o más fechas ya están registradas como vacaciones activas');
  }
}

export class MonthlyJustificationLimitError extends ConflictException {
  constructor() {
    super('El empleado ya alcanzó el máximo de 3 justificaciones en el mes');
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
