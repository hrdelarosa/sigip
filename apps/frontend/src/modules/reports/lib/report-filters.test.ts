import { describe, expect, it } from 'vitest'

import { buildIncidentsReportFilters } from './report-filters'

describe('buildIncidentsReportFilters', () => {
  it('includes a selected office in the incidents report request', () => {
    const filters = buildIncidentsReportFilters({
      period: 'MONTH',
      fortnight: 'FIRST',
      month: 10,
      year: 2026,
      officeId: 'office-id',
      includeCancelled: false,
    })

    expect(filters.officeId).toBe('office-id')
    expect(filters).not.toHaveProperty('organizationalUnitId')
  })
})
