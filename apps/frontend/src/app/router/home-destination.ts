import { hasPermission } from '@/modules/auth'

import { routes } from './routes'

const destinations = [
  { permission: 'dashboard:read', route: routes.dashboard },
  { permission: 'incidents:read', route: routes.incidents.root },
  { permission: 'reports:read', route: routes.reports },
  { permission: 'employees:read', route: routes.employees.root },
  { permission: 'audit:read', route: routes.audit },
  { permission: 'users:read', route: routes.administration.users },
  { permission: 'roles:read', route: routes.administration.roles },
  { permission: 'permissions:read', route: routes.administration.permissions },
  {
    permission: 'catalogs:read',
    route: routes.administration.organizationalUnits,
  },
] as const

export function getHomeDestination(permissions: readonly string[] | undefined) {
  const destination = destinations.find(({ permission }) =>
    hasPermission(permissions, permission),
  )

  return destination?.route ?? null
}
