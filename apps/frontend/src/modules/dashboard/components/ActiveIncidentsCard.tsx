import type { UseQueryResult } from '@tanstack/react-query'
import { Link } from 'wouter'
import type { DashboardActiveIncidentsResponse } from '@sigip/shared'
import { UserRoundCheckIcon } from 'lucide-react'

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
      <CardContent>
        {query.isPending ? <ActiveIncidentsSkeleton /> : null}

        {query.isError ? (
          <DashboardError
            message="No fue posible cargar el personal ausente."
            onRetry={() => query.refetch()}
          />
        ) : null}

        {query.isSuccess && query.data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground" role="status">
            No hay personal ausente por incidencia hoy.
          </p>
        ) : null}

        {query.isSuccess && query.data.items.length > 0 ? (
          <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {query.data.items.map((item) => (
              <li
                key={item.incidentId}
                className="rounded-xl border bg-background p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary">{item.incidentType.name}</Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {item.employeeNumber}
                  </span>
                </div>
                <Link
                  href={routes.incidents.detail(item.incidentId)}
                  className="mt-4 block font-semibold underline-offset-4 hover:underline"
                >
                  {item.employeeName}
                </Link>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {item.position.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.organizationalUnit.name}
                </p>
                <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                  {formatDashboardOccurrence(
                    item.occurrence.startDate,
                    item.occurrence.endDate,
                  )}
                </p>
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
