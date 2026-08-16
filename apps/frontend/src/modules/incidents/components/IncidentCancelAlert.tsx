import { BanIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { StatusErrorAlert } from '@/components/status-error-alert'
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useCancelIncident } from '../hooks/useCancelIncident'
import type { Incident } from '../types/incident.types'

export function IncidentCancelAlert({
  incident,
  open,
  onOpenChange,
}: {
  incident: Incident
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [reason, setReason] = useState('')
  const mutation = useCancelIncident()
  const error = reason.trim().length > 0 && reason.trim().length < 3

  function handleOpenChange(nextOpen: boolean) {
    if (mutation.isPending) return
    if (!nextOpen) {
      setReason('')
      mutation.reset()
    }
    onOpenChange(nextOpen)
  }

  function cancelIncident() {
    if (reason.trim().length < 3) return

    mutation.mutate(
      { id: incident.id, input: { reason: reason.trim() } },
      {
        onSuccess: () => {
          toast.success('Incidencia cancelada', {
            description: 'El expediente se conserva para consulta y auditoría.',
          })
          setReason('')
          mutation.reset()
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <BanIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>¿Cancelar esta incidencia?</AlertDialogTitle>
          <AlertDialogDescription>
            La incidencia no se eliminará. Cambiará a cancelada y conservará su
            formato, fechas e historial de auditoría.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Field data-invalid={error} className="gap-1.5">
          <FieldLabel htmlFor="incident-cancellation-reason">
            Motivo de cancelación
          </FieldLabel>
          <Textarea
            id="incident-cancellation-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={2000}
            className="h-22 resize-none field-sizing-fixed"
            disabled={mutation.isPending}
            aria-invalid={error}
            placeholder="Describa por qué se cancela el registro"
          />
          <FieldError>
            {error ? 'El motivo debe contener al menos 3 caracteres' : undefined}
          </FieldError>
        </Field>

        {mutation.error ? (
          <StatusErrorAlert errorMessage={mutation.error.message} />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Conservar incidencia
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending || reason.trim().length < 3}
            onClick={cancelIncident}
          >
            {mutation.isPending ? <Spinner aria-label="Cancelando incidencia" /> : null}
            Cancelar incidencia
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
