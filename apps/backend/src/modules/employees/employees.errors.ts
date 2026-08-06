import {
  BadRequestException,
  ConflictException,
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
