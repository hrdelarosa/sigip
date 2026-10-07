import { DrizzleEmployeesRepository } from './drizzle-employees.repository';
import { employees, employeeAssignments } from '../../../database/schema';
import { uuidToBuffer } from '../../../database/utils/uuid.util';
import type { DrizzleDatabase } from '../../../database/database.types';

const employeeId = '0198aa00-0000-7000-8000-000000000001';
const sourceOffice = '0198aa00-0000-7000-8000-000000000002';
const targetOffice = '0198aa00-0000-7000-8000-000000000003';

function makeRepository() {
  const employeeRow = {
    id: uuidToBuffer(employeeId),
    officeId: uuidToBuffer(sourceOffice),
    employeeNumber: '001',
    fullName: 'Persona',
    hireDate: null,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const assignments = [
    {
      id: uuidToBuffer('0198aa00-0000-7000-8000-000000000011'),
      employeeId: uuidToBuffer(employeeId),
      officeId: uuidToBuffer(sourceOffice),
    },
    {
      id: uuidToBuffer('0198aa00-0000-7000-8000-000000000012'),
      employeeId: uuidToBuffer(employeeId),
      officeId: uuidToBuffer(sourceOffice),
    },
  ];
  const updates: Array<{ table: unknown; values: Record<string, unknown> }> =
    [];
  const query = (transactional: boolean) => {
    return {
      select: () => ({
        from: (selected: unknown) => {
          return {
            where: () => ({
              for: () =>
                Promise.resolve(
                  selected === employees
                    ? [
                        {
                          ...employeeRow,
                          officeId: Buffer.from(employeeRow.officeId),
                        },
                      ]
                    : assignments,
                ),
              limit: () =>
                Promise.resolve(selected === employees ? [employeeRow] : []),
            }),
            limit: () =>
              Promise.resolve(selected === employees ? [employeeRow] : []),
          };
        },
      }),
      update: (updated: unknown) => ({
        set: (values: Record<string, unknown>) => ({
          where: () => {
            updates.push({ table: updated, values });
            if (updated === employeeAssignments && values.officeId) {
              assignments.forEach((assignment) => {
                assignment.officeId = values.officeId as Buffer;
              });
            }
            if (updated === employees && values.officeId)
              employeeRow.officeId = values.officeId as Buffer;
          },
        }),
      }),
      insert: () => ({ values: () => Promise.resolve(undefined) }),
      execute: () => Promise.resolve(undefined),
      transactional,
    };
  };
  const db = {
    ...query(false),
    transaction: async (
      callback: (tx: ReturnType<typeof query>) => Promise<unknown>,
    ) => {
      const employeeOfficeBefore = Buffer.from(employeeRow.officeId);
      const assignmentOfficesBefore = assignments.map((assignment) =>
        Buffer.from(assignment.officeId),
      );
      try {
        return await callback(query(true));
      } catch (error) {
        employeeRow.officeId = employeeOfficeBefore;
        assignments.forEach((assignment, index) => {
          assignment.officeId = assignmentOfficesBefore[index];
        });
        throw error;
      }
    },
  } as unknown as DrizzleDatabase;
  const audit = { append: jest.fn().mockResolvedValue(undefined) };
  return {
    repository: new DrizzleEmployeesRepository(db, audit as never),
    assignments,
    updates,
    audit,
    employeeRow,
  };
}

describe('DrizzleEmployeesRepository.update office correction', () => {
  it('updates employee and every assignment office and audits before/after in the transaction', async () => {
    const { repository, assignments, updates, audit } = makeRepository();
    await repository.update(
      employeeId,
      { officeId: targetOffice, updatedAt: new Date() },
      sourceOffice,
      { userId: employeeId, sessionId: employeeId },
    );
    expect(
      updates.filter((update) => update.table === employeeAssignments),
    ).toHaveLength(1);
    expect(
      assignments.every((assignment) =>
        assignment.officeId.equals(uuidToBuffer(targetOffice)),
      ),
    ).toBe(true);
    expect(audit.append).toHaveBeenCalledWith(
      expect.objectContaining({
        oldValues: { officeId: sourceOffice },
        newValues: { officeId: targetOffice },
      }),
      expect.objectContaining({ transactional: true }),
    );
  });

  it('does not rewrite assignment offices when officeId is omitted', async () => {
    const { repository, updates, audit } = makeRepository();
    await repository.update(
      employeeId,
      { fullName: 'Actualizado', updatedAt: new Date() },
      sourceOffice,
    );
    expect(updates.some((update) => update.table === employeeAssignments)).toBe(
      false,
    );
    expect(audit.append).not.toHaveBeenCalled();
  });

  it('does not rewrite assignments for a same-office update', async () => {
    const { repository, updates } = makeRepository();
    await repository.update(
      employeeId,
      { officeId: sourceOffice, updatedAt: new Date() },
      sourceOffice,
    );
    expect(updates.some((update) => update.table === employeeAssignments)).toBe(
      false,
    );
  });

  it('propagates audit failure so the transaction can roll back', async () => {
    const { repository, audit, assignments, employeeRow } = makeRepository();
    audit.append.mockRejectedValueOnce(new Error('audit unavailable'));
    await expect(
      repository.update(
        employeeId,
        { officeId: targetOffice, updatedAt: new Date() },
        sourceOffice,
        { userId: employeeId, sessionId: employeeId },
      ),
    ).rejects.toThrow('audit unavailable');
    expect(employeeRow.officeId.equals(uuidToBuffer(sourceOffice))).toBe(true);
    expect(
      assignments.every((assignment) =>
        assignment.officeId.equals(uuidToBuffer(sourceOffice)),
      ),
    ).toBe(true);
  });
});
