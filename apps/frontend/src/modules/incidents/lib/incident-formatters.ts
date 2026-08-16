import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { IncidentOccurrenceResponse } from '@sigip/shared'

export function formatCalendarDate(value: string): string {
  return format(parseISO(value), 'd MMM yyyy', { locale: es })
}

export function formatCalendarDateNumeric(value: string): string {
  return format(parseISO(value), 'dd/MM/yyyy', { locale: es })
}

export function formatIncidentOccurrences(
  occurrences: IncidentOccurrenceResponse[],
): string {
  if (occurrences.length === 0) return 'Sin fechas'
  if (occurrences.length > 2) {
    return `${formatCalendarDate(occurrences[0].startDate)} y ${occurrences.length - 1} más`
  }

  return occurrences
    .map((occurrence) =>
      occurrence.endDate
        ? `${formatCalendarDate(occurrence.startDate)} al ${formatCalendarDate(occurrence.endDate)}`
        : formatCalendarDate(occurrence.startDate),
    )
    .join(', ')
}
