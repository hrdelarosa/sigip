import { ArrowLeftIcon } from 'lucide-react'
import { Link, useLocation } from 'wouter'

import { routes } from '@/app/router/routes'
import PageHeader from '@/components/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IncidentForm } from '../components/IncidentForm'

export function CreateIncidentPage() {
  const [, navigate] = useLocation()

  return (
    <div className="flex min-w-0 w-full flex-col gap-5">
      <Link
        href={routes.incidents.root}
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Volver a incidencias
      </Link>
      <PageHeader
        title="Registrar nueva incidencia"
        description="Capture los datos del empleado, el periodo afectado y el documento que respalda la incidencia."
      />
      <IncidentForm
        onSuccess={(incident) => navigate(routes.incidents.detail(incident.id))}
        onCancel={() => navigate(routes.incidents.root)}
      />
    </div>
  )
}
