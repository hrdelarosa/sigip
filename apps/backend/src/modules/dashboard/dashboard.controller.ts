import { Controller, Get, Query } from '@nestjs/common';
import type {
  DashboardActiveIncidentsResponse,
  DashboardIncidentsByTypeResponse,
  DashboardIncidentTrendResponse,
  DashboardRecentIncidentsResponse,
  DashboardSummaryResponse,
  DashboardUpcomingReturnsResponse,
} from '@sigip/shared';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { DashboardService } from './dashboard.service';
import {
  toDashboardActiveIncidentResponse,
  toDashboardIncidentTypeCountResponse,
  toDashboardRecentIncidentResponse,
  toDashboardSummaryResponse,
  toDashboardUpcomingReturnResponse,
} from './presenters/dashboard.presenter';
import { GetIncidentTrendDto } from './dto/get-incident-trend.dto';

@Controller('dashboard')
@RequirePermissions('dashboard:read')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  async summary(): Promise<DashboardSummaryResponse> {
    return toDashboardSummaryResponse(await this.service.getSummary());
  }

  @Get('active-incidents')
  async activeIncidents(): Promise<DashboardActiveIncidentsResponse> {
    const items = await this.service.getActiveIncidents();

    return {
      items: items.map(toDashboardActiveIncidentResponse),
      total: items.length,
    };
  }

  @Get('incidents-by-type')
  async incidentsByType(): Promise<DashboardIncidentsByTypeResponse> {
    const items = await this.service.getIncidentsByType();

    return {
      items: items.map(toDashboardIncidentTypeCountResponse),
      total: items.reduce((sum, item) => sum + item.count, 0),
    };
  }

  @Get('incident-trend')
  async incidentTrend(
    @Query() query: GetIncidentTrendDto,
  ): Promise<DashboardIncidentTrendResponse> {
    const items = await this.service.getIncidentTrend(query.period);
    return { items };
  }

  @Get('upcoming-returns')
  async upcomingReturns(): Promise<DashboardUpcomingReturnsResponse> {
    const items = await this.service.getUpcomingReturns();
    return {
      items: items.map(toDashboardUpcomingReturnResponse),
      total: items.length,
    };
  }

  @Get('recent-incidents')
  async recentIncidents(): Promise<DashboardRecentIncidentsResponse> {
    const items = await this.service.getRecentIncidents();
    return {
      items: items.map(toDashboardRecentIncidentResponse),
      total: items.length,
    };
  }
}
