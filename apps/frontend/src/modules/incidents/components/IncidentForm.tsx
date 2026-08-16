import { format } from 'date-fns'
import {
  CalendarRangeIcon,
  FileTextIcon,
  UserRoundSearchIcon,
} from 'lucide-react'
import { FormProvider, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { cn } from '@/lib/utils'
import { useCreateIncident } from '../hooks/useCreateIncident'
import { useUpdateIncident } from '../hooks/useUpdateIncident'
import {
  commissionAnnexSchema,
  incidentFileSchema,
  incidentFormSchema,
  type IncidentFormValues,
} from '../schemas/incident-form.schema'
import type { Incident } from '../types/incident.types'
import { IncidentContextFields } from './IncidentContextFields'
import { IncidentFileField } from './IncidentFileField'
import { IncidentMetadataFields } from './IncidentMetadataFields'
import { IncidentObservationsField } from './IncidentObservationsField'
import { IncidentOccurrencesField } from './IncidentOccurrencesField'

export function IncidentForm({
  incident,
  onSuccess,
  onCancel,
  compact = false,
}: {
  incident?: Incident
  onSuccess: (incident: Incident) => void
  onCancel?: () => void
  compact?: boolean
}) {
  const createMutation = useCreateIncident()
  const updateMutation = useUpdateIncident()
  const isPending = createMutation.isPending || updateMutation.isPending
  const { form, handleSubmit } = useValidatedForm<IncidentFormValues>({
    formSchema: incidentFormSchema,
    defaultValues: getDefaultValues(incident),
    onSubmit: submit,
  })
  const temporalMode = useWatch({
    control: form.control,
    name: 'temporalMode',
  })
  const incidentTypeId = useWatch({
    control: form.control,
    name: 'incidentTypeId',
  })
  const incidentTypeCode = useWatch({
    control: form.control,
    name: 'incidentTypeCode',
  })

  async function submit(values: IncidentFormValues) {
    if (!incident) {
      const fileResult = incidentFileSchema.safeParse(values.file)

      if (!fileResult.success) {
        form.setError('file', {
          message: fileResult.error.issues[0]?.message ?? 'Seleccione un PDF',
        })
        return
      }

      const commissionAnnex = values.commissionAnnex
        ? commissionAnnexSchema.safeParse(values.commissionAnnex)
        : null
      if (commissionAnnex && !commissionAnnex.success) {
        form.setError('commissionAnnex', {
          message:
            commissionAnnex.error.issues[0]?.message ?? 'Seleccione un PDF válido',
        })
        return
      }

      try {
        const created = await createMutation.mutateAsync({
          input: toRequest(values),
          file: fileResult.data,
          commissionAnnex: commissionAnnex?.data,
        })
        toast.success('Incidencia registrada', {
          description: `El formato de ${created.employee.fullName} quedó resguardado.`,
        })
        onSuccess(created)
      } catch (error) {
        toast.error('No se pudo registrar la incidencia', {
          description: getErrorMessage(error),
        })
      }
      return
    }

    try {
      const updated = await updateMutation.mutateAsync({
        id: incident.id,
        input: toUpdateRequest(values),
      })
      toast.success('Incidencia actualizada', {
        description: 'Los cambios se guardaron correctamente.',
      })
      onSuccess(updated)
    } catch (error) {
      toast.error('No se pudo actualizar la incidencia', {
        description: getErrorMessage(error),
      })
    }
  }

  return (
    <FormProvider {...form}>
      <form
        className="flex min-w-0 flex-col gap-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <div
          className={cn(
            'grid min-w-0 items-start gap-4',
            !compact &&
              'xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.85fr)]',
          )}
        >
          <div className="flex min-w-0 flex-col gap-4">
            <Card className="min-w-0" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRoundSearchIcon aria-hidden="true" />
              <h2>Identificación</h2>
            </CardTitle>
            <CardDescription>
              Empleado, asignación y tipo de incidencia a registrar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentContextFields incident={incident} disabled={isPending} />
          </CardContent>
            </Card>

            <Card className="min-w-0" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRangeIcon aria-hidden="true" />
              <h2>Periodo de la incidencia</h2>
            </CardTitle>
            <CardDescription>
              Defina cómo se distribuyen las fechas de la incidencia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentOccurrencesField
              temporalMode={temporalMode}
              configured={Boolean(incidentTypeId)}
              disabled={isPending}
            />
          </CardContent>
            </Card>
          </div>

          <Card
            className={cn(
              'min-w-0',
              !compact && 'xl:sticky xl:top-4',
            )}
            size="sm"
          >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon aria-hidden="true" />
              <h2>Documento y trámite</h2>
            </CardTitle>
            <CardDescription>
              Datos administrativos y respaldo documental de la incidencia.
            </CardDescription>
            {!incident ? (
              <CardAction>
                <Badge variant="outline">PDF obligatorio</Badge>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <IncidentMetadataFields disabled={isPending} />
            {!incident ? <IncidentFileField disabled={isPending} /> : null}
            {!incident && incidentTypeCode === 'COMISION' ? (
              <IncidentFileField
                name="commissionAnnex"
                id="commission-annex"
                label="Oficio de comisión (opcional)"
                description="Anexo exclusivo para Comisión, en PDF y de hasta 5 MB."
                prompt="Seleccionar oficio PDF"
                disabled={isPending}
              />
            ) : null}
            <IncidentObservationsField disabled={isPending} />
          </CardContent>
          </Card>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
          ) : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            {incident ? 'Guardar cambios' : 'Registrar incidencia'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

function getDefaultValues(incident?: Incident): IncidentFormValues {
  if (!incident) {
    return {
      employeeId: '',
      employeeAssignmentId: '',
      incidentTypeId: '',
      incidentTypeCode: '',
      temporalMode: 'SINGLE_DATE',
      assignmentEffectiveFrom: '',
      assignmentEffectiveTo: null,
      issuedDate: null,
      receivedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      referenceYear: String(new Date().getFullYear()),
      observations: '',
      occurrences: [{ startDate: '', endDate: null }],
      file: null,
      commissionAnnex: null,
    }
  }

  return {
    employeeId: incident.employeeId,
    employeeAssignmentId: incident.employeeAssignmentId,
    incidentTypeId: incident.incidentTypeId,
    incidentTypeCode: incident.incidentType.code,
    temporalMode: incident.incidentType.temporalMode,
    assignmentEffectiveFrom: incident.assignment.effectiveFrom,
    assignmentEffectiveTo: incident.assignment.effectiveTo,
    issuedDate: incident.issuedDate,
    receivedAt: format(new Date(incident.receivedAt), "yyyy-MM-dd'T'HH:mm"),
    referenceYear: incident.referenceYear ? String(incident.referenceYear) : '',
    observations: incident.observations ?? '',
    occurrences: incident.occurrences.map((occurrence) => ({
      startDate: occurrence.startDate,
      endDate: occurrence.endDate,
    })),
    file: null,
    commissionAnnex: null,
  }
}

function toRequest(values: IncidentFormValues) {
  return {
    employeeId: values.employeeId,
    employeeAssignmentId: values.employeeAssignmentId,
    incidentTypeId: values.incidentTypeId,
    issuedDate: values.issuedDate || null,
    receivedAt: new Date(values.receivedAt).toISOString(),
    referenceYear: values.referenceYear ? Number(values.referenceYear) : null,
    observations: values.observations.trim() || null,
    occurrences: values.occurrences.map((occurrence) => ({
      startDate: occurrence.startDate,
      endDate: occurrence.endDate || null,
    })),
  }
}

function toUpdateRequest(values: IncidentFormValues) {
  const request = toRequest(values)

  return {
    incidentTypeId: request.incidentTypeId,
    issuedDate: request.issuedDate,
    receivedAt: request.receivedAt,
    referenceYear: request.referenceYear,
    observations: request.observations,
    occurrences: request.occurrences,
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Intente nuevamente.'
}
