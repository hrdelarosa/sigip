import { DetailField } from '@/components/detail-field'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDate } from '@/lib/formatters'
import type { Incident } from '../types/incident.types'

export function IncidentCancellationCard({ incident }: { incident: Incident }) {
  if (incident.status !== 'CANCELLED') return null

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle>
          <h2>Cancelación registrada</h2>
        </CardTitle>
        <CardDescription>
          El registro se conserva y ya no admite modificaciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Fecha de cancelación">
            {incident.cancelledAt
              ? formatDate(incident.cancelledAt)
              : 'No registrada'}
          </DetailField>
          <DetailField label="Motivo">
            {incident.cancellationReason ?? 'No registrado'}
          </DetailField>
        </dl>
      </CardContent>
    </Card>
  )
}
