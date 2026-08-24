import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ReportPeriodType } from '@sigip/shared'

const PERIOD_TYPE_LABELS: Record<ReportPeriodType, string> = {
  FORTNIGHT: 'Quincenal',
  MONTH: 'Mensual',
  YEAR: 'Anual',
  CUSTOM: 'Personalizado',
}

export function formatReportPeriodType(type: ReportPeriodType): string {
  return PERIOD_TYPE_LABELS[type]
}

export function formatReportDate(value: string): string {
  return format(parseISO(value), "d 'de' MMMM 'de' yyyy", { locale: es })
}

export function formatReportCalendarDate(value: string): string {
  return format(parseISO(value), 'd MMM yyyy', { locale: es })
}
