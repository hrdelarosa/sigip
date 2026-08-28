import type { UseQueryResult } from '@tanstack/react-query'
import { Link } from 'wouter'
import type { DashboardActiveIncidentsResponse } from '@sigip/shared'
import { CalendarDaysIcon, UserRoundCheckIcon } from 'lucide-react'

import { routes } from '@/app/router/routes'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDashboardOccurrence } from '../lib/dashboard-formatters'
import { DashboardError } from './DashboardStates'

interface Props {
  query: UseQueryResult<DashboardActiveIncidentsResponse>
}

export function ActiveIncidentsCard({ query }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className="border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Personal ausente hoy</CardTitle>
          <CardDescription>
            Personal con una incidencia registrada vigente el día de hoy.
          </CardDescription>
        </div>
        {query.data ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-sm ring-1 ring-foreground/10 sm:mt-0">
            <UserRoundCheckIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="font-semibold tabular-nums">
              {query.data.total}
            </span>
            <span className="text-muted-foreground">personas</span>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {query.isPending ? <ActiveIncidentsSkeleton /> : null}

        {query.isError ? (
          <DashboardError
            message="No fue posible cargar el personal ausente."
            onRetry={() => query.refetch()}
          />
        ) : null}

        {query.isSuccess && query.data.items.length === 0 ? (
          <div className="px-6 py-10 text-center" role="status">
            <UserRoundCheckIcon
              className="mx-auto size-8 text-muted-foreground/60"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-medium">
              No hay personal ausente hoy
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              No se encontraron incidencias vigentes para esta fecha.
            </p>
          </div>
        ) : null}

        {query.isSuccess && query.data.items.length > 0 ? (
          <ul className="divide-y">
            {query.data.items.map((item) => (
              <li
                key={item.incidentId}
                className="group flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {getInitials(item.employeeName)}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={routes.incidents.detail(item.incidentId)}
                      className="block truncate font-semibold underline-offset-4 group-hover:underline"
                    >
                      {item.employeeName}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.position.name} · {item.organizationalUnit.name}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Expediente {item.employeeNumber}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  <Badge variant="secondary" className="max-w-full truncate">
                    {item.incidentType.name}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
                    {formatDashboardOccurrence(
                      item.occurrence.startDate,
                      item.occurrence.endDate,
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}

function ActiveIncidentsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
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
