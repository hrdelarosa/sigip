import { Test } from '@nestjs/testing';

import type {
  DashboardActiveIncidentModel,
  DashboardIncidentTypeCountModel,
  DashboardSummaryModel,
} from './models/dashboard.model';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './repositories/dashboard.repository';

describe('DashboardService', () => {
  const repository = {
    getSummary: jest.fn(),
    getActiveIncidents: jest.fn(),
    getIncidentsByType: jest.fn(),
  };

  let service: DashboardService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-08-16T12:00:00.000Z'));

    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DashboardRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(DashboardService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the summary using today and the current month bounds', async () => {
    const summary: DashboardSummaryModel = {
      activeEmployees: 10,
      absentToday: 2,
      absenceRate: 20,
      activeIncidentsToday: 2,
      monthIncidents: 5,
    };
    repository.getSummary.mockResolvedValue(summary);

    await expect(service.getSummary()).resolves.toBe(summary);

    expect(repository.getSummary).toHaveBeenCalledWith(
      new Date('2026-08-16T00:00:00.000Z'),
      new Date('2026-08-01T00:00:00.000Z'),
      new Date('2026-09-01T00:00:00.000Z'),
    );
  });

  it('returns the active incidents covering today', async () => {
    const items: DashboardActiveIncidentModel[] = [];
    repository.getActiveIncidents.mockResolvedValue(items);

    await expect(service.getActiveIncidents()).resolves.toBe(items);

    expect(repository.getActiveIncidents).toHaveBeenCalledWith(
      new Date('2026-08-16T00:00:00.000Z'),
    );
  });

  it('returns the incident counts for the current year', async () => {
    const items: DashboardIncidentTypeCountModel[] = [
      {
        incidentTypeId: 'type-id',
        code: 'PERMISO',
        name: 'Permiso',
        count: 3,
      },
    ];
    repository.getIncidentsByType.mockResolvedValue(items);

    await expect(service.getIncidentsByType()).resolves.toBe(items);

    expect(repository.getIncidentsByType).toHaveBeenCalledWith(
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2027-01-01T00:00:00.000Z'),
    );
  });
});
