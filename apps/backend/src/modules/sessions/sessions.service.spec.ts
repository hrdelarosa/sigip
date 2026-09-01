import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { SessionsRepository } from './repositories/sessions.repository';
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  const repository = {
    createLoginSession: jest.fn(),
    findAuthenticatedByTokenHash: jest.fn(),
    touch: jest.fn(),
    findAllForUser: jest.fn(),
    findSessionSummaryForUser: jest.fn(),
    findByIdForUser: jest.fn(),
    revoke: jest.fn(),
    revokeAllForUser: jest.fn(),
  };
  const config = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, number> = {
        'auth.sessionIdleMinutes': 30,
        'auth.sessionAbsoluteMinutes': 600,
      };
      return values[key];
    }),
  };
  let service: SessionsService;
  const user = {
    id: '0198a68e-e5b2-7000-8000-000000000001',
    roleId: '0198a68e-e5b2-7000-8000-000000000002',
    officeId: '0198a68e-e5b2-7000-8000-000000000003',
    username: 'admin',
    fullName: 'Administrador',
    passwordHash: 'password-hash',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: SessionsRepository, useValue: repository },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(SessionsService);
  });

  beforeEach(() => jest.clearAllMocks());

  it('persists only a token hash when creating a login session', async () => {
    let persisted!: Record<string, unknown>;
    repository.createLoginSession.mockImplementation(
      (data: { tokenHash: string; id: string }) => {
        persisted = data;
        return Promise.resolve({
          ...data,
          userId: user.id,
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
          },
          role: { id: user.roleId, code: 'admin', name: 'Admin' },
          permissions: ['users:read'],
        });
      },
    );

    const result = await service.createLoginSession(user, {
      ipAddress: null,
      userAgent: null,
    });
    expect(result?.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(persisted.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(persisted).not.toHaveProperty('token');
    expect(persisted.tokenHash).not.toBe(result?.token);
  });

  it('rejects malformed tokens without querying persistence', async () => {
    await expect(service.authenticateToken('invalid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(repository.findAuthenticatedByTokenHash).not.toHaveBeenCalled();
  });

  it('restores identity and touches a valid session', async () => {
    repository.findAuthenticatedByTokenHash.mockResolvedValue({
      id: '0198a68e-e5b2-7000-8000-000000000003',
      user: { id: user.id, username: user.username, fullName: user.fullName },
      role: { id: user.roleId, code: 'admin', name: 'Admin' },
      permissions: ['users:read'],
    });
    repository.touch.mockResolvedValue(true);

    await expect(
      service.authenticateToken('a'.repeat(43)),
    ).resolves.toMatchObject({
      userId: user.id,
      sessionId: '0198a68e-e5b2-7000-8000-000000000003',
      permissions: ['users:read'],
    });
    expect(repository.touch).toHaveBeenCalledTimes(1);
  });
});
