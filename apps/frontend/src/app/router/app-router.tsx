import { Redirect, Route, Switch } from 'wouter'
import { PermissionsPage } from '@/modules/administration/permissions'

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
