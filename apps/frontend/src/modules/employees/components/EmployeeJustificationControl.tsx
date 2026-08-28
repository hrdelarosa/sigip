import { ClockArrowDownIcon } from 'lucide-react'
import type { EmployeeJustificationControlResponse } from '@sigip/shared'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function formatMonth(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}-01T00:00:00.000Z`))
}

export function EmployeeJustificationControl({
  control,
}: {
  control: EmployeeJustificationControlResponse
}) {
  const current = control.months.find(
    (month) => month.month === control.currentMonth,
  )
  const history = control.months.filter(
    (month) => month.month !== control.currentMonth,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockArrowDownIcon className="size-5" aria-hidden="true" />
          <h2>Justificaciones de entrada y salida</h2>
        </CardTitle>
        <CardDescription>
          Ambas modalidades comparten un máximo de 3 registros por mes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {current ? (
          <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium capitalize">
                {formatMonth(current.month)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {current.entryCount} de entrada · {current.exitCount} de salida
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold tabular-nums">
                {current.used}/3
              </span>
              <Badge variant={current.remaining === 0 ? 'destructive' : 'secondary'}>
                {current.remaining} disponibles
              </Badge>
            </div>
          </div>
        ) : null}

        {history.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium">Historial mensual</h3>
            <div className="mt-2 divide-y rounded-md border">
              {history.map((month) => (
                <div
                  key={month.month}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="capitalize">{formatMonth(month.month)}</p>
                    <p className="text-xs text-muted-foreground">
                      Entrada {month.entryCount} · Salida {month.exitCount}
                    </p>
                  </div>
                  <span className="font-medium tabular-nums">{month.used}/3</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay justificaciones de meses anteriores.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
