import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { OfficesService } from '../offices/offices.service';
import { RolesRepository } from '../roles/repositories/roles.repository';
import { SessionsRepository } from '../sessions/repositories/sessions.repository';
import { CryptoService } from '../../common/crypto/crypto.service';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';

describe('UsersService office assignment', () => {
  const usersRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const rolesRepository = { findById: jest.fn() };
  const cryptoService = { hashPassword: jest.fn() };
  const officesService = { ensureActive: jest.fn() };
  const auditContext = { userId: 'actor-id', sessionId: 'session-id' };
  const actor = (permissions: string[] = []): AuthenticatedUserModel => ({
    userId: 'actor-id',
    sessionId: 'session-id',
    username: 'admin',
    fullName: 'Administrador',
    office: { id: 'office-a', code: 'ORGRO', name: 'Oficina A' },
    role: { id: 'role-id', code: 'admin', name: 'Administrador' },
    permissions,
  });
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    rolesRepository.findById.mockResolvedValue({ isActive: true });
    usersRepository.findByUsername.mockResolvedValue(null);
    cryptoService.hashPassword.mockResolvedValue('password-hash');
    usersRepository.create.mockImplementation((data) =>
      Promise.resolve({
        ...data,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: CryptoService, useValue: cryptoService },
        { provide: RolesRepository, useValue: rolesRepository },
        { provide: SessionsRepository, useValue: {} },
        { provide: AuditRepository, useValue: {} },
        { provide: OfficesService, useValue: officesService },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('uses the actor office when no office is requested', async () => {
    await service.create(
      {
        roleId: 'role-id',
        username: 'usuario',
        fullName: 'Usuario',
        password: 'password',
      },
      actor(),
      auditContext,
    );

    expect(officesService.ensureActive).toHaveBeenCalledWith('office-a');
    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ officeId: 'office-a' }),
      auditContext,
    );
  });

  it('scopes user listing to the actor office', async () => {
    usersRepository.findAll.mockResolvedValue({ items: [], total: 0 });
    const query = { page: 1, limit: 20 };

    await service.findAll(query, actor());

    expect(usersRepository.findAll).toHaveBeenCalledWith(query, 'office-a');
  });

  it('allows global users to list every office', async () => {
    usersRepository.findAll.mockResolvedValue({ items: [], total: 0 });
    const query = { page: 1, limit: 20 };

    await service.findAll(query, actor(['offices:access-all']));

    expect(usersRepository.findAll).toHaveBeenCalledWith(query, undefined);
  });

  it('rejects another office without global access', async () => {
    await expect(
      service.create(
        {
          roleId: 'role-id',
          officeId: 'office-b',
          username: 'usuario',
          fullName: 'Usuario',
          password: 'password',
        },
        actor(),
        auditContext,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(usersRepository.create).not.toHaveBeenCalled();
  });

  it('allows another active office with global access', async () => {
    await service.create(
      {
        roleId: 'role-id',
        officeId: 'office-b',
        username: 'usuario',
        fullName: 'Usuario',
        password: 'password',
      },
      actor(['offices:access-all']),
      auditContext,
    );

    expect(officesService.ensureActive).toHaveBeenCalledWith('office-b');
    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ officeId: 'office-b' }),
      auditContext,
    );
  });
});
