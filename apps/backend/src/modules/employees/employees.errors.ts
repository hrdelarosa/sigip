import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export class EmployeeNotFoundError extends NotFoundException {
  constructor(id: string) {
    super(
      `El empleado solicitado (${id}) no existe o no se encuentra disponible.`,
    );
  }
}

export class EmployeeNumberAlreadyExistsError extends ConflictException {
  constructor(employeeNumber: string) {
    super(
      `El número de empleado (${employeeNumber}) ya existe. Por favor, utilice un número diferente.`,
    );
  }
}

export class EmployeeAssignmentNotFoundError extends NotFoundException {
  constructor(assignmentId: string) {
    super(
      `La asignación de empleado solicitada (${assignmentId}) no existe o no se encuentra disponible.`,
    );
  }
}

export class EmptyEmployeeUpdateError extends BadRequestException {
  constructor() {
    super('Debe proporcionar al menos un campo para actualizar el empleado.');
  }
}

export class EmptyEmployeeAssignmentUpdateError extends BadRequestException {
  constructor() {
    super('Debe proporcionar al menos un campo para actualizar la asignación.');
  }
}

export class InvalidAdministrativeDateError extends BadRequestException {
  constructor() {
    super('Las fechas deben tener el formato YYYY-MM-DD y ser fechas válidas.');
  }
}

export class InvalidAssignmentPeriodError extends BadRequestException {
  constructor() {
    super(
      'La fecha final de la asignación no puede ser anterior a la fecha de inicio.',
    );
  }
}

export class OverlappingEmployeeAssignmentError extends ConflictException {
  constructor() {
    super(
      'El periodo de asignación del empleado se superpone con otra asignación existente. Por favor, ajuste las fechas para evitar conflictos.',
    );
  }
}

export class EmployeeHasCurrentOrFutureAssignmentsError extends ConflictException {
  constructor() {
    super(
      'El empleado no puede desactivarse porque tiene asignaciones vigentes o futuras.',
    );
  }
}

export class InactiveEmployeeAssignmentError extends ConflictException {
  constructor() {
    super(
      'Un empleado inactivo no puede recibir nuevas asignaciones ni mantener asignaciones vigentes o futuras.',
    );
  }
}

export class OrganizationalUnitNotAvailableError extends BadRequestException {
  constructor() {
    super('La unidad organizativa indicada no existe o no está activa');
  }
}

export class PositionNotAvailableError extends BadRequestException {
  constructor() {
    super('El puesto indicado no existe o no está activo');
  }
}

export class InvalidEmployeeAssignmentReferenceError extends BadRequestException {
  constructor() {
    super(
      'La asignación contiene una referencia que no existe o no está disponible.',
    );
  }
}

export class EmployeePersistenceError extends InternalServerErrorException {
  constructor() {
    super('No fue posible completar la operación del empleado.');
  }
}
