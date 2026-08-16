import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IncidentForm } from './IncidentForm'
import type { Incident } from '../types/incident.types'

export function IncidentEditDialog({
  incident,
  open,
  onOpenChange,
}: {
  incident: Incident
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto p-4 sm:max-w-4xl sm:p-6">
        <DialogHeader>
          <DialogTitle>Editar incidencia</DialogTitle>
          <DialogDescription>
            Actualice la clasificación, fechas y datos del formato. El empleado y
            su asignación histórica no pueden reemplazarse.
          </DialogDescription>
        </DialogHeader>
        <IncidentForm
          incident={incident}
          compact
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
