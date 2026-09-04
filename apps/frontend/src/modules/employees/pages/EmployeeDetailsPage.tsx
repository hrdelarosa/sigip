import { ArrowLeft, Pencil, Power, PowerOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'wouter'

import { routes } from '@/app/router/routes'
import { DetailsErrorAlert } from '@/components/details/details-error-alert'
import PageHeader from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import EmployeeAssignmentCreate from '../components/EmployeeAssignmentCreate'
import { EmployeeAssignmentHistory } from '../components/EmployeeAssignmentHistory'
import EmployeeCurrentAssignment from '../components/EmployeeCurrentAssignment'
import EmployeeDetails from '../components/EmployeeDetails'
import EmployeeEdit from '../components/EmployeeEdit'
import EmployeeStatusAlert from '../components/EmployeeStatusAlert'
import { useEmployee } from '../hooks/useEmployee'
import { getEmployeeAssignmentPeriod } from '../lib/employee-assignment-period'
import { useCalendarToday } from '../hooks/useCalendarToday'
import { useAuth } from '@/modules/auth'
import { getEmployeePermissions } from '../lib/employee-permissions'
import { EmployeeVacationControl } from '../components/EmployeeVacationControl'
import { EmployeeJustificationControl } from '../components/EmployeeJustificationControl'

export function EmployeeDetailsPage({ employeeId }: { employeeId: string }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [employeeId])

  const employeeQuery = useEmployee(employeeId)
  const [editOpen, setEditOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const today = useCalendarToday()
  const backHref = `${routes.employees.root}${window.location.search}`
  const employee = employeeQuery.data
  const auth = useAuth()
  const { canUpdate, canChangeStatus } = getEmployeePermissions(
    auth.data?.permissions,
    employee?.status === 'ACTIVE',
  )
  const currentAssignment =
    employee?.assignments.find(
      (assignment) =>
        getEmployeeAssignmentPeriod(assignment, today) === 'current',
    ) ?? null
  const otherAssignments =
    employee?.assignments.filter(
      (assignment) => assignment.id !== currentAssignment?.id,
    ) ?? []
  const futureCount = otherAssignments.filter(
    (assignment) => getEmployeeAssignmentPeriod(assignment, today) === 'future',
  ).length

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Link
        href={backHref}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'w-fit',
        )}
      >
        <ArrowLeft data-icon="inline-start" />
        Volver a empleados
      </Link>

      {employeeQuery.isPending ? (
        <div
          className="space-y-6"
          aria-busy="true"
          aria-label="Cargando empleado"
        >
          <Skeleton className="h-20 w-full max-w-xl" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(19rem,1fr)]">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : null}

      {employeeQuery.isError ? (
        <DetailsErrorAlert
          itemType="empleado"
          onRetry={() => employeeQuery.refetch()}
          isPending={employeeQuery.isFetching}
        />
      ) : null}

      {employeeQuery.isSuccess && employee ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <PageHeader
                title={employee.fullName}
                description={`Expediente institucional ${employee.employeeNumber}`}
              />
              <StatusBadge isActive={employee.status === 'ACTIVE'} />
            </div>

            {canUpdate || canChangeStatus ? (
              <div className="flex flex-wrap gap-2">
                {canUpdate ? (
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    <Pencil data-icon="inline-start" />
                    Editar datos
                  </Button>
                ) : null}

                {canChangeStatus ? (
                  <Button
                    variant={
                      employee.status === 'ACTIVE' ? 'destructive' : 'default'
                    }
                    onClick={() => setStatusOpen(true)}
                  >
                    {employee.status === 'ACTIVE' ? (
                      <PowerOff data-icon="inline-start" />
                    ) : (
                      <Power data-icon="inline-start" />
                    )}
                    {employee.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          <section
            className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(19rem,1fr)]"
            aria-label="Resumen del empleado"
          >
            <EmployeeCurrentAssignment
              assignment={currentAssignment}
              canUpdate={canUpdate}
            />
            <EmployeeDetails employee={employee} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
            <EmployeeVacationControl
              employeeId={employee.id}
              control={employee.vacationControl}
              canUpdate={canUpdate}
            />
            <EmployeeJustificationControl
              control={employee.justificationControl}
            />
          </section>

          <Card>
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle>
                    <h2>Historial y próximas asignaciones</h2>
                  </CardTitle>
                  <CardDescription>
                    Consulta las vigencias concluidas y los cambios programados.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {futureCount > 0 ? (
                    <Badge variant="outline">
                      {futureCount} {futureCount === 1 ? 'próxima' : 'próximas'}
                    </Badge>
                  ) : null}
                  <Badge variant="secondary">{otherAssignments.length}</Badge>
                  {employee.status === 'ACTIVE' && canUpdate ? (
                    <EmployeeAssignmentCreate employeeId={employee.id} />
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EmployeeAssignmentHistory
                assignments={otherAssignments}
                canUpdate={canUpdate}
              />
            </CardContent>
          </Card>

          {canUpdate ? (
            <EmployeeEdit
              employee={employee}
              open={editOpen}
              onOpenChange={setEditOpen}
            />
          ) : null}
          {canChangeStatus ? (
            <EmployeeStatusAlert
              employee={employee}
              open={statusOpen}
              onOpenChange={setStatusOpen}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
