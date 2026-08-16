import { BanIcon, PencilIcon } from 'lucide-react'

import { DetailField } from '@/components/detail-field'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/formatters'
import { formatCalendarDate } from '../lib/incident-formatters'
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
    <section className="flex min-w-0 flex-col gap-5" aria-labelledby="incident-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <IncidentStatusBadge status={incident.status} />
            <span className="font-mono text-xs text-muted-foreground">
              {incident.incidentType.code}
            </span>
          </div>
          <h1
            id="incident-title"
            className="wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {incident.incidentType.name}
          </h1>
          <p className="mt-2 wrap-break-word text-sm text-muted-foreground">
            {incident.employee.fullName} · Número{' '}
            {incident.employee.employeeNumber}
          </p>
        </div>

        {showActions ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            {canEdit ? (
              <Button variant="outline" onClick={onEdit}>
                <PencilIcon data-icon="inline-start" />
                Editar incidencia
              </Button>
            ) : null}
            {canCancel ? (
              <Button variant="destructive" onClick={onCancel}>
                <BanIcon data-icon="inline-start" />
                Cancelar incidencia
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <dl className="grid min-w-0 gap-4 rounded-xl border bg-muted/25 p-4 sm:grid-cols-3 sm:gap-6">
        <DetailField label="Aplicación">
          {getApplicationSummary(incident.occurrences)}
        </DetailField>
        <DetailField label="Recepción en RH">
          {formatDate(incident.receivedAt)}
        </DetailField>
        <DetailField label="Identificador">
          <span className="break-all font-mono text-xs font-normal text-muted-foreground">
            {incident.id}
          </span>
        </DetailField>
      </dl>
    </section>
  )
}

function getApplicationSummary(
  occurrences: Incident['occurrences'],
): string {
  if (occurrences.length > 1) {
    return `${occurrences.length} fechas registradas`
  }

  const occurrence = occurrences[0]

  if (!occurrence) return 'Sin fechas registradas'

  if (occurrence.endDate) {
    return `${formatCalendarDate(occurrence.startDate)} al ${formatCalendarDate(occurrence.endDate)}`
  }

  return formatCalendarDate(occurrence.startDate)
}
