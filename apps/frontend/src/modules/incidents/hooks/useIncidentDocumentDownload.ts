import { useState } from 'react'
import { toast } from 'sonner'

import { downloadIncidentDocument } from '../api/incidents.api'
import type { IncidentDocuments } from '../types/incident.types'

type IncidentDocument = IncidentDocuments[number]

export function useIncidentDocumentDownload() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  async function download(document: IncidentDocument) {
    setDownloadingId(document.id)

    try {
      const file = await downloadIncidentDocument(
        document.id,
        document.originalName,
      )
      const url = URL.createObjectURL(file.blob)
      const anchor = window.document.createElement('a')

      anchor.href = url
      anchor.download = file.filename
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('No se pudo descargar el documento', {
        description:
          error instanceof Error ? error.message : 'Intente nuevamente.',
      })
    } finally {
      setDownloadingId(null)
    }
  }

  return { download, downloadingId }
}
