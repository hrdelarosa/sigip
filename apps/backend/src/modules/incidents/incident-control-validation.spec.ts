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

  it('accepts a fourth combined entry or exit justification in the month', () => {
    const existing = [
      new Date('2026-08-01T00:00:00.000Z'),
      new Date('2026-08-02T00:00:00.000Z'),
      new Date('2026-08-03T00:00:00.000Z'),
    ];

    expect(() =>
      assertJustificationLimit(existing, [
        new Date('2026-08-04T00:00:00.000Z'),
      ]),
    ).not.toThrow();
  });

  it('rejects a fifth combined justification with the updated limit message', () => {
    const existing = Array.from(
      { length: 4 },
      (_, index) => new Date(Date.UTC(2026, 7, index + 1)),
    );

    expect(() =>
      assertJustificationLimit(existing, [
        new Date('2026-08-05T00:00:00.000Z'),
      ]),
    ).toThrow(MonthlyJustificationLimitError);
    expect(() =>
      assertJustificationLimit(existing, [
        new Date('2026-08-05T00:00:00.000Z'),
      ]),
    ).toThrow(
      'El empleado ya alcanzó el máximo de 4 justificaciones en el mes',
    );
  });

  it('accumulates candidate dates within the monthly limit', () => {
    const existing = [
      new Date('2026-08-01T00:00:00.000Z'),
      new Date('2026-08-02T00:00:00.000Z'),
    ];
    const candidates = [
      new Date('2026-08-03T00:00:00.000Z'),
      new Date('2026-08-04T00:00:00.000Z'),
    ];

    expect(() => assertJustificationLimit(existing, candidates)).not.toThrow();
    expect(() =>
      assertJustificationLimit(existing, [
        ...candidates,
        new Date('2026-08-05T00:00:00.000Z'),
      ]),
    ).toThrow(MonthlyJustificationLimitError);
  });

  it('keeps separate limits by occurrence month and year, including history', () => {
    const existing = Array.from(
      { length: 4 },
      (_, index) => new Date(Date.UTC(2025, 7, index + 1)),
    );

    expect(() =>
      assertJustificationLimit(existing, [
        new Date('2025-09-01T00:00:00.000Z'),
        new Date('2026-08-01T00:00:00.000Z'),
      ]),
    ).not.toThrow();
  });
});
