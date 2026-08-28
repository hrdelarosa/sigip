import { eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns'

export const ORDINARY_VACATION_CODES = [
  'VACACIONES_PRIMER_PERIODO',
  'VACACIONES_SEGUNDO_PERIODO',
] as const

export const MAX_VACATION_DAYS = 10

export function isOrdinaryVacation(code: string): boolean {
  return ORDINARY_VACATION_CODES.some((vacationCode) => vacationCode === code)
}

export function buildVacationDateRange(
  startDate: string,
  endDate: string,
  includeWeekends: boolean,
): string[] {
  if (!startDate || !endDate || endDate < startDate) return []

  return eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
    .filter((date) => includeWeekends || !isWeekend(date))
    .map((date) => format(date, 'yyyy-MM-dd'))
}
