import type {
  DashboardActiveIncidentModel,
  DashboardIncidentTypeCountModel,
  DashboardRecentIncidentModel,
  DashboardOperationalSummaryModel,
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
    officeId?: string,
  ): Promise<DashboardOperationalSummaryModel>;

  abstract getActiveIncidents(
    today: Date,
    officeId?: string,
  ): Promise<DashboardActiveIncidentModel[]>;

  abstract getIncidentsByType(
    periodStart: Date,
    periodEnd: Date,
    officeId?: string,
  ): Promise<DashboardIncidentTypeCountModel[]>;

  abstract getIncidentTrend(
    periodStart: Date,
    periodEnd: Date,
    officeId?: string,
  ): Promise<Array<{ period: string; count: number }>>;

  abstract getUpcomingReturns(
    today: Date,
    weekEnd: Date,
    officeId?: string,
  ): Promise<DashboardUpcomingReturnModel[]>;

  abstract getRecentIncidents(
    limit: number,
    officeId?: string,
  ): Promise<DashboardRecentIncidentModel[]>;
}
