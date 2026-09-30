import { FileDownIcon, EyeIcon } from 'lucide-react'
import type { VacationReportPeriod } from '@sigip/shared'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { buildYearOptions } from '../lib/report-filters'

export interface VacationsFilterState {
  year: number
  period: VacationReportPeriod
  officeId?: string
}

export function VacationsReportFilters({
  value,
  onChange,
  onPreview,
  onDownload,
  canExport,
  downloading,
  officeItems,
  canChooseOffice,
}: {
  value: VacationsFilterState
  onChange: (value: VacationsFilterState) => void
  onPreview: () => void
  onDownload: () => void
  canExport: boolean
  downloading: boolean
  officeItems: Array<{ value: string; label: string }>
  canChooseOffice: boolean
}) {
  const years = buildYearOptions()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saldo de vacaciones</CardTitle>
        <CardDescription>Consulta los días disponibles por empleado, periodo vacacional y oficina. El saldo corresponde al estado actual.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="vacation-report-year">Año de cargo</FieldLabel>
            <Select value={String(value.year)} onValueChange={(year) => year && onChange({ ...value, year: Number(year) })}>
              <SelectTrigger id="vacation-report-year"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="vacation-report-period">Periodo vacacional</FieldLabel>
            <Select value={value.period} onValueChange={(period) => period && onChange({ ...value, period: period as VacationReportPeriod })}>
              <SelectTrigger id="vacation-report-period">
                <SelectValue>
                  {{ BOTH: 'Ambos periodos', FIRST: 'Primer periodo', SECOND: 'Segundo periodo' }[value.period]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BOTH">Ambos periodos</SelectItem>
                <SelectItem value="FIRST">Primer periodo</SelectItem>
                <SelectItem value="SECOND">Segundo periodo</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {canChooseOffice ? (
            <Field>
              <FieldLabel htmlFor="vacation-report-office">Oficina</FieldLabel>
              <Select value={value.officeId ?? ''} onValueChange={(officeId) => onChange({ ...value, officeId: officeId || undefined })}>
                <SelectTrigger id="vacation-report-office">
                  <SelectValue placeholder="Todas las oficinas">
                    {value.officeId
                      ? officeItems.find((office) => office.value === value.officeId)?.label ?? 'Oficina seleccionada'
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las oficinas</SelectItem>
                  {officeItems.map((office) => <SelectItem key={office.value} value={office.value}>{office.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3 border-t bg-muted/20">
        <Button type="button" variant="outline" onClick={onPreview}><EyeIcon data-icon="inline-start" />Vista previa</Button>
        {canExport ? <Button type="button" onClick={onDownload} disabled={downloading}>
          <FileDownIcon data-icon="inline-start" />{downloading ? 'Generando PDF...' : 'Generar PDF'}
        </Button> : null}
      </CardFooter>
    </Card>
  )
}
