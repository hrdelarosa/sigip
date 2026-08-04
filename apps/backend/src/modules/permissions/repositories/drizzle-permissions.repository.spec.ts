import { isForeignKeyConstraintError } from './drizzle-permissions.repository';

describe('isForeignKeyConstraintError', () => {
  it('recognizes a MySQL foreign-key error wrapped by Drizzle', () => {
    const mysqlError = Object.assign(
      new Error('Foreign key constraint fails'),
      {
        code: 'ER_ROW_IS_REFERENCED_2',
      },
    );
    const drizzleError = new Error('Failed query', { cause: mysqlError });

    expect(isForeignKeyConstraintError(drizzleError)).toBe(true);
  });

  it('does not classify unrelated database errors as assignment conflicts', () => {
    const mysqlError = Object.assign(new Error('Connection failed'), {
      code: 'ECONNREFUSED',
    });
    const drizzleError = new Error('Failed query', { cause: mysqlError });

    expect(isForeignKeyConstraintError(drizzleError)).toBe(false);
  });
});
