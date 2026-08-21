import { Link, useLocation } from 'wouter'

import { NavUser } from '../nav-user'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb'
import { Separator } from '../ui/separator'
import { SidebarTrigger } from '../ui/sidebar'
import { routes } from '@/app/router/routes'
import { useAuth } from '@/modules/auth'

const breadcrumbRoutes = [
  { path: routes.dashboard, label: 'Inicio' },
  { path: routes.reports, label: 'Reportes' },
  { path: routes.incidents.root, label: 'Incidencias' },
  { path: routes.employees.root, label: 'Empleados' },
  {
    path: routes.administration.organizationalUnits,
    label: 'Unidades organizativas',
  },
  { path: routes.administration.positions, label: 'Puestos' },
  { path: routes.administration.users, label: 'Usuarios' },
  { path: routes.administration.roles, label: 'Roles' },
  { path: routes.administration.permissions, label: 'Permisos' },
  { path: routes.audit, label: 'Auditoría' },
] as const

export function SiteHeader() {
  const auth = useAuth()
  const [location] = useLocation()
  const current = breadcrumbRoutes.find(
    (route) => location === route.path || location.startsWith(`${route.path}/`),
  )

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger
          className="-ml-1"
          aria-label="Alternar barra lateral"
          title="Alternar barra lateral"
        />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-14"
        />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={routes.home} />}>
                SIGIP
              </BreadcrumbLink>
            </BreadcrumbItem>
            {current ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{current.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : null}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <NavUser user={auth.data} />
        </div>
      </div>
    </header>
  )
}
