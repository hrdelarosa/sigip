import type { UseQueryResult } from '@tanstack/react-query'
import type { DashboardRecentIncidentsResponse } from '@sigip/shared'
import { ArrowRightIcon } from 'lucide-react'
import { Link } from 'wouter'

import { routes } from '@/app/router/routes'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDashboardDate } from '../lib/dashboard-formatters'
import { DashboardError } from './DashboardStates'

export function RecentIncidentsTable({
  query,
}: {
  query: UseQueryResult<DashboardRecentIncidentsResponse>
}) {
  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Incidencias recientes</CardTitle>
          <CardDescription>Últimas incidencias registradas en el sistema.</CardDescription>
        </div>
        <Link
          href={routes.incidents.root}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline sm:mt-0"
        >
          Ver todas <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </CardHeader>
      <CardContent>
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? (
          <DashboardError
            message="No fue posible cargar las incidencias recientes."
            onRetry={() => query.refetch()}
          />
        ) : null}
        {query.isSuccess && query.data.items.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground" role="status">
            No hay incidencias registradas recientemente.
          </p>
        ) : null}
        {query.isSuccess && query.data.items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead className="hidden md:table-cell">Área</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden sm:table-cell">Periodo</TableHead>
                <TableHead className="hidden lg:table-cell">Registro</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.items.map((item) => (
                <TableRow key={item.incidentId}>
                  <TableCell>
                    <Link
                      href={routes.incidents.detail(item.incidentId)}
                      className="font-medium hover:underline"
                    >
                      {item.employee.name}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {item.employee.employeeNumber}
                    </span>
                  </TableCell>
                  <TableCell className="hidden max-w-36 truncate md:table-cell">
                    {item.organizationalUnit.name}
                  </TableCell>
                  <TableCell>{item.incidentType.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDashboardDate(item.occurrence.startDate)}
                    {item.occurrence.endDate
                      ? ` - ${formatDashboardDate(item.occurrence.endDate)}`
                      : ''}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDashboardDate(item.receivedAt.slice(0, 10))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'REGISTERED' ? 'secondary' : 'outline'}>
                      {item.status === 'REGISTERED' ? 'Activa' : 'Finalizada'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando incidencias recientes">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}
