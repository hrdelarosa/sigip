import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

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

export class EmptyOrganizationalUnitUpdateError extends BadRequestException {
  constructor() {
    super(
      'Debe proporcionar al menos un campo para actualizar la unidad organizacional.',
    );
  }
}

export class InvalidOrganizationalUnitParentError extends BadRequestException {
  constructor() {
    super('La unidad organizacional padre no existe o no se encuentra activa.');
  }
}

export class OrganizationalUnitHierarchyCycleError extends ConflictException {
  constructor() {
    super(
      'La unidad organizacional no puede ser padre de sí misma ni de uno de sus ancestros.',
    );
  }
}

export class OrganizationalUnitHasActiveChildrenError extends ConflictException {
  constructor() {
    super(
      'No se puede desactivar una unidad organizacional con unidades hijas activas.',
    );
  }
}

export class OrganizationalUnitHasCurrentOrFutureAssignmentsError extends ConflictException {
  constructor() {
    super(
      'No se puede desactivar una unidad organizacional con asignaciones vigentes o futuras.',
    );
  }
}
