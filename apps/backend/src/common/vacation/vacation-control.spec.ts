import {
  addSixCalendarMonths,
  getCurrentVacationPeriod,
  getVacationPeriodDates,
  getVacationPeriodFromCode,
  isVacationDateEligible,
} from './vacation-control';

describe('vacation control calendar', () => {
  it('maps ordinary incident codes to their period', () => {
    expect(getVacationPeriodFromCode('VACACIONES_PRIMER_PERIODO')).toBe(
      'FIRST',
    );
    expect(getVacationPeriodFromCode('VACACIONES_SEGUNDO_PERIODO')).toBe(
      'SECOND',
    );
    expect(getVacationPeriodFromCode('VACACIONES_ESTIMULOS')).toBeNull();
  });

  it('uses the provisional institutional period boundaries', () => {
    expect(getVacationPeriodDates(2026, 'FIRST')).toEqual({
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-06-30T00:00:00.000Z'),
    });
    expect(getVacationPeriodDates(2026, 'SECOND')).toEqual({
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      endDate: new Date('2026-12-31T00:00:00.000Z'),
    });
  });

  it('clamps six calendar months for month-end hires', () => {
    expect(addSixCalendarMonths(new Date('2024-08-31T00:00:00.000Z'))).toEqual(
      new Date('2025-02-28T00:00:00.000Z'),
    );
    expect(addSixCalendarMonths(new Date('2023-08-31T00:00:00.000Z'))).toEqual(
      new Date('2024-02-29T00:00:00.000Z'),
    );
  });

  it('allows vacation starting on the six-month eligibility date', () => {
    const hireDate = new Date('2026-01-15T00:00:00.000Z');

    expect(
      isVacationDateEligible(hireDate, new Date('2026-07-14T00:00:00.000Z')),
    ).toBe(false);
    expect(
      isVacationDateEligible(hireDate, new Date('2026-07-15T00:00:00.000Z')),
    ).toBe(true);
  });

  it('reports the current period and inclusive calendar days remaining', () => {
    expect(
      getCurrentVacationPeriod(new Date('2026-06-30T00:00:00.000Z')),
    ).toMatchObject({ period: 'FIRST', daysRemaining: 1 });
    expect(
      getCurrentVacationPeriod(new Date('2026-07-01T00:00:00.000Z')),
    ).toMatchObject({ period: 'SECOND', daysRemaining: 184 });
  });
});
