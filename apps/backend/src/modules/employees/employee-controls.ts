import type {
  EmployeeJustificationControlResponse,
  EmployeeVacationControlResponse,
  EmployeeVacationPeriodBalanceResponse,
  VacationBalanceStatus,
  VacationPeriod,
} from '@sigip/shared';
import {
  MONTHLY_JUSTIFICATION_LIMIT,
  VACATION_ENTITLEMENT_DAYS,
  addSixCalendarMonths,
  getCurrentVacationPeriod,
  getVacationPeriodDates,
  getVacationPeriodFromCode,
} from '../../common/vacation/vacation-control';
import type { EmployeeControlSnapshot } from './models/employee-control.model';
import type { EmployeeModel } from './models/employee.model';

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthKey(date: Date): string {
  return formatDate(date).slice(0, 7);
}

function getBalanceStatus(
  today: Date,
  eligibilityDate: Date | null,
  startDate: Date,
  endDate: Date,
): VacationBalanceStatus {
  if (
    !eligibilityDate ||
    eligibilityDate > endDate ||
    today < eligibilityDate
  ) {
    return 'NOT_ELIGIBLE';
  }
  if (today < startDate) return 'NOT_STARTED';
  if (today > endDate) return 'EXPIRED';
  return 'AVAILABLE';
}

function buildVacationPeriodBalance(
  year: number,
  period: VacationPeriod,
  today: Date,
  eligibilityDate: Date | null,
  snapshot: EmployeeControlSnapshot,
): EmployeeVacationPeriodBalanceResponse {
  const { startDate, endDate } = getVacationPeriodDates(year, period);
  const incidentDays = snapshot.vacationDates.filter(
    (item) =>
      getVacationPeriodFromCode(item.code) === period &&
      item.date >= startDate &&
      item.date <= endDate,
  ).length;
  const adjustments = snapshot.adjustments.filter(
    (adjustment) => adjustment.year === year && adjustment.period === period,
  );
  const adjustmentDays = adjustments.reduce(
    (total, adjustment) => total + adjustment.daysDelta,
    0,
  );
  const entitlementDays =
    eligibilityDate && eligibilityDate <= endDate
      ? VACATION_ENTITLEMENT_DAYS
      : 0;
  const consumedDays = incidentDays + adjustmentDays;

  return {
    period,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    entitlementDays,
    incidentDays,
    adjustmentDays,
    consumedDays,
    remainingDays: entitlementDays - consumedDays,
    status: getBalanceStatus(today, eligibilityDate, startDate, endDate),
    adjustments: adjustments.map((adjustment) => ({
      id: adjustment.id,
      year: adjustment.year,
      period: adjustment.period,
      daysDelta: adjustment.daysDelta,
      reason: adjustment.reason,
      createdBy: adjustment.createdBy,
      createdAt: adjustment.createdAt.toISOString(),
    })),
  };
}

export function buildEmployeeControls(
  employee: EmployeeModel,
  snapshot: EmployeeControlSnapshot,
  today: Date,
): {
  vacationControl: EmployeeVacationControlResponse;
  justificationControl: EmployeeJustificationControlResponse;
} {
  const currentVacationPeriod = getCurrentVacationPeriod(today);
  const eligibilityDate = employee.hireDate
    ? addSixCalendarMonths(employee.hireDate)
    : null;
  const years = new Set<number>([currentVacationPeriod.year]);
  snapshot.vacationDates.forEach((item) =>
    years.add(item.date.getUTCFullYear()),
  );
  snapshot.adjustments.forEach((item) => years.add(item.year));

  const vacationControl: EmployeeVacationControlResponse = {
    eligibilityDate: eligibilityDate ? formatDate(eligibilityDate) : null,
    isEligible: Boolean(eligibilityDate && today >= eligibilityDate),
    currentYear: currentVacationPeriod.year,
    currentPeriod: currentVacationPeriod.period,
    years: [...years]
      .sort((left, right) => right - left)
      .map((year) => ({
        year,
        periods: (['FIRST', 'SECOND'] as const).map((period) =>
          buildVacationPeriodBalance(
            year,
            period,
            today,
            eligibilityDate,
            snapshot,
          ),
        ),
      })),
  };

  const currentMonth = monthKey(today);
  const months = new Set<string>([currentMonth]);
  snapshot.justificationDates.forEach((item) =>
    months.add(monthKey(item.date)),
  );
  const justificationControl: EmployeeJustificationControlResponse = {
    currentMonth,
    months: [...months]
      .sort((left, right) => right.localeCompare(left))
      .map((month) => {
        const dates = snapshot.justificationDates.filter(
          (item) => monthKey(item.date) === month,
        );
        const entryCount = dates.filter(
          (item) => item.code === 'JUSTIFICACION_ENTRADA',
        ).length;
        const exitCount = dates.filter(
          (item) => item.code === 'JUSTIFICACION_SALIDA',
        ).length;
        const used = entryCount + exitCount;

        return {
          month,
          entryCount,
          exitCount,
          used,
          remaining: MONTHLY_JUSTIFICATION_LIMIT - used,
        };
      }),
  };

  return { vacationControl, justificationControl };
}
