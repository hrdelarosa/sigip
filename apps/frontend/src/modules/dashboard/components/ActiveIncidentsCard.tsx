import type { UseQueryResult } from '@tanstack/react-query'
import type { DashboardActiveIncidentsResponse } from '@sigip/shared'
import { UserRoundCheckIcon } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ActiveIncidentsList } from './ActiveIncidentsList'

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
        <ActiveIncidentsList query={query} />
      </CardContent>
    </Card>
  )
}
