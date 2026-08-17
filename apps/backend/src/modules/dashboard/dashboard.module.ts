import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DashboardRepository } from './repositories/dashboard.repository';
import { DrizzleDashboardRepository } from './repositories/drizzle-dashboard.repository';

@Module({
  controllers: [DashboardController],
  providers: [
    DashboardService,
    {
      provide: DashboardRepository,
      useClass: DrizzleDashboardRepository,
    },
  ],
  exports: [DashboardService, DashboardRepository],
})
export class DashboardModule {}