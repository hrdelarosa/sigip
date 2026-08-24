import type { UseQueryResult } from '@tanstack/react-query'
import type { DashboardUpcomingReturnsResponse } from '@sigip/shared'
import { ArrowRightIcon, CalendarCheck2Icon } from 'lucide-react'
import { Link } from 'wouter'

import { routes } from '@/app/router/routes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDashboardDate, getEmployeeInitials } from '../lib/dashboard-formatters'
import { DashboardError } from './DashboardStates'

export function UpcomingReturnsCard({
  query,
}: {
  query: UseQueryResult<DashboardUpcomingReturnsResponse>
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <CalendarCheck2Icon className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>Próximas reincorporaciones</CardTitle>
        <CardDescription>Incidencias que terminan durante los próximos 7 días.</CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? <ReturnsSkeleton /> : null}
        {query.isError ? (
          <DashboardError
            message="No fue posible cargar las próximas reincorporaciones."
            onRetry={() => query.refetch()}
          />
        ) : null}
        {query.isSuccess && query.data.items.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground" role="status">
            No hay reincorporaciones previstas durante los próximos 7 días.
          </p>
        ) : null}
        {query.isSuccess && query.data.items.length > 0 ? (
          <ul className="space-y-1">
            {query.data.items.map((item) => (
              <li key={item.incidentId}>
                <Link
                  href={routes.incidents.detail(item.incidentId)}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <Avatar size="sm">
                    <AvatarFallback>
                      {getEmployeeInitials(item.employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {item.employee.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.incidentType.name} · {item.organizationalUnit.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <Badge variant="outline" className="font-normal">
                      {item.daysRemaining === 0
                        ? 'Hoy'
                        : item.daysRemaining === 1
                          ? 'Mañana'
                          : formatDashboardDate(item.returnDate)}
                    </Badge>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {query.isSuccess && query.data.items.length > 0 ? (
          <Link
            href={routes.incidents.root}
            className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver incidencias <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}

function ReturnsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando reincorporaciones">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}
