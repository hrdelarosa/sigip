import { Test } from '@nestjs/testing';

import { CryptoService } from '../../common/crypto/crypto.service';
import { SessionsService } from '../sessions/sessions.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { InvalidCredentialsError } from './auth.errors';
import { AuthService } from './auth.service';
import { AuditService } from '../audit/audit.service';

describe('AuthService', () => {
  const user = {
    id: '0198a68e-e5b2-7000-8000-000000000001',
    roleId: '0198a68e-e5b2-7000-8000-000000000002',
    username: 'admin',
    fullName: 'Administrador',
    passwordHash: 'hash',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const usersRepository = {
    findByUsernameWithPassword: jest.fn(),
  };
  const cryptoService = { verifyPassword: jest.fn() };
  const sessionsService = { createLoginSession: jest.fn() };
  const auditService = { append: jest.fn() };
  let service: AuthService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: CryptoService, useValue: cryptoService },
        { provide: SessionsService, useValue: sessionsService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  beforeEach(() => jest.clearAllMocks());

  it('creates a session for valid active credentials', async () => {
    usersRepository.findByUsernameWithPassword.mockResolvedValue(user);
    cryptoService.verifyPassword.mockResolvedValue(true);
    sessionsService.createLoginSession.mockResolvedValue({ token: 'token' });

    await expect(
      service.login(
        { username: 'admin', password: 'secret' },
        { ipAddress: null, userAgent: null },
      ),
    ).resolves.toEqual({ token: 'token' });
  });

  it('uses the same credential error when the username does not exist', async () => {
    usersRepository.findByUsernameWithPassword.mockResolvedValue(null);
    cryptoService.verifyPassword.mockResolvedValue(false);

    await expect(
      service.login(
        { username: 'unknown', password: 'secret' },
        { ipAddress: null, userAgent: null },
      ),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(cryptoService.verifyPassword).toHaveBeenCalledTimes(1);
    expect(auditService.append).toHaveBeenCalledWith({
      action: 'LOGIN_FAILED',
      entityType: 'AUTH',
      newValues: { username: 'unknown' },
      ipAddress: null,
      userAgent: null,
    });
  });

  it('rejects inactive users even when the password matches', async () => {
    usersRepository.findByUsernameWithPassword.mockResolvedValue({
      ...user,
      isActive: false,
    });
    cryptoService.verifyPassword.mockResolvedValue(true);

    await expect(
      service.login(
        { username: 'admin', password: 'secret' },
        { ipAddress: null, userAgent: null },
      ),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('keeps the credential error when failed-login auditing is unavailable', async () => {
    usersRepository.findByUsernameWithPassword.mockResolvedValue(null);
    cryptoService.verifyPassword.mockResolvedValue(false);
    auditService.append.mockRejectedValueOnce(
      new Error('database unavailable'),
    );

    await expect(
      service.login(
        { username: 'unknown', password: 'secret' },
        { ipAddress: null, userAgent: null },
      ),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('audits a login rejected during transactional session creation', async () => {
    usersRepository.findByUsernameWithPassword.mockResolvedValue(user);
    cryptoService.verifyPassword.mockResolvedValue(true);
    sessionsService.createLoginSession.mockResolvedValue(null);

    await expect(
      service.login(
        { username: 'admin', password: 'secret' },
        { ipAddress: null, userAgent: null },
      ),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(auditService.append).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        action: 'LOGIN_FAILED',
      }),
    );
  });
});
