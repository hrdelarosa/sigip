import { describe, expect, it } from 'vitest'

import {
  ALL_REPORT_FILTERS_VALUE,
  buildIncidentsReportFilters,
  fromReportFilterSelectValue,
  toReportFilterSelectValue,
} from './report-filters'

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

describe('report filter select values', () => {
  it('represents an unset filter with a selectable non-empty value', () => {
    expect(toReportFilterSelectValue()).toBe(ALL_REPORT_FILTERS_VALUE)
    expect(ALL_REPORT_FILTERS_VALUE).not.toBe('')
  })

  it('clears the filter when the all-options value is selected', () => {
    expect(fromReportFilterSelectValue(ALL_REPORT_FILTERS_VALUE)).toBeNull()
  })

  it('preserves a selected office id', () => {
    expect(fromReportFilterSelectValue('office-id')).toBe('office-id')
    expect(toReportFilterSelectValue('office-id')).toBe('office-id')
  })
})
