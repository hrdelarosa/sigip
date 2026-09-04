import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import * as exampleSeedData from './template-employees.seed-data.example';

interface TemplateEmployeeRow {
  fullName: string;
  employeeNumber: string;
  position: string;
  schedule: string;
  hireDate: string;
  officeCode: string;
  area?: string;
}

interface TemplateCatalogItem {
  code: string;
  name: string;
  description: string;
}

interface TemplateAssignment {
  employeeNumber: string;
  officeCode: string;
  unitCode?: string;
  positionCode: string;
  appointmentType: 'BASE' | 'CONFIANZA';
  schedule: string;
  effectiveFrom: string;
}

interface SeedData {
  templateEmployeesSeed: readonly TemplateEmployeeRow[];
  templateUnitCode: (officeCode: string, area: string) => string;
  templatePositionCode: (officeCode: string, position: string) => string;
  templateOrganizationalUnitsSeed: readonly TemplateCatalogItem[];
  templatePositionsSeed: readonly TemplateCatalogItem[];
  templateAssignmentsSeed: readonly TemplateAssignment[];
}

const localSeedPath = resolve(
  __dirname,
  'template-employees.seed-data.local.ts',
);
const loadModule = createRequire(__filename);
const seedData: SeedData = existsSync(localSeedPath)
  ? (loadModule(localSeedPath) as SeedData)
  : exampleSeedData;

export const templateEmployeesSeed = seedData.templateEmployeesSeed;
export const templateUnitCode = seedData.templateUnitCode;
export const templatePositionCode = seedData.templatePositionCode;
export const templateOrganizationalUnitsSeed =
  seedData.templateOrganizationalUnitsSeed;
export const templatePositionsSeed = seedData.templatePositionsSeed;
export const templateAssignmentsSeed = seedData.templateAssignmentsSeed;
