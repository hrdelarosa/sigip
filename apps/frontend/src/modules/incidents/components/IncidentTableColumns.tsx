import type { DataTableColumn } from '@/components/data-table'
import { formatDate } from '@/lib/formatters'
import { formatIncidentOccurrences } from '../lib/incident-formatters'
import type { Incident } from '../types/incident.types'
import { IncidentStatusBadge } from './IncidentStatusBadge'

export const incidentTableColumns: DataTableColumn<Incident>[] = [
  {
    key: 'employee',
    header: 'Empleado',
    cellClassName: 'whitespace-normal',
    skeletonClassName: 'w-40',
    render: (incident) => (
      <div className="flex min-w-44 flex-col gap-0.5">
        <span className="font-medium">{incident.employee.fullName}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {incident.employee.employeeNumber}
        </span>
      </div>
    ),
  },
  {
    key: 'type',
    header: 'Tipo',
    cellClassName: 'whitespace-normal',
    skeletonClassName: 'w-36',
    render: (incident) => (
      <div className="flex min-w-36 flex-col gap-0.5">
        <span>{incident.incidentType.name}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {incident.incidentType.code}
        </span>
      </div>
    ),
  },
  {
    key: 'occurrences',
    header: 'Aplicación',
    cellClassName: 'whitespace-normal',
    skeletonClassName: 'w-40',
    render: (incident) => (
      <span className="block min-w-44 text-sm">
        {formatIncidentOccurrences(incident.occurrences)}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    skeletonClassName: 'w-24',
    render: (incident) => <IncidentStatusBadge status={incident.status} />,
  },
  {
    key: 'receivedAt',
    header: 'Recibida',
    skeletonClassName: 'w-32',
    render: (incident) => formatDate(incident.receivedAt),
  },
]
