import type { UseQueryResult } from '@tanstack/react-query'
import type { DashboardActiveIncidentsResponse } from '@sigip/shared'
import { CalendarDaysIcon, UserRoundCheckIcon } from 'lucide-react'
import { Link } from 'wouter'

import { routes } from '@/app/router/routes'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDashboardOccurrence } from '../lib/dashboard-formatters'
import { DashboardError } from './DashboardStates'

interface Props {
  query: UseQueryResult<DashboardActiveIncidentsResponse>
}

export function ActiveIncidentsList({ query }: Props) {
  if (query.isPending) return <ActiveIncidentsSkeleton />

  if (query.isError) {
    return (
      <DashboardError
        message="No fue posible cargar el personal ausente."
        onRetry={() => query.refetch()}
      />
    )
  }

  if (query.data.items.length === 0) {
    return (
      <div className="px-6 py-10 text-center" role="status">
        <UserRoundCheckIcon
          className="mx-auto size-8 text-muted-foreground/60"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm font-medium">No hay personal ausente hoy</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No se encontraron incidencias vigentes para esta fecha.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y">
      {query.data.items.map((item) => (
        <li
          key={item.incidentId}
          className="group px-6 py-5 transition-colors hover:bg-muted/30"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              aria-hidden="true"
            >
              {getInitials(item.employeeName)}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={routes.incidents.detail(item.incidentId)}
                className="font-semibold break-words text-foreground underline-offset-4 hover:underline focus-visible:underline"
              >
                {item.employeeName}
              </Link>
              <p className="mt-0.5 text-sm break-words text-muted-foreground">
                {item.position.name} · {item.organizationalUnit.name}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                Expediente {item.employeeNumber}
              </p>
              <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                <Badge variant="secondary" className="h-auto max-w-full py-1 text-left whitespace-normal">
                  {item.incidentType.name}
                </Badge>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDaysIcon className="size-3.5 shrink-0" aria-hidden="true" />
                  {formatDashboardOccurrence(
                    item.occurrence.startDate,
                    item.occurrence.endDate,
                  )}
                </span>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function ActiveIncidentsSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6" aria-busy="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return initials.toUpperCase() || '?'
}
