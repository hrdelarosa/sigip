import { CircleAlert, Power, PowerOff } from 'lucide-react'
import type { Role } from '../types/roles.types'
import { ApiError } from '@/lib/api/api-error'

import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { useUpdateRoleStatus } from '../hooks/useUpdateRoleStatus'

interface Props {
  role: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RoleStatusAlert({ role, open, onOpenChange }: Props) {
  const statusMutation = useUpdateRoleStatus()
  const activating = !role.isActive

  function handleStatusChange() {
    statusMutation.mutate(
      { id: role.id, input: { isActive: activating } },
      {
        onSuccess: (updatedRole) => {
          onOpenChange(false)
          toast.success(activating ? 'Rol activado' : 'Rol desactivado', {
            description: `El rol “${updatedRole.name}” se actualizó correctamente.`,
          })
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            onOpenChange(false)
          }
          toast.error('No se pudo actualizar el estado del rol', {
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
            ¿{activating ? 'Activar' : 'Desactivar'} este rol?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {activating
              ? `El rol “${role.name}” volverá a estar disponible para asignaciones.`
              : `El rol “${role.name}” dejará de estar disponible. Los usuarios asignados deben reasignarse antes de desactivarlo.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {statusMutation.error ? (
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>No se pudo cambiar el estado</AlertTitle>
            <AlertDescription>{statusMutation.error.message}</AlertDescription>
          </Alert>
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
              <Spinner data-icon="inline-start" aria-label="Actualizando rol" />
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
