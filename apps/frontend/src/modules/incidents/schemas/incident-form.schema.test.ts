import { describe, expect, it } from 'vitest'

import {
  commissionAnnexSchema,
  incidentFileSchema,
  incidentFormSchema,
} from './incident-form.schema'

const baseValues = {
  employeeId: '0198aa00-0000-7000-8000-000000000001',
  employeeAssignmentId: '0198aa00-0000-7000-8000-000000000002',
  incidentTypeId: '0198aa00-0000-7000-8000-000000000003',
  incidentTypeCode: 'VACACIONES',
  temporalMode: 'MULTIPLE_DATES' as const,
  assignmentEffectiveFrom: '2026-01-01',
  assignmentEffectiveTo: '2026-12-31',
  issuedDate: '2026-07-09',
  receivedAt: '2026-07-10T16:30',
  referenceYear: '2026',
  observations: '',
  file: null,
  commissionAnnex: null,
}

describe('incidentFormSchema', () => {
  it('accepts separate vacation days', () => {
    const result = incidentFormSchema.safeParse({
      ...baseValues,
      occurrences: [
        { startDate: '2026-07-14', endDate: null },
        { startDate: '2026-07-15', endDate: null },
        { startDate: '2026-07-22', endDate: null },
      ],
    })

    expect(result.success).toBe(true)
  })

  it('rejects duplicate occurrence dates', () => {
    const result = incidentFormSchema.safeParse({
      ...baseValues,
      occurrences: [
        { startDate: '2026-07-14', endDate: null },
        { startDate: '2026-07-14', endDate: null },
      ],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.some((issue) => issue.message.includes('repite')))
      .toBe(true)
  })

  it('requires an end date for continuous ranges', () => {
    const result = incidentFormSchema.safeParse({
      ...baseValues,
      temporalMode: 'DATE_RANGE',
      occurrences: [{ startDate: '2026-07-14', endDate: null }],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.some((issue) => issue.message.includes('final')))
      .toBe(true)
  })

  it('rejects dates outside the selected assignment', () => {
    const result = incidentFormSchema.safeParse({
      ...baseValues,
      occurrences: [{ startDate: '2027-01-02', endDate: null }],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.some((issue) => issue.message.includes('vigencia')))
      .toBe(true)
  })
})

describe('incidentFileSchema', () => {
  it('accepts a PDF up to 10 MB', () => {
    const file = new File(['pdf'], 'formato.pdf', { type: 'application/pdf' })
    expect(incidentFileSchema.safeParse(file).success).toBe(true)
  })

  it('rejects files larger than 10 MB', () => {
    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'formato.pdf', {
      type: 'application/pdf',
    })
    expect(incidentFileSchema.safeParse(file).success).toBe(false)
  })

  it('rejects non-PDF files', () => {
    const file = new File(['formato'], 'formato.txt', {
      type: 'text/plain',
    })
    expect(incidentFileSchema.safeParse(file).success).toBe(false)
  })
})

describe('commissionAnnexSchema', () => {
  it('accepts a PDF up to 5 MB', () => {
    const file = new File(['pdf'], 'oficio.pdf', { type: 'application/pdf' })
    expect(commissionAnnexSchema.safeParse(file).success).toBe(true)
  })

  it('rejects files larger than 5 MB', () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'oficio.pdf', {
      type: 'application/pdf',
    })
    expect(commissionAnnexSchema.safeParse(file).success).toBe(false)
  })
})
