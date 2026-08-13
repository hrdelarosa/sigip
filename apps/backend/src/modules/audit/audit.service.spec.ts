import { Test } from '@nestjs/testing';

import { AuditService } from './audit.service';
import { AuditRepository } from './repositories/audit.repository';

describe('AuditService', () => {
  const repository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    append: jest.fn(),
  };
  let service: AuditService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: AuditRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(AuditService);
  });

  beforeEach(() => jest.clearAllMocks());

  it('returns the paginated audit result from the repository', async () => {
    const filters = { page: 1, limit: 20, action: 'LOGIN_SUCCEEDED' as const };
    const result = { items: [], total: 0 };
    repository.findAll.mockResolvedValue(result);

    await expect(service.findAll(filters)).resolves.toBe(result);
    expect(repository.findAll).toHaveBeenCalledWith(filters);
  });

  it('throws when an audit entry does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.findById('0198a68e-e5b2-7000-8000-000000000001'),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('rejects sensitive fields before persistence', () => {
    expect(() =>
      service.append({
        action: 'PASSWORD_CHANGED',
        entityType: 'USER',
        newValues: { passwordHash: 'secret' },
      }),
    ).toThrow('no puede auditarse');
    expect(repository.append).not.toHaveBeenCalled();
  });

  it.each(['newPassword', 'authorization', 'cookie', 'apiKey', 'accessToken'])(
    'rejects the sensitive key %s',
    (key) => {
      expect(() =>
        service.append({
          action: 'UPDATED',
          entityType: 'USER',
          newValues: { [key]: 'secret' },
        }),
      ).toThrow('no puede auditarse');
    },
  );
});
