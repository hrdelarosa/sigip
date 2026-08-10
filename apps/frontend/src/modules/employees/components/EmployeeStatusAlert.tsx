import { Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import type { Employee } from '../types/employee.types'
import { useUpdateEmployeeStatus } from '../hooks/useUpdateEmployeeStatus'
import { StatusErrorAlert } from '@/components/status-error-alert'
import { Spinner } from '@/components/ui/spinner'
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
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmployeeStatusAlert({
  employee,
  open,
  onOpenChange,
}: Props) {
  const statusMutation = useUpdateEmployeeStatus()
  const activating = employee.status === 'INACTIVE'

  function handleStatusChange() {
    statusMutation.mutate(
      {
        id: employee.id,
        input: { status: activating ? 'ACTIVE' : 'INACTIVE' },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          toast.success(activating ? 'Empleado activado' : 'Empleado desactivado')
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
            ¿{activating ? 'Activar' : 'Desactivar'} a “{employee.fullName}”?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {activating
              ? 'El empleado volverá a figurar como activo en sus asignaciones.'
              : 'El empleado dejará de figurar como activo. Su historial de asignaciones se conservará.'}
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
              <Spinner aria-label="Actualizando empleado" />
            ) : null}
            {activating ? 'Activar' : 'Desactivar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
