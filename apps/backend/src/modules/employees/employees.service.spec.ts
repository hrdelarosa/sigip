import { Test } from '@nestjs/testing';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { EmployeesService } from './employees.service';
import { EmployeesRepository } from './repositories/employees.repository';
import { EmployeeControlsRepository } from './repositories/employee-controls.repository';
import { VacationAdjustmentBalanceError } from './employees.errors';
import { OfficesService } from '../offices/offices.service';
import { EmployeeNotFoundError } from './employees.errors';

describe('EmployeesService controls', () => {
  const employeesRepository = {
    findById: jest.fn(),
    findByEmployeeNumber: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findAssignmentsByEmployeeId: jest.fn(),
    createAssignment: jest.fn(),
  };
  const controlsRepository = {
    findSnapshot: jest.fn(),
    createVacationAdjustment: jest.fn(),
  };
  const officesService = { ensureActive: jest.fn().mockResolvedValue({}) };
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
        {
          provide: OfficesService,
          useValue: officesService,
        },
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
    expect(result.controls.vacationControl.currentPeriod).toBe('FIRST');
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

  it('creates an employee in the requested office only with global office access', async () => {
    const globalActor = {
      ...actor,
      permissions: ['employees:create', 'offices:access-all'],
    };
    employeesRepository.create.mockResolvedValue({ id: 'new-id' });
    await service.create(
      {
        officeId: 'target-office',
        employeeNumber: '002',
        fullName: 'Nueva Persona',
      },
      globalActor,
    );
    expect(employeesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ officeId: 'target-office' }),
      expect.objectContaining({ userId: actor.userId }),
    );
  });

  it('defaults a compatible create request to the actor office', async () => {
    employeesRepository.create.mockResolvedValue({ id: 'new-id' });
    await service.create(
      { employeeNumber: '004', fullName: 'Default office' },
      actor,
    );
    expect(employeesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ officeId: 'office-id' }),
      expect.any(Object),
    );
  });

  it('rejects a local actor requesting another office', async () => {
    await expect(
      service.create(
        {
          officeId: 'other-office',
          employeeNumber: '002',
          fullName: 'Nueva Persona',
        },
        actor,
      ),
    ).rejects.toThrow('No puedes administrar empleados de otra oficina');
    expect(employeesRepository.create).not.toHaveBeenCalled();
  });

  it('does not reset an employee office when update omits officeId', async () => {
    const current = {
      id: 'employee-id',
      officeId: 'different-current-office',
      employeeNumber: '001',
      fullName: 'Persona',
    };
    employeesRepository.findById.mockResolvedValue(current);
    employeesRepository.update.mockResolvedValue(current);
    await service.update(
      'employee-id',
      { fullName: 'Persona editada' },
      { ...actor, permissions: ['employees:update', 'offices:access-all'] },
    );
    expect(employeesRepository.update).toHaveBeenCalledWith(
      'employee-id',
      expect.objectContaining({ officeId: undefined }),
      undefined,
      expect.any(Object),
    );
  });

  it('does not reset office B when a global actor from office A edits employee B', async () => {
    const employeeB = {
      id: 'employee-id',
      officeId: 'office-b',
      employeeNumber: '001',
      fullName: 'Persona',
    };
    employeesRepository.findById.mockResolvedValue(employeeB);
    employeesRepository.update.mockResolvedValue(employeeB);

    await service.update(
      'employee-id',
      { fullName: 'Editado' },
      {
        ...actor,
        office: { id: 'office-a', code: 'A', name: 'A' },
        permissions: ['employees:update', 'offices:access-all'],
      },
    );

    expect(employeesRepository.update).toHaveBeenCalledWith(
      'employee-id',
      expect.objectContaining({ officeId: undefined }),
      undefined,
      expect.any(Object),
    );
  });

  it('requires access to the employee source office before changing its office', async () => {
    employeesRepository.findById.mockResolvedValue(null);
    await expect(
      service.update('employee-id', { officeId: 'office-b' }, actor),
    ).rejects.toBeInstanceOf(EmployeeNotFoundError);
    expect(officesService.ensureActive).not.toHaveBeenCalled();
  });

  it('rejects a local actor changing an employee to a different destination office', async () => {
    employeesRepository.findById.mockResolvedValue({
      id: 'employee-id',
      officeId: 'office-id',
      employeeNumber: '001',
      fullName: 'Persona',
    });
    await expect(
      service.update('employee-id', { officeId: 'office-b' }, actor),
    ).rejects.toThrow('No puedes administrar empleados de otra oficina');
    expect(officesService.ensureActive).not.toHaveBeenCalled();
    expect(employeesRepository.update).not.toHaveBeenCalled();
  });

  it('checks that a requested destination office is active', async () => {
    const globalActor = {
      ...actor,
      permissions: ['employees:create', 'offices:access-all'],
    };
    officesService.ensureActive.mockRejectedValueOnce(
      new Error('office unavailable'),
    );
    await expect(
      service.create(
        {
          officeId: 'inactive-office',
          employeeNumber: '003',
          fullName: 'Persona',
        },
        globalActor,
      ),
    ).rejects.toThrow('office unavailable');
    expect(employeesRepository.create).not.toHaveBeenCalled();
  });
});
