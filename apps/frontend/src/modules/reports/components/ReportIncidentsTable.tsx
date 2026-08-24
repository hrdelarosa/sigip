import { CircleCheckIcon, CircleXIcon, FileTextIcon } from 'lucide-react'
import type { IncidentsReportItemResponse } from '@sigip/shared'

import { Badge } from '@/components/ui/badge'
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

import { formatReportCalendarDate } from '../lib/report-formatters'

export function ReportIncidentsTable({
  items,
}: {
  items: IncidentsReportItemResponse[]
}) {
  return (
    <section className="rounded-xl border bg-card shadow-xs">
      <div className="border-b p-5">
        <h3 className="font-semibold">Detalle de incidencias</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? 'incidencia encontrada' : 'incidencias encontradas'} para el periodo seleccionado.
        </p>
      </div>
      <div className="p-0">
        {items.length === 0 ? <ReportEmptyState /> : null}
        {items.length > 0 ? (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[34%]">Empleado</TableHead>
                <TableHead className="hidden w-[22%] md:table-cell">Unidad</TableHead>
                <TableHead className="w-[22%]">Tipo</TableHead>
                <TableHead className="hidden w-[18%] sm:table-cell">Periodo</TableHead>
                <TableHead className="w-[22%] sm:w-[16%]">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <ReportIncidentRow key={item.incidentId} item={item} />
              ))}
            </TableBody>
          </Table>
        ) : null}
      </div>
    </section>
  )
}

function ReportIncidentRow({ item }: { item: IncidentsReportItemResponse }) {
  return (
    <TableRow>
      <TableCell>
        <span className="block truncate font-medium" title={item.employee.fullName}>
          {item.employee.fullName}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {item.employee.employeeNumber}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <span className="block truncate" title={item.organizationalUnit.name}>
          {item.organizationalUnit.name}
        </span>
      </TableCell>
      <TableCell>
        <span className="block truncate" title={item.incidentType.name}>
          {item.incidentType.name}
        </span>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <span className="block truncate" title={formatOccurrences(item)}>
          {formatOccurrences(item)}
        </span>
      </TableCell>
      <TableCell>
        <StatusBadge status={item.status} />
      </TableCell>
    </TableRow>
  )
}

function ReportEmptyState() {
  return (
    <Empty className="py-16">
      <EmptyMedia variant="icon">
        <FileTextIcon aria-hidden="true" />
      </EmptyMedia>
      <EmptyContent>
        <EmptyTitle>Sin incidencias</EmptyTitle>
        <EmptyDescription>
          No se encontraron incidencias para el periodo y los filtros seleccionados.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}

function StatusBadge({ status }: { status: 'REGISTERED' | 'CANCELLED' }) {
  return (
    <Badge variant={status === 'REGISTERED' ? 'secondary' : 'destructive'}>
      {status === 'REGISTERED' ? <CircleCheckIcon aria-hidden="true" /> : <CircleXIcon aria-hidden="true" />}
      {status === 'REGISTERED' ? 'Registrada' : 'Cancelada'}
    </Badge>
  )
}

function formatOccurrences(item: IncidentsReportItemResponse): string {
  if (item.occurrences.length === 0) return 'Sin fechas'
  return item.occurrences
    .map((occurrence) =>
      occurrence.endDate
        ? `${formatReportCalendarDate(occurrence.startDate)} al ${formatReportCalendarDate(occurrence.endDate)}`
        : formatReportCalendarDate(occurrence.startDate),
    )
    .join(', ')
}
