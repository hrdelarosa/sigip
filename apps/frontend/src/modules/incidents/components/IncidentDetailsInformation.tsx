import {
  BriefcaseBusinessIcon,
  CalendarDaysIcon,
  FileTextIcon,
  UserRoundIcon,
} from 'lucide-react'

import { DetailField } from '@/components/detail-field'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDate } from '@/lib/formatters'
import {
  INCIDENT_APPOINTMENT_SCOPE_LABELS,
  INCIDENT_TEMPORAL_MODE_LABELS,
} from '../constants/incident.constants'
import {
  formatCalendarDate,
  formatCalendarDateNumeric,
} from '../lib/incident-formatters'
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
      className="flex min-w-0 flex-col gap-5"
      aria-label="Información de la incidencia"
    >
      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-2">
        <Card className="min-w-0 shadow-sm" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRoundIcon className="size-4" aria-hidden="true" />
              Empleado y asignación
            </CardTitle>
            <CardDescription>
              Contexto laboral conservado al registrar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <DetailField label="Empleado">
                {incident.employee.fullName}
              </DetailField>
              <DetailField label="Número">
                {incident.employee.employeeNumber}
              </DetailField>
              <DetailField label="Adscripción">
                {incident.assignment?.organizationalUnit.name ?? 'No asignado'}
              </DetailField>
              <DetailField label="Puesto">
                {incident.assignment?.position.name ?? 'No asignado'}
              </DetailField>
              <DetailField label="Nombramiento">
                {incident.assignment
                  ? incident.assignment.appointmentType === 'BASE'
                    ? 'Base'
                    : 'Confianza'
                  : 'No asignado'}
              </DetailField>
              <DetailField label="Horario">
                {incident.assignment?.schedule ?? 'No asignado'}
              </DetailField>
              <DetailField
                label="Vigencia de la asignación"
                className="sm:col-span-2"
              >
                {incident.assignment
                  ? `${formatCalendarDate(incident.assignment.effectiveFrom)}${
                      incident.assignment.effectiveTo
                        ? ` al ${formatCalendarDate(incident.assignment.effectiveTo)}`
                        : ' en adelante'
                    }`
                  : 'No asignado'}
              </DetailField>
            </dl>
          </CardContent>
        </Card>

        <Card className="min-w-0 shadow-sm" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BriefcaseBusinessIcon className="size-4" aria-hidden="true" />
              Datos de la incidencia
            </CardTitle>
            <CardDescription>
              Tipo, recepción y metadatos del formato.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <DetailField label="Tipo">
                {incident.incidentType.name}
              </DetailField>
              <DetailField label="Clave">
                <span className="font-mono text-sm">
                  {incident.incidentType.code}
                </span>
              </DetailField>
              <DetailField label="Modalidad temporal">
                {
                  INCIDENT_TEMPORAL_MODE_LABELS[
                    incident.incidentType.temporalMode
                  ]
                }
              </DetailField>
              <DetailField label="Alcance">
                {
                  INCIDENT_APPOINTMENT_SCOPE_LABELS[
                    incident.incidentType.appointmentScope
                  ]
                }
              </DetailField>
              <DetailField label="Fecha de recepción">
                {formatDate(incident.receivedAt)}
              </DetailField>
              <DetailField label="Fecha de emisión">
                {incident.issuedDate
                  ? formatCalendarDate(incident.issuedDate)
                  : 'No indicada'}
              </DetailField>
              <DetailField label="Año de referencia">
                {incident.referenceYear ?? 'No aplica'}
              </DetailField>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-2">
        <Card className="min-w-0 shadow-sm" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDaysIcon className="size-4" aria-hidden="true" />
              Fechas de la incidencia ({incident.occurrences.length})
            </CardTitle>
            <CardDescription>
              Periodos o días afectados por esta incidencia.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {incident.occurrences.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin fechas registradas.
              </p>
            ) : (
              incident.occurrences.map((occurrence, index) => (
                <div
                  key={occurrence.id}
                  className="rounded-lg border bg-muted/20 px-3 py-2"
                >
                  {occurrence.endDate ? (
                    <div className="flex justify-between items-center gap-3">
                      <DateValue value={occurrence.startDate} />
                      <span className="text-sm text-muted-foreground">al</span>
                      <DateValue value={occurrence.endDate} />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {incident.occurrences.length > 1 ? (
                        <span className="text-xs font-medium text-muted-foreground">
                          Día {index + 1}
                        </span>
                      ) : null}
                      <DateValue value={occurrence.startDate} />
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 shadow-sm h-full" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileTextIcon className="size-4" aria-hidden="true" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="wrap-break-word text-sm leading-relaxed whitespace-pre-wrap">
              {incident.observations ?? 'Sin observaciones registradas.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {documents}
    </section>
  )
}

function DateValue({ value }: { value: string }) {
  return (
    <span className="font-mono text-sm tabular-nums">
      {formatCalendarDateNumeric(value)}
    </span>
  )
}
