import {
  CalendarDaysIcon,
  FileTextIcon,
  UserRoundSearchIcon,
} from 'lucide-react'
import { useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useIncidentSubmit } from '../hooks/useIncidentSubmit'
import { useIncidentFormContext } from '../hooks/useIncidentFormContext'
import { getIncidentFormDefaultValues } from '../lib/incident-form-helpers'
import {
  createIncidentFormSchema,
  incidentFormSchema,
  type IncidentFormValues,
} from '../schemas/incident-form.schema'
import type { Incident } from '../types/incident.types'
import { IncidentEmployeeFields } from './IncidentContextFields'
import { IncidentFileField } from './IncidentFileField'
import { IncidentMetadataFields } from './IncidentMetadataFields'
import { IncidentObservationsField } from './IncidentObservationsField'
import { IncidentOccurrencesField } from './IncidentOccurrencesField'

export function IncidentForm({
  incident,
  onSuccess,
  onCancel,
}: {
  incident?: Incident
  onSuccess: (incident: Incident) => void
  onCancel?: () => void
  compact?: boolean
}) {
  const { isPending, submit } = useIncidentSubmit(incident, onSuccess)
  const { control, register, setValue, handleSubmit } =
    useValidatedForm<IncidentFormValues>({
      formSchema: incident ? incidentFormSchema : createIncidentFormSchema,
      defaultValues: getIncidentFormDefaultValues(incident),
      onSubmit: submit,
    })
  const context = useIncidentFormContext(control, setValue, incident)
  const temporalMode = useWatch({ control, name: 'temporalMode' })
  const incidentTypeId = useWatch({ control, name: 'incidentTypeId' })
  const incidentTypeCode = useWatch({ control, name: 'incidentTypeCode' })

  return (
    <form
      className="flex min-w-0 flex-col gap-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="flex min-w-0 flex-col gap-5">
        <Card className="min-w-0 shadow-sm" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRoundSearchIcon className="size-4" aria-hidden="true" />
              Empleado y asignación
            </CardTitle>
            <CardDescription>
              Seleccione el empleado y la asignación afectada por la incidencia.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <IncidentEmployeeFields
              control={control}
              incident={incident}
              disabled={isPending}
              context={context}
            />
          </CardContent>
        </Card>

        <Card className="min-w-0 shadow-sm" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileTextIcon className="size-4" aria-hidden="true" />
              Datos de la incidencia
            </CardTitle>
            <CardDescription>
              Tipo de incidencia y datos de recepción del documento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentMetadataFields
              control={control}
              register={register}
              disabled={isPending}
              context={context}
            />
          </CardContent>
        </Card>

        <Card className="min-w-0 shadow-sm" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDaysIcon className="size-4" aria-hidden="true" />
              Fechas de la incidencia
            </CardTitle>
            <CardDescription>
              Defina cómo se distribuyen las fechas de la incidencia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentOccurrencesField
              control={control}
              temporalMode={temporalMode}
              configured={Boolean(incidentTypeId)}
              disabled={isPending}
            />
          </CardContent>
        </Card>

        <Card className="min-w-0 shadow-sm" size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileTextIcon className="size-4" aria-hidden="true" />
              Observaciones y documentos
            </CardTitle>
            <CardDescription>
              {incident
                ? 'Notas adicionales sobre la incidencia.'
                : 'Adjunte el formato de incidencia y registre observaciones.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <IncidentObservationsField
              control={control}
              register={register}
              disabled={isPending}
            />
            {!incident ? (
              <IncidentFileField control={control} disabled={isPending} />
            ) : null}
            {!incident && incidentTypeCode === 'COMISION' ? (
              <IncidentFileField
                control={control}
                name="commissionAnnex"
                id="commission-annex"
                label="Oficio de comisión (opcional)"
                description="Anexo exclusivo para Comisión, en PDF y de hasta 5 MB."
                prompt="Adjuntar oficio PDF"
                disabled={isPending}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
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
  )
}
