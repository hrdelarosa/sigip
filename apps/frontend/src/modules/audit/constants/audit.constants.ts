import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@sigip/shared'

export const auditActionLabels: Record<string, string> = {
  LOGIN_SUCCEEDED: 'Inicio de sesión correcto',
  LOGIN_FAILED: 'Inicio de sesión fallido',
  LOGOUT: 'Cierre de sesión',
  SESSION_REVOKED: 'Sesión revocada',
  SESSIONS_REVOKED: 'Sesiones revocadas',
  CREATED: 'Creación',
  UPDATED: 'Actualización',
  STATUS_CHANGED: 'Cambio de estado',
  PASSWORD_CHANGED: 'Cambio de contraseña',
  ROLE_CHANGED: 'Cambio de rol',
  PERMISSIONS_CHANGED: 'Cambio de permisos',
  CANCELLED: 'Cancelación',
  UPLOADED: 'Carga',
  DELETED: 'Eliminación',
}

export const auditEntityLabels: Record<string, string> = {
  AUTH: 'Autenticación',
  SESSION: 'Sesión',
  USER: 'Usuario',
  ROLE: 'Rol',
  PERMISSION: 'Permiso',
  ORGANIZATIONAL_UNIT: 'Unidad organizativa',
  POSITION: 'Puesto',
  EMPLOYEE: 'Empleado',
  EMPLOYEE_ASSIGNMENT: 'Asignación',
  INCIDENT_TYPE: 'Tipo de incidencia',
  INCIDENT: 'Incidencia',
  DOCUMENT_TYPE: 'Tipo documental',
  DOCUMENT: 'Documento',
}

export const auditActionItems = [
  { value: '', label: 'Todas las acciones' },
  ...AUDIT_ACTIONS.map((value) => ({
    value,
    label: auditActionLabels[value] ?? value,
  })),
]

export const auditEntityItems = [
  { value: '', label: 'Todas las entidades' },
  ...AUDIT_ENTITY_TYPES.map((value) => ({
    value,
    label: auditEntityLabels[value] ?? value,
  })),
]

export const auditPageSizes = [10, 20, 25, 30] as const
