import { Trash2 } from 'lucide-react'
import type { Permission } from '../types/permission.types'

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
  function handleDelete() {
    onOpenChange(false)
    toast.info('Eliminación no disponible', {
      description: 'Esta acción todavía no está conectada al servidor.',
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>

          <AlertDialogTitle>¿Eliminar este permiso?</AlertDialogTitle>
          <AlertDialogDescription>
            El permiso “{permission.code}” dejaría de estar disponible para los
            roles que lo utilizan. Esta operación todavía no está habilitada en
            el servidor.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
