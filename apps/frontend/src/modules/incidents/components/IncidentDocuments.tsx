import { useQuery } from '@tanstack/react-query'
import {
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  FileXCornerIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { DetailsErrorAlert } from '@/components/details/details-error-alert'
import { DetailsEmpty } from '@/components/details/details-empty'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { downloadIncidentDocument } from '../api/incidents.api'
import { useIncidentDocumentDownload } from '../hooks/useIncidentDocumentDownload'
import { incidentDocumentsQueryOptions } from '../queries/incident-query-options'
import type { IncidentDocuments } from '../types/incident.types'
import { CommissionAnnexUpload } from './CommissionAnnexUpload'

type IncidentDocument = IncidentDocuments[number]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function IncidentDocuments({
  incidentId,
  canUploadCommissionAnnex = false,
}: {
  incidentId: string
  canUploadCommissionAnnex?: boolean
}) {
  const query = useQuery(incidentDocumentsQueryOptions(incidentId))
  const { download, downloadingId } = useIncidentDocumentDownload()
  const [viewingId, setViewingId] = useState<string | null>(null)
  const hasCommissionAnnex = query.data?.some(
    (document) => document.documentType.code === 'OFICIO_COMISION',
  )

  async function view(document: IncidentDocument) {
    setViewingId(document.id)

    try {
      const file = await downloadIncidentDocument(
        document.id,
        document.originalName,
      )
      const url = URL.createObjectURL(file.blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      toast.error('No se pudo visualizar el documento', {
        description:
          error instanceof Error ? error.message : 'Intente nuevamente.',
      })
    } finally {
      setViewingId(null)
    }
  }

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">
          Documentos adjuntos
          {query.isSuccess ? ` (${query.data.length})` : ''}
        </CardTitle>
        <CardDescription>
          Archivos privados asociados a este formato de incidencia.
        </CardDescription>
        {query.isSuccess && canUploadCommissionAnnex && !hasCommissionAnnex ? (
          <CardAction>
            <CommissionAnnexUpload incidentId={incidentId} />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : null}
        {query.isError ? (
          <DetailsErrorAlert
            text="No fue posible cargar los documentos"
            onRetry={() => query.refetch()}
            isPending={query.isFetching}
          />
        ) : null}
        {query.isSuccess && query.data.length === 0 ? (
          <DetailsEmpty
            title="Sin documentos"
            description="Esta incidencia no tiene documentos disponibles."
            media={<FileXCornerIcon />}
          />
        ) : null}
        {query.isSuccess && query.data.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {query.data.map((document) => (
              <li
                key={document.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-md',
                      'bg-destructive/10 text-destructive',
                    )}
                  >
                    <FileTextIcon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {document.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {document.documentType.name} ·{' '}
                      {formatFileSize(document.sizeBytes)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={viewingId !== null || downloadingId !== null}
                    onClick={() => void view(document)}
                  >
                    <EyeIcon data-icon="inline-start" />
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={downloadingId !== null || viewingId !== null}
                    aria-label={`Descargar ${document.originalName}`}
                    onClick={() => void download(document)}
                  >
                    <DownloadIcon />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
