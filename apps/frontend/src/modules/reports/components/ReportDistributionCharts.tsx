import type { IncidentsReportResponse } from '@sigip/shared'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const typeConfig = {
  count: { label: 'Incidencias', color: 'var(--chart-1)' },
} satisfies ChartConfig

const unitConfig = {
  count: { label: 'Incidencias', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function ReportDistributionCharts({
  summary,
  hideUnitChart,
}: {
  summary: IncidentsReportResponse['summary']
  hideUnitChart: boolean
}) {
  const hasTypeData = summary.byType.length > 0
  const hasUnitData = summary.byOrganizationalUnit.length > 0

  return (
    <div className={`grid gap-4 ${hideUnitChart ? '' : 'lg:grid-cols-2'}`}>
      <DistributionChart
        title="Incidencias por tipo"
        description="Distribución de las incidencias del periodo."
        data={summary.byType.map((item) => ({ ...item, label: item.name }))}
        config={typeConfig}
        hasData={hasTypeData}
      />
      {!hideUnitChart ? (
        <DistributionChart
          title="Incidencias por unidad"
          description="Distribución dentro de las unidades organizacionales."
          data={summary.byOrganizationalUnit.map((item) => ({
            ...item,
            label: item.name,
          }))}
          config={unitConfig}
          hasData={hasUnitData}
        />
      ) : null}
    </div>
  )
}

function DistributionChart({
  title,
  description,
  data,
  config,
  hasData,
}: {
  title: string
  description: string
  data: Array<{ label: string; count: number; percentage: number }>
  config: ChartConfig
  hasData: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="py-16 text-center text-sm text-muted-foreground" role="status">
            Sin incidencias para distribuir.
          </p>
        ) : (
          <ChartContainer config={config} className="h-[280px] w-full aspect-auto">
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ left: 4, right: 12 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="label"
                type="category"
                width={108}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: string) =>
                  value.length > 15 ? `${value.slice(0, 14)}…` : value
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value, name, item) => (
                      <div className="grid gap-1">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-mono font-medium">
                          {value} incidencias · {item.payload?.percentage ?? 0}%
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
