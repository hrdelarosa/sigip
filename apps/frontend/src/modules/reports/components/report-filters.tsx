import { FileDownIcon, EyeIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ReportFortnightOption, ReportPeriodType } from '@sigip/shared'

import {
  MONTH_OPTIONS,
  buildYearOptions,
  formatPeriodLabel,
  type ReportsFilterState,
} from '../lib/report-filters'

interface ReportFiltersProps {
  value: ReportsFilterState
  onChange: (value: ReportsFilterState) => void
  onPreview: () => void
  onDownload: () => void
  canExport: boolean
  isValid: boolean
  downloading: boolean
  typeItems: Array<{ value: string; label: string }>
  unitItems: Array<{ value: string; label: string }>
  catalogsLoading: boolean
  catalogsError: boolean
  onRetryCatalogs: () => void
}

const PERIOD_OPTIONS: Array<{ value: ReportPeriodType; label: string }> = [
  { value: 'FORTNIGHT', label: 'Quincenal' },
  { value: 'MONTH', label: 'Mensual' },
  { value: 'YEAR', label: 'Anual' },
  { value: 'CUSTOM', label: 'Personalizado' },
]

const FORTNIGHT_OPTIONS: Array<{ value: ReportFortnightOption; label: string }> = [
  { value: 'FIRST', label: 'Primera quincena (1 al 15)' },
  { value: 'SECOND', label: 'Segunda quincena (16 al fin de mes)' },
]

const yearOptions = buildYearOptions()

export function ReportFilters({
  value,
  onChange,
  onPreview,
  onDownload,
  canExport,
  isValid,
  downloading,
  typeItems,
  unitItems,
  catalogsLoading,
  catalogsError,
  onRetryCatalogs,
}: ReportFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar reporte</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {catalogsError ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>
              No fue posible cargar los catálogos.{' '}
              <button type="button" className="font-medium underline" onClick={onRetryCatalogs}>
                Reintentar
              </button>
            </AlertDescription>
          </Alert>
        ) : null}
        <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field>
              <FieldLabel htmlFor="report-period">Periodo</FieldLabel>
              <Select
                value={value.period}
                onValueChange={(period) => {
                  if (!period) return

                  onChange(applyPeriodChange(value, period as ReportPeriodType))
                }}
              >
                <SelectTrigger id="report-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {value.period === 'FORTNIGHT' ? (
              <Field>
                <FieldLabel htmlFor="report-fortnight">Quincena</FieldLabel>
                <Select
                  value={value.fortnight}
                  onValueChange={(fortnight) => {
                    if (fortnight) {
                      onChange({
                        ...value,
                        fortnight: fortnight as ReportFortnightOption,
                      })
                    }
                  }}
                >
                  <SelectTrigger id="report-fortnight">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORTNIGHT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}

            {value.period === 'FORTNIGHT' || value.period === 'MONTH' ? (
              <MonthField
                value={value.month}
                onChange={(month) => onChange({ ...value, month })}
              />
            ) : null}

            {value.period !== 'CUSTOM' ? (
              <YearField
                value={value.year}
                onChange={(year) => onChange({ ...value, year })}
              />
            ) : null}

            {value.period === 'CUSTOM' ? (
              <>
                <Field>
                  <FieldLabel htmlFor="report-start-date">
                    Fecha inicial
                  </FieldLabel>
                  <Input
                    id="report-start-date"
                    type="date"
                    value={value.startDate ?? ''}
                    onChange={(event) =>
                      onChange({
                        ...value,
                        startDate: event.target.value || undefined,
                      })
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="report-end-date">Fecha final</FieldLabel>
                  <Input
                    id="report-end-date"
                    type="date"
                    value={value.endDate ?? ''}
                    onChange={(event) =>
                      onChange({
                        ...value,
                        endDate: event.target.value || undefined,
                      })
                    }
                  />
                </Field>
              </>
            ) : null}
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FilterSelect
              id="report-type"
              label="Tipo de incidencia"
              value={value.incidentTypeId ?? ''}
              placeholder="Todos los tipos"
              items={typeItems}
              disabled={catalogsLoading}
              onValueChange={(incidentTypeId) =>
                onChange({ ...value, incidentTypeId: incidentTypeId || undefined })
              }
            />

            <FilterSelect
              id="report-unit"
              label="Unidad organizacional"
              value={value.organizationalUnitId ?? ''}
              placeholder="Todas las unidades"
              items={unitItems}
              disabled={catalogsLoading}
              onValueChange={(organizationalUnitId) =>
                onChange({
                  ...value,
                  organizationalUnitId: organizationalUnitId || undefined,
                })
              }
            />

            <Field className="justify-end">
              <Checkbox
                id="report-include-cancelled"
                checked={value.includeCancelled}
                onCheckedChange={(checked) =>
                  onChange({ ...value, includeCancelled: checked === true })
                }
              />
              <FieldLabel htmlFor="report-include-cancelled">
                Incluir canceladas
              </FieldLabel>
            </Field>
          </div>
        </FieldGroup>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={onPreview} disabled={!isValid}>
            <EyeIcon data-icon="inline-start" />
            Vista previa
          </Button>

          {canExport ? (
            <Button type="button" onClick={onDownload} disabled={downloading || !isValid}>
            <FileDownIcon data-icon="inline-start" />
            {downloading ? 'Generando...' : 'Generar PDF'}
            </Button>
          ) : null}

          <Badge variant="secondary" className="ml-auto">
            {formatPeriodLabel(value)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function MonthField({
  value,
  onChange,
}: {
  value: number
  onChange: (month: number) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor="report-month">Mes</FieldLabel>
      <Select
        value={String(value)}
        onValueChange={(month) => {
          if (month) onChange(Number(month))
        }}
      >
        <SelectTrigger id="report-month">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Mes</SelectLabel>
            {MONTH_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

function YearField({
  value,
  onChange,
}: {
  value: number
  onChange: (year: number) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor="report-year">Año</FieldLabel>
      <Select
        value={String(value)}
        onValueChange={(year) => {
          if (year) onChange(Number(year))
        }}
      >
        <SelectTrigger id="report-year">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Año</SelectLabel>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

function FilterSelect({
  id,
  label,
  value,
  placeholder,
  items,
  disabled,
  onValueChange,
}: {
  id: string
  label: string
  value: string
  placeholder: string
  items: Array<{ value: string; label: string }>
  disabled?: boolean
  onValueChange: (value: string | null) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            <SelectItem value="">{placeholder}</SelectItem>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

function applyPeriodChange(
  current: ReportsFilterState,
  period: ReportPeriodType,
): ReportsFilterState {
  const next: ReportsFilterState = { ...current, period }

  if (
    period === 'CUSTOM' &&
    (!next.startDate || !next.endDate) &&
    next.month > 0 &&
    next.year > 0
  ) {
    const firstDay = new Date(Date.UTC(next.year, next.month - 1, 1))
    const lastDay = new Date(Date.UTC(next.year, next.month, 0))

    next.startDate = firstDay.toISOString().slice(0, 10)
    next.endDate = lastDay.toISOString().slice(0, 10)
  }

  return next
}
