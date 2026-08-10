import { Redirect, Route, Switch } from 'wouter'
import { PermissionsPage } from '@/modules/administration/permissions'
import { OrganizationalUnitsPage } from '@/modules/administration/organizational-units'
import { PositionsPage } from '@/modules/administration/positions'
import { RolesPage } from '@/modules/administration/roles'
import { UsersPage } from '@/modules/administration/users'
import { EmployeeDetailsPage, EmployeesPage } from '@/modules/employees'

import { AppLayout } from '../layouts/AppLayout'
import { ProtectedRoute } from './protected-route'
import { routes } from './routes'

export function AppRouter() {
  return (
    <Switch>
      <Route path={routes.home}>
        <Redirect to={routes.administration.permissions} />
      </Route>

      <Route path={routes.administration.permissions}>
        <ProtectedRoute>
          <AppLayout>
            <PermissionsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={routes.administration.roles}>
        <ProtectedRoute>
          <AppLayout>
            <RolesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={routes.administration.users}>
        <ProtectedRoute>
          <AppLayout>
            <UsersPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={routes.administration.organizationalUnits}>
        <ProtectedRoute>
          <AppLayout>
            <OrganizationalUnitsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path={routes.administration.positions}>
        <ProtectedRoute>
          <AppLayout>
            <PositionsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/employees/:employeeId">
        {(params) => (
          <ProtectedRoute>
            <AppLayout>
              <EmployeeDetailsPage employeeId={params.employeeId} />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path={routes.employees.root}>
        <ProtectedRoute>
          <AppLayout>
            <EmployeesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  )
}

function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>

        <p className="mt-2 text-muted-foreground">
          La página solicitada no existe.
        </p>
      </div>
    </div>
  )
}
