import { Redirect } from 'wouter'

import { hasPermission, useAuth } from '@/modules/auth'

import { AccessEmptyState } from './access-empty-state'
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

export function HomeRedirect() {
  const auth = useAuth()
  const destination = destinations.find(({ permission }) =>
    hasPermission(auth.data?.permissions, permission),
  )

  return destination ? (
    <Redirect to={destination.route} replace />
  ) : (
    <AccessEmptyState />
  )
}
