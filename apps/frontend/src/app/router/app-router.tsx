import { Redirect, Route, Switch } from 'wouter'

import { OrganizationalUnitsPage } from '@/modules/administration/organizational-units'
import { PermissionsPage } from '@/modules/administration/permissions'
import { PositionsPage } from '@/modules/administration/positions'
import { RolesPage } from '@/modules/administration/roles'
import { UsersPage } from '@/modules/administration/users'
import { EmployeeDetailsPage, EmployeesPage } from '@/modules/employees'
import { hasPermission, LoginPage, useAuth } from '@/modules/auth'
import { AppLayout } from '../layouts/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { ProtectedRoute } from './protected-route'
import { routes } from './routes'
import { AuditPage } from '@/modules/audit'
import {
  CreateIncidentPage,
  IncidentDetailsPage,
  IncidentsPage,
} from '@/modules/incidents'
import { DashboardPage } from '@/modules/dashboard'

const destinations = [
  { permission: 'dashboard:read', route: routes.dashboard },
  { permission: 'incidents:read', route: routes.incidents.root },
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

export function AppRouter() {
  return (
    <Switch>
      <Route path={routes.auth.login}>
        <LoginRoute />
      </Route>

      <Route path={routes.home}>
        <ProtectedRoute>
          <HomeRedirect />
        </ProtectedRoute>
      </Route>

      <Route path={routes.dashboard}>
        <ProtectedPage permission="dashboard:read">
          <DashboardPage />
        </ProtectedPage>
      </Route>

      <Route path={routes.administration.permissions}>
        <ProtectedPage permission="permissions:read">
          <PermissionsPage />
        </ProtectedPage>
      </Route>
      <Route path={routes.administration.roles}>
        <ProtectedPage permission="roles:read">
          <RolesPage />
        </ProtectedPage>
      </Route>
      <Route path={routes.administration.users}>
        <ProtectedPage permission="users:read">
          <UsersPage />
        </ProtectedPage>
      </Route>
      <Route path={routes.administration.organizationalUnits}>
        <ProtectedPage permission="catalogs:read">
          <OrganizationalUnitsPage />
        </ProtectedPage>
      </Route>
      <Route path={routes.administration.positions}>
        <ProtectedPage permission="catalogs:read">
          <PositionsPage />
        </ProtectedPage>
      </Route>
      <Route path="/employees/:employeeId">
        {(params) => (
          <ProtectedPage permission="employees:read">
            <EmployeeDetailsPage employeeId={params.employeeId} />
          </ProtectedPage>
        )}
      </Route>
      <Route path={routes.employees.root}>
        <ProtectedPage permission="employees:read">
          <EmployeesPage />
        </ProtectedPage>
      </Route>
      <Route path={routes.incidents.create}>
        <ProtectedPage
          permissions={[
            'incidents:create',
            'incidents:read',
            'employees:read',
            'catalogs:read',
          ]}
        >
          <CreateIncidentPage />
        </ProtectedPage>
      </Route>
      <Route path="/incidents/:incidentId">
        {(params) => (
          <ProtectedPage permission="incidents:read">
            <IncidentDetailsPage id={params.incidentId} />
          </ProtectedPage>
        )}
      </Route>
      <Route path={routes.incidents.root}>
        <ProtectedPage permission="incidents:read">
          <IncidentsPage />
        </ProtectedPage>
      </Route>
      <Route path={routes.audit}>
        <ProtectedPage permission="audit:read">
          <AuditPage />
        </ProtectedPage>
      </Route>
      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  )
}

function ProtectedPage({
  children,
  permission,
  permissions,
}: React.PropsWithChildren<{
  permission?: string
  permissions?: readonly string[]
}>) {
  return (
    <ProtectedRoute permission={permission} permissions={permissions}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function LoginRoute() {
  const auth = useAuth()
  if (auth.data) return <Redirect to={routes.home} replace />
  return (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  )
}

function HomeRedirect() {
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

function AccessEmptyState() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Sin módulos asignados</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          La cuenta es válida, pero no tiene permisos de consulta asignados.
        </p>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">
          La página solicitada no existe.
        </p>
      </div>
    </div>
  )
}
