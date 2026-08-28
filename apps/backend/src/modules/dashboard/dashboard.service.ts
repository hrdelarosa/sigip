import { Injectable } from '@nestjs/common';
import {
  addDaysUtc,
  startOfDayUtc,
  startOfMonthUtc,
  startOfNextMonthUtc,
  startOfNextYearUtc,
  startOfYearUtc,
} from './dashboard.dates';
import type {
  DashboardActiveIncidentModel,
  DashboardIncidentTrendModel,
  DashboardIncidentTypeCountModel,
  DashboardRecentIncidentModel,
  DashboardSummaryModel,
  DashboardUpcomingReturnModel,
} from './models/dashboard.model';
import { DashboardRepository } from './repositories/dashboard.repository';
import { getCurrentVacationPeriod } from '../../common/vacation/vacation-control';

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async getSummary(): Promise<DashboardSummaryModel> {
    const today = startOfDayUtc();
    const monthStart = startOfMonthUtc();
    const monthEnd = startOfNextMonthUtc();
    const previousMonthStart = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1),
    );
    const weekEnd = addDaysUtc(today, 7);

    const summary = await this.repository.getSummary(
      today,
      monthStart,
      monthEnd,
      previousMonthStart,
      weekEnd,
      monthStart,
    );

    return {
      ...summary,
      currentVacationPeriod: getCurrentVacationPeriod(today),
    };
  }

  async getActiveIncidents(): Promise<DashboardActiveIncidentModel[]> {
    const today = startOfDayUtc();

    return this.repository.getActiveIncidents(today);
  }

  async getIncidentsByType(): Promise<DashboardIncidentTypeCountModel[]> {
    const yearStart = startOfYearUtc();
    const yearEnd = startOfNextYearUtc();

    return this.repository.getIncidentsByType(yearStart, yearEnd);
  }

  async getIncidentTrend(
    period: '3m' | '6m' | 'ytd' | '12m',
  ): Promise<DashboardIncidentTrendModel[]> {
    const currentStart = startOfMonthUtc();
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    const periodStart =
      period === 'ytd'
        ? startOfYearUtc()
        : new Date(
            Date.UTC(
              currentStart.getUTCFullYear(),
              currentStart.getUTCMonth() - (months - 1),
              1,
            ),
          );
    const rows = await this.repository.getIncidentTrend(
      periodStart,
      startOfNextMonthUtc(),
    );
    const counts = new Map(rows.map((row) => [row.period, row.count]));
    const result: DashboardIncidentTrendModel[] = [];
    const cursor = new Date(periodStart);

    while (cursor < startOfNextMonthUtc()) {
      const periodKey = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`;
      result.push({
        period: periodKey,
        label: new Intl.DateTimeFormat('es-MX', {
          month: 'short',
          timeZone: 'UTC',
        }).format(cursor),
        count: counts.get(periodKey) ?? 0,
      });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }

    return result;
  }

  async getUpcomingReturns(): Promise<DashboardUpcomingReturnModel[]> {
    const today = startOfDayUtc();
    return this.repository.getUpcomingReturns(today, addDaysUtc(today, 7));
  }

  async getRecentIncidents(): Promise<DashboardRecentIncidentModel[]> {
    return this.repository.getRecentIncidents(8);
  }
}
