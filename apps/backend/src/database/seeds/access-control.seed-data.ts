export const permissionsSeed = [
  { code: 'dashboard:read', description: 'Consultar el panel principal.' },
  {
    code: 'offices:access-all',
    description: 'Acceder a información de todas las oficinas.',
  },
  { code: 'users:create', description: 'Crear usuarios.' },
  { code: 'users:read', description: 'Consultar usuarios.' },
  { code: 'users:update', description: 'Editar usuarios.' },
  { code: 'users:activate', description: 'Activar usuarios.' },
  { code: 'users:deactivate', description: 'Desactivar usuarios.' },
  {
    code: 'users:reset-password',
    description: 'Restablecer contraseñas de usuarios.',
  },
  { code: 'roles:read', description: 'Consultar los roles disponibles.' },
  { code: 'permissions:read', description: 'Consultar los permisos.' },
  { code: 'sessions:read', description: 'Consultar las sesiones activas.' },
  { code: 'sessions:revoke', description: 'Revocar sesiones activas.' },
  { code: 'employees:create', description: 'Registrar empleados.' },
  { code: 'employees:read', description: 'Consultar empleados.' },
  { code: 'employees:update', description: 'Editar empleados.' },
  { code: 'employees:activate', description: 'Activar empleados.' },
  { code: 'employees:deactivate', description: 'Desactivar empleados.' },
  { code: 'incidents:create', description: 'Registrar incidencias.' },
  { code: 'incidents:read', description: 'Consultar incidencias.' },
  { code: 'incidents:update', description: 'Modificar incidencias.' },
  { code: 'incidents:cancel', description: 'Cancelar incidencias.' },
  { code: 'documents:create', description: 'Subir documentos.' },
  { code: 'documents:read', description: 'Consultar documentos.' },
  { code: 'documents:update', description: 'Reemplazar documentos.' },
  {
    code: 'documents:delete',
    description: 'Eliminar documentos de forma lógica.',
  },
  { code: 'catalogs:read', description: 'Consultar catálogos.' },
  { code: 'catalogs:update', description: 'Administrar catálogos.' },
  { code: 'audit:read', description: 'Consultar la auditoría.' },
  { code: 'reports:read', description: 'Consultar reportes.' },
  { code: 'reports:export', description: 'Exportar reportes.' },
  { code: 'settings:read', description: 'Consultar la configuración.' },
  { code: 'settings:update', description: 'Modificar la configuración.' },
] as const;

export type PermissionCode = (typeof permissionsSeed)[number]['code'];

const allPermissionCodes = permissionsSeed.map(({ code }) => code);

export const rolesSeed = [
  {
    code: 'system-administrator',
    name: 'Administrador del Sistema',
    description: 'Administra completamente la aplicación y su seguridad.',
    permissions: allPermissionCodes,
  },
  {
    code: 'supervisor',
    name: 'Supervisor',
    description:
      'Supervisa la operación, consulta información y genera reportes sin modificar datos operativos.',
    permissions: [
      'dashboard:read',
      'employees:read',
      'catalogs:read',
      'incidents:read',
      'documents:read',
      'reports:read',
      'reports:export',
      'audit:read',
    ],
  },
  {
    code: 'human-resources-operator',
    name: 'Operador de Recursos Humanos',
    description:
      'Gestiona empleados, incidencias, documentos y reportes de la operación diaria.',
    permissions: [
      'dashboard:read',
      'employees:create',
      'employees:read',
      'employees:update',
      'catalogs:read',
      'incidents:create',
      'incidents:read',
      'incidents:update',
      'incidents:cancel',
      'documents:create',
      'documents:read',
      'documents:update',
      'reports:read',
      'reports:export',
    ],
  },
  {
    code: 'data-entry-clerk',
    name: 'Capturista',
    description:
      'Registra incidencias y documentos, y consulta la información necesaria para la captura.',
    permissions: [
      'dashboard:read',
      'employees:read',
      'catalogs:read',
      'incidents:create',
      'incidents:read',
      'documents:create',
      'documents:read',
    ],
  },
] as const satisfies ReadonlyArray<{
  code: string;
  name: string;
  description: string;
  permissions: readonly PermissionCode[];
}>;

export const developmentAdministrator = {
  username: 'admin',
  fullName: 'Administrador del Sistema',
  password: 'admin123',
  roleCode: 'system-administrator',
} as const;
