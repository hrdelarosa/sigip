import { ArrowLeftIcon } from 'lucide-react'
import { Link } from 'wouter'

import { DetailsErrorAlert } from '@/components/details/details-error-alert'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { IncidentCancelAlert } from '../components/IncidentCancelAlert'
import { IncidentCancellationCard } from '../components/IncidentCancellationCard'
import {
  IncidentDetailsFooter,
  IncidentDetailsHeader,
} from '../components/IncidentDetailsHeader'
import { IncidentDetailsInformation } from '../components/IncidentDetailsInformation'
import { IncidentDocuments } from '../components/IncidentDocuments'
import { IncidentEditDialog } from '../components/IncidentEditDialog'
import { useIncidentDetails } from '../hooks/useIncidentDetails'

export function IncidentDetailsPage({ id }: { id: string }) {
  const {
    backHref,
    incident,
    canEdit,
    canCancel,
    canReadDocuments,
    canCreateDocuments,
    editOpen,
    setEditOpen,
    cancelOpen,
    setCancelOpen,
    query,
  } = useIncidentDetails(id)

  return (
    <div className="flex min-w-0 w-full flex-col gap-6">
      {query.isPending ? <IncidentDetailsSkeleton /> : null}
      {query.isError ? (
        <DetailsErrorAlert
          itemType="incidencia"
          onRetry={() => query.refetch()}
          isPending={query.isFetching}
        />
      ) : null}

      {query.isSuccess && incident ? (
        <>
          <IncidentDetailsHeader
            incident={incident}
            canEdit={canEdit}
            canCancel={canCancel}
            onEdit={() => setEditOpen(true)}
            onCancel={() => setCancelOpen(true)}
          />

          <IncidentCancellationCard incident={incident} />

          <IncidentDetailsInformation
            incident={incident}
            documents={
              canReadDocuments ? (
                <IncidentDocuments
                  incidentId={incident.id}
                  canUploadCommissionAnnex={
                    canCreateDocuments &&
                    incident.status === 'REGISTERED' &&
                    incident.incidentType.code === 'COMISION'
                  }
                />
              ) : undefined
            }
          />

          <IncidentDetailsFooter incident={incident} />

          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'w-fit',
            )}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Volver al listado
          </Link>

          {canEdit ? (
            <IncidentEditDialog
              incident={incident}
              open={editOpen}
              onOpenChange={setEditOpen}
            />
          ) : null}
          {canCancel ? (
            <IncidentCancelAlert
              incident={incident}
              open={cancelOpen}
              onOpenChange={setCancelOpen}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function IncidentDetailsSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label="Cargando incidencia"
    >
      <Skeleton className="h-24 w-full max-w-xl" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="h-40" />
    </div>
  )
}
