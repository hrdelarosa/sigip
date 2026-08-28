export const VACATION_ENTITLEMENT_DAYS = 10;
export const MONTHLY_JUSTIFICATION_LIMIT = 3;

export const ORDINARY_VACATION_CODES = {
  VACACIONES_PRIMER_PERIODO: 'FIRST',
  VACACIONES_SEGUNDO_PERIODO: 'SECOND',
} as const;

export const JUSTIFICATION_CODES = [
  'JUSTIFICACION_ENTRADA',
  'JUSTIFICACION_SALIDA',
] as const;

export type VacationPeriod =
  (typeof ORDINARY_VACATION_CODES)[keyof typeof ORDINARY_VACATION_CODES];

const DAY_MS = 24 * 60 * 60 * 1000;
const INSTITUTIONAL_TIME_ZONE = 'America/Mexico_City';

export function institutionalCalendarDate(reference: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: INSTITUTIONAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(reference);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return new Date(Date.UTC(value('year'), value('month') - 1, value('day')));
}

export function getVacationPeriodFromCode(code: string): VacationPeriod | null {
  return code in ORDINARY_VACATION_CODES
    ? ORDINARY_VACATION_CODES[code as keyof typeof ORDINARY_VACATION_CODES]
    : null;
}

export function isJustificationCode(code: string): boolean {
  return JUSTIFICATION_CODES.some(
    (justificationCode) => justificationCode === code,
  );
}

export function getVacationPeriodDates(
  year: number,
  period: VacationPeriod,
): { startDate: Date; endDate: Date } {
  return period === 'FIRST'
    ? {
        startDate: new Date(Date.UTC(year, 0, 1)),
        endDate: new Date(Date.UTC(year, 5, 30)),
      }
    : {
        startDate: new Date(Date.UTC(year, 6, 1)),
        endDate: new Date(Date.UTC(year, 11, 31)),
      };
}

export function isDateInVacationPeriod(
  date: Date,
  period: VacationPeriod,
): boolean {
  const { startDate, endDate } = getVacationPeriodDates(
    date.getUTCFullYear(),
    period,
  );
  return date >= startDate && date <= endDate;
}

export function addSixCalendarMonths(hireDate: Date): Date {
  const targetMonth = hireDate.getUTCMonth() + 6;
  const targetYear = hireDate.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = targetMonth % 12;
  const lastDay = new Date(
    Date.UTC(targetYear, normalizedMonth + 1, 0),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      targetYear,
      normalizedMonth,
      Math.min(hireDate.getUTCDate(), lastDay),
    ),
  );
}

export function isVacationDateEligible(hireDate: Date, date: Date): boolean {
  return date >= addSixCalendarMonths(hireDate);
}

export function getCurrentVacationPeriod(reference: Date): {
  year: number;
  period: VacationPeriod;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
} {
  const year = reference.getUTCFullYear();
  const period = reference.getUTCMonth() < 6 ? 'FIRST' : 'SECOND';
  const dates = getVacationPeriodDates(year, period);

  return {
    year,
    period,
    ...dates,
    daysRemaining:
      Math.floor((dates.endDate.getTime() - reference.getTime()) / DAY_MS) + 1,
  };
}
