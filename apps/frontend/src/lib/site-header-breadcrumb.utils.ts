import { routes } from '@/app/router/routes'

export interface BreadcrumbEntry {
  label: string
  href?: string
}

const sectionRoutes = [
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

export function getBreadcrumbEntries(location: string): BreadcrumbEntry[] {
  const pathname = location.split('?')[0]

  if (pathname === routes.dashboard) {
    return [{ label: 'Inicio' }]
  }

  if (pathname === routes.incidents.create) {
    return [
      { label: 'Inicio', href: routes.home },
      { label: 'Incidencias', href: routes.incidents.root },
      { label: 'Nueva incidencia' },
    ]
  }

  if (pathname.startsWith(`${routes.incidents.root}/`)) {
    return [
      { label: 'Inicio', href: routes.home },
      { label: 'Incidencias', href: routes.incidents.root },
      { label: 'Detalle de incidencia' },
    ]
  }

  if (pathname.startsWith(`${routes.employees.root}/`)) {
    return [
      { label: 'Inicio', href: routes.home },
      { label: 'Empleados', href: routes.employees.root },
      { label: 'Detalle de empleado' },
    ]
  }

  const section = sectionRoutes.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`),
  )

  return section
    ? [{ label: 'Inicio', href: routes.home }, { label: section.label }]
    : [{ label: 'Inicio' }]
}
