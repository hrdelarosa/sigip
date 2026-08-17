import PageHeader from '@/components/page-header'
import { ActiveIncidentsCard } from '../components/ActiveIncidentsCard'
import { DashboardKpiCards } from '../components/DashboardKpiCards'
import { IncidentsByTypeCard } from '../components/IncidentsByTypeCard'
import { useDashboardPage } from '../hooks/useDashboardPage'

export function DashboardPage() {
  const page = useDashboardPage()

  return (
    <>
      <PageHeader
        title="Panel de inicio"
        description="Resumen operativo del personal y las incidencias registradas."
      />

      <DashboardKpiCards summaryQuery={page.summaryQuery} />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ActiveIncidentsCard query={page.activeIncidentsQuery} />
        </div>
        <div className="lg:col-span-2">
          <IncidentsByTypeCard query={page.incidentsByTypeQuery} />
        </div>
      </div>
    </>
  )
}