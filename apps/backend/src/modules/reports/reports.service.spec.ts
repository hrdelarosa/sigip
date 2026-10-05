import { ReportsService } from './reports.service';
import { GetIncidentsReportDto } from './dto/get-incidents-report.dto';
import { GetVacationsReportDto } from './dto/get-vacations-report.dto';
import type { ReportIncidentModel } from './models/incidents-report.model';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { ForbiddenException } from '@nestjs/common';

describe('ReportsService', () => {
  const actor: AuthenticatedUserModel = {
    userId: 'user-id',
    sessionId: 'session-id',
    username: 'user',
    fullName: 'User',
    office: { id: 'office-id', code: 'OFFICE', name: 'Office' },
    role: { id: 'role-id', code: 'ROLE', name: 'Role' },
    permissions: [],
  };
  it('builds average and percentage distributions from the same report items', async () => {
    const items: ReportIncidentModel[] = [
      buildIncident('one', 'employee-1', 'type-a', 'unit-a', 'REGISTERED'),
      buildIncident('two', 'employee-1', 'type-a', 'unit-a', 'CANCELLED'),
      buildIncident('three', 'employee-2', 'type-b', 'unit-b', 'REGISTERED'),
    ];
    const repository = {
      findIncidents: jest.fn().mockResolvedValue(items),
      findVacationEmployees: jest.fn(),
      findVacationIncidents: jest.fn(),
      findVacationAdjustments: jest.fn(),
    };
    const service = new ReportsService(repository);
    const filters = Object.assign(new GetIncidentsReportDto(), {
      period: 'MONTH',
      month: 8,
      year: 2026,
      includeCancelled: true,
    });

    const report = await service.getIncidentsReport(filters, actor);

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
    const repository = {
      findIncidents: jest.fn().mockResolvedValue([]),
      findVacationEmployees: jest.fn(),
      findVacationIncidents: jest.fn(),
      findVacationAdjustments: jest.fn(),
    };
    const service = new ReportsService(repository);
    const filters = Object.assign(new GetIncidentsReportDto(), {
      period: 'YEAR',
      year: 2026,
      includeCancelled: false,
    });

    const report = await service.getIncidentsReport(filters, actor);

    expect(report.summary.averageIncidentsPerEmployee).toBe(0);
    expect(report.summary.byType).toEqual([]);
    expect(report.summary.byOrganizationalUnit).toEqual([]);
  });

  it('filters an incidents report by office for users with cross-office access', async () => {
    const repository = {
      findIncidents: jest.fn().mockResolvedValue([]),
      findVacationEmployees: jest.fn(),
      findVacationIncidents: jest.fn(),
      findVacationAdjustments: jest.fn(),
    };
    const service = new ReportsService(repository);
    const filters = Object.assign(new GetIncidentsReportDto(), {
      period: 'YEAR',
      year: 2026,
      officeId: 'selected-office-id',
    });

    const report = await service.getIncidentsReport(filters, {
      ...actor,
      permissions: ['offices:access-all'],
    });

    expect(repository.findIncidents).toHaveBeenCalledWith(
      expect.objectContaining({ officeId: 'selected-office-id' }),
    );
    expect(report.filters?.officeId).toBe('selected-office-id');
  });

  it('rejects a selected office outside a user office scope', async () => {
    const repository = {
      findIncidents: jest.fn().mockResolvedValue([]),
      findVacationEmployees: jest.fn(),
      findVacationIncidents: jest.fn(),
      findVacationAdjustments: jest.fn(),
    };
    const service = new ReportsService(repository);
    const filters = Object.assign(new GetIncidentsReportDto(), {
      period: 'YEAR',
      year: 2026,
      officeId: 'other-office-id',
    });

    await expect(service.getIncidentsReport(filters, actor)).rejects.toThrow(
      ForbiddenException,
    );
    expect(repository.findIncidents).not.toHaveBeenCalled();
  });

  it('groups incidents without an assignment under No asignado', async () => {
    const incident = buildIncident(
      'one',
      'employee-1',
      'type-a',
      'unit-a',
      'REGISTERED',
    );
    incident.organizationalUnit = null;
    incident.position = null;
    const repository = {
      findIncidents: jest.fn().mockResolvedValue([incident]),
      findVacationEmployees: jest.fn(),
      findVacationIncidents: jest.fn(),
      findVacationAdjustments: jest.fn(),
    };
    const service = new ReportsService(repository);
    const filters = Object.assign(new GetIncidentsReportDto(), {
      period: 'YEAR',
      year: 2026,
    });

    const report = await service.getIncidentsReport(filters, actor);

    expect(report.summary.byOrganizationalUnit).toEqual([
      {
        organizationalUnitId: null,
        name: 'No asignado',
        count: 1,
        percentage: 100,
      },
    ]);
  });

  it('builds current vacation balances by assigned year and period', async () => {
    const repository = {
      findIncidents: jest.fn(),
      findVacationEmployees: jest.fn().mockResolvedValue([
        {
          id: 'employee-id',
          employeeNumber: '001',
          fullName: 'Persona',
          officeId: 'office-id',
          officeName: 'Oficina',
          hireDate: new Date('2020-01-01T00:00:00.000Z'),
        },
      ]),
      findVacationIncidents: jest.fn().mockResolvedValue([
        {
          employeeId: 'employee-id',
          code: 'VACACIONES_SEGUNDO_PERIODO',
          referenceYear: 2025,
          date: new Date('2026-05-12T00:00:00.000Z'),
        },
      ]),
      findVacationAdjustments: jest.fn().mockResolvedValue([
        {
          employeeId: 'employee-id',
          year: 2025,
          period: 'SECOND',
          daysDelta: 2,
        },
      ]),
    };
    const service = new ReportsService(repository);
    const report = await service.getVacationsReport(
      Object.assign(new GetVacationsReportDto(), {
        year: 2025,
        period: 'BOTH',
      }),
      { ...actor, permissions: ['offices:access-all'] },
    );

    expect(report.items[0].periods).toEqual([
      expect.objectContaining({
        period: 'FIRST',
        entitlementDays: 10,
        remainingDays: 10,
      }),
      expect.objectContaining({
        period: 'SECOND',
        entitlementDays: 10,
        incidentDays: 1,
        adjustmentDays: 2,
        remainingDays: 7,
      }),
    ]);
    expect(report.totals.secondPeriodRemainingDays).toBe(0);
    expect(repository.findVacationEmployees).toHaveBeenCalledWith(undefined);
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
