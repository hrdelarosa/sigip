import type { UserResponse } from '@sigip/shared'
import { CircleAlert, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
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
import { Spinner } from '@/components/ui/spinner'
import { useUpdateUserStatus } from '../hooks/useUpdateUserStatus'

interface Props {
  user: UserResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UserStatusAlert({ user, open, onOpenChange }: Props) {
  const statusMutation = useUpdateUserStatus()
  const activating = !user.isActive

  function handleStatusChange() {
    statusMutation.mutate(
      { id: user.id, input: { isActive: activating } },
      {
        onSuccess: (updatedUser) => {
          onOpenChange(false)
          toast.success(
            activating ? 'Usuario activado' : 'Usuario desactivado',
            {
              description: `La cuenta de “${updatedUser.fullName}” se actualizó correctamente.`,
            },
          )
        },
        onError: (error) => {
          toast.error('No se pudo actualizar el estado del usuario', {
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
            ¿{activating ? 'Activar' : 'Desactivar'} este usuario?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {activating
              ? `La cuenta de “${user.fullName}” recuperará el acceso al sistema.`
              : `La cuenta de “${user.fullName}” dejará de poder acceder al sistema.`}
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
              <Spinner data-icon="inline-start" aria-label="Actualizando usuario" />
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
