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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';

@Controller('dashboard')
@RequirePermissions('dashboard:read')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  async summary(
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<DashboardSummaryResponse> {
    return toDashboardSummaryResponse(await this.service.getSummary(actor));
  }

  @Get('active-incidents')
  async activeIncidents(
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<DashboardActiveIncidentsResponse> {
    const items = await this.service.getActiveIncidents(actor);

    return {
      items: items.map(toDashboardActiveIncidentResponse),
      total: items.length,
    };
  }

  @Get('incidents-by-type')
  async incidentsByType(
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<DashboardIncidentsByTypeResponse> {
    const items = await this.service.getIncidentsByType(actor);

    return {
      items: items.map(toDashboardIncidentTypeCountResponse),
      total: items.reduce((sum, item) => sum + item.count, 0),
    };
  }

  @Get('incident-trend')
  async incidentTrend(
    @Query() query: GetIncidentTrendDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<DashboardIncidentTrendResponse> {
    const items = await this.service.getIncidentTrend(query.period, actor);
    return { items };
  }

  @Get('upcoming-returns')
  async upcomingReturns(
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<DashboardUpcomingReturnsResponse> {
    const items = await this.service.getUpcomingReturns(actor);
    return {
      items: items.map(toDashboardUpcomingReturnResponse),
      total: items.length,
    };
  }

  @Get('recent-incidents')
  async recentIncidents(
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<DashboardRecentIncidentsResponse> {
    const items = await this.service.getRecentIncidents(actor);
    return {
      items: items.map(toDashboardRecentIncidentResponse),
      total: items.length,
    };
  }
}
