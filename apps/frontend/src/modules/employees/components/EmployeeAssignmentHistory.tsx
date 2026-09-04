import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarRange, Pencil } from 'lucide-react'
import { useState } from 'react'
import type { EmployeeAssignment } from '../types/employee.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import EmployeeAssignmentEdit from './EmployeeAssignmentEdit'
import { Link } from 'wouter'
import { routes } from '@/app/router/routes'
import { getEmployeeAssignmentPeriod } from '../lib/employee-assignment-period'
import { useCalendarToday } from '../hooks/useCalendarToday'

function formatCalendarDate(value: string) {
  return format(parseISO(value), 'PPP', { locale: es })
}

export function EmployeeAssignmentHistory({
  assignments,
  canUpdate,
  emptyMessage = 'No hay asignaciones adicionales para mostrar.',
}: {
  assignments: EmployeeAssignment[]
  canUpdate: boolean
  emptyMessage?: string
}) {
  const [editing, setEditing] = useState<EmployeeAssignment | null>(null)
  const today = useCalendarToday()

  if (assignments.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <>
      <ItemGroup role="list">
        {assignments.map((assignment) => {
          const period = getEmployeeAssignmentPeriod(assignment, today)
          return (
            <Item key={assignment.id} variant="outline" role="listitem">
              <ItemMedia variant="icon">
                <CalendarRange aria-hidden="true" />
              </ItemMedia>
              <ItemContent>
                <div className="flex flex-wrap items-center gap-2">
                  <ItemTitle>
                    <Link
                      href={routes.administration.positionDetail(
                        assignment.position.id,
                      )}
                      className="underline-offset-4 hover:underline"
                    >
                      {assignment.position.name}
                    </Link>
                  </ItemTitle>
                  <Badge variant={period === 'current' ? 'default' : 'secondary'}>
                    {period === 'current'
                      ? 'Actual'
                      : period === 'future'
                        ? 'Futura'
                        : 'Histórica'}
                  </Badge>
                </div>
                <ItemDescription>
                  {assignment.position.code} ·{' '}
                  {assignment.organizationalUnit ? (
                    <Link
                      href={routes.administration.organizationalUnitDetail(
                        assignment.organizationalUnit.id,
                      )}
                      className="underline-offset-4 hover:underline"
                    >
                      {assignment.organizationalUnit.code} ·{' '}
                      {assignment.organizationalUnit.name}
                    </Link>
                  ) : (
                    'Sin unidad asignada'
                  )}
                </ItemDescription>
                <p className="text-xs text-muted-foreground">
                  {formatCalendarDate(assignment.effectiveFrom)} –{' '}
                  {assignment.effectiveTo
                    ? formatCalendarDate(assignment.effectiveTo)
                    : 'Sin fecha de fin'}
                  {' · '}
                  {assignment.appointmentType === 'BASE' ? 'Base' : 'Confianza'}
                </p>
                {assignment.schedule ? (
                  <p className="text-xs text-muted-foreground">Horario: {assignment.schedule}</p>
                ) : null}
                {assignment.notes ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm">{assignment.notes}</p>
                ) : null}
              </ItemContent>
              {canUpdate ? (
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Editar asignación de ${assignment.position.name}`}
                    onClick={() => setEditing(assignment)}
                  >
                    <Pencil />
                  </Button>
                </ItemActions>
              ) : null}
            </Item>
          )
        })}
      </ItemGroup>

      {canUpdate && editing ? (
        <EmployeeAssignmentEdit
          assignment={editing}
          open
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
        />
      ) : null}
    </>
  )
}
