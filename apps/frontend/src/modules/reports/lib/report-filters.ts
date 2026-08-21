import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type {
  IncidentsReportFilters,
  ReportFortnightOption,
  ReportPeriodType,
} from '@sigip/shared'

export interface ReportsFilterState {
  period: ReportPeriodType
  fortnight: ReportFortnightOption
  month: number
  year: number
  startDate?: string
  endDate?: string
  incidentTypeId?: string
  organizationalUnitId?: string
  includeCancelled: boolean
}

const now = new Date()

export function defaultReportsFilterState(): ReportsFilterState {
  return {
    period: 'MONTH',
    fortnight: 'FIRST',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    includeCancelled: false,
  }
}

export function buildIncidentsReportFilters(
  state: ReportsFilterState,
): IncidentsReportFilters {
  const filters: IncidentsReportFilters = {
    period: state.period,
    includeCancelled: state.includeCancelled,
  }

  if (state.incidentTypeId) {
    filters.incidentTypeId = state.incidentTypeId
  }

  if (state.organizationalUnitId) {
    filters.organizationalUnitId = state.organizationalUnitId
  }

  if (state.period === 'CUSTOM') {
    filters.startDate = state.startDate
    filters.endDate = state.endDate
  } else {
    filters.month = state.month
    filters.year = state.year

    if (state.period === 'FORTNIGHT') {
      filters.fortnight = state.fortnight
    }
  }

  return filters
}

export function isReportFilterValid(state: ReportsFilterState): boolean {
  if (state.period !== 'CUSTOM') return true
  if (!state.startDate || !state.endDate) return false

  return state.startDate <= state.endDate
}

export function formatPeriodLabel(state: ReportsFilterState): string {
  if (state.period === 'CUSTOM') {
    if (state.startDate && state.endDate) {
      return `Del ${formatReportDate(state.startDate)} al ${formatReportDate(state.endDate)}`
    }

    return 'Periodo personalizado'
  }

  const monthName =
    MONTH_OPTIONS.find((option) => option.value === state.month)?.label ?? ''

  if (state.period === 'FORTNIGHT') {
    return `${state.fortnight === 'FIRST' ? 'Primera quincena' : 'Segunda quincena'} de ${monthName} de ${state.year}`
  }

  if (state.period === 'MONTH') {
    return `${monthName} de ${state.year}`
  }

  return `Año ${state.year}`
}

export const MONTH_OPTIONS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
] as const

export function buildYearOptions(): number[] {
  const years: number[] = []

  for (let year = now.getFullYear() - 5; year <= now.getFullYear() + 1; year += 1) {
    years.push(year)
  }

  return years
}

function formatReportDate(value: string): string {
  return format(parseISO(value), "d 'de' MMMM 'de' yyyy", { locale: es })
}
