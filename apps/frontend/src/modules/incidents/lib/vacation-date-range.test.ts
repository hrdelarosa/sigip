import { describe, expect, it } from 'vitest'

import { buildVacationDateRange } from './vacation-date-range'

describe('buildVacationDateRange', () => {
  it('includes every day when weekends are enabled', () => {
    expect(buildVacationDateRange('2026-08-07', '2026-08-10', true)).toEqual([
      '2026-08-07',
      '2026-08-08',
      '2026-08-09',
      '2026-08-10',
    ])
  })

  it('excludes Saturdays and Sundays by default', () => {
    expect(buildVacationDateRange('2026-08-07', '2026-08-10', false)).toEqual([
      '2026-08-07',
      '2026-08-10',
    ])
  })

  it('returns no dates when the end precedes the start', () => {
    expect(buildVacationDateRange('2026-08-10', '2026-08-07', true)).toEqual([])
  })
})
