export const INSTITUTIONAL_TIME_ZONE = 'America/Mexico_City';

interface CalendarParts {
  year: number;
  month: number;
  day: number;
}

function calendarParts(reference: Date): CalendarParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: INSTITUTIONAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(reference);

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  };
}

export function startOfDayUtc(reference: Date = new Date()): Date {
  const { year, month, day } = calendarParts(reference);
  return new Date(Date.UTC(year, month - 1, day));
}

export function startOfMonthUtc(reference: Date = new Date()): Date {
  const { year, month } = calendarParts(reference);
  return new Date(Date.UTC(year, month - 1, 1));
}

export function startOfNextMonthUtc(reference: Date = new Date()): Date {
  const { year, month } = calendarParts(reference);
  return new Date(Date.UTC(year, month, 1));
}

export function startOfYearUtc(reference: Date = new Date()): Date {
  const { year } = calendarParts(reference);
  return new Date(Date.UTC(year, 0, 1));
}

export function startOfNextYearUtc(reference: Date = new Date()): Date {
  const { year } = calendarParts(reference);
  return new Date(Date.UTC(year + 1, 0, 1));
}
