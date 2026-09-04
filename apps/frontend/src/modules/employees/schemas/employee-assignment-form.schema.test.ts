import { describe, expect, it } from 'vitest'
import { employeeAssignmentFormSchema } from './employee-assignment-form.schema'

const validAssignment = {
  organizationalUnitId: '',
  positionId: '0190f368-15e4-7000-8000-000000000001',
  appointmentType: 'BASE' as const,
  schedule: '09:00-17:00',
  effectiveFrom: '2026-09-03',
  effectiveTo: '',
  notes: '',
}

describe('employeeAssignmentFormSchema', () => {
  it('accepts an assignment without an organizational unit', () => {
    expect(employeeAssignmentFormSchema.parse(validAssignment)).toMatchObject({
      organizationalUnitId: null,
    })
  })
})
