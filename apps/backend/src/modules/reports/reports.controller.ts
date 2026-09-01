import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { IncidentsReportResponse } from '@sigip/shared';

import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { GetIncidentsReportDto } from './dto/get-incidents-report.dto';
import { ReportsPdfService } from './reports-pdf.service';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';

@Controller('reports')
@RequirePermissions('reports:read')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly pdfService: ReportsPdfService,
  ) {}

  @Get('incidents')
  async getIncidentsReport(
    @Query() filters: GetIncidentsReportDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<IncidentsReportResponse> {
    const report = await this.reportsService.getIncidentsReport(filters, actor);

    return this.reportsService.toResponse(report);
  }

  @Get('incidents/pdf')
  @RequirePermissions('reports:read', 'reports:export')
  async downloadIncidentsReport(
    @Query() filters: GetIncidentsReportDto,
    @CurrentUser() actor: AuthenticatedUserModel,
    @Res() response: Response,
  ): Promise<void> {
    const report = await this.reportsService.getIncidentsReport(filters, actor);
    const pdf = await this.pdfService.generate(report);
    const filename = buildFilename(
      report.period.startDate,
      report.period.endDate,
    );

    response.setHeader('Content-Type', 'application/pdf');

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );

    response.setHeader('Content-Length', String(pdf.length));

    response.end(pdf);
  }
}

function buildFilename(startDate: Date, endDate: Date): string {
  return (
    ['reporte-incidencias', toIsoDate(startDate), 'a', toIsoDate(endDate)].join(
      '-',
    ) + '.pdf'
  );
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
