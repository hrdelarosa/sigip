import { Controller, Get } from '@nestjs/common';
import type {
  DashboardActiveIncidentsResponse,
  DashboardIncidentsByTypeResponse,
  DashboardSummaryResponse,
} from '@sigip/shared';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { DashboardService } from './dashboard.service';
import {
  toDashboardActiveIncidentResponse,
  toDashboardIncidentTypeCountResponse,
  toDashboardSummaryResponse,
} from './presenters/dashboard.presenter';

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
}
