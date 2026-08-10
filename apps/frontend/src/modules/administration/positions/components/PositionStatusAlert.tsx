import { toast } from 'sonner'
import { useUpdatePositionStatus } from '../hooks/useUpdatePositionStatus'
import type { Position } from '../types/positions.types'
import { ApiError } from '@/lib/api/api-error'
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

interface Props {
  position: Position
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PositionStatusAlert({
  position,
  open,
  onOpenChange,
}: Props) {
  const statusMutation = useUpdatePositionStatus()
  const activating = !position.isActive

  function handleStatusChange() {
    statusMutation.mutate(
      { id: position.id, input: { isActive: activating } },
      {
        onSuccess: (updatedPosition) => {
          onOpenChange(false)
          toast.success(activating ? 'Puesto activado' : 'Puesto desactivado', {
            description: `El puesto “${updatedPosition.name}” se actualizó correctamente.`,
          })
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409)
            onOpenChange(false)
          toast.error('No se pudo actualizar el estado del puesto', {
            description: error.message,
          })
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
            ¿{activating ? 'Activar' : 'Desactivar'} este puesto “
            {position.name}”?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {activating
              ? `El puesto “${position.name}” volverá a estar disponible para asignación y los usuarios podrán acceder a sus funciones.`
              : `El puesto “${position.name}” dejará de estar disponible para asignación y los usuarios no podrán acceder a sus funciones.`}
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
                aria-label="Actualizando puesto"
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
