import type {
  VacationReportPeriodBalanceResponse,
  VacationsReportResponse,
} from '@sigip/shared'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const periodLabels = { FIRST: 'Primer periodo', SECOND: 'Segundo periodo' } as const
const statusLabels = {
  NOT_ELIGIBLE: 'No elegible',
  NOT_STARTED: 'Próximo',
  AVAILABLE: 'Disponible',
  EXPIRED: 'Vencido',
} as const

function findBalance(
  periods: VacationReportPeriodBalanceResponse[],
  period: 'FIRST' | 'SECOND',
) {
  return periods.find((balance) => balance.period === period)
}

function VacationBalance({
  balance,
}: {
  balance?: VacationReportPeriodBalanceResponse
}) {
  if (!balance) return <span className="text-sm text-muted-foreground">—</span>

  return (
    <div className="min-w-40">
      <p className="whitespace-nowrap font-semibold tabular-nums">
        {balance.remainingDays}
        <span className="font-normal text-muted-foreground"> / {balance.entitlementDays} días</span>
      </p>
      <p className="mt-0.5 whitespace-nowrap text-xs text-muted-foreground">
        {balance.consumedDays} usados · {statusLabels[balance.status]}
      </p>
    </div>
  )
}

export function VacationsReportPreview({
  report,
}: {
  report: VacationsReportResponse
}) {
  const periods: Array<'FIRST' | 'SECOND'> =
    report.period === 'BOTH' ? ['FIRST', 'SECOND'] : [report.period]

  return (
    <section className="space-y-4" aria-label="Vista previa de saldos vacacionales">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Empleados activos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{report.totalEmployees}</CardContent>
        </Card>
        {report.period !== 'SECOND' ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saldo restante · primer periodo</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {report.totals.firstPeriodRemainingDays} días
            </CardContent>
          </Card>
        ) : null}
        {report.period !== 'FIRST' ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saldo restante · segundo periodo</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {report.totals.secondPeriodRemainingDays} días
            </CardContent>
          </Card>
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalle por empleado · año de cargo {report.year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Empleado</th>
                  <th className="px-3 py-2 font-medium">Oficina</th>
                  {periods.map((period) => (
                    <th key={period} className="px-3 py-2 font-semibold text-foreground">
                      {periodLabels[period]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.items.map((employee) => (
                  <tr key={employee.id} className="border-b last:border-0">
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{employee.fullName}</p>
                      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                        No. {employee.employeeNumber}
                      </p>
                    </td>
                    <td className="max-w-56 px-3 py-2.5 text-muted-foreground">
                      {employee.office.name}
                    </td>
                    {periods.map((period) => (
                      <td key={`${employee.id}-${period}`} className="px-3 py-2.5">
                        <VacationBalance balance={findBalance(employee.periods, period)} />
                      </td>
                    ))}
                  </tr>
                ))}
                {report.items.length === 0 ? (
                  <tr>
                    <td colSpan={2 + periods.length} className="px-3 py-10 text-center text-muted-foreground">
                      No hay empleados activos para los filtros seleccionados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Los periodos vencidos se muestran como referencia histórica y no se suman al total disponible.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
