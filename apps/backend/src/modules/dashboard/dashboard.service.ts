import { Injectable } from '@nestjs/common';
import {
  startOfDayUtc,
  startOfMonthUtc,
  startOfNextMonthUtc,
  startOfNextYearUtc,
  startOfYearUtc,
} from './dashboard.dates';
import type {
  DashboardActiveIncidentModel,
  DashboardIncidentTypeCountModel,
  DashboardSummaryModel,
} from './models/dashboard.model';
import { DashboardRepository } from './repositories/dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async getSummary(): Promise<DashboardSummaryModel> {
    const today = startOfDayUtc();
    const monthStart = startOfMonthUtc();
    const monthEnd = startOfNextMonthUtc();

    return this.repository.getSummary(today, monthStart, monthEnd);
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
}