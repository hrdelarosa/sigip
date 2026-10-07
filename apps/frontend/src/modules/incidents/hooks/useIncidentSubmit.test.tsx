import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { createMutateAsync, updateMutateAsync } = vi.hoisted(() => ({
  createMutateAsync: vi.fn(),
  updateMutateAsync: vi.fn(),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('./useCreateIncident', () => ({
  useCreateIncident: () => ({ isPending: false, mutateAsync: createMutateAsync }),
}))
vi.mock('./useUpdateIncident', () => ({
  useUpdateIncident: () => ({ isPending: false, mutateAsync: updateMutateAsync }),
}))

import { useIncidentSubmit } from './useIncidentSubmit'
import type { IncidentFormValues } from '../schemas/incident-form.schema'

const values = (incidentTypeCode: string, file: File | null): IncidentFormValues => ({
  employeeId: '0198aa00-0000-7000-8000-000000000001',
  employeeAssignmentId: '',
  hasAssignments: false,
  incidentTypeId: '0198aa00-0000-7000-8000-000000000003',
  incidentTypeCode,
  temporalMode: 'SINGLE_DATE',
  assignmentEffectiveFrom: '',
  assignmentEffectiveTo: null,
  issuedDate: null,
  receivedAt: '2026-08-14T12:00',
  referenceYear: '',
  observations: '',
  occurrences: [{ startDate: '2026-08-14', endDate: null }],
  file,
  commissionAnnex: null,
})

describe('useIncidentSubmit', () => {
  afterEach(() => {
    createMutateAsync.mockReset()
    updateMutateAsync.mockReset()
  })

  async function submit(formValues: IncidentFormValues) {
    let result: ReturnType<typeof useIncidentSubmit> | undefined
    renderToString(createElement(() => {
      result = useIncidentSubmit(undefined, vi.fn())
      return null
    }))
    await result?.submit(formValues)
  }

  it('submits a commission without documents', async () => {
    createMutateAsync.mockResolvedValue({ employee: { fullName: 'Persona' } })
    await submit(values('COMISION', null))
    expect(createMutateAsync).toHaveBeenCalledOnce()
    expect(createMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ file: null }))
  })

  it('submits a commission with its annex and no format', async () => {
    const annex = new File(['pdf'], 'oficio.pdf', { type: 'application/pdf' })
    createMutateAsync.mockResolvedValue({ employee: { fullName: 'Persona' } })
    await submit({ ...values('COMISION', null), commissionAnnex: annex })
    expect(createMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      file: null,
      commissionAnnex: annex,
    }))
  })

  it('does not submit a non-commission without its required format', async () => {
    await submit(values('VACACIONES', null))
    expect(createMutateAsync).not.toHaveBeenCalled()
  })

  it('submits a non-commission with its format', async () => {
    const file = new File(['pdf'], 'formato.pdf', { type: 'application/pdf' })
    createMutateAsync.mockResolvedValue({ employee: { fullName: 'Persona' } })
    await submit(values('VACACIONES', file))
    expect(createMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ file }))
  })
})
