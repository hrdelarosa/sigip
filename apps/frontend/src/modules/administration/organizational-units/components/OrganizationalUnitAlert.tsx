import { toast } from 'sonner'
import { useUpdateOrganizationalUnitsStatus } from '../hooks/useUpdateOrganizationalUnitStatus'
import type { OrganizationalUnit } from '../types/organizational-units.types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Power, PowerOff } from 'lucide-react'
import { StatusErrorAlert } from '@/components/status-error-alert'
import { Spinner } from '@/components/ui/spinner'
import { ApiError } from '@/lib/api/api-error'

interface Props {
  organizationalUnit: OrganizationalUnit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OrganizationalUnitAlert({
  organizationalUnit,
  open,
  onOpenChange,
}: Props) {
  const statusMutation = useUpdateOrganizationalUnitsStatus()
  const activating = !organizationalUnit.isActive

  function handleStatusChange() {
    statusMutation.mutate(
      { id: organizationalUnit.id, input: { isActive: activating } },
      {
        onSuccess: (updatedOrganizationalUnit) => {
          onOpenChange(false)
          toast.success(
            activating
              ? 'Unidad organizacional activada'
              : 'Unidad organizacional desactivada',
            {
              description: `La unidad organizacional “${updatedOrganizationalUnit.name}” se actualizó correctamente.`,
            },
          )
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409)
            onOpenChange(false)
          toast.error(
            'No se pudo actualizar el estado de la unidad organizacional',
            {
              description: error.message,
            },
          )
        },
      },
    )
  }

  function handleOpenChange(nextOpen: boolean) {
    if (statusMutation.isPending) return
    statusMutation.reset()
    onOpenChange(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            {activating ? <Power /> : <PowerOff />}
          </AlertDialogMedia>
          <AlertDialogTitle>
            ¿{activating ? 'Activar' : 'Desactivar'} esta unidad organizacional
            “{organizationalUnit.name}”?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {activating
              ? `La unidad organizacional “${organizationalUnit.name}” volverá a estar disponible para asignación y los usuarios podrán acceder a sus funciones.`
              : `La unidad organizacional “${organizationalUnit.name}” dejará de estar disponible para asignación y los usuarios no podrán acceder a sus funciones.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {statusMutation.error ? (
          <StatusErrorAlert errorMessage={statusMutation.error.message} />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={statusMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant={activating ? 'default' : 'destructive'}
            disabled={statusMutation.isPending}
            onClick={handleStatusChange}
          >
            {statusMutation.isPending ? (
              <Spinner
                data-icon="inline-start"
                aria-label="Actualizando unidad organizacional"
              />
            ) : null}
            {statusMutation.isPending
              ? 'Actualizando'
              : activating
                ? 'Activar'
                : 'Desactivar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
