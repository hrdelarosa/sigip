import { beforeEach, describe, expect, it, vi } from 'vitest'

const { apiDownloadMock, apiRequestMock } = vi.hoisted(() => ({
  apiDownloadMock: vi.fn(),
  apiRequestMock: vi.fn(),
}))

vi.mock('@/lib/api/api-client', () => ({
  apiDownload: apiDownloadMock,
  apiRequest: apiRequestMock,
}))

import { createIncident, downloadIncidentDocument } from './incidents.api'

describe('downloadIncidentDocument', () => {
  beforeEach(() => {
    apiDownloadMock.mockReset()
  })

  it('uses the UTF-8 filename from Content-Disposition', async () => {
    apiDownloadMock.mockResolvedValue(
      new Response('pdf', {
        headers: {
          'Content-Disposition':
            "attachment; filename*=UTF-8''Formato%20vacaciones%20Jos%C3%A9.pdf",
        },
      }),
    )

    const result = await downloadIncidentDocument('document-id')

    expect(result.filename).toBe('Formato vacaciones José.pdf')
  })

  it('uses the document metadata when the response header is unavailable', async () => {
    apiDownloadMock.mockResolvedValue(new Response('pdf'))

    const result = await downloadIncidentDocument(
      'document-id',
      'formato-original.pdf',
    )

    expect(result.filename).toBe('formato-original.pdf')
  })

  it('uses documento.pdf only when no original name is available', async () => {
    apiDownloadMock.mockResolvedValue(new Response('pdf'))

    const result = await downloadIncidentDocument('document-id', '   ')

    expect(result.filename).toBe('documento.pdf')
  })
})

describe('createIncident', () => {
  it('appends the optional commission annex to the multipart request', () => {
    apiRequestMock.mockResolvedValue({})
    const file = new File(['pdf'], 'formato.pdf', { type: 'application/pdf' })
    const commissionAnnex = new File(['pdf'], 'oficio.pdf', {
      type: 'application/pdf',
    })

    void createIncident({
      input: {
        employeeId: 'employee-id',
        employeeAssignmentId: 'assignment-id',
        incidentTypeId: 'type-id',
        receivedAt: '2026-08-14T12:00:00.000Z',
        occurrences: [{ startDate: '2026-08-14' }],
      },
      file,
      commissionAnnex,
    })

    const options = apiRequestMock.mock.calls[0]?.[1] as { body: FormData }
    expect(options.body.get('file')).toBe(file)
    expect(options.body.get('commissionAnnex')).toBe(commissionAnnex)
  })
})
