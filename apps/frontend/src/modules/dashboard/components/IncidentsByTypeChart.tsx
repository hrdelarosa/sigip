import type { UseQueryResult } from '@tanstack/react-query'
import type { DashboardIncidentsByTypeResponse } from '@sigip/shared'
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
import { DashboardError } from './DashboardStates'
import { Skeleton } from '@/components/ui/skeleton'

const chartConfig = {
  count: {
    label: 'Incidencias',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function IncidentsByTypeChart({
  query,
}: {
  query: UseQueryResult<DashboardIncidentsByTypeResponse>
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Incidencias por tipo</CardTitle>
        <CardDescription>
          Tipos con incidencias registradas durante el año.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? <TypeSkeleton /> : null}
        {query.isError ? (
          <DashboardError
            message="No fue posible cargar las incidencias por tipo."
            onRetry={() => query.refetch()}
          />
        ) : null}
        {query.isSuccess && query.data.items.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground" role="status">
            No hay incidencias registradas durante este año.
          </p>
        ) : null}
        {query.isSuccess && query.data.items.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-auto">
            <BarChart
              accessibilityLayer
              data={query.data.items}
              layout="vertical"
              margin={{ left: 4, right: 12 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                width={96}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: string) =>
                  value.length > 14 ? `${value.slice(0, 13)}…` : value
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
                          {value} ({item.payload?.percentage ?? 0}%)
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ChartContainer>
        ) : null}
      </CardContent>
    </Card>
  )
}

function TypeSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando tipos">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-7 w-full" />
      ))}
    </div>
  )
}
