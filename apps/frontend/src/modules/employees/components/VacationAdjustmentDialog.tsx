import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'

import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useCreateVacationAdjustment } from '../hooks/useCreateVacationAdjustment'
import {
  vacationAdjustmentFormSchema,
  type VacationAdjustmentFormValues,
} from '../schemas/vacation-adjustment-form.schema'

export function VacationAdjustmentDialog({
  employeeId,
  currentYear,
  currentPeriod,
}: {
  employeeId: string
  currentYear: number
  currentPeriod: 'FIRST' | 'SECOND'
}) {
  const [open, setOpen] = useState(false)
  const mutation = useCreateVacationAdjustment()
  const defaults: VacationAdjustmentFormValues = {
    year: String(currentYear),
    period: currentPeriod,
    daysDelta: '1',
    reason: '',
  }
  const { register, control, errors, reset, handleSubmit } = useValidatedForm({
    formSchema: vacationAdjustmentFormSchema,
    defaultValues: defaults,
    onSubmit: (values) => {
      mutation.mutate(
        {
          employeeId,
          input: {
            year: Number(values.year),
            period: values.period,
            daysDelta: Number(values.daysDelta),
            reason: values.reason,
          },
        },
        {
          onSuccess: () => {
            toast.success('Ajuste vacacional registrado')
            reset(defaults)
            setOpen(false)
          },
          onError: (error) =>
            toast.error('No se pudo registrar el ajuste', {
              description: error.message,
            }),
        },
      )
    },
  })

  return (
    <FormDialog
      module="ajuste vacacional"
      description="Registra consumo previo o una corrección. Los movimientos no se eliminan."
      trigger={
        <Button size="sm" variant="outline">
          <PlusIcon data-icon="inline-start" />
          Registrar ajuste
        </Button>
      }
      open={open}
      onOpenChange={(nextOpen) => {
        if (mutation.isPending) return
        if (!nextOpen) {
          reset(defaults)
          mutation.reset()
        }
        setOpen(nextOpen)
      }}
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      error={mutation.error}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.year)} className="gap-1.5">
          <FieldLabel htmlFor="vacation-adjustment-year">Año</FieldLabel>
          <Input
            id="vacation-adjustment-year"
            type="number"
            min={2000}
            max={2100}
            disabled={mutation.isPending}
            aria-invalid={Boolean(errors.year)}
            {...register('year')}
          />
          <FieldError>{errors.year?.message}</FieldError>
        </Field>

        <Controller
          control={control}
          name="period"
          render={({ field }) => (
            <Field data-invalid={Boolean(errors.period)} className="gap-1.5">
              <FieldLabel htmlFor="vacation-adjustment-period">Periodo</FieldLabel>
              <Select
                items={[
                  { value: 'FIRST', label: 'Primer periodo' },
                  { value: 'SECOND', label: 'Segundo periodo' },
                ]}
                value={field.value}
                onValueChange={field.onChange}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="vacation-adjustment-period" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST">Primer periodo</SelectItem>
                  <SelectItem value="SECOND">Segundo periodo</SelectItem>
                </SelectContent>
              </Select>
              <FieldError>{errors.period?.message}</FieldError>
            </Field>
          )}
        />
      </div>

      <Field data-invalid={Boolean(errors.daysDelta)} className="gap-1.5">
        <FieldLabel htmlFor="vacation-adjustment-days">Días de ajuste</FieldLabel>
        <Input
          id="vacation-adjustment-days"
          type="number"
          min={-10}
          max={10}
          disabled={mutation.isPending}
          aria-invalid={Boolean(errors.daysDelta)}
          {...register('daysDelta')}
        />
        <p className="text-xs text-muted-foreground">
          Use valores positivos para agregar consumo y negativos para corregirlo.
        </p>
        <FieldError>{errors.daysDelta?.message}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.reason)} className="gap-1.5">
        <FieldLabel htmlFor="vacation-adjustment-reason">Motivo</FieldLabel>
        <Textarea
          id="vacation-adjustment-reason"
          rows={3}
          maxLength={500}
          disabled={mutation.isPending}
          aria-invalid={Boolean(errors.reason)}
          {...register('reason')}
        />
        <FieldError>{errors.reason?.message}</FieldError>
      </Field>
    </FormDialog>
  )
}
