import { CalendarRangeIcon } from 'lucide-react'
import { useState } from 'react'
import type { EmployeeVacationControlResponse } from '@sigip/shared'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VacationAdjustmentDialog } from './VacationAdjustmentDialog'

const periodLabels = {
  FIRST: 'Primer periodo',
  SECOND: 'Segundo periodo',
} as const

const statusLabels = {
  NOT_ELIGIBLE: 'Sin derecho todavía',
  NOT_STARTED: 'Próximo',
  AVAILABLE: 'Disponible',
  EXPIRED: 'Vencido',
} as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00.000Z`))
}

export function EmployeeVacationControl({
  employeeId,
  control,
  canUpdate,
}: {
  employeeId: string
  control: EmployeeVacationControlResponse
  canUpdate: boolean
}) {
  const [selectedYear, setSelectedYear] = useState(String(control.currentYear))
  const year =
    control.years.find((item) => item.year === Number(selectedYear)) ??
    control.years[0]

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarRangeIcon className="size-5" aria-hidden="true" />
              <h2>Control vacacional</h2>
            </CardTitle>
            <CardDescription className="mt-1">
              Saldos ordinarios calculados con incidencias activas y ajustes.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Select
              items={control.years.map((item) => ({
                value: String(item.year),
                label: String(item.year),
              }))}
              value={selectedYear}
              onValueChange={(value) => {
                if (value) setSelectedYear(value)
              }}
            >
              <SelectTrigger
                className="w-28"
                aria-label="Año de saldos vacacionales"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {control.years.map((item) => (
                  <SelectItem key={item.year} value={String(item.year)}>
                    {item.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canUpdate ? (
              <VacationAdjustmentDialog
                employeeId={employeeId}
                currentYear={control.currentYear}
                currentPeriod={control.currentPeriod}
              />
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>
            Elegible desde:{' '}
            {control.eligibilityDate
              ? formatDate(control.eligibilityDate)
              : 'fecha de ingreso no registrada'}
          </span>
          <Badge variant={control.isEligible ? 'secondary' : 'outline'}>
            {control.isEligible ? 'Antigüedad cumplida' : 'Aún no elegible'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {year ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {year.periods.map((period) => {
              const usedPercentage =
                period.entitlementDays > 0
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        (period.consumedDays / period.entitlementDays) * 100,
                      ),
                    )
                  : 0

              return (
                <section
                  key={period.period}
                  className="rounded-lg border bg-muted/20 p-4"
                  aria-label={`${periodLabels[period.period]} ${year.year}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium">
                        {periodLabels[period.period]}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(period.startDate)} al{' '}
                        {formatDate(period.endDate)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        period.status === 'AVAILABLE' ? 'default' : 'secondary'
                      }
                    >
                      {statusLabels[period.status]}
                    </Badge>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <span className="text-3xl font-semibold tabular-nums">
                        {period.remainingDays}
                      </span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        días restantes
                      </span>
                    </div>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {period.consumedDays} de {period.entitlementDays} usados
                    </span>
                  </div>
                  <progress
                    className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary"
                    aria-label={`Consumo de ${periodLabels[period.period]}`}
                    max={period.entitlementDays || 10}
                    value={period.consumedDays}
                  >
                    {usedPercentage}%
                  </progress>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Incidencias: {period.incidentDays}</span>
                    <span>Ajustes: {period.adjustmentDays}</span>
                  </div>

                  {period.adjustments.length > 0 ? (
                    <div className="mt-4 border-t pt-3">
                      <p className="text-xs font-medium">
                        Movimientos manuales
                      </p>
                      <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                        {period.adjustments.map((adjustment) => (
                          <li
                            key={adjustment.id}
                            className="flex justify-between gap-3"
                          >
                            <span
                              className="min-w-0 truncate"
                              title={adjustment.reason}
                            >
                              {adjustment.reason} ·{' '}
                              {adjustment.createdBy.fullName}
                            </span>
                            <span className="shrink-0 font-medium tabular-nums text-foreground">
                              {adjustment.daysDelta > 0 ? '+' : ''}
                              {adjustment.daysDelta}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </section>
              )
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
