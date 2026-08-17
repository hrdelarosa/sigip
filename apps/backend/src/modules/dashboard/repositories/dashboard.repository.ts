import type {
  DashboardActiveIncidentModel,
  DashboardIncidentTypeCountModel,
  DashboardSummaryModel,
} from '../models/dashboard.model';

export abstract class DashboardRepository {
  abstract getSummary(
    today: Date,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<DashboardSummaryModel>;

  abstract getActiveIncidents(today: Date): Promise<DashboardActiveIncidentModel[]>;

  abstract getIncidentsByType(
    yearStart: Date,
    yearEnd: Date,
  ): Promise<DashboardIncidentTypeCountModel[]>;
}