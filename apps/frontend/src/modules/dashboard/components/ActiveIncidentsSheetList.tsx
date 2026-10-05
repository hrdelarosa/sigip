import type { UseQueryResult } from '@tanstack/react-query'
import type {
  DashboardActiveIncidentResponse,
  DashboardActiveIncidentsResponse,
} from '@sigip/shared'
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  CalendarDaysIcon,
  UserRoundCheckIcon,
} from 'lucide-react'
import { Link } from 'wouter'

import { routes } from '@/app/router/routes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDashboardOccurrence, getEmployeeInitials } from '../lib/dashboard-formatters'
import { DashboardError } from './DashboardStates'

interface Props {
  query: UseQueryResult<DashboardActiveIncidentsResponse>
  employees: DashboardActiveIncidentResponse[][]
}

export function ActiveIncidentsSheetList({ query, employees }: Props) {
  if (query.isPending) return <ActiveIncidentsSkeleton />

  if (query.isError) {
    return (
      <DashboardError
        message="No fue posible cargar el personal ausente."
        onRetry={() => query.refetch()}
      />
    )
  }

  if (employees.length === 0) {
    return (
      <div className="px-6 py-12 text-center" role="status">
        <UserRoundCheckIcon className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 font-medium">No hay personal ausente hoy</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No se encontraron incidencias vigentes para esta fecha.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-3 p-4 sm:p-5">
      {employees.map((incidents) => {
        const employee = incidents[0]

        return (
          <li
            key={employee.employeeId}
            className="overflow-hidden rounded-lg border bg-card shadow-xs"
          >
            <div className="flex items-center gap-3 bg-muted/20 px-4 py-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 font-medium text-primary">
                  {getEmployeeInitials(employee.employeeName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug break-words">
                  {employee.employeeName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Expediente <span className="font-mono">{employee.employeeNumber}</span>
                </p>
              </div>
              {incidents.length > 1 ? (
                <Badge variant="outline" className="shrink-0 bg-background">
                  {incidents.length} incidencias
                </Badge>
              ) : null}
            </div>

            <div className="space-y-2 px-4 py-3">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <BriefcaseBusinessIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span className="break-words">{employee.position.name}</span>
              </p>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Building2Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span className="break-words">{employee.organizationalUnit.name}</span>
              </p>
            </div>

            <ul className="divide-y border-t bg-muted/10">
              {incidents.map((incident) => (
                <li key={incident.incidentId}>
                  <Link
                    href={routes.incidents.detail(incident.incidentId)}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                  >
                    <Badge variant="secondary" className="h-auto max-w-full whitespace-normal">
                      {incident.incidentType.name}
                    </Badge>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDaysIcon className="size-3.5 shrink-0" aria-hidden="true" />
                      {formatDashboardOccurrence(
                        incident.occurrence.startDate,
                        incident.occurrence.endDate,
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        )
      })}
    </ul>
  )
}

function ActiveIncidentsSkeleton() {
  return (
    <div className="divide-y" aria-busy="true" aria-label="Cargando personal ausente">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex gap-3 px-5 py-4">
          <Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="mt-3 h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
