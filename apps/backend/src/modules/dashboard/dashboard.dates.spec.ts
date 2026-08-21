import {
  startOfDayUtc,
  startOfMonthUtc,
  startOfYearUtc,
} from './dashboard.dates';

describe('dashboard institutional calendar', () => {
  it('uses the Mexico City calendar date near UTC midnight', () => {
    expect(startOfDayUtc(new Date('2026-08-16T05:30:00.000Z'))).toEqual(
      new Date('2026-08-15T00:00:00.000Z'),
    );
    expect(startOfDayUtc(new Date('2026-08-16T06:30:00.000Z'))).toEqual(
      new Date('2026-08-16T00:00:00.000Z'),
    );
  });

  it('uses the institutional month and year', () => {
    const reference = new Date('2026-01-01T05:30:00.000Z');

    expect(startOfMonthUtc(reference)).toEqual(
      new Date('2025-12-01T00:00:00.000Z'),
    );
    expect(startOfYearUtc(reference)).toEqual(
      new Date('2025-01-01T00:00:00.000Z'),
    );
  });
});
