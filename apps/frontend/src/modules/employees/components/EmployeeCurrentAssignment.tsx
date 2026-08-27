import {
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  Clock3,
  FileText,
  Pencil,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import { Link } from 'wouter'

import { routes } from '@/app/router/routes'
import { DetailField } from '@/components/detail-field'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { EmployeeAssignment } from '../types/employee.types'
import EmployeeAssignmentEdit from './EmployeeAssignmentEdit'

function formatCalendarDate(value: string) {
  return format(parseISO(value), 'PPP', { locale: es })
}

export default function EmployeeCurrentAssignment({
  assignment,
  canUpdate,
}: {
  assignment: EmployeeAssignment | null
  canUpdate: boolean
}) {
  const [editOpen, setEditOpen] = useState(false)

  if (!assignment) {
    return (
      <Card className="h-full border-dashed bg-muted/20 shadow-none">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <div className="grid size-11 place-items-center rounded-full bg-muted">
            <BriefcaseBusiness aria-hidden="true" className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="font-medium">Sin asignación vigente</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              No existe una asignación activa para la fecha actual. Consulta el
              historial o registra una nueva vigencia.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-full border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BriefcaseBusiness aria-hidden="true" className="size-4" />
            <h2>Asignación actual</h2>
          </CardTitle>
          <CardDescription>
            Contexto laboral vigente del empleado.
          </CardDescription>
          <CardAction className="flex items-center gap-2">
            <Badge>Vigente</Badge>
            {canUpdate ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Editar asignación actual"
                onClick={() => setEditOpen(true)}
              >
                <Pencil />
              </Button>
            ) : null}
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Link
              href={routes.administration.positionDetail(assignment.position.id)}
              className="text-xl font-semibold tracking-tight underline-offset-4 hover:underline"
            >
              {assignment.position.name}
            </Link>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {assignment.position.code}
            </p>
          </div>

          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <DetailField label="Unidad organizacional">
              <Link
                href={routes.administration.organizationalUnitDetail(
                  assignment.organizationalUnit.id,
                )}
                className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
              >
                <Building2 aria-hidden="true" className="size-4 text-muted-foreground" />
                {assignment.organizationalUnit.name}
              </Link>
            </DetailField>
            <DetailField label="Nombramiento">
              {assignment.appointmentType === 'BASE' ? 'Base' : 'Confianza'}
            </DetailField>
            <DetailField label="Vigencia">
              <span className="inline-flex items-center gap-2">
                <CalendarRange aria-hidden="true" className="size-4 text-muted-foreground" />
                {formatCalendarDate(assignment.effectiveFrom)} a{' '}
                {assignment.effectiveTo
                  ? formatCalendarDate(assignment.effectiveTo)
                  : 'sin fecha de fin'}
              </span>
            </DetailField>
            <DetailField label="Horario">
              <span className="inline-flex items-center gap-2">
                <Clock3 aria-hidden="true" className="size-4 text-muted-foreground" />
                {assignment.schedule || 'No especificado'}
              </span>
            </DetailField>
          </dl>

          {assignment.notes ? (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <FileText aria-hidden="true" className="size-3.5" />
                Notas
              </p>
              <p className="whitespace-pre-wrap text-sm">{assignment.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {canUpdate ? (
        <EmployeeAssignmentEdit
          assignment={assignment}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
    </>
  )
}
