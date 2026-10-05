import { useState } from 'react'

import { ActiveIncidentsCard } from '../components/ActiveIncidentsCard'
import { ActiveIncidentsSheet } from '../components/ActiveIncidentsSheet'
import { DashboardKpiCards } from '../components/DashboardKpiCards'
import { DashboardPeriodFilter } from '../components/DashboardPeriodFilter'
import { IncidentTrendChart } from '../components/IncidentTrendChart'
import { IncidentsByTypeChart } from '../components/IncidentsByTypeChart'
import { RecentIncidentsTable } from '../components/RecentIncidentsTable'
import { UpcomingReturnsCard } from '../components/UpcomingReturnsCard'
import { VacationPeriodCard } from '../components/VacationPeriodCard'
import { useDashboardPage, type DashboardTrendPeriod } from '../hooks/useDashboardPage'

export function DashboardPage() {
  const [period, setPeriod] = useState<DashboardTrendPeriod>('6m')
  const page = useDashboardPage(period)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Panel de inicio</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen general de personal e incidencias.
          </p>
        </div>

        <DashboardPeriodFilter value={period} onChange={setPeriod} />
      </div>

      <DashboardKpiCards
        summaryQuery={page.summaryQuery}
        onViewAbsences={() => page.setAbsencesOpen(true)}
      />
      <ActiveIncidentsSheet
        query={page.activeIncidentsQuery}
        open={page.absencesOpen}
        onOpenChange={page.setAbsencesOpen}
      />
      <VacationPeriodCard summaryQuery={page.summaryQuery} />

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <IncidentTrendChart query={page.trendQuery} />
        </div>

        <div className="xl:col-span-2">
          <IncidentsByTypeChart query={page.incidentsByTypeQuery} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActiveIncidentsCard query={page.activeIncidentsQuery} />

        <UpcomingReturnsCard query={page.upcomingReturnsQuery} />
      </div>

      <RecentIncidentsTable query={page.recentIncidentsQuery} />
    </div>
  )
}
