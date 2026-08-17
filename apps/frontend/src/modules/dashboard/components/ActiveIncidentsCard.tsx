import type { UseQueryResult } from '@tanstack/react-query'
import { Link } from 'wouter'
import type { DashboardActiveIncidentsResponse } from '@sigip/shared'

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
      <CardHeader>
        <CardTitle>Ausentes hoy</CardTitle>
        <CardDescription>
          Personal con una incidencia registrada vigente el día de hoy.
        </CardDescription>
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
          <p className="text-sm text-muted-foreground">
            No hay personal ausente por incidencia hoy.
          </p>
        ) : null}

        {query.isSuccess && query.data.items.length > 0 ? (
          <ul className="divide-y">
            {query.data.items.map((item) => (
              <li
                key={item.incidentId}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={routes.incidents.detail(item.incidentId)}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {item.employeeName}
                  </Link>
                  <Badge variant="secondary">{item.incidentType.name}</Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {item.employeeNumber} · {item.organizationalUnit.name} ·{' '}
                  {item.position.name}
                </p>
                <p className="text-xs text-muted-foreground">
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