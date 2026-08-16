import {
  BriefcaseBusinessIcon,
  CalendarDaysIcon,
  FileTextIcon,
  UserRoundIcon,
} from 'lucide-react'

import { DetailField } from '@/components/detail-field'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { INCIDENT_TEMPORAL_MODE_LABELS } from '../constants/incident.constants'
import { formatCalendarDate } from '../lib/incident-formatters'
import type { Incident } from '../types/incident.types'

export function IncidentDetailsInformation({
  incident,
  documents,
}: {
  incident: Incident
  documents?: React.ReactNode
}) {
  return (
    <section
      className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.8fr)]"
      aria-label="Información de la incidencia"
    >
      <div className="flex min-w-0 flex-col gap-6">
        <Card className="min-w-0 border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDaysIcon aria-hidden="true" />
              <h2>Aplicación de la incidencia</h2>
            </CardTitle>
            <CardDescription>
              Fechas afectadas y notas registradas para este concepto.
            </CardDescription>
            <CardAction className="flex items-center gap-2">
              <Badge variant="outline">
                {
                  INCIDENT_TEMPORAL_MODE_LABELS[
                    incident.incidentType.temporalMode
                  ]
                }
              </Badge>
              <Badge variant="secondary">{incident.occurrences.length}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ItemGroup className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {incident.occurrences.map((occurrence, index) => (
                <Item key={occurrence.id} variant="outline">
                  <ItemMedia variant="icon">
                    <CalendarDaysIcon />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle>
                      {occurrence.endDate
                        ? `Periodo ${index + 1}`
                        : `Día ${index + 1}`}
                    </ItemTitle>
                    <ItemDescription>
                      {formatCalendarDate(occurrence.startDate)}
                      {occurrence.endDate
                        ? ` al ${formatCalendarDate(occurrence.endDate)}`
                        : ''}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>

            <Separator />

            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <FileTextIcon aria-hidden="true" />
                Observaciones
              </p>
              <p className="wrap-break-word rounded-lg bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {incident.observations ?? 'Sin observaciones registradas.'}
              </p>
            </div>
          </CardContent>
        </Card>
        {documents}
      </div>

      <aside className="flex min-w-0 flex-col gap-6" aria-label="Contexto del expediente">
        <Card className="min-w-0" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRoundIcon aria-hidden="true" />
              <h2>Empleado y adscripción</h2>
            </CardTitle>
            <CardDescription>
              Contexto laboral conservado al registrar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div>
              <p className="text-lg font-semibold tracking-tight">
                {incident.employee.fullName}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {incident.employee.employeeNumber}
              </p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <DetailField label="Adscripción">
                {incident.assignment.organizationalUnit.name}
              </DetailField>
              <DetailField label="Puesto">
                {incident.assignment.position.name}
              </DetailField>
              <DetailField label="Nombramiento">
                {incident.assignment.appointmentType === 'BASE'
                  ? 'Base'
                  : 'Confianza'}
              </DetailField>
              <DetailField label="Vigencia">
                {formatCalendarDate(incident.assignment.effectiveFrom)}
                {incident.assignment.effectiveTo
                  ? ` al ${formatCalendarDate(incident.assignment.effectiveTo)}`
                  : ' en adelante'}
              </DetailField>
            </dl>
          </CardContent>
        </Card>

        <Card className="min-w-0" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusinessIcon aria-hidden="true" />
              <h2>Control del formato</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <DetailField label="Tipo">
                <span className="flex flex-wrap items-center gap-2">
                  {incident.incidentType.name}
                  <Badge variant="outline" className="font-mono">
                    {incident.incidentType.code}
                  </Badge>
                </span>
              </DetailField>
              <DetailField label="Emisión">
                {incident.issuedDate
                  ? formatCalendarDate(incident.issuedDate)
                  : 'No indicada'}
              </DetailField>
              <DetailField label="Año de referencia">
                {incident.referenceYear ?? 'No aplica'}
              </DetailField>
              <DetailField label="Registró">
                {incident.registeredBy.fullName}
              </DetailField>
            </dl>
          </CardContent>
        </Card>
      </aside>
    </section>
  )
}
