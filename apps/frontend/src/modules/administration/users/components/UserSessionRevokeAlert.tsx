import { LogOutIcon } from 'lucide-react'
import { toast } from 'sonner'

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
import { useRevokeUserSession } from '../hooks/useRevokeUserSession'
import type { User, UserSession } from '../types/user.types'

interface Props {
  user: User
  session: UserSession | null
  onOpenChange: (open: boolean) => void
}

export default function UserSessionRevokeAlert({
  user,
  session,
  onOpenChange,
}: Props) {
  const revokeMutation = useRevokeUserSession(user.id)

  function handleOpenChange(open: boolean) {
    if (revokeMutation.isPending) return
    if (!open) revokeMutation.reset()
    onOpenChange(open)
  }

  function handleRevoke() {
    if (!session) return

    revokeMutation.mutate(
      { userId: user.id, sessionId: session.id },
      {
        onSuccess: () => {
          onOpenChange(false)
          toast.success('Sesión revocada', {
            description: `El acceso de “${user.fullName}” fue invalidado correctamente.`,
          })
        },
        onError: (error) => {
          toast.error('No se pudo revocar la sesión', {
            description: error.message,
          })
        },
      },
    )
  }

  return (
    <AlertDialog open={Boolean(session)} onOpenChange={handleOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <LogOutIcon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>¿Revocar esta sesión?</AlertDialogTitle>
          <AlertDialogDescription>
            “{user.fullName}” perderá inmediatamente el acceso asociado a este
            dispositivo.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={revokeMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={revokeMutation.isPending}
            onClick={handleRevoke}
          >
            {revokeMutation.isPending ? <Spinner aria-hidden="true" /> : null}
            {revokeMutation.isPending ? 'Revocando...' : 'Revocar sesión'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
