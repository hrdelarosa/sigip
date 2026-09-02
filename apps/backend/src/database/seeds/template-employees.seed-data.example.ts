type TemplateEmployeeRow = {
  fullName: string;
  employeeNumber: string;
  position: string;
  schedule: string;
  hireDate: string;
  officeCode: string;
  area: string;
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

const positionCodes = new Map(
  [...new Set(exampleRows.map((row) => slug(row.position)))].map(
    (position, index) => [position, `P${String(index + 1).padStart(2, '0')}`],
  ),
);

export const templateEmployeesSeed = exampleRows;

export const templateUnitCode = (officeCode: string, area: string): string =>
  `${officeCode}-${slug(area || 'SIN-AREA')}`.slice(0, 50);

export const templatePositionCode = (
  officeCode: string,
  position: string,
): string => `${officeCode}-${positionCodes.get(slug(position))}`;

export const templateOrganizationalUnitsSeed = [
  {
    officeCode: 'ORGRO',
    code: templateUnitCode('ORGRO', 'CONTROL MIGRATORIO'),
    name: 'Control Migratorio',
  },
];

export const templatePositionsSeed = [
  {
    officeCode: 'ORGRO',
    code: templatePositionCode('ORGRO', exampleRows[0].position),
    name: exampleRows[0].position,
  },
];

export const templateAssignmentsSeed = [
  {
    employeeNumber: '652192',
    officeCode: 'ORGRO',
    unitCode: templateUnitCode('ORGRO', 'CONTROL MIGRATORIO'),
    positionCode: templatePositionCode('ORGRO', exampleRows[0].position),
    appointmentType: 'BASE' as const,
    schedule: '09:00-17:00',
    effectiveFrom: '2026-01-01',
  },
];
