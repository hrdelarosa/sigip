import { ArrowLeftIcon } from 'lucide-react'
import { Link, useLocation } from 'wouter'

import { routes } from '@/app/router/routes'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IncidentForm } from '../components/IncidentForm'

export function CreateIncidentPage() {
  const [, navigate] = useLocation()

  return (
    <div className="flex min-w-0 w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Registrar incidencia
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Capture una nueva incidencia de personal y adjunte la documentación de
            respaldo.
          </p>
        </div>

        <Link
          href={routes.incidents.root}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'w-fit shrink-0',
          )}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Volver
        </Link>
      </div>

      <IncidentForm
        onSuccess={(incident) => navigate(routes.incidents.detail(incident.id))}
        onCancel={() => navigate(routes.incidents.root)}
      />
    </div>
  )
}
