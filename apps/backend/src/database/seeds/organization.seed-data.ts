export const organizationalUnitsSeed = [
  ['DIRECCION-ENLACE-LEGAL', 'Dirección y Enlace Legal'],
  ['ASUNTOS-JURIDICOS', 'Departamento de Asuntos Jurídicos'],
  ['REGULACION-MIGRATORIA', 'Departamento de Regulación Migratoria'],
  ['CONTROL-VERIFICACION', 'Departamento de Control y Verificación Migratoria'],
  ['RECURSOS-HUMANOS', 'Departamento de Recursos Humanos'],
  ['RECURSOS-MATERIALES', 'Departamento de Recursos Materiales y Servicios'],
  ['RECURSOS-FINANCIEROS', 'Departamento de Recursos Financieros'],
  ['INFORMATICA-TELECOMUNICACIONES', 'Informática y Telecomunicaciones'],
  ['ESTACION-MIGRATORIA', 'Coordinación de Estación Migratoria'],
  ['GRUPO-BETA', 'Coordinación Local de Grupos Beta'],
  ['REPRESENTACION-LOCAL', 'Representaciones y puntos de revisión locales'],
] as const;

export const positionsSeed = [
  ['TITULAR-OFICINA', 'Titular de la Oficina de Representación'],
  ['SUBDIRECTOR-REGULACION', 'Subdirector de Regulación Migratoria'],
  ['SUBDIRECTOR-CONTROL', 'Subdirector de Control y Verificación Migratoria'],
  ['JEFE-DEPARTAMENTO', 'Jefe de Departamento'],
  [
    'COORDINADOR-SERVICIOS',
    'Coordinador de Unidad en Área de Servicios Migratorios',
  ],
  ['AGENTE-MIGRACION-A', 'Agente Federal de Migración A'],
  ['AGENTE-MIGRACION-B', 'Agente Federal de Migración B'],
  ['AGENTE-MIGRACION-C', 'Agente Federal de Migración C'],
  ['REPRESENTANTE-LOCAL', 'Representante Local'],
  ['DIRECTOR-ESTACION', 'Director de Estación Migratoria'],
  ['OFICIAL-PROTECCION-INFANCIA', 'Oficial de Protección a la Infancia'],
  ['COORDINADOR-GRUPO-BETA', 'Coordinador de Grupo Beta'],
  ['AGENTE-GRUPO-BETA', 'Agente Temático de Grupo Beta'],
  ['ANALISTA-TECNICO', 'Analista Técnico Especializado'],
  ['AUXILIAR-ADMINISTRATIVO', 'Auxiliar Administrativo / Capturista'],
] as const;

const employeeNames = [
  'María García López',
  'Carlos Hernández Ruiz',
  'Laura Martínez Soto',
  'Jorge Ramírez Cruz',
  'Ana Torres Méndez',
  'Roberto Sánchez Vargas',
  'Patricia Morales Díaz',
  'Luis Fernando Ortega',
  'Claudia Reyes Navarro',
  'Miguel Ángel Castillo',
  'Sofía Mendoza Flores',
  'Eduardo Jiménez Lara',
  'Gabriela Ríos Contreras',
  'Fernando Ponce Salazar',
  'Daniela Vega Cárdenas',
  'Héctor Valencia Ruiz',
  'Alejandra Fuentes León',
  'Ricardo Espinoza Mora',
  'Verónica Campos Silva',
  'Arturo Delgado Peña',
  'Natalia Cabrera Núñez',
  'Óscar Maldonado Gil',
  'Beatriz Zamora Cruz',
  'Francisco Solís Herrera',
  'Elena Bautista Torres',
  'Martín Acosta Velázquez',
  'Rosa María Ibarra',
  'Guillermo Beltrán Soto',
  'Mónica Escobar Reyes',
  'Iván Cervantes Luna',
  'Teresa Villanueva Ortiz',
  'Sergio Padilla Rangel',
  'Karla Mendoza Rosales',
  'Alberto Treviño Gómez',
  'Diana Salgado Méndez',
  'Raúl Figueroa Nieto',
  'Lucía Ocampo Estrada',
  'Enrique Valdés Paredes',
  'Adriana Tapia Guzmán',
  'José Manuel Castañeda',
] as const;

export const employeesSeed = employeeNames.map((fullName, index) => ({
  employeeNumber: `EMP-${String(index + 1).padStart(4, '0')}`,
  fullName,
  hireDate: `${2016 + (index % 9)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
  status: index === 39 ? 'INACTIVE' : 'ACTIVE',
}));

const assignmentPlan = [
  ['DIRECCION-ENLACE-LEGAL', 'TITULAR-OFICINA'],
  ['REGULACION-MIGRATORIA', 'SUBDIRECTOR-REGULACION'],
  ['CONTROL-VERIFICACION', 'SUBDIRECTOR-CONTROL'],
  ['ASUNTOS-JURIDICOS', 'JEFE-DEPARTAMENTO'],
  ['RECURSOS-HUMANOS', 'JEFE-DEPARTAMENTO'],
  ['RECURSOS-MATERIALES', 'JEFE-DEPARTAMENTO'],
  ['RECURSOS-FINANCIEROS', 'JEFE-DEPARTAMENTO'],
  ['INFORMATICA-TELECOMUNICACIONES', 'ANALISTA-TECNICO'],
  ['ESTACION-MIGRATORIA', 'DIRECTOR-ESTACION'],
  ['GRUPO-BETA', 'COORDINADOR-GRUPO-BETA'],
  ['REGULACION-MIGRATORIA', 'COORDINADOR-SERVICIOS'],
  ['REGULACION-MIGRATORIA', 'AGENTE-MIGRACION-A'],
  ['CONTROL-VERIFICACION', 'AGENTE-MIGRACION-B'],
  ['CONTROL-VERIFICACION', 'AGENTE-MIGRACION-C'],
  ['REPRESENTACION-LOCAL', 'REPRESENTANTE-LOCAL'],
  ['ESTACION-MIGRATORIA', 'OFICIAL-PROTECCION-INFANCIA'],
  ['GRUPO-BETA', 'AGENTE-GRUPO-BETA'],
  ['RECURSOS-HUMANOS', 'AUXILIAR-ADMINISTRATIVO'],
  ['RECURSOS-FINANCIEROS', 'AUXILIAR-ADMINISTRATIVO'],
  ['RECURSOS-MATERIALES', 'AUXILIAR-ADMINISTRATIVO'],
] as const;

export const assignmentsSeed = employeesSeed.map((employee, index) => {
  const [unitCode, positionCode] =
    assignmentPlan[index % assignmentPlan.length];
  return {
    employeeNumber: employee.employeeNumber,
    unitCode,
    positionCode,
    appointmentType:
      positionCode.includes('AGENTE') || positionCode.includes('AUXILIAR')
        ? 'BASE'
        : 'CONFIANZA',
    schedule: positionCode.includes('AGENTE')
      ? 'Turnos operativos'
      : 'Lunes a viernes, 09:00 a 18:00',
    effectiveFrom: employee.hireDate,
    effectiveTo: employee.status === 'INACTIVE' ? '2025-12-31' : null,
  };
});
