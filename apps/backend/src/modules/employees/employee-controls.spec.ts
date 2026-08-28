import type { EmployeeModel } from './models/employee.model';
import type { EmployeeControlSnapshot } from './models/employee-control.model';
import { buildEmployeeControls } from './employee-controls';

describe('buildEmployeeControls', () => {
  const employee: EmployeeModel = {
    id: 'employee-id',
    employeeNumber: '001',
    fullName: 'Persona de prueba',
    hireDate: new Date('2026-01-15T00:00:00.000Z'),
    status: 'ACTIVE',
    createdAt: new Date('2026-01-15T00:00:00.000Z'),
    updatedAt: new Date('2026-01-15T00:00:00.000Z'),
  };

  const snapshot: EmployeeControlSnapshot = {
    vacationDates: [
      {
        code: 'VACACIONES_SEGUNDO_PERIODO',
        date: new Date('2026-08-03T00:00:00.000Z'),
      },
      {
        code: 'VACACIONES_SEGUNDO_PERIODO',
        date: new Date('2026-08-04T00:00:00.000Z'),
      },
    ],
    justificationDates: [
      {
        code: 'JUSTIFICACION_ENTRADA',
        date: new Date('2026-08-05T00:00:00.000Z'),
      },
      {
        code: 'JUSTIFICACION_SALIDA',
        date: new Date('2026-08-06T00:00:00.000Z'),
      },
    ],
    adjustments: [
      {
        id: 'adjustment-id',
        employeeId: 'employee-id',
        year: 2026,
        period: 'SECOND',
        daysDelta: 3,
        reason: 'Consumo previo',
        createdBy: { id: 'user-id', fullName: 'Administrador' },
        createdAt: new Date('2026-08-01T12:00:00.000Z'),
      },
    ],
  };

  it('combines active incidents and adjustments into the current balance', () => {
    const result = buildEmployeeControls(
      employee,
      snapshot,
      new Date('2026-08-28T00:00:00.000Z'),
    );
    const current = result.vacationControl.years
      .find((year) => year.year === 2026)
      ?.periods.find((period) => period.period === 'SECOND');

    expect(current).toMatchObject({
      entitlementDays: 10,
      incidentDays: 2,
      adjustmentDays: 3,
      consumedDays: 5,
      remainingDays: 5,
      status: 'AVAILABLE',
    });
  });

  it('combines entry and exit justifications in the same monthly limit', () => {
    const result = buildEmployeeControls(
      employee,
      snapshot,
      new Date('2026-08-28T00:00:00.000Z'),
    );

    expect(result.justificationControl.months[0]).toEqual({
      month: '2026-08',
      entryCount: 1,
      exitCount: 1,
      used: 2,
      remaining: 1,
    });
  });
});
