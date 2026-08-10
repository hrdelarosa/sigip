import { CalendarDays, Clock3, IdCardLanyard, UserRound } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

import { DetailField } from '@/components/detail-field'
import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDate } from '@/lib/formatters'
import type { EmployeeDetails as EmployeeDetailsData } from '../types/employee.types'

export default function EmployeeDetails({
  employee,
}: {
  employee: EmployeeDetailsData
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound aria-hidden="true" className="size-4" />
          <h2>Datos del empleado</h2>
        </CardTitle>
        <CardDescription>
          Información institucional y estado del registro.
        </CardDescription>
        <CardAction>
          <StatusBadge isActive={employee.status === 'ACTIVE'} />
        </CardAction>
      </CardHeader>

      <CardContent>
        <dl className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <DetailField label="Número de empleado">
            <span className="inline-flex items-center gap-2 font-mono font-medium">
              <IdCardLanyard aria-hidden="true" className="size-4 text-muted-foreground" />
              {employee.employeeNumber}
            </span>
          </DetailField>
          <DetailField label="Fecha de contratación">
            <span className="inline-flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="size-4 text-muted-foreground" />
              {employee.hireDate
                ? format(parseISO(employee.hireDate), 'PPP', { locale: es })
                : 'No registrada'}
            </span>
          </DetailField>
          <DetailField label="Creado">
            {formatDate(employee.createdAt)}
          </DetailField>
          <DetailField label="Última actualización">
            <span className="inline-flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-4 text-muted-foreground" />
              {formatDate(employee.updatedAt)}
            </span>
          </DetailField>
        </dl>

        <div className="mt-5 border-t pt-4">
          <Badge variant="outline">
            {employee.assignments.length === 1
              ? '1 asignación registrada'
              : `${employee.assignments.length} asignaciones registradas`}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
