export const routes = {
  home: '/',

  dashboard: '/dashboard',

  administration: {
    root: '/administration',
    permissions: '/administration/permissions',
    roles: '/administration/roles',
    users: '/administration/users',
    organizationalUnits: '/administration/organizational-units',
    positions: '/administration/positions',
    incidentTypes: '/administration/incident-types',
    documentTypes: '/administration/document-types',
  },

  employees: {
    root: '/employees',
    detail: (employeeId: string) => `/employees/${employeeId}`,
  },

  incidents: {
    root: '/incidents',
    create: '/incidents/new',
    detail: (incidentId: string) => `/incidents/${incidentId}`,
  },

  documents: {
    detail: (documentId: string) => `/documents/${documentId}`,
  },

  audit: '/audit',
  sessions: '/sessions',

  auth: {
    login: '/login',
  },

  notFound: '/404',
} as const
