import type {
  DashboardActiveIncidentModel,
  DashboardIncidentTypeCountModel,
  DashboardRecentIncidentModel,
  DashboardSummaryModel,
  DashboardUpcomingReturnModel,
} from '../models/dashboard.model';

export abstract class DashboardRepository {
  abstract getSummary(
    today: Date,
    monthStart: Date,
    monthEnd: Date,
    previousMonthStart: Date,
    weekEnd: Date,
    monthStartForEmployees: Date,
  ): Promise<DashboardSummaryModel>;

  abstract getActiveIncidents(
    today: Date,
  ): Promise<DashboardActiveIncidentModel[]>;

  abstract getIncidentsByType(
    periodStart: Date,
    periodEnd: Date,
  ): Promise<DashboardIncidentTypeCountModel[]>;

  abstract getIncidentTrend(
    periodStart: Date,
    periodEnd: Date,
  ): Promise<Array<{ period: string; count: number }>>;

  abstract getUpcomingReturns(
    today: Date,
    weekEnd: Date,
  ): Promise<DashboardUpcomingReturnModel[]>;

  abstract getRecentIncidents(
    limit: number,
  ): Promise<DashboardRecentIncidentModel[]>;
}
