import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDashboardDate(value: string): string {
  return format(parseISO(value), 'd MMM yyyy', { locale: es })
}

export function formatDashboardOccurrence(
  startDate: string,
  endDate: string | null,
): string {
  return endDate
    ? `${formatDashboardDate(startDate)} al ${formatDashboardDate(endDate)}`
    : formatDashboardDate(startDate)
}

export function getEmployeeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
