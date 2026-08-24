import type { UseQueryResult } from '@tanstack/react-query'
import type { DashboardIncidentTrendResponse } from '@sigip/shared'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardError } from './DashboardStates'

const chartConfig = {
  count: {
    label: 'Incidencias',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function IncidentTrendChart({
  query,
}: {
  query: UseQueryResult<DashboardIncidentTrendResponse>
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Evolución de incidencias</CardTitle>
        <CardDescription>
          Comportamiento de las incidencias registradas durante el periodo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? <TrendSkeleton /> : null}
        {query.isError ? (
          <DashboardError
            message="No fue posible cargar la evolución de incidencias."
            onRetry={() => query.refetch()}
          />
        ) : null}
        {query.isSuccess && query.data.items.every((item) => item.count === 0) ? (
          <div className="grid min-h-72 place-items-center text-center" role="status">
            <p className="text-sm text-muted-foreground">
              No hay incidencias registradas durante este periodo.
            </p>
          </div>
        ) : null}
        {query.isSuccess && query.data.items.some((item) => item.count > 0) ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-auto">
            <AreaChart
              accessibilityLayer
              data={query.data.items}
              margin={{ left: 0, right: 8, top: 8 }}
            >
              <defs>
                <linearGradient id="dashboardTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={28} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="count"
                type="monotone"
                stroke="var(--color-count)"
                fill="url(#dashboardTrendFill)"
                strokeWidth={2}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        ) : null}
      </CardContent>
    </Card>
  )
}

function TrendSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando tendencia">
      <Skeleton className="h-[260px] w-full" />
    </div>
  )
}
