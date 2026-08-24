import { ReportsService } from './reports.service';
import { GetIncidentsReportDto } from './dto/get-incidents-report.dto';
import type { ReportIncidentModel } from './models/incidents-report.model';

describe('ReportsService', () => {
  it('builds average and percentage distributions from the same report items', async () => {
    const items: ReportIncidentModel[] = [
      buildIncident('one', 'employee-1', 'type-a', 'unit-a', 'REGISTERED'),
      buildIncident('two', 'employee-1', 'type-a', 'unit-a', 'CANCELLED'),
      buildIncident('three', 'employee-2', 'type-b', 'unit-b', 'REGISTERED'),
    ];
    const repository = {
      findIncidents: jest.fn().mockResolvedValue(items),
    };
    const service = new ReportsService(repository);
    const filters = Object.assign(new GetIncidentsReportDto(), {
      period: 'MONTH',
      month: 8,
      year: 2026,
      includeCancelled: true,
    });

    const report = await service.getIncidentsReport(filters);

    expect(report.summary).toEqual({
      totalIncidents: 3,
      totalEmployees: 2,
      registeredIncidents: 2,
      cancelledIncidents: 1,
      averageIncidentsPerEmployee: 1.5,
      byType: [
        {
          incidentTypeId: 'type-a',
          code: 'TYPE-A',
          name: 'Tipo A',
          count: 2,
          percentage: 66.7,
        },
        {
          incidentTypeId: 'type-b',
          code: 'TYPE-B',
          name: 'Tipo B',
          count: 1,
          percentage: 33.3,
        },
      ],
      byOrganizationalUnit: [
        {
          organizationalUnitId: 'unit-a',
          name: 'Unidad A',
          count: 2,
          percentage: 66.7,
        },
        {
          organizationalUnitId: 'unit-b',
          name: 'Unidad B',
          count: 1,
          percentage: 33.3,
        },
      ],
    });
  });

  it('returns zero average and empty distributions with no incidents', async () => {
    const repository = { findIncidents: jest.fn().mockResolvedValue([]) };
    const service = new ReportsService(repository);
    const filters = Object.assign(new GetIncidentsReportDto(), {
      period: 'YEAR',
      year: 2026,
      includeCancelled: false,
    });

    const report = await service.getIncidentsReport(filters);

    expect(report.summary.averageIncidentsPerEmployee).toBe(0);
    expect(report.summary.byType).toEqual([]);
    expect(report.summary.byOrganizationalUnit).toEqual([]);
  });
});

function buildIncident(
  incidentId: string,
  employeeId: string,
  incidentTypeId: string,
  organizationalUnitId: string,
  status: 'REGISTERED' | 'CANCELLED',
): ReportIncidentModel {
  const suffix = incidentTypeId === 'type-a' ? 'A' : 'B';
  return {
    incidentId,
    employee: {
      id: employeeId,
      employeeNumber: `EMP-${employeeId}`,
      fullName: `Empleado ${employeeId}`,
    },
    organizationalUnit: {
      id: organizationalUnitId,
      name: `Unidad ${organizationalUnitId.slice(-1).toUpperCase()}`,
    },
    position: { id: `position-${suffix}`, name: 'Analista' },
    incidentType: {
      id: incidentTypeId,
      code: `TYPE-${suffix}`,
      name: `Tipo ${suffix}`,
    },
    occurrences: [
      { startDate: new Date('2026-08-01T00:00:00.000Z'), endDate: null },
    ],
    issuedDate: null,
    receivedAt: new Date('2026-08-01T12:00:00.000Z'),
    status,
    observations: null,
  };
}
