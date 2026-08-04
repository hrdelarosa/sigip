import { Trash2 } from 'lucide-react'
import type { Permission } from '../types/permission.types'
import { useDeletePermission } from '../hooks/useDeletePermission'

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
import { ApiError } from '@/lib/api/api-error'

interface Props {
  permission: Permission
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PermissionDeleteAlert({
  permission,
  open,
  onOpenChange,
}: Props) {
  const deleteMutation = useDeletePermission()

  function handleDelete() {
    deleteMutation.mutate(
      { id: permission.id },
      {
        onSuccess: () => {
          onOpenChange(false)
          toast.success('Permiso eliminado', {
            description: `El permiso “${permission.code}” se eliminó correctamente.`,
          })
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            onOpenChange(false)
          }

          toast.error('No se pudo eliminar el permiso', {
            description: error.message,
          })
        },
      },
    )
  }

  function handleOpenChange(nextOpen: boolean) {
    if (deleteMutation.isPending) return
    deleteMutation.reset()

    onOpenChange(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>

          <AlertDialogTitle>¿Eliminar este permiso?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el permiso “{permission.code}
            ”. Solo es posible eliminar permisos que no estén asignados a ningún
            rol.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            {deleteMutation.isPending ? (
              <Spinner
                data-icon="inline-start"
                aria-label="Eliminando permiso"
              />
            ) : null}
            {deleteMutation.isPending ? 'Eliminando' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
