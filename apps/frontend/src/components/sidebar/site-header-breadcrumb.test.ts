import { describe, expect, it } from 'vitest'

import { getBreadcrumbEntries } from '@/lib/site-header-breadcrumb.utils'

describe('getBreadcrumbEntries', () => {
  it('represents the dashboard as Inicio', () => {
    expect(getBreadcrumbEntries('/dashboard')).toEqual([{ label: 'Inicio' }])
  })

  it('builds the incidents hierarchy', () => {
    expect(getBreadcrumbEntries('/incidents')).toEqual([
      { label: 'Inicio', href: '/' },
      { label: 'Incidencias' },
    ])

    expect(getBreadcrumbEntries('/incidents/incident-id')).toEqual([
      { label: 'Inicio', href: '/' },
      { label: 'Incidencias', href: '/incidents' },
      { label: 'Detalle de incidencia' },
    ])
  })

  it('builds the employee detail hierarchy and ignores query parameters', () => {
    expect(getBreadcrumbEntries('/employees/employee-id?tab=incidents')).toEqual([
      { label: 'Inicio', href: '/' },
      { label: 'Empleados', href: '/employees' },
      { label: 'Detalle de empleado' },
    ])
  })
})
