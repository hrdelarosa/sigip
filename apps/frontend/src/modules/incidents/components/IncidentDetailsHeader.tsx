import { BanIcon, PencilIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/formatters'
import type { Incident } from '../types/incident.types'
import { IncidentStatusBadge } from './IncidentStatusBadge'

export function IncidentDetailsHeader({
  incident,
  canEdit,
  canCancel,
  onEdit,
  onCancel,
}: {
  incident: Incident
  canEdit: boolean
  canCancel: boolean
  onEdit: () => void
  onCancel: () => void
}) {
  const showActions =
    incident.status === 'REGISTERED' && (canEdit || canCancel)

  return (
    <header className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              id="incident-title"
              className="wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              {incident.incidentType.name}
            </h1>
            <IncidentStatusBadge status={incident.status} />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Folio {incident.id}
          </p>
        </div>

        {showActions ? (
          <div className="flex flex-wrap gap-2">
            {canEdit ? (
              <Button variant="outline" onClick={onEdit}>
                <PencilIcon data-icon="inline-start" />
                Editar
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={onCancel}
              >
                <BanIcon data-icon="inline-start" />
                Cancelar
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  )
}

export function IncidentDetailsFooter({ incident }: { incident: Incident }) {
  return (
    <footer
      className="flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        Registrada por {incident.registeredBy.fullName} ·{' '}
        {formatDate(incident.createdAt)}
      </p>
      <p>Última actualización · {formatDate(incident.updatedAt)}</p>
    </footer>
  )
}
