import {
  assertJustificationLimit,
  assertVacationBalance,
} from './incident-control-validation';
import {
  DuplicateActiveVacationDateError,
  IncidentVacationBalanceExceededError,
  MonthlyJustificationLimitError,
} from './incidents.errors';

describe('incident aggregate controls', () => {
  it('rejects an aggregate vacation balance above 10 days', () => {
    const existingDates = Array.from(
      { length: 8 },
      (_, index) => new Date(Date.UTC(2026, 6, index + 1)),
    );
    const candidateDates = [
      new Date('2026-07-20T00:00:00.000Z'),
      new Date('2026-07-21T00:00:00.000Z'),
      new Date('2026-07-22T00:00:00.000Z'),
    ];

    expect(() =>
      assertVacationBalance(existingDates, candidateDates, 0),
    ).toThrow(IncidentVacationBalanceExceededError);
  });

  it('rejects a vacation date already used by another active incident', () => {
    const date = new Date('2026-07-20T00:00:00.000Z');

    expect(() => assertVacationBalance([date], [date], 0)).toThrow(
      DuplicateActiveVacationDateError,
    );
  });

  it('combines entry and exit dates in the monthly limit', () => {
    const existing = [
      new Date('2026-08-01T00:00:00.000Z'),
      new Date('2026-08-02T00:00:00.000Z'),
      new Date('2026-08-03T00:00:00.000Z'),
    ];

    expect(() =>
      assertJustificationLimit(existing, [
        new Date('2026-08-04T00:00:00.000Z'),
      ]),
    ).toThrow(MonthlyJustificationLimitError);
    expect(() =>
      assertJustificationLimit(existing.slice(0, 2), [
        new Date('2026-08-04T00:00:00.000Z'),
      ]),
    ).not.toThrow();
  });
});
