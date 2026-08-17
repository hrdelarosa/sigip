import type { UseQueryResult } from '@tanstack/react-query'
import type { DashboardIncidentsByTypeResponse } from '@sigip/shared'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardError } from './DashboardStates'

interface Props {
  query: UseQueryResult<DashboardIncidentsByTypeResponse>
}

export function IncidentsByTypeCard({ query }: Props) {
  const items = query.data?.items
  const maxCount =
    items && items.length > 0
      ? Math.max(...items.map((item) => item.count))
      : 1

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Incidencias por tipo</CardTitle>
        <CardDescription>
          Distribución de las incidencias registradas este año.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? <IncidentsByTypeSkeleton /> : null}

        {query.isError ? (
          <DashboardError
            message="No fue posible cargar la distribución por tipo."
            onRetry={() => query.refetch()}
          />
        ) : null}

        {query.isSuccess && query.data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin incidencias registradas este año.
          </p>
        ) : null}

        {query.isSuccess && query.data.items.length > 0 ? (
          <ul className="space-y-3">
            {query.data.items.map((item) => (
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
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}

function IncidentsByTypeSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  )
}