type TemplateEmployeeRow = {
  fullName: string;
  employeeNumber: string;
  position: string;
  schedule: string;
  hireDate: string;
  officeCode: string;
  area?: string;
};

const exampleRows: readonly TemplateEmployeeRow[] = [
  {
    fullName: 'Empleado Ficticio 001',
    employeeNumber: '652192',
    position: 'Agente Federal de Migración B',
    schedule: '09:00-17:00',
    hireDate: '2026-01-01',
    officeCode: 'ORGRO',
    area: 'CONTROL MIGRATORIO',
  },
];

const slug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const templateEmployeesSeed = exampleRows;

export const templateUnitCode = (_officeCode: string, area: string): string =>
  slug(area);

export const templatePositionCode = (
  _officeCode: string,
  _position: string,
): string => 'AGENTE-MIGRACION-B';

export const templateOrganizationalUnitsSeed = [
  {
    code: templateUnitCode('ORGRO', 'CONTROL MIGRATORIO'),
    name: 'Control Migratorio',
    description: 'Unidad responsable del control migratorio.',
  },
];

export const templatePositionsSeed = [
  {
    code: 'AGENTE-MIGRACION-B',
    name: exampleRows[0].position,
    description: 'Puesto de Agente Federal de Migración B.',
  },
];

export const templateAssignmentsSeed = [
  {
    employeeNumber: '652192',
    officeCode: 'ORGRO',
    unitCode: templateUnitCode('ORGRO', 'CONTROL MIGRATORIO'),
    positionCode: templatePositionCode('ORGRO', exampleRows[0].position),
    appointmentType: 'CONFIANZA' as const,
    schedule: '09:00-17:00',
    effectiveFrom: '2026-01-01',
  },
];
