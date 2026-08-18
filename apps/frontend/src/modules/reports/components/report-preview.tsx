import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CircleCheckIcon,
  CircleXIcon,
  ClipboardListIcon,
  FileTextIcon,
  UsersIcon,
} from 'lucide-react'
import type {
  IncidentsReportItemResponse,
  IncidentsReportResponse,
  ReportPeriodType,
} from '@sigip/shared'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ReportPreviewProps {
  report: IncidentsReportResponse
}

const PERIOD_TYPE_LABELS: Record<ReportPeriodType, string> = {
  FORTNIGHT: 'Quincenal',
  MONTH: 'Mensual',
  YEAR: 'Anual',
  CUSTOM: 'Personalizado',
}

export function ReportPreview({ report }: ReportPreviewProps) {
  const maxByTypeCount =
    report.summary.byType.length > 0
      ? Math.max(...report.summary.byType.map((item) => item.count))
      : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Vista previa del reporte
          </h2>

          <p className="text-sm text-muted-foreground">
            {report.period.label}
          </p>

          <p className="text-xs text-muted-foreground">
            Del {formatReportDate(report.period.startDate)} al{' '}
            {formatReportDate(report.period.endDate)}
          </p>
        </div>

        <Badge variant="secondary" className="w-fit">
          {PERIOD_TYPE_LABELS[report.period.type]}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Incidencias"
          value={report.summary.totalIncidents}
          icon={ClipboardListIcon}
        />
        <SummaryCard
          label="Trabajadores"
          value={report.summary.totalEmployees}
          icon={UsersIcon}
        />
        <SummaryCard
          label="Registradas"
          value={report.summary.registeredIncidents}
          icon={CircleCheckIcon}
        />
        <SummaryCard
          label="Canceladas"
          value={report.summary.cancelledIncidents}
          icon={CircleXIcon}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Incidencias por tipo</CardTitle>
            <CardDescription>
              Distribución de las incidencias del periodo.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {report.summary.byType.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay incidencias en el periodo.
              </p>
            ) : (
              <ul className="space-y-3">
                {report.summary.byType.map((item) => (
                  <li key={item.incidentTypeId}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`${item.name}: ${item.count} incidencias`}
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(item.count / maxByTypeCount) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Resumen del periodo</CardTitle>
            <CardDescription>
              Información consolidada de las incidencias capturadas.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <PeriodFact
                label="Fecha inicial"
                value={formatReportDate(report.period.startDate)}
              />
              <PeriodFact
                label="Fecha final"
                value={formatReportDate(report.period.endDate)}
              />
              <PeriodFact
                label="Tipo de reporte"
                value={PERIOD_TYPE_LABELS[report.period.type]}
              />
              <PeriodFact
                label="Incidencias con detalles"
                value={`${report.items.length} en el periodo`}
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de incidencias</CardTitle>
          <CardDescription>
            {report.items.length} incidencia(s) encontrada(s) para el periodo
            seleccionado.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {report.items.length === 0 ? (
            <Empty>
              <EmptyMedia variant="icon">
                <FileTextIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyContent>
                <EmptyTitle>Sin incidencias</EmptyTitle>
                <EmptyDescription>
                  No se encontraron incidencias para el periodo y los filtros
                  seleccionados.
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">No.</TableHead>
                  <TableHead>No. empleado</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha(s)</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {report.items.map((item, index) => (
                  <TableRow key={item.incidentId}>
                    <TableCell className="text-center tabular-nums text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {item.employee.employeeNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.employee.fullName}
                    </TableCell>
                    <TableCell>{item.organizationalUnit.name}</TableCell>
                    <TableCell>{item.position.name}</TableCell>
                    <TableCell>{item.incidentType.name}</TableCell>
                    <TableCell>{formatOccurrences(item)}</TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell
                      className="max-w-56 truncate text-muted-foreground"
                      title={item.observations ?? undefined}
                    >
                      {item.observations ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: typeof ClipboardListIcon
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon aria-hidden="true" className="size-4" />
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
      </CardContent>
    </Card>
  )
}

function PeriodFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  )
}

function StatusBadge({ status }: { status: 'REGISTERED' | 'CANCELLED' }) {
  return (
    <Badge variant={status === 'REGISTERED' ? 'default' : 'destructive'}>
      {status === 'REGISTERED' ? (
        <CircleCheckIcon aria-hidden="true" />
      ) : (
        <CircleXIcon aria-hidden="true" />
      )}
      {status === 'REGISTERED' ? 'Registrada' : 'Cancelada'}
    </Badge>
  )
}

function formatOccurrences(item: IncidentsReportItemResponse): string {
  if (item.occurrences.length === 0) return 'Sin fechas'
  if (item.occurrences.length > 2) {
    return `${formatCalendarDate(item.occurrences[0].startDate)} y ${item.occurrences.length - 1} más`
  }

  return item.occurrences
    .map((occurrence) =>
      occurrence.endDate
        ? `${formatCalendarDate(occurrence.startDate)} al ${formatCalendarDate(occurrence.endDate)}`
        : formatCalendarDate(occurrence.startDate),
    )
    .join(', ')
}

function formatCalendarDate(value: string): string {
  return format(parseISO(value), 'd MMM yyyy', { locale: es })
}

function formatReportDate(value: string): string {
  return format(parseISO(value), "d 'de' MMMM 'de' yyyy", { locale: es })
}