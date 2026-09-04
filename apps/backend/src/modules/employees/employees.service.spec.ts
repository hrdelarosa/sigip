import { Test } from '@nestjs/testing';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { EmployeesService } from './employees.service';
import { EmployeesRepository } from './repositories/employees.repository';
import { EmployeeControlsRepository } from './repositories/employee-controls.repository';
import { VacationAdjustmentBalanceError } from './employees.errors';

describe('EmployeesService controls', () => {
  const employeesRepository = {
    findById: jest.fn(),
    findAssignmentsByEmployeeId: jest.fn(),
    createAssignment: jest.fn(),
  };
  const controlsRepository = {
    findSnapshot: jest.fn(),
    createVacationAdjustment: jest.fn(),
  };
  const actor: AuthenticatedUserModel = {
    userId: 'user-id',
    sessionId: 'session-id',
    username: 'admin',
    fullName: 'Administrador',
    office: { id: 'office-id', code: 'ORGRO', name: 'Oficina' },
    role: { id: 'role-id', code: 'ADMIN', name: 'Administrador' },
    permissions: ['employees:update'],
  };
  let service: EmployeesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-08-28T12:00:00.000Z'));
    const module = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: EmployeesRepository, useValue: employeesRepository },
        { provide: EmployeeControlsRepository, useValue: controlsRepository },
      ],
    }).compile();
    service = module.get(EmployeesService);
  });

  afterEach(() => jest.useRealTimers());

  it('enriches employee details with vacation and justification controls', async () => {
    employeesRepository.findById.mockResolvedValue({
      id: 'employee-id',
      employeeNumber: '001',
      fullName: 'Persona',
      hireDate: new Date('2025-01-01T00:00:00.000Z'),
      status: 'ACTIVE',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    });
    employeesRepository.findAssignmentsByEmployeeId.mockResolvedValue([]);
    controlsRepository.findSnapshot.mockResolvedValue({
      vacationDates: [],
      justificationDates: [],
      adjustments: [],
    });

    const result = await service.findDetails('employee-id', actor);

    expect(employeesRepository.findById).toHaveBeenCalledWith(
      'employee-id',
      'office-id',
    );
    expect(
      employeesRepository.findAssignmentsByEmployeeId,
    ).toHaveBeenCalledWith('employee-id', 'office-id');
    expect(controlsRepository.findSnapshot).toHaveBeenCalledWith(
      'employee-id',
      'office-id',
    );
    expect(result.controls.vacationControl.currentPeriod).toBe('SECOND');
    expect(result.controls.justificationControl.months[0]).toMatchObject({
      month: '2026-08',
      used: 0,
      remaining: 3,
    });
  });

  it('rejects an adjustment that would leave the balance out of range', async () => {
    controlsRepository.createVacationAdjustment.mockResolvedValue({
      status: 'balance-out-of-range',
    });

    await expect(
      service.createVacationAdjustment(
        'employee-id',
        {
          year: 2026,
          period: 'SECOND',
          daysDelta: 3,
          reason: 'Consumo previo',
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(VacationAdjustmentBalanceError);
  });

  it('creates an assignment without an organizational unit', async () => {
    employeesRepository.createAssignment.mockResolvedValue({
      status: 'success',
      assignment: {
        id: 'assignment-id',
        employeeId: 'employee-id',
        organizationalUnitId: null,
        positionId: 'position-id',
        organizationalUnit: null,
        position: { id: 'position-id', code: 'P1', name: 'Puesto' },
        appointmentType: 'BASE',
        schedule: '09:00-17:00',
        effectiveFrom: new Date('2026-08-01T00:00:00.000Z'),
        effectiveTo: null,
        notes: null,
        createdAt: new Date('2026-08-01T00:00:00.000Z'),
        updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      },
    });

    await service.createAssignment(
      'employee-id',
      {
        positionId: 'position-id',
        appointmentType: 'BASE',
        schedule: '09:00-17:00',
        effectiveFrom: '2026-08-01',
      },
      actor,
    );

    expect(employeesRepository.createAssignment).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: 'employee-id',
        organizationalUnitId: null,
        positionId: 'position-id',
      }),
    );
  });
});
