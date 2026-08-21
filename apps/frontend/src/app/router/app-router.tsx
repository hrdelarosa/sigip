import { Route, Switch } from 'wouter'

import { OrganizationalUnitsPage } from '@/modules/administration/organizational-units'
import { PermissionsPage } from '@/modules/administration/permissions'
import { PositionsPage } from '@/modules/administration/positions'
import { RolesPage } from '@/modules/administration/roles'
import { UsersPage } from '@/modules/administration/users'
import { EmployeeDetailsPage, EmployeesPage } from '@/modules/employees'
import { ProtectedRoute } from './protected-route'
import { routes } from './routes'
import { AuditPage } from '@/modules/audit'
import {
  CreateIncidentPage,
  IncidentDetailsPage,
  IncidentsPage,
} from '@/modules/incidents'
import { DashboardPage } from '@/modules/dashboard'
import { ReportsPage } from '@/modules/reports'
import { HomeRedirect } from './home-redirect'
import { LoginRoute } from './login-route'
import { NotFoundPage } from './not-found-page'
import { ProtectedPage } from './protected-page'

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

      <Route path={routes.reports}>
        <ProtectedPage permission="reports:read">
          <ReportsPage />
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
