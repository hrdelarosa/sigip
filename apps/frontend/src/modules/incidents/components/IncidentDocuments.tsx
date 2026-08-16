import { useQuery } from '@tanstack/react-query'
import { DownloadIcon, FileTextIcon, FileXCornerIcon } from 'lucide-react'

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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { formatDate } from '@/lib/formatters'
import { useIncidentDocumentDownload } from '../hooks/useIncidentDocumentDownload'
import { incidentDocumentsQueryOptions } from '../queries/incident-query-options'
import { DetailsErrorAlert } from '@/components/details/details-error-alert'
import { DetailsEmpty } from '@/components/details/details-empty'
import { CommissionAnnexUpload } from './CommissionAnnexUpload'

export function IncidentDocuments({
  incidentId,
  canUploadCommissionAnnex = false,
}: {
  incidentId: string
  canUploadCommissionAnnex?: boolean
}) {
  const query = useQuery(incidentDocumentsQueryOptions(incidentId))
  const { download, downloadingId } = useIncidentDocumentDownload()
  const hasCommissionAnnex = query.data?.some(
    (document) => document.documentType.code === 'OFICIO_COMISION',
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Expediente documental</h2>
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
          <ItemGroup>
            {query.data.map((document) => (
              <Item key={document.id} variant="outline">
                <ItemMedia variant="icon">
                  <FileTextIcon />
                </ItemMedia>

                <ItemContent className="min-w-0">
                  <ItemTitle>{document.originalName}</ItemTitle>

                  <ItemDescription>
                    {document.documentType.name} ·{' '}
                    {(document.sizeBytes / 1024 / 1024).toFixed(2)} MB ·{' '}
                    {formatDate(document.createdAt)}
                  </ItemDescription>
                </ItemContent>

                <ItemActions className="basis-full justify-end sm:basis-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={downloadingId !== null}
                    onClick={() => void download(document)}
                  >
                    <DownloadIcon data-icon="inline-start" />
                    Descargar
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        ) : null}
      </CardContent>
    </Card>
  )
}
