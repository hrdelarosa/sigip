import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsPdfService } from './reports-pdf.service';
import { ReportsRepository } from './repositories/reports.repository';
import { DrizzleReportsRepository } from './repositories/drizzle-reports.repository';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsPdfService,
    {
      provide: ReportsRepository,
      useClass: DrizzleReportsRepository,
    },
  ],
})
export class ReportsModule {}
