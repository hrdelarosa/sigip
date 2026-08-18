import { BadRequestException } from '@nestjs/common';

import { resolveReportPeriod } from './reports.dates';

describe('resolveReportPeriod', () => {
  describe('FORTNIGHT', () => {
    it('resolves the first fortnight from day 1 to day 15', () => {
      const period = resolveReportPeriod({
        period: 'FORTNIGHT',
        fortnight: 'FIRST',
        month: 3,
        year: 2026,
      });

      expect(period.startDate.toISOString()).toBe('2026-03-01T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-03-15T00:00:00.000Z');
      expect(period.label).toBe('Primera quincena de marzo de 2026');
    });

    it('resolves the second fortnight from day 16 to the last day of the month', () => {
      const period = resolveReportPeriod({
        period: 'FORTNIGHT',
        fortnight: 'SECOND',
        month: 2,
        year: 2026,
      });

      expect(period.startDate.toISOString()).toBe('2026-02-16T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-02-28T00:00:00.000Z');
      expect(period.label).toBe('Segunda quincena de febrero de 2026');
    });

    it('defaults to the first fortnight when not provided', () => {
      const period = resolveReportPeriod({
        period: 'FORTNIGHT',
        month: 1,
        year: 2026,
      });

      expect(period.startDate.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-01-15T00:00:00.000Z');
    });

    it('rejects a fortnight without a month or year', () => {
      expect(() =>
        resolveReportPeriod({ period: 'FORTNIGHT', month: 1 }),
      ).toThrow(BadRequestException);

      expect(() =>
        resolveReportPeriod({ period: 'FORTNIGHT', year: 2026 }),
      ).toThrow(BadRequestException);
    });
  });

  describe('MONTH', () => {
    it('resolves the full month bounds and a readable label', () => {
      const period = resolveReportPeriod({
        period: 'MONTH',
        month: 12,
        year: 2026,
      });

      expect(period.startDate.toISOString()).toBe('2026-12-01T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-12-31T00:00:00.000Z');
      expect(period.label).toBe('Diciembre de 2026');
    });

    it('rejects a month without a month', () => {
      expect(() =>
        resolveReportPeriod({ period: 'MONTH', year: 2026 }),
      ).toThrow(BadRequestException);
    });
  });

  describe('YEAR', () => {
    it('resolves the full year bounds', () => {
      const period = resolveReportPeriod({ period: 'YEAR', year: 2026 });

      expect(period.startDate.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-12-31T00:00:00.000Z');
      expect(period.label).toBe('Año 2026');
    });

    it('rejects a year without a year', () => {
      expect(() => resolveReportPeriod({ period: 'YEAR' })).toThrow(
        BadRequestException,
      );
    });
  });

  describe('CUSTOM', () => {
    it('resolves the provided date range', () => {
      const period = resolveReportPeriod({
        period: 'CUSTOM',
        startDate: '2026-03-01',
        endDate: '2026-03-15',
      });

      expect(period.startDate.toISOString()).toBe('2026-03-01T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-03-15T00:00:00.000Z');
      expect(period.label).toContain('2026');
    });

    it('rejects missing or reversed dates', () => {
      expect(() =>
        resolveReportPeriod({ period: 'CUSTOM', startDate: '2026-03-01' }),
      ).toThrow(BadRequestException);

      expect(() =>
        resolveReportPeriod({
          period: 'CUSTOM',
          startDate: '2026-03-15',
          endDate: '2026-03-01',
        }),
      ).toThrow(BadRequestException);
    });
  });
});
