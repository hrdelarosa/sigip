import {
  MONTHLY_JUSTIFICATION_LIMIT,
  VACATION_ENTITLEMENT_DAYS,
} from '../../common/vacation/vacation-control';
import {
  DuplicateActiveVacationDateError,
  IncidentVacationBalanceExceededError,
  MonthlyJustificationLimitError,
} from './incidents.errors';

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function assertVacationBalance(
  existingDates: Date[],
  candidateDates: Date[],
  adjustmentDays: number,
): void {
  const existingKeys = new Set(existingDates.map(dateKey));
  if (candidateDates.some((date) => existingKeys.has(dateKey(date)))) {
    throw new DuplicateActiveVacationDateError();
  }

  const consumed =
    existingDates.length + candidateDates.length + adjustmentDays;
  if (consumed < 0 || consumed > VACATION_ENTITLEMENT_DAYS) {
    const availableDays = Math.max(
      0,
      Math.min(
        VACATION_ENTITLEMENT_DAYS,
        VACATION_ENTITLEMENT_DAYS - existingDates.length - adjustmentDays,
      ),
    );
    throw new IncidentVacationBalanceExceededError(availableDays);
  }
}

export function assertJustificationLimit(
  existingDates: Date[],
  candidateDates: Date[],
): void {
  const monthCounts = new Map<string, number>();
  for (const date of existingDates) {
    const month = dateKey(date).slice(0, 7);
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
  }
  for (const date of candidateDates) {
    const month = dateKey(date).slice(0, 7);
    const count = (monthCounts.get(month) ?? 0) + 1;
    if (count > MONTHLY_JUSTIFICATION_LIMIT) {
      throw new MonthlyJustificationLimitError();
    }
    monthCounts.set(month, count);
  }
}
