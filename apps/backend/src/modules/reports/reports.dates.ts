import { BadRequestException } from '@nestjs/common';
import type { ReportFortnightOption, ReportPeriodType } from '@sigip/shared';

export interface ResolveReportPeriodInput {
  period: ReportPeriodType;
  fortnight?: ReportFortnightOption;
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
}

export interface ResolvedReportPeriod {
  type: ReportPeriodType;
  startDate: Date;
  endDate: Date;
  label: string;
}

export function resolveReportPeriod(
  input: ResolveReportPeriodInput,
): ResolvedReportPeriod {
  switch (input.period) {
    case 'FORTNIGHT':
      return resolveFortnight(input);

    case 'MONTH':
      return resolveMonth(input);

    case 'YEAR':
      return resolveYear(input);

    case 'CUSTOM':
      return resolveCustomPeriod(input);
  }
}

/**
 * Primera quincena: día 1 al 15.
 * Segunda quincena: día 16 al último día del mes.
 *
 * La regla institucional definitiva permanece pendiente de confirmación.
 */
function resolveFortnight(
  input: ResolveReportPeriodInput,
): ResolvedReportPeriod {
  const { month, year } = requireMonthAndYear(input);

  const fortnight = input.fortnight ?? 'FIRST';

  const startDate = new Date(
    Date.UTC(year, month - 1, fortnight === 'FIRST' ? 1 : 16),
  );

  const endDate =
    fortnight === 'FIRST'
      ? new Date(Date.UTC(year, month - 1, 15))
      : new Date(Date.UTC(year, month, 0));

  return {
    type: 'FORTNIGHT',
    startDate,
    endDate,
    label: `${fortnightLabel(fortnight)} de ${monthName(month)} de ${year}`,
  };
}

function resolveMonth(input: ResolveReportPeriodInput): ResolvedReportPeriod {
  const { month, year } = requireMonthAndYear(input);

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0));

  return {
    type: 'MONTH',
    startDate,
    endDate,
    label: `${capitalize(monthName(month))} de ${year}`,
  };
}

function resolveYear(input: ResolveReportPeriodInput): ResolvedReportPeriod {
  const year = requireYear(input);

  return {
    type: 'YEAR',
    startDate: new Date(Date.UTC(year, 0, 1)),
    endDate: new Date(Date.UTC(year, 11, 31)),
    label: `Año ${year}`,
  };
}

function resolveCustomPeriod(
  input: ResolveReportPeriodInput,
): ResolvedReportPeriod {
  if (!input.startDate || !input.endDate) {
    throw new BadRequestException(
      'Los reportes personalizados requieren startDate y endDate.',
    );
  }

  const startDate = parseIsoDate(input.startDate, 'startDate');
  const endDate = parseIsoDate(input.endDate, 'endDate');

  if (startDate > endDate) {
    throw new BadRequestException(
      'La fecha inicial no puede ser posterior a la fecha final.',
    );
  }

  return {
    type: 'CUSTOM',
    startDate,
    endDate,
    label: `${formatLongDate(startDate)} al ${formatLongDate(endDate)}`,
  };
}

function requireMonthAndYear(input: ResolveReportPeriodInput): {
  month: number;
  year: number;
} {
  const month = requireMonth(input);
  const year = requireYear(input);

  return { month, year };
}

function requireMonth(input: ResolveReportPeriodInput): number {
  if (input.month === undefined) {
    throw new BadRequestException(
      'El periodo quincenal o mensual requiere el mes (month).',
    );
  }

  return input.month;
}

function requireYear(input: ResolveReportPeriodInput): number {
  if (input.year === undefined) {
    throw new BadRequestException('El periodo requiere el año (year).');
  }

  return input.year;
}

function parseIsoDate(value: string, field: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new BadRequestException(`${field} debe tener formato YYYY-MM-DD.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new BadRequestException(`${field} no contiene una fecha válida.`);
  }

  return date;
}

function fortnightLabel(option: ReportFortnightOption): string {
  return option === 'FIRST' ? 'Primera quincena' : 'Segunda quincena';
}

function monthName(month: number): string {
  return new Intl.DateTimeFormat('es-MX', {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2000, month - 1, 1)));
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatLongDate(value: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}
