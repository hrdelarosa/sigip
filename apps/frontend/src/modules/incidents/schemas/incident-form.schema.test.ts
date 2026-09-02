import { describe, expect, it } from 'vitest'

import {
  commissionAnnexSchema,
  createIncidentFormSchema,
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
  it('accepts an empty assignment when the employee has none', () => {
    const result = incidentFormSchema.safeParse({
      ...baseValues,
      employeeAssignmentId: '',
      hasAssignments: false,
      assignmentEffectiveFrom: '',
      assignmentEffectiveTo: null,
      occurrences: [{ startDate: '2026-07-14', endDate: null }],
    })

    expect(result.success).toBe(true)
  })

  it('requires selecting an assignment when the employee has assignments', () => {
    const result = incidentFormSchema.safeParse({
      ...baseValues,
      employeeAssignmentId: '',
      hasAssignments: true,
      occurrences: [{ startDate: '2026-07-14', endDate: null }],
    })

    expect(result.success).toBe(false)
    expect(
      result.error?.issues.some(
        (issue) => issue.path.join('.') === 'employeeAssignmentId',
      ),
    ).toBe(true)
  })

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

  it('rejects more than 10 days for an ordinary vacation period', () => {
    const result = incidentFormSchema.safeParse({
      ...baseValues,
      incidentTypeCode: 'VACACIONES_PRIMER_PERIODO',
      occurrences: Array.from({ length: 11 }, (_, index) => ({
        startDate: `2026-07-${String(index + 1).padStart(2, '0')}`,
        endDate: null,
      })),
    })

    expect(result.success).toBe(false)
    expect(
      result.error?.issues.some((issue) => issue.message.includes('10 días')),
    ).toBe(true)
  })

  it('keeps the general multiple-date limit for vacation incentives', () => {
    const result = incidentFormSchema.safeParse({
      ...baseValues,
      incidentTypeCode: 'VACACIONES_ESTIMULOS',
      occurrences: Array.from({ length: 11 }, (_, index) => ({
        startDate: `2026-07-${String(index + 1).padStart(2, '0')}`,
        endDate: null,
      })),
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

describe('createIncidentFormSchema', () => {
  const createValues = {
    ...baseValues,
    occurrences: [{ startDate: '2026-07-14', endDate: null }],
  }

  it('rejects a missing format file', () => {
    const result = createIncidentFormSchema.safeParse(createValues)

    expect(result.success).toBe(false)
    expect(result.error?.issues.some((issue) => issue.path.join('.') === 'file'))
      .toBe(true)
  })

  it('accepts a valid PDF format file', () => {
    const result = createIncidentFormSchema.safeParse({
      ...createValues,
      file: new File(['pdf'], 'formato.pdf', { type: 'application/pdf' }),
    })

    expect(result.success).toBe(true)
  })

  it('rejects a format file larger than 10 MB', () => {
    const result = createIncidentFormSchema.safeParse({
      ...createValues,
      file: new File(
        [new Uint8Array(10 * 1024 * 1024 + 1)],
        'formato.pdf',
        { type: 'application/pdf' },
      ),
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.some((issue) => issue.path.join('.') === 'file'))
      .toBe(true)
  })

  it('rejects a commission annex larger than 5 MB', () => {
    const result = createIncidentFormSchema.safeParse({
      ...createValues,
      file: new File(['pdf'], 'formato.pdf', { type: 'application/pdf' }),
      commissionAnnex: new File(
        [new Uint8Array(5 * 1024 * 1024 + 1)],
        'oficio.pdf',
        { type: 'application/pdf' },
      ),
    })

    expect(result.success).toBe(false)
    expect(
      result.error?.issues.some((issue) => issue.path.join('.') === 'commissionAnnex'),
    ).toBe(true)
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
