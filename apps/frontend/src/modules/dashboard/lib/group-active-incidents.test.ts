import type { DashboardActiveIncidentResponse } from '@sigip/shared'
import { describe, expect, it } from 'vitest'

import { groupActiveIncidents } from './group-active-incidents'

const incident = {
  employeeId: 'employee-1',
  employeeName: 'Persona A',
  employeeNumber: '100',
  incidentId: 'incident-1',
  organizationalUnit: { id: 'unit-1', name: 'Unidad A' },
  position: { id: 'position-1', name: 'Puesto A' },
  incidentType: { id: 'type-1', code: 'VACACIONES', name: 'Vacaciones' },
  occurrence: { startDate: '2026-10-01', endDate: '2026-10-03' },
  issuedDate: null,
  referenceYear: null,
} satisfies DashboardActiveIncidentResponse

describe('groupActiveIncidents', () => {
  it('muestra a cada persona una sola vez aunque tenga varias incidencias', () => {
    const groups = groupActiveIncidents([
      incident,
      { ...incident, employeeId: 'employee-2', incidentId: 'incident-2' },
      { ...incident, incidentId: 'incident-3' },
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0].map((item) => item.incidentId)).toEqual([
      'incident-1',
      'incident-3',
    ])
    expect(groups[1].map((item) => item.incidentId)).toEqual(['incident-2'])
  })
})
