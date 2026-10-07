import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEmployeeDto } from './create-employee.dto';
import { UpdateEmployeeDto } from './update-employee.dto';

const validEmployee = { employeeNumber: '001', fullName: 'Persona' };

describe('employee officeId DTO validation', () => {
  it('accepts omitted officeId for backward-compatible requests', async () => {
    const dto = plainToInstance(CreateEmployeeDto, validEmployee);
    expect(await validate(dto)).toHaveLength(0);
  });

  it('requires a valid UUID when officeId is present on create or update', async () => {
    const invalidCreate = plainToInstance(CreateEmployeeDto, {
      ...validEmployee,
      officeId: 'not-a-uuid',
    });
    const invalidUpdate = plainToInstance(UpdateEmployeeDto, {
      officeId: 'not-a-uuid',
    });
    expect(
      (await validate(invalidCreate)).some(
        (error) => error.property === 'officeId',
      ),
    ).toBe(true);
    expect(
      (await validate(invalidUpdate)).some(
        (error) => error.property === 'officeId',
      ),
    ).toBe(true);
  });

  it('accepts the UUIDv7 office identifiers used by the application', async () => {
    const dto = plainToInstance(UpdateEmployeeDto, {
      officeId: '0198aa00-0000-7000-8000-000000000001',
    });
    expect(await validate(dto)).toHaveLength(0);
  });
});
